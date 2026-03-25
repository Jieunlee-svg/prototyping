import React from 'react';
import { HeartPulse, X, User, MessageSquare, Bell, CheckCircle, Clock, RefreshCw } from 'lucide-react';
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

// 섹션 헤더 공통 컴포넌트
const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; color: string }> = ({ icon, title, color }) => (
  <div className={clsx('flex items-center gap-2 px-5 py-3 border-b border-gray-100', color)}>
    {icon}
    <span className="text-sm font-bold text-gray-700">{title}</span>
  </div>
);

// 라벨-값 행 공통 컴포넌트
const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-xs text-gray-400 w-28 flex-shrink-0">{label}</span>
    <span className="text-sm font-medium text-gray-800 text-right">{value}</span>
  </div>
);

// 재처방 예정일 계산 (sentAt + duration일)
const calcRefillDate = (sentAt: string, duration: number): string => {
  try {
    const base = new Date(sentAt.replace(' ', 'T'));
    base.setDate(base.getDate() + duration);
    return base.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '-').replace('.', '');
  } catch {
    return '—';
  }
};

export const ConsultationDetailModal: React.FC<ConsultationDetailModalProps> = ({ data, onClose }) => {
  const refillDate = calcRefillDate(data.sentAt, data.duration);
  const reminderEnabled = data.reminderEnabled ?? true;
  const refillAlertEnabled = data.refillAlertEnabled ?? true;
  const adherenceRate = data.adherenceRate ?? 87;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-gray-900/75" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">

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

          <div className="overflow-y-auto max-h-[72vh]">

            {/* ── Section 1: 고객 정보 ── */}
            <div className="border-b border-gray-100">
              <SectionHeader
                icon={<User size={14} className="text-blue-600" />}
                title="고객 정보"
                color="bg-blue-50/60"
              />
              <div className="px-5 py-1">
                <Row label="고객명" value={<span className="font-bold text-gray-900">{data.patientName}</span>} />
                <Row label="생년월일" value={data.birthDate ?? '—'} />
                <Row label="성별" value={data.gender ?? '—'} />
                <Row label="휴대폰 번호" value={data.phone} />
              </div>
            </div>

            {/* ── Section 2: 복약 상담 메시지 ── */}
            <div className="border-b border-gray-100">
              <SectionHeader
                icon={<MessageSquare size={14} className="text-emerald-600" />}
                title="복약 상담 메시지"
                color="bg-emerald-50/60"
              />
              <div className="px-5 py-1">
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

              {/* 메시지 내용 */}
              <div className="px-5 pb-4">
                <p className="text-xs text-gray-400 mb-2">전송 내용</p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto">
                  {data.messageContent}
                </div>
              </div>
            </div>

            {/* ── Section 3: 복약 알림 및 재처방 알림 ── */}
            <div>
              <SectionHeader
                icon={<Bell size={14} className="text-purple-600" />}
                title="복약 알림 및 재처방 알림"
                color="bg-purple-50/60"
              />
              <div className="px-5 py-3 space-y-4">

                {/* 복약 알림 */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-purple-500" />
                      <span className="text-xs font-bold text-gray-600">복약 알림</span>
                    </div>
                    <span className={clsx(
                      'text-[11px] font-bold px-2 py-0.5 rounded-full',
                      reminderEnabled ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-500'
                    )}>
                      {reminderEnabled ? '활성' : '비활성'}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">알림 시간</span>
                      <span className="font-medium text-gray-700">{data.times.join(', ')} ({data.relation})</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">30일 복약 순응도</span>
                      <span className={clsx(
                        'font-bold',
                        adherenceRate >= 80 ? 'text-emerald-600' : adherenceRate >= 50 ? 'text-orange-500' : 'text-red-500'
                      )}>
                        {adherenceRate}%
                      </span>
                    </div>
                  </div>
                  {/* 순응도 바 */}
                  <div className="mt-2.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={clsx('h-full rounded-full transition-all', adherenceRate >= 80 ? 'bg-emerald-500' : adherenceRate >= 50 ? 'bg-orange-400' : 'bg-red-400')}
                      style={{ width: `${adherenceRate}%` }}
                    />
                  </div>
                </div>

                {/* 재처방 알림 */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <RefreshCw size={13} className="text-purple-500" />
                      <span className="text-xs font-bold text-gray-600">재처방 알림</span>
                    </div>
                    <span className={clsx(
                      'text-[11px] font-bold px-2 py-0.5 rounded-full',
                      refillAlertEnabled ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-500'
                    )}>
                      {refillAlertEnabled ? '활성' : '비활성'}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">복약 종료 예정일</span>
                      <span className="font-medium text-gray-700">{refillDate}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">알림 전송 예정</span>
                      <span className="font-medium text-gray-700">종료 3일 전</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-1">
                      <CheckCircle size={11} />
                      알림 전송 예약 완료
                    </div>
                  </div>
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
    </div>
  );
};
