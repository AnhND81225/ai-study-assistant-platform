import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Check, Crop, ImagePlus, RotateCw, Trash2, X } from 'lucide-react';

const defaultAllowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

export function ImageScannerInput({
  value,
  onChange,
  onError,
  label,
  helperText,
  emptyTitle = 'Scan or choose image',
  emptyDescription = 'Use the camera on mobile, or choose an image from your gallery.',
  kindLabel = 'image',
  maxSizeBytes = 5 * 1024 * 1024,
  allowedTypes = defaultAllowedTypes,
}) {
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const imageRef = useRef(null);
  const [rotating, setRotating] = useState(false);
  const [cropping, setCropping] = useState(false);
  const [cropRect, setCropRect] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const previewUrl = useMemo(() => (value ? URL.createObjectURL(value) : null), [value]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function chooseFile(file) {
    onError?.('');
    if (!file) return;
    if (!allowedTypes.includes(file.type)) {
      onError?.(`Only JPG, PNG, and WebP ${kindLabel} files are supported.`);
      return;
    }
    if (file.size > maxSizeBytes) {
      onError?.(`${capitalize(kindLabel)} must be ${formatBytes(maxSizeBytes)} or smaller.`);
      return;
    }
    onChange(file);
  }

  function clear() {
    onError?.('');
    onChange(null);
    resetCrop();
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  }

  async function rotateClockwise() {
    if (!value || rotating) return;
    onError?.('');
    resetCrop();
    setRotating(true);
    try {
      const rotated = await rotateImageFile(value);
      onChange(rotated);
    } catch {
      onError?.('Could not rotate this image. Please choose another photo.');
    } finally {
      setRotating(false);
    }
  }

  function startCrop() {
    if (!value) return;
    onError?.('');
    setCropping(true);
    setCropRect(null);
    setDragStart(null);
  }

  function resetCrop() {
    setCropping(false);
    setCropRect(null);
    setDragStart(null);
  }

  function beginCropSelection(event) {
    if (!cropping || !imageRef.current) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const point = cropPoint(event);
    setDragStart(point);
    setCropRect({ x: point.x, y: point.y, width: 0, height: 0 });
  }

  function updateCropSelection(event) {
    if (!cropping || !dragStart || !imageRef.current) return;
    event.preventDefault();
    const point = cropPoint(event);
    setCropRect(normalizeRect(dragStart, point));
  }

  function finishCropSelection(event) {
    if (!cropping || !dragStart) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setDragStart(null);
  }

  async function applyCrop() {
    if (!value || !cropRect || !imageRef.current || cropRect.width < 24 || cropRect.height < 24) {
      onError?.('Drag over the question area before applying the crop.');
      return;
    }
    onError?.('');
    try {
      const cropped = await cropImageFile(value, imageRef.current, cropRect);
      if (cropped.size > maxSizeBytes) {
        onError?.(`Cropped ${kindLabel} is still larger than ${formatBytes(maxSizeBytes)}. Choose a smaller area.`);
        return;
      }
      onChange(cropped);
      resetCrop();
    } catch {
      onError?.('Could not crop this image. Please try again or choose another photo.');
    }
  }

  function cropPoint(event) {
    const rect = imageRef.current.getBoundingClientRect();
    return {
      x: clamp(event.clientX - rect.left, 0, rect.width),
      y: clamp(event.clientY - rect.top, 0, rect.height),
    };
  }

  return (
    <div className="scanner-shell">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {label ? <p className="text-base font-extrabold text-ink">{label}</p> : null}
          {helperText ? <p className="mt-1 max-w-xl text-sm font-medium leading-6 text-slate-600">{helperText}</p> : null}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button type="button" onClick={() => cameraInputRef.current?.click()} className="primary-button px-3 text-sm">
            <Camera size={17} />
            Camera
          </button>
          <button type="button" onClick={() => galleryInputRef.current?.click()} className="secondary-button px-3 text-sm">
            <ImagePlus size={17} />
            Gallery
          </button>
        </div>
      </div>

      <div className="scanner-frame">
        {previewUrl ? (
          <div
            className={`crop-stage ${cropping ? 'crop-stage-active' : ''}`}
            onPointerDown={beginCropSelection}
            onPointerMove={updateCropSelection}
            onPointerUp={finishCropSelection}
            onPointerCancel={finishCropSelection}
          >
            <img ref={imageRef} src={previewUrl} alt={`${kindLabel} preview`} className="max-h-[34rem] w-full rounded-lg object-contain" draggable={false} />
            {cropping ? (
              <div className="crop-overlay" aria-hidden="true">
                {cropRect ? <span className="crop-selection" style={cropStyle(cropRect)} /> : null}
                {!cropRect ? (
                  <span className="crop-hint">Drag over the question you want to keep</span>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="px-4 py-12 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-lg bg-blue-50 text-ocean">
              <Camera size={28} />
            </div>
            <p className="mt-4 text-base font-extrabold text-ink">{emptyTitle}</p>
            <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-6 text-slate-600">{emptyDescription}</p>
          </div>
        )}
      </div>

      {value ? (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="truncate text-sm font-semibold text-slate-600">
            {value.name} · {formatBytes(value.size)}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            {cropping ? (
              <>
                <button type="button" onClick={applyCrop} className="primary-button px-3 text-sm">
                  <Check size={17} />
                  Apply crop
                </button>
                <button type="button" onClick={resetCrop} className="secondary-button px-3 text-sm">
                  <X size={17} />
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={startCrop} className="secondary-button px-3 text-sm">
                  <Crop size={17} />
                  Crop
                </button>
                <button type="button" onClick={rotateClockwise} disabled={rotating} className="secondary-button px-3 text-sm">
                  <RotateCw size={17} />
                  {rotating ? 'Rotating...' : 'Rotate'}
                </button>
                <button type="button" onClick={clear} className="danger-button px-3 text-sm">
                  <Trash2 size={17} />
                  Clear
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}

      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={(event) => chooseFile(event.target.files?.[0])} className="sr-only" />
      <input ref={galleryInputRef} type="file" accept="image/*" onChange={(event) => chooseFile(event.target.files?.[0])} className="sr-only" />
    </div>
  );
}

function cropImageFile(file, imageElement, rect) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    if (!imageElement.clientWidth || !imageElement.clientHeight) {
      reject(new Error('Image size unavailable'));
      return;
    }
    const scaleX = imageElement.naturalWidth / imageElement.clientWidth;
    const scaleY = imageElement.naturalHeight / imageElement.clientHeight;
    const sourceX = Math.round(rect.x * scaleX);
    const sourceY = Math.round(rect.y * scaleY);
    const sourceWidth = Math.round(rect.width * scaleX);
    const sourceHeight = Math.round(rect.height * scaleY);

    canvas.width = sourceWidth;
    canvas.height = sourceHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      reject(new Error('Canvas context unavailable'));
      return;
    }

    /** Crop is performed locally so backend, Cloudinary, and AI APIs keep the same upload contract. */
    context.drawImage(
      imageElement,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      sourceWidth,
      sourceHeight
    );
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Image crop failed'));
        return;
      }
      resolve(new File([blob], croppedFileName(file.name), {
        type: file.type || 'image/jpeg',
        lastModified: Date.now(),
      }));
    }, file.type || 'image/jpeg', 0.92);
  });
}

function normalizeRect(start, end) {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  };
}

function cropStyle(rect) {
  return {
    left: `${rect.x}px`,
    top: `${rect.y}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  };
}

function rotateImageFile(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalHeight;
      canvas.height = image.naturalWidth;
      const context = canvas.getContext('2d');
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Canvas context unavailable'));
        return;
      }
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate(Math.PI / 2);
      context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(objectUrl);
        if (!blob) {
          reject(new Error('Image rotation failed'));
          return;
        }
        resolve(new File([blob], rotatedFileName(file.name), {
          type: file.type || 'image/jpeg',
          lastModified: Date.now(),
        }));
      }, file.type || 'image/jpeg', 0.92);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image load failed'));
    };
    image.src = objectUrl;
  });
}

function rotatedFileName(name) {
  const dotIndex = name.lastIndexOf('.');
  if (dotIndex <= 0) return `${name}-rotated`;
  return `${name.slice(0, dotIndex)}-rotated${name.slice(dotIndex)}`;
}

function croppedFileName(name) {
  const dotIndex = name.lastIndexOf('.');
  if (dotIndex <= 0) return `${name}-cropped`;
  return `${name.slice(0, dotIndex)}-cropped${name.slice(dotIndex)}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function capitalize(value) {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : 'Image';
}
