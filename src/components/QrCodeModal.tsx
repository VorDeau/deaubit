import { useState } from "react";
import { X, DownloadSimple, CircleNotch, QrCode } from "@phosphor-icons/react";

interface QrCodeModalProps { slug: string; shortUrl: string; onClose: () => void; }

export default function QrCodeModal({ slug, shortUrl, onClose }: QrCodeModalProps) {
  const [downloading, setDownloading] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

  const previewQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=20&color=163-230-53&bgcolor=10-10-10&data=${encodeURIComponent(shortUrl)}`;
  const downloadApiUrl = `/api/qr-download?url=${encodeURIComponent(shortUrl)}`;

  const handleDownload = async () => {
    setDownloading(true); setDownloadError(false);
    try {
      const response = await fetch(downloadApiUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `deaubit-${slug}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      setDownloadError(true);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 db-overlay animate-reveal">
      <div className="db-card animate-modal-in relative w-full max-w-xs shadow-2xl">

        <div className="flex items-center justify-between px-6 py-4 border-b border-(--db-border)">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-(--db-primary)/15 text-(--db-primary) rounded-xl">
              <QrCode size={16} />
            </div>
            <div>
              <h3 className="nothing-title text-sm text-(--db-text)">QR_CODE</h3>
              <p className="nothing-label text-[8px] opacity-40 mt-0.5">/{slug}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-(--db-surface-hover) opacity-30 hover:opacity-100 transition-all group"
          >
            <X size={16} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        <div className="p-5 space-y-4">

          <div className="relative rounded-2xl overflow-hidden bg-(--db-surface-hover) aspect-square border border-(--db-border) flex items-center justify-center">
            {!imgLoaded && (
              <CircleNotch size={28} className="animate-spin text-(--db-primary)" />
            )}
            <img
              src={previewQrUrl}
              alt={`QR ${slug}`}
              className={`w-full h-full object-contain transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0 absolute"}`}
              onLoad={() => setImgLoaded(true)}
            />
          </div>

          <div className="px-3 py-2.5 rounded-xl border border-(--db-border) bg-(--db-surface)">
            <p className="nothing-label text-[8px] opacity-40 mb-0.5">Short_URL</p>
            <p className="font-dot text-xs text-(--db-text) truncate opacity-60">
              {shortUrl.replace(/^https?:\/\//, "")}
            </p>
          </div>

          {downloadError && (
            <p className="text-red-500 font-bold text-[10px] text-center uppercase tracking-widest">
              DOWNLOAD_FAILED
            </p>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3 text-[10px] nothing-label opacity-100">
              CLOSE
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading || !imgLoaded}
              className="btn-primary flex-1 py-3 text-[10px] nothing-label opacity-100 shadow-lg shadow-(--db-primary)/20 disabled:opacity-30"
            >
              {downloading
                ? <CircleNotch size={14} className="animate-spin" />
                : <><DownloadSimple size={14} /> SAVE</>
              }
            </button>
          </div>

          <p className="nothing-label text-[8px] text-center opacity-20 normal-case tracking-normal">
            Download saves as black & white
          </p>
        </div>
      </div>
    </div>
  );
}
