import React, { useState } from 'react';
import {
  FileText,
  X,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { clsx } from 'clsx';
import { ImageWithFallback } from '../figma/ImageWithFallback';

// ── Types ──────────────────────────────────────────────────────────────
export type PrescriptionStatus = 'received' | 'dispensing' | 'payment_done' | 'ready_pickup' | 'rejected';
export type PrescriptionSource = 'app_camera' | 'fax_telemed' | 'kiosk';

export interface Prescription {
  id: string;
  source: PrescriptionSource;
  patientName: string;
  birthDate: string;
  phone: string;
  hospitalName: string;
  diseaseCode: string;
  status: PrescriptionStatus;
  paymentStatus: 'paid' | 'pending' | 'refunded' | 'na';
  paymentAmount?: string;
  deliveryMethod?: '방문 수령' | '배송';
  isMember?: boolean;
  receivedAt: string;
  imageUrl?: string;
  isNew?: boolean;
}

export const REJECT_REASONS = [
  { id: 'no_drug',  label: '약 재고 없음',    desc: '처방된 약품이 현재 재고에 없습니다.' },
  { id: 'unclear',  label: '처방전 불명확',    desc: '처방전 이미지가 흐리거나 내용을 확인할 수 없습니다.' },
  { id: 'expired',  label: '처방전 기간 만료', desc: '처방전 유효기간이 지났습니다.' },
  { id: 'other',    label: '기타',            desc: '직접 사유를 입력합니다.' },
];

export const getSourceLabel = (source: PrescriptionSource) => {
  if (source === 'app_camera') return '고객 앱 촬영';
  if (source === 'kiosk') return '키오스크 스캔';
  return '의사 웹 전송';
};

export const STATUS_LABEL: Record<PrescriptionStatus, { label: string; color: string; bgColor: string }> = {
  received:     { label: '신규 접수', color: 'text-blue-600',   bgColor: 'bg-blue-50' },
  dispensing:   { label: '조제 중',   color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  payment_done: { label: '결제 완료', color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  ready_pickup: { label: '수령 대기', color: 'text-green-600',  bgColor: 'bg-green-50' },
  rejected:     { label: '거절/반려', color: 'text-red-600',    bgColor: 'bg-red-50' },
};

export const StatusText: React.FC<{ status: PrescriptionStatus }> = ({ status }) => {
  const { label, color, bgColor } = STATUS_LABEL[status];
  return (
    <span className={clsx(
      'inline-flex px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap',
      color,
      bgColor
    )}>
      {label}
    </span>
  );
};

interface PrescriptionDetailModalProps {
  prescription: Prescription;
  onClose: () => void;
  onUpdateStatus?: (newStatus: PrescriptionStatus) => void;
}

export const PrescriptionDetailModal: React.FC<PrescriptionDetailModalProps> = ({
  prescription,
  onClose,
  onUpdateStatus
}) => {
  const [zoom, setZoom] = useState(1);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNote, setRejectNote] = useState('');

  const dispenseLabel = prescription.status === 'dispensing' ? '조제 완료 및 결제 요청' : '조제 시작';
  const dispenseNext: PrescriptionStatus = prescription.status === 'dispensing' ? 'payment_done' : 'dispensing';
  const showDispenseBtn = !['payment_done', 'ready_pickup', 'rejected'].includes(prescription.status);
  const showRejectBtn = !['rejected'].includes(prescription.status);

  const confirmReject = () => {
    onUpdateStatus?.('rejected');
    setRejectOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex overflow-hidden max-h-[90vh] animate-in zoom-in-95 fade-in duration-200">

        {/* Left: image viewer */}
        <div className="flex-1 bg-gray-100 flex flex-col min-w-0">
          <div className="flex justify-end gap-2 p-3 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
            <button onClick={() => setZoom(z => Math.min(z + 0.25, 3))} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"><ZoomIn size={16} /></button>
            <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"><ZoomOut size={16} /></button>
          </div>
          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            {prescription.imageUrl ? (
              <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center top', transition: 'transform 0.2s' }}>
                <ImageWithFallback src={prescription.imageUrl} alt="처방전" className="max-w-full rounded-lg shadow" />
              </div>
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                <FileText size={48} className="mb-2 opacity-40" />
                <p className="text-sm">이미지 없음</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: info + actions */}
        <div className="w-80 flex flex-col border-l border-gray-200 flex-shrink-0">
          {/* Right header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-blue-600" />
              <span className="text-sm font-bold text-gray-900">처방전 검토</span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"><X size={16} /></button>
          </div>

          {/* Scrollable info */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {/* 조제 상태 */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">조제 상태</span>
              <StatusText status={prescription.status} />
            </div>

            {/* 환자 정보 */}
            <div>
              <p className="text-sm font-bold text-gray-900 mb-3">환자 정보</p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5">고객명</p>
                    <p className="text-sm font-medium text-gray-900">{prescription.patientName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5">생년월일</p>
                    <p className="text-sm font-medium text-gray-900">{prescription.birthDate}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 mb-0.5">휴대폰 번호</p>
                  <p className="text-sm font-medium text-blue-600">{prescription.phone}</p>
                </div>
              </div>
            </div>

            {/* 처방 정보 */}
            <div>
              <p className="text-sm font-bold text-gray-900 mb-3">처방 정보</p>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-gray-400 mb-0.5">발행 병원</p>
                  <p className="text-sm font-medium text-gray-900">
                    {prescription.source === 'app_camera' ? '확인 안됨' : prescription.hospitalName}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5">대체조제 동의</p>
                    <p className="text-sm font-medium text-gray-900">동의</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5">수령 방법</p>
                    <p className="text-sm font-medium text-gray-900">{prescription.deliveryMethod ?? '—'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 mb-0.5">접수 경로</p>
                  <p className="text-sm font-medium text-blue-600">{getSourceLabel(prescription.source)}</p>
                </div>
              </div>
            </div>

            {/* Developer Note (Prototype Instruction) */}
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                이 팝업은 자체 개발 하지 않습니다.<br />
                <a 
                  href="https://mims-account.mcircle.co.kr/login" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline break-all block my-1"
                >
                  https://mims-account.mcircle.co.kr/login
                </a>
                링크를 엽니다.<br />
                로그인 버튼을 누르고 탐색을 계속 하세요.
              </p>
            </div>
          </div>

          {/* Action buttons at bottom */}
          <div className="px-5 pb-5 pt-3 border-t border-gray-100 space-y-2">
            {/* 조제 시작 / 조제 완료 */}
            {showDispenseBtn && (
              <button
                onClick={() => onUpdateStatus?.(dispenseNext)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
              >
                {dispenseLabel}
              </button>
            )}

            {/* 거절/반려 — accordion */}
            {showRejectBtn && (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setRejectOpen(o => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  거절 / 반려
                  {rejectOpen ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
                </button>

                {rejectOpen && (
                  <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-2 bg-gray-50">
                    {REJECT_REASONS.map(r => (
                      <label key={r.id} className={clsx('flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all text-sm',
                        rejectReason === r.id ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
                      )}>
                        <input type="radio" name="reject" value={r.id} checked={rejectReason === r.id}
                          onChange={() => setRejectReason(r.id)} className="mt-0.5 accent-red-500 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800 text-xs">{r.label}</p>
                          <p className="text-gray-500 text-[11px] mt-0.5">{r.desc}</p>
                        </div>
                      </label>
                    ))}
                    {rejectReason === 'other' && (
                      <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)}
                        placeholder="반려 사유를 직접 입력하세요." rows={2}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none resize-none"
                      />
                    )}
                    <button
                      onClick={confirmReject}
                      disabled={!rejectReason || (rejectReason === 'other' && !rejectNote.trim())}
                      className="w-full py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      반려 확정
                    </button>
                  </div>
                )}
              </div>
            )}

            {prescription.status === 'rejected' && (
              <div className="w-full py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium text-center">
                거절/반려 처리된 처방전입니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
