import React from 'react';
import { HeartPulse, X, User, MessageSquare, Bell, Clock, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

export interface ConsultationData {
  id: string;
  patientName: string;
  birthDate?: string;
  gender?: '남성' | '여성';
  phone: string;
  sendMethod: '알림톡' | '웰체크 앱' | '문자';
  sentAt: string;
  summary?: string;
  frequency: number;
  times: string[];
  relation: string;
  duration: number;
  messageContent: string;
  reminderEnabled?: boolean;
  refillAlertEnabled?: boolean;
  adherenceRate?: number;
}

interface ConsultationDetailModalProps {
  data: ConsultationData;
  onClose: () => void;
}

const getSendMethodBadge = (method: string) => {
  const styles: Record<string, string> = {
    '알림톡': 'bg-yellow-100 text-yellow-800',
    '웰체크 앱': 'bg-blue-100 text-blue-800',
    '문자': 'bg-green-100 text-green-800',
  };
  return (
    <span className={clsx('inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold', styles[method] ?? 'bg-gray-100 text-gray-600')}>
      {method}
    </span>
  );
};

// 컬럼 섹션 헤더
const ColHeader: React.FC<{ icon: React.ReactNode; title: string; accent: string }> = ({ icon, title, accent }) => (
  <div className={clsx('flex items-center gap-2 px-4 py-2.5 rounded-lg mb-3', accent)}>
    {icon}
    <span className="text-xs font-bold text-gray-700 tracking-wide">{title}</span>
  </div>
);

// 라벨-값 행
const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
    <span className="text-xs text-gray-400 w-24 flex-shrink-0">{label}</span>
    <span className="text-sm font-medium text-gray-800 text-right">{value}</span>
  </div>
);


export const ConsultationDetailModal: React.FC<ConsultationDetailModalProps> = ({ data, onClose }) => {
  const reminderEnabled = data.reminderEnabled ?? true;
  const refillAlertEnabled = data.refillAlertEnabled ?? true;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-900/75" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">

        {/* ── 모달 헤더 ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <HeartPulse size={18} className="text-blue-600" />
            복약 상담 상세
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <X size={18} />
          </button>
        </div>

        {/* ── 2열 본문 ── */}
        <div className="grid grid-cols-2 divide-x divide-gray-100">

          {/* ── 좌측: 고객 정보 + 복약 알림 ── */}
          <div className="p-5 flex flex-col gap-5">

            {/* Section 1: 고객 정보 */}
            <div>
              <ColHeader
                icon={<User size={13} className="text-blue-600" />}
                title="고객 정보"
                accent="bg-blue-50/70"
              />
              <div className="px-1">
                <Row label="고객명" value={<span className="font-bold text-gray-900">{data.patientName}</span>} />
                <Row label="생년월일" value={data.birthDate ?? '—'} />
                <Row label="성별" value={data.gender ?? '—'} />
                <Row label="휴대폰 번호" value={data.phone} />
              </div>
            </div>

            {/* Section 3: 복약 알림 및 재처방 알림 */}
            <div>
              <ColHeader
                icon={<Bell size={13} className="text-purple-600" />}
                title="복약 알림 및 재처방 알림"
                accent="bg-purple-50/70"
              />
              <div className="space-y-3">

                {/* 복약 알림 카드 */}
                <div className="bg-gray-50 rounded-xl p-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-purple-500" />
                      <span className="text-xs font-bold text-gray-600">복약 알림</span>
                    </div>
                    <span className={clsx(
                      'text-[11px] font-bold px-2 py-0.5 rounded-full',
                      reminderEnabled ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-500'
                    )}>
                      {reminderEnabled ? '보냄' : '안보냄'}
                    </span>
                  </div>
                </div>

                {/* 재처방 알림 카드 */}
                <div className="bg-gray-50 rounded-xl p-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <RefreshCw size={12} className="text-purple-500" />
                      <span className="text-xs font-bold text-gray-600">재처방 알림</span>
                    </div>
                    <span className={clsx(
                      'text-[11px] font-bold px-2 py-0.5 rounded-full',
                      refillAlertEnabled ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-500'
                    )}>
                      {refillAlertEnabled ? '보냄' : '안보냄'}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ── 우측: 복약 상담 메시지 ── */}
          <div className="p-5 flex flex-col">
            <ColHeader
              icon={<MessageSquare size={13} className="text-emerald-600" />}
              title="복약 상담 메시지"
              accent="bg-emerald-50/70"
            />
            <div className="px-1">
              <Row label="전송 방법" value={getSendMethodBadge(data.sendMethod)} />
              <Row label="전송 시각" value={data.sentAt} />
              <Row
                label="복용 횟수"
                value={
                  <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700">
                    하루 {data.frequency}회
                  </span>
                }
              />
              <Row label="복용 시점" value={data.relation} />
              <Row label="복용 시간" value={data.times.join(', ')} />
              <Row label="복약 일수" value={`${data.duration}일`} />
            </div>

            {/* 전송 내용 */}
            <div className="mt-4 flex-1 flex flex-col">
              <p className="text-xs text-gray-400 mb-2">전송 내용</p>
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 whitespace-pre-line leading-relaxed overflow-y-auto" style={{ minHeight: '160px' }}>
                {data.messageContent}
              </div>
            </div>
          </div>
        </div>

        {/* ── 푸터 ── */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
