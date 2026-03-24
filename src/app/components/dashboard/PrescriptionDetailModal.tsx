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
export type PrescriptionStatus = 'received' | 'completed' | 'cancelled';
export type PrescriptionSource = 'app_camera' | 'fax_telemed' | 'kiosk';

export interface Prescription {
  id: string;
  source: PrescriptionSource;
  patientName: string;
  birthDate: string;
  phone: string;
  gender?: '여성' | '남성';
  hospitalName: string;
  diseaseCode: string;
  status: PrescriptionStatus;
  deliveryMethod?: '본인 방문' | '가족 방문' | '퀵' | '택배';
  isConsentSubstitute?: boolean;
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
  if (source === 'kiosk') return '키오스크 스캔(TBD)';
  return '의사 웹 전송';
};

export const STATUS_LABEL: Record<PrescriptionStatus, { label: string; color: string; bgColor: string }> = {
  received:  { label: '접수됨',   color: 'text-blue-600',    bgColor: 'bg-blue-50' },
  completed: { label: '조제 완료', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  cancelled: { label: '취소됨',   color: 'text-gray-500',    bgColor: 'bg-gray-100' },
};

export const StatusText: React.FC<{ status: PrescriptionStatus }> = ({ status }) => {
  // Safety check: provide a default if status is not found in STATUS_LABEL
  const { label, color, bgColor } = STATUS_LABEL[status] || { label: '알 수 없음', color: 'text-gray-600', bgColor: 'bg-gray-50' };
  
  const getBorderColor = (s: PrescriptionStatus) => {
    if (s === 'received') return 'border-red-100';
    if (s === 'dispensing' || s === 'dispensing_done') return 'border-blue-100';
    if (s === 'rejected') return 'border-orange-100';
    return 'border-emerald-100';
  };

  return (
    <span className={clsx(
      'inline-flex px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap border',
      getBorderColor(status),
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
  const [paymentAmount, setPaymentAmount] = useState(prescription.paymentAmount ? prescription.paymentAmount.replace(/[^0-9]/g, '') : '');
  const [isNoPayment, setIsNoPayment] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [tempStatus, setTempStatus] = useState<PrescriptionStatus>(prescription.status);

  const handleUpdateStatus = (newStatus: PrescriptionStatus) => {
    onUpdateStatus?.(newStatus);
    setIsChangingStatus(false);
  };

  const confirmReject = () => {
    handleUpdateStatus('rejected');
    setRejectOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex overflow-hidden max-h-[90vh] animate-in zoom-in-95 fade-in duration-200">

        {/* Left: image viewer */}
        <div className="flex-1 bg-gray-100 flex flex-col min-w-0 border-r border-gray-200">
          <div className="flex justify-end gap-2 p-3 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
            <button onClick={() => setZoom(z => Math.min(z + 0.25, 3))} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"><ZoomIn size={16} /></button>
            <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"><ZoomOut size={16} /></button>
          </div>
          <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-gray-50">
            {prescription.imageUrl ? (
              <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center top', transition: 'transform 0.2s' }}>
                <ImageWithFallback src={prescription.imageUrl} alt="처방전" className="max-w-full rounded-lg shadow-xl" />
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
        <div className="w-80 flex flex-col flex-shrink-0 bg-white">
          {/* Right header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText size={15} className="text-blue-600" />
              </div>
              <span className="text-[15px] font-bold text-gray-900">
                {prescription.status === 'rejected' ? '취소 / 반려 상세' : '처방전 검토'}
              </span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X size={18} /></button>
          </div>

          {/* Scrollable info */}
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
            {/* 결제 금액 안내 (결제 완료 상태일 때만) */}
            {prescription.status === 'payment_done' && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">₩</span>
                </div>
                <p className="text-sm font-bold text-blue-600">
                  결제 금액: <span className="text-blue-700">{paymentAmount ? `${Number(paymentAmount).toLocaleString()}원` : '미입력'}</span>
                </p>
              </div>
            )}

            {/* 조제 상태 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">조제 상태</span>
              <StatusText status={prescription.status} />
            </div>

            {/* 환자 정보 */}
            <div>
              <p className="text-lg font-bold text-gray-900 mb-4">환자 정보</p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">고객명</p>
                    <p className="text-sm font-medium text-gray-900">{prescription.patientName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">생년월일</p>
                    <p className="text-sm font-medium text-gray-900">{prescription.birthDate}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">휴대폰 번호</p>
                  <p className="text-sm font-medium text-gray-900">{prescription.phone}</p>
                </div>
              </div>
            </div>

            {/* 처방 정보 */}
            <div>
              <p className="text-lg font-bold text-gray-900 mb-4">처방 정보</p>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">발행 병원</p>
                  <p className="text-sm font-medium text-gray-900">{prescription.hospitalName}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">대체조제 동의</p>
                    <p className="text-sm font-medium text-gray-900">
                      {prescription.isConsentSubstitute !== false ? '동의' : '미동의'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">수령 방법</p>
                    <p className="text-sm font-medium text-gray-900">{prescription.deliveryMethod ?? '—'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">접수 경로</p>
                  <span className="inline-flex px-2 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold rounded">
                    {getSourceLabel(prescription.source)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons at bottom */}
          <div className="px-5 pb-6 pt-4 border-t border-gray-100 space-y-3 bg-white">
            {/* Rejection selection UI */}
            {rejectOpen ? (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="p-4 bg-gray-50 rounded-xl space-y-2.5 border border-red-100">
                  <p className="text-xs font-bold text-gray-900 mb-1">반려 사유</p>
                  <select 
                    value={rejectReason} 
                    onChange={e => setRejectReason(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-300"
                  >
                    <option value="">사유를 선택하세요</option>
                    {REJECT_REASONS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setRejectOpen(false)} className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-100 rounded-lg">취소</button>
                  <button onClick={confirmReject} disabled={!rejectReason} className="flex-1 py-3 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-50">확정</button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {isChangingStatus ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-gray-900 mb-2">상태 선택</p>
                      <select 
                        value={tempStatus}
                        onChange={e => setTempStatus(e.target.value as PrescriptionStatus)}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-[15px] font-medium text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                      >
                        <option value="received">신규 접수</option>
                        <option value="dispensing">조제 중</option>
                        <option value="dispensing_done">조제 완료</option>
                        <option value="payment_done">결제 완료</option>
                        <option value="rejected">취소 / 반려</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setIsChangingStatus(false)} className="flex-1 py-3.5 border border-gray-200 text-gray-700 text-[15px] font-bold rounded-lg hover:bg-gray-50">취소</button>
                      <button onClick={() => handleUpdateStatus(tempStatus)} className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-[15px] font-bold rounded-lg shadow-lg active:scale-[0.98]">확인</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {prescription.status === 'received' && (
                      <>
                        <button onClick={() => handleUpdateStatus('dispensing')} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-[15px] font-bold rounded-lg transition-all shadow-lg active:scale-[0.98]">조제 시작</button>
                        <button onClick={() => setRejectOpen(true)} className="w-full py-3 border border-gray-200 text-gray-700 text-[15px] font-medium rounded-lg hover:bg-gray-50">취소 / 반려</button>
                      </>
                    )}

                    {prescription.status === 'dispensing' && (
                      <>
                        <button onClick={() => handleUpdateStatus('dispensing_done')} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-[15px] font-bold rounded-lg shadow-lg active:scale-[0.98]">조제 완료</button>
                        <button onClick={() => handleUpdateStatus('received')} className="w-full py-3 border border-gray-200 text-gray-700 text-[15px] font-medium rounded-lg hover:bg-gray-50">조제 중단</button>
                      </>
                    )}

                    {prescription.status === 'dispensing_done' && (
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 text-[10px] font-bold">₩</span>
                            </div>
                            <span className="text-xs font-bold text-gray-900">결제 금액 입력</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between gap-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                              <input 
                                type="text" 
                                value={isNoPayment ? '' : paymentAmount} 
                                disabled={isNoPayment}
                                onChange={e => setPaymentAmount(e.target.value.replace(/[^0-9]/g, ''))}
                                className="bg-transparent text-[15px] w-full outline-none font-bold text-gray-900 disabled:text-gray-300" 
                                placeholder="0"
                              />
                              <span className={clsx("text-sm font-bold", isNoPayment ? "text-gray-300" : "text-gray-900")}>원</span>
                            </div>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={isNoPayment}
                                onChange={e => setIsNoPayment(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-xs font-medium text-gray-500">미입력</span>
                            </label>
                          </div>
                        </div>
                        <button onClick={() => handleUpdateStatus('payment_done')} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-[15px] font-bold rounded-lg shadow-lg active:scale-[0.98]">결제 완료</button>
                      </div>
                    )}

                    {prescription.status === 'payment_done' && (
                      <div className="space-y-3">
                        <button disabled className="w-full py-4 bg-gray-50 border border-gray-200 text-gray-400 text-[15px] font-bold rounded-lg cursor-not-allowed">결제 완료된 처방전입니다.</button>
                        <button onClick={() => { setTempStatus('payment_done'); setIsChangingStatus(true); }} className="w-full py-3 border border-gray-200 text-gray-700 text-[15px] font-medium rounded-lg hover:bg-gray-50">상태 변경</button>
                      </div>
                    )}

                    {prescription.status === 'completed' && (
                      <button onClick={onClose} className="w-full py-3.5 bg-white border border-gray-200 text-gray-700 text-[15px] font-bold rounded-lg shadow-sm">닫기</button>
                    )}

                    {prescription.status === 'rejected' && (
                      <div className="space-y-3">
                        <button disabled className="w-full py-4 bg-gray-50 border border-gray-200 text-gray-400 text-[15px] font-bold rounded-lg cursor-not-allowed">취소 / 반려된 처방전입니다.</button>
                        <button onClick={() => { setTempStatus('rejected'); setIsChangingStatus(true); }} className="w-full py-3 border border-gray-200 text-gray-700 text-[15px] font-medium rounded-lg hover:bg-gray-50">상태 변경</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
