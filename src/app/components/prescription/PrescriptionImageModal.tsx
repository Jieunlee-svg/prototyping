import React from 'react';
import {
  X,
  Calendar,
  User,
  Building2,
  FileText,
  Download,
  ZoomIn,
  ZoomOut,
  ImageOff
} from 'lucide-react';
import { clsx } from 'clsx';

interface PrescriptionImageModalProps {
  imageUrl?: string;
  patientName: string;
  receivedAt: string;
  hospitalName: string;
  status: string;
  statusLabel: string;
  source: string;
  onClose: () => void;
}

export const PrescriptionImageModal: React.FC<PrescriptionImageModalProps> = ({
  imageUrl,
  patientName,
  receivedAt,
  hospitalName,
  status,
  statusLabel,
  source,
  onClose,
}) => {
  const [zoom, setZoom] = React.useState(1);
  const [imageError, setImageError] = React.useState(false);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  const statusStyle = (() => {
    switch (status) {
      case 'received': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'cancelled': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  })();

  const sourceLabel = source === 'app_camera' ? '고객 앱 촬영' : source === 'kiosk' ? '키오스크 스캔' : '비대면 진료';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <FileText size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">처방전 원본 보기</h2>
              <p className="text-xs text-gray-400 mt-0.5">접수된 처방전 이미지를 확인합니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
          >
            <X size={18} />
          </button>
        </div>

        {/* Info Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-4 flex-wrap text-xs text-gray-600 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <User size={13} className="text-gray-400" />
            <span className="font-semibold text-gray-800">{patientName}</span>
          </div>
          <div className="w-px h-3.5 bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-gray-400" />
            <span>{receivedAt}</span>
          </div>
          <div className="w-px h-3.5 bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <Building2 size={13} className="text-gray-400" />
            <span>{hospitalName}</span>
          </div>
          <div className="w-px h-3.5 bg-gray-200" />
          <span className={clsx('px-2 py-0.5 rounded-full text-[11px] font-medium border', statusStyle)}>
            {statusLabel}
          </span>
          <div className="w-px h-3.5 bg-gray-200" />
          <span className="text-gray-400">{sourceLabel}</span>
        </div>

        {/* Image Area */}
        <div className="flex-1 overflow-auto bg-gray-100 relative min-h-[300px]">
          {imageUrl && !imageError ? (
            <div className="flex items-center justify-center p-6 min-h-[400px]">
              <img
                src={imageUrl}
                alt="처방전 원본 이미지"
                className="rounded-lg shadow-lg transition-transform duration-200 ease-out"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                onError={() => setImageError(true)}
                draggable={false}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-400">
              <ImageOff size={48} className="mb-4 text-gray-300" />
              <p className="text-sm font-medium">처방전 이미지를 불러올 수 없습니다.</p>
              <p className="text-xs text-gray-300 mt-1">이미지가 삭제되었거나 접근할 수 없습니다.</p>
            </div>
          )}
        </div>

        {/* Footer Toolbar */}
        <div className="px-6 py-3 border-t border-gray-100 bg-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none"
              aria-label="축소"
            >
              <ZoomOut size={16} className="text-gray-600" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs font-medium text-gray-600 transition-colors focus:outline-none tabular-nums"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none"
              aria-label="확대"
            >
              <ZoomIn size={16} className="text-gray-600" />
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
