import { Download, WifiOff } from 'lucide-react';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export function PwaStatusBanner() {
  const online = useOnlineStatus();
  const { canInstall, install } = useInstallPrompt();

  if (!online) {
    return (
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          <WifiOff size={17} />
          You are offline. Upload, AI explanation, grading, and history sync require internet.
        </div>
      </div>
    );
  }

  if (!canInstall) return null;

  return (
    <div className="border-b border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-ocean">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span>Install StudyAI for a faster mobile app experience.</span>
        <button type="button" onClick={install} className="primary-button px-3 text-sm">
          <Download size={16} />
          Install app
        </button>
      </div>
    </div>
  );
}
