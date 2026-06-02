import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, ImagePlus, RotateCw, Trash2 } from 'lucide-react';

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
  const [rotating, setRotating] = useState(false);
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
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  }

  async function rotateClockwise() {
    if (!value || rotating) return;
    onError?.('');
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

  return (
    <div className="scanner-shell">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {label ? <p className="text-sm font-bold text-ink">{label}</p> : null}
          {helperText ? <p className="mt-1 text-sm leading-6 text-slate-600">{helperText}</p> : null}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button type="button" onClick={() => cameraInputRef.current?.click()} className="tap-target inline-flex items-center justify-center gap-2 rounded-lg bg-sea px-3 text-sm font-bold text-white transition hover:bg-teal-700">
            <Camera size={17} />
            Camera
          </button>
          <button type="button" onClick={() => galleryInputRef.current?.click()} className="tap-target inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-sea hover:text-sea">
            <ImagePlus size={17} />
            Gallery
          </button>
        </div>
      </div>

      <div className="scanner-frame">
        {previewUrl ? (
          <img src={previewUrl} alt={`${kindLabel} preview`} className="max-h-[34rem] w-full rounded-lg object-contain" />
        ) : (
          <div className="px-4 py-12 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-mint text-sea">
              <Camera size={28} />
            </div>
            <p className="mt-4 text-base font-black text-ink">{emptyTitle}</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">{emptyDescription}</p>
          </div>
        )}
      </div>

      {value ? (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="truncate text-sm font-semibold text-slate-600">
            {value.name} · {formatBytes(value.size)}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button type="button" onClick={rotateClockwise} disabled={rotating} className="tap-target inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-sea hover:text-sea disabled:opacity-60">
              <RotateCw size={17} />
              {rotating ? 'Rotating...' : 'Rotate'}
            </button>
            <button type="button" onClick={clear} className="tap-target inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-bold text-red-700 transition hover:bg-red-100">
              <Trash2 size={17} />
              Clear
            </button>
          </div>
        </div>
      ) : null}

      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={(event) => chooseFile(event.target.files?.[0])} className="sr-only" />
      <input ref={galleryInputRef} type="file" accept="image/*" onChange={(event) => chooseFile(event.target.files?.[0])} className="sr-only" />
    </div>
  );
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
