import { useEffect, useRef, useState } from 'react';
import { ErrorBanner } from './ErrorBanner';

const GOOGLE_SCRIPT_ID = 'google-identity-services';

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    const existing = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function GoogleSignInButton({ onCredential, onError }) {
  const containerRef = useRef(null);
  const [scriptError, setScriptError] = useState('');
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !containerRef.current) return undefined;

    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response?.credential) {
              onCredential(response.credential);
            } else {
              onError?.('Google could not finish sign in. Please try again.');
            }
          },
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          width: containerRef.current.offsetWidth || 360,
          text: 'continue_with',
        });
      })
      .catch(() => setScriptError('Google sign in is temporarily unavailable.'));

    return () => {
      cancelled = true;
    };
  }, [clientId, onCredential, onError]);

  if (!clientId) return null;

  return (
    <div className="grid gap-3">
      <div ref={containerRef} className="google-login-shell" />
      <ErrorBanner message={scriptError} onDismiss={() => setScriptError('')} />
    </div>
  );
}
