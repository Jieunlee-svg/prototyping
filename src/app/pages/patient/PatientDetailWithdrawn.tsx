import React, { useState } from 'react';
import {
  ArrowLeft,
  FileText,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Camera,
  Printer,
  Monitor,
  Search,
  ChevronDown,
  Check,
  Send,
  Video,
  Phone,
  Paperclip,
  MessageSquare,
  Mic,
  Smile,
  Info,
  UserX,
  AlertTriangle,
  ShieldX,
  Ban
} from 'lucide-react';
import {
  PrescriptionWorkflowModal
} from '../../components/prescription/PrescriptionWorkflowModal';
import {
  ConsultationDetailModal,
  ConsultationData
} from '../../components/consultation/ConsultationDetailModal';
import { clsx } from 'clsx';
import {
  Prescription,
  PrescriptionDetailModal,
  StatusText,
  PrescriptionStatus,
  PrescriptionSource
} from '../../components/prescription/PrescriptionDetailModal';
import { TelemedPrescriptionDetail } from '../../components/prescription/TelemedPrescriptionDetail';
import { PrescriptionImageModal } from '../../components/prescription/PrescriptionImageModal';

const MOCK_PRESCRIPTIONS: Prescription[] = [
  { id: 'RX-W-003', receivedAt: '2026-03-16 16:45', source: 'fax_telemed', status: 'completed', hospitalName: '연세세브란스',    patientName: '십칠스프린트탈퇴', birthDate: '1987-03-12', phone: '010-1234-5678', diseaseCode: 'I10', isConsentSubstitute: true, deliveryMethod: '가족 방문' },
  { id: 'RX-W-002', receivedAt: '2026-03-15 14:30', source: 'app_camera',  status: 'completed', hospitalName: '김민수이비인후과', patientName: '십칠스프린트탈퇴', birthDate: '1987-03-12', phone: '010-1234-5678', diseaseCode: 'I10', isConsentSubstitute: true, deliveryMethod: '본인 방문' },
  { id: 'RX-W-001', receivedAt: '2026-03-14 11:20', source: 'app_camera',  status: 'completed', hospitalName: '우리들병원',      patientName: '십칠스프린트탈퇴', birthDate: '1987-03-12', phone: '010-1234-5678', diseaseCode: 'I10', isConsentSubstitute: true, deliveryMethod: '본인 방문' },
];

const STATUS_LABEL: Record<PrescriptionStatus, { label: string; color: string; bgColor: string }> = {
  received:  { label: '접수됨',   color: 'text-blue-600',    bgColor: 'bg-blue-50' },
  completed: { label: '조제 완료', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  cancelled: { label: '취소됨',   color: 'text-gray-500',    bgColor: 'bg-gray-100' },
};

const getSourceIcon = (source: string) => {
  if (source === 'app_camera') return <Camera size={14} className="text-gray-400" />;
  if (source === 'kiosk') return <Printer size={14} className="text-gray-400" />;
  return <Printer size={14} className="text-gray-400" />;
};

const getSourceLabel = (source: string) => {
  if (source === 'app_camera') return '고객 앱 촬영';
  if (source === 'kiosk') return '키오스크 스캔(TBD)';
  return '비대면 진료';
};

interface PatientDetailProps {
  onBack: () => void;
  patientId: string | null;
}

export const PatientDetailWithdrawn: React.FC<PatientDetailProps> = ({ onBack, patientId }) => {
  const [memo] = useState("고객 특이사항:\n- 알약 삼키는 것을 힘들어함\n- 저녁 식후 복약 선호\n\n다음 상담 시 확인:\n- 어지럼증 호전 여부");

  const [prescriptions] = useState<Prescription[]>(MOCK_PRESCRIPTIONS);
  const [telemedPrescription, setTelemedPrescription] = useState<Prescription | null>(null);

  const [filter, setFilter] = useState<'all' | PrescriptionSource>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PrescriptionStatus>('all');

  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationData | null>(null);
  const [imagePrescription, setImagePrescription] = useState<Prescription | null>(null);
  const sentIds = new Set(['RX-W-003', 'RX-W-002', 'RX-W-001']);
  const sentConsultations: Record<string, ConsultationData> = {
    'RX-W-003': {
      id: 'RX-W-003',
      patientName: '십칠스프린트탈퇴',
      birthDate: '1987-03-12',
      gender: '여성',
      phone: '010-1234-5678',
      sendMethod: '알림톡',
      sentAt: '2026-03-16 16:45',
      frequency: 3,
      times: ['아침', '점심', '저녁'],
      relation: '식후 30분',
      duration: 14,
      messageContent: '[복약 상담 안내]\n안녕하세요, 웰체크약국입니다.\n처방받으신 약품을 안내드립니다.',
      reminderEnabled: true,
      refillAlertEnabled: true,
      adherenceRate: 85,
    },
  };

  const filteredPrescriptions = prescriptions.filter(p => {
    return (filter === 'all' || p.source === filter) && (statusFilter === 'all' || p.status === statusFilter);
  });

  const patientInfo = {
    name: '십칠스프린트탈퇴',
    birthDate: '1987-03-12',
    gender: '여성' as const,
    phone: '010-****-5678',
    disease: '고혈압',
    isRegular: false,
    withdrawnAt: '2026-04-10 09:30'
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Header Section */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex-none z-20 shadow-sm relative">
        <div className="flex justify-between items-start">
          <div className="flex items-start">
            <button
              onClick={onBack}
              className="mr-4 mt-1 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>

            <div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-400">{patientInfo.name}</h1>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-200">
                    <UserX size={13} />
                    탈퇴한 회원
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                  <span>{patientInfo.birthDate}</span>
                  <span className="text-gray-300">·</span>
                  <span>만 40세</span>
                  <span className="text-gray-300">·</span>
                  <span>{patientInfo.gender}</span>
                  <span className="text-gray-300">·</span>
                  <span>{patientInfo.phone}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-red-400 text-xs">탈퇴일: {patientInfo.withdrawnAt}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Withdrawn Notice Banner */}
      <div className="mx-6 mt-4 px-5 py-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
        <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-red-700 mb-1">탈퇴한 회원의 정보입니다</p>
          <p className="text-xs text-red-500 leading-relaxed">
            개인정보 보호 정책에 따라 일부 정보는 마스킹 처리되며, 메시지 전송 및 상태 변경 등의 기능이 제한됩니다.
            과거 처방전 기록과 복약 상담 내역은 조회만 가능합니다.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-6 w-full h-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          {/* Left Column: Pharmacist Memo (2 cols) — Read Only */}
          <section className="lg:col-span-2 flex flex-col min-h-0">
            <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2 mb-3">
              <FileText size={18} className="text-gray-400" />
              약사 메모
            </h3>
            <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col flex-1 min-h-0 relative overflow-hidden opacity-60">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1.5">
                  <FileText size={14} />
                </span>
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Ban size={10} />
                  읽기 전용
                </span>
              </div>
              <textarea
                className="flex-1 bg-transparent resize-none text-sm text-gray-500 placeholder-gray-400 outline-none leading-relaxed cursor-not-allowed"
                value={memo}
                disabled
                readOnly
              />
            </div>
          </section>

          {/* Center Column: Chat UI (4 cols) — Disabled */}
          <section className="lg:col-span-4 flex flex-col min-h-0">
            <WithdrawnChatChannel patientName={patientInfo.name} withdrawnAt={patientInfo.withdrawnAt} />
          </section>

          {/* Right Column: Prescription List Section (6 cols) */}
          <section className="lg:col-span-6 flex flex-col min-h-0 space-y-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <FileText size={18} className="text-gray-400" />
                  과거 처방전 기록
                  <span className="text-xs text-gray-400 font-normal">(조회 전용)</span>
                </h3>
              </div>

              {/* Filter Toolbar */}
              <div className="py-2.5 bg-white border border-gray-200 rounded-xl px-4 flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {([
                    { value: 'all', label: '전체', icon: undefined as React.ReactNode },
                    { value: 'app_camera', label: '고객 앱 촬영', icon: <Camera size={13} /> as React.ReactNode },
                    { value: 'fax_telemed', label: '비대면 진료', icon: <Printer size={13} /> as React.ReactNode },
                  ]).map(({ value, label, icon }) => (
                    <button key={value} onClick={() => setFilter(value as any)}
                      className={clsx('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium border transition-all',
                        filter === value ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-500 bg-white hover:border-gray-400 hover:text-gray-700'
                      )}
                    >{icon}{label}</button>
                  ))}
                  <div className="w-px h-4 bg-gray-200 mx-1" />
                  <select className="text-[13px] border border-gray-200 text-gray-500 rounded-full px-3 py-1 bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none cursor-pointer"
                    value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
                    <option value="all">모든 상태</option>
                    <option value="received">접수됨</option>
                    <option value="completed">조제 완료</option>
                    <option value="cancelled">취소됨</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] text-gray-400">총 <span className="text-blue-600 font-semibold">{filteredPrescriptions.length}</span>건</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-auto flex-1 custom-scrollbar">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">접수 일시</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">접수 경로</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">대체조제 동의</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">수령 방법</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">발행 병원</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">상태</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">복약 상담</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredPrescriptions.map((rx: Prescription) => {
                    const isSent = sentIds.has(rx.id);
                    const { label, color, bgColor } = STATUS_LABEL[rx.status];

                    return (
                      <tr key={rx.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">
                          {rx.receivedAt}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={clsx(
                              "h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0",
                              'bg-gray-100'
                            )}>
                              {getSourceIcon(rx.source)}
                            </span>
                            {rx.source === 'app_camera' ? (
                              <button
                                onClick={() => setImagePrescription(rx)}
                                className="text-xs font-semibold text-blue-500 hover:underline focus:outline-none"
                              >
                                {getSourceLabel(rx.source)}
                              </button>
                            ) : (
                              <button
                                onClick={() => setTelemedPrescription(rx)}
                                className="text-xs font-semibold text-purple-500 hover:underline focus:outline-none"
                              >
                                {getSourceLabel(rx.source)}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">
                          {rx.isConsentSubstitute ? '동의' : '미동의'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">
                          {rx.deliveryMethod || <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">
                          {rx.hospitalName}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={clsx(
                            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
                            'bg-gray-100 text-gray-400 border-gray-200'
                          )}>
                            {label}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          {isSent ? (
                            <button
                              onClick={() => setSelectedConsultation(sentConsultations[rx.id] || null)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md bg-white hover:bg-gray-50 transition-colors shadow-sm text-gray-400"
                            >
                              <CheckCircle2 size={13} className="text-gray-400" />전송됨
                            </button>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {prescriptions.length === 0 && (
                <div className="py-20 text-center text-gray-400 text-sm">
                  접수된 처방전이 없습니다.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {telemedPrescription && (
        <TelemedPrescriptionDetail
          prescription={telemedPrescription}
          onClose={() => setTelemedPrescription(null)}
          readOnly
        />
      )}

      {selectedConsultation && (
        <ConsultationDetailModal
          data={selectedConsultation}
          onClose={() => setSelectedConsultation(null)}
        />
      )}

      {imagePrescription && (
        <PrescriptionImageModal
          prescription={imagePrescription}
          onClose={() => setImagePrescription(null)}
          readOnly
        />
      )}
    </div>
  );
};

/* ── Withdrawn Chat Channel ── */
const WithdrawnChatChannel: React.FC<{ patientName: string; withdrawnAt: string }> = ({ patientName, withdrawnAt }) => {
  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0 bg-white shadow-sm z-10">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center">
            <MessageSquare size={13} className="text-gray-400" />
          </div>
          <span className="text-sm font-bold text-gray-400">통합 상담 채널</span>
          <span className="text-[10px] text-red-400 font-medium bg-red-50 px-2 py-0.5 rounded-full border border-red-100">비활성</span>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto bg-[#F9FAFB] p-4 flex flex-col gap-6 custom-scrollbar relative">
        {/* Withdrawn Overlay */}
        <div className="absolute inset-0 bg-gray-50/40 z-10 flex items-center justify-center pointer-events-none">
          <div className="text-center px-8 py-6 bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg pointer-events-auto max-w-[280px]">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <UserX size={28} className="text-red-400" />
            </div>
            <p className="text-sm font-bold text-gray-700 mb-1.5">탈퇴한 회원입니다</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              {withdrawnAt} 탈퇴<br />
              메시지 전송이 불가합니다.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 py-2 opacity-30">
          <span className="px-3 py-1 bg-white/60 border border-gray-100 rounded-full text-[11px] text-gray-400 font-medium">2026년 2월 5일 목요일</span>
          <div className="px-5 py-1.5 rounded-lg bg-gray-100/80 text-[11px] text-gray-500 font-medium border border-gray-200/50">
            상담이 시작되었습니다.
          </div>
        </div>

        {/* Past Messages — dimmed */}
        <div className="flex flex-col items-end gap-1 max-w-[90%] self-end opacity-30">
          <div className="bg-blue-600 text-white p-3.5 rounded-2xl rounded-tr-sm text-[13px] leading-relaxed shadow-sm">
            안녕하세요, {patientName}님 😊<br /><br />
            웰체크와 함께해 주셔서 감사합니다.<br /><br />
            건강한 삶은 작은 습관에서 시작됩니다.<br /><br />
            서울종로약국 드림
          </div>
          <span className="text-[10px] text-gray-400 font-medium mr-1.5 uppercase">09:02 AM</span>
        </div>

        <div className="flex flex-col items-start gap-1 max-w-[80%] opacity-30">
          <div className="bg-white border border-gray-200 text-gray-800 p-3 rounded-2xl rounded-tl-sm text-sm shadow-sm font-medium">
            감사합니다.
          </div>
          <span className="text-[10px] text-gray-400 font-medium ml-1.5 uppercase">09:05 AM</span>
        </div>

        {/* Withdrawal system message */}
        <div className="flex flex-col items-center gap-2 py-2">
          <span className="px-3 py-1 bg-white/60 border border-gray-100 rounded-full text-[11px] text-gray-400 font-medium">2026년 4월 10일 목요일</span>
          <div className="px-5 py-2 rounded-lg bg-red-50 text-[11px] text-red-500 font-medium border border-red-100 flex items-center gap-2">
            <UserX size={12} />
            고객이 서비스를 탈퇴하였습니다.
          </div>
        </div>
      </div>

      {/* Input Area — Disabled */}
      <div className="p-4 bg-gray-100 border-t border-gray-200 flex-shrink-0">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-gray-300">
            <button disabled className="cursor-not-allowed">
              <Paperclip size={18} />
            </button>
            <button disabled className="cursor-not-allowed">
              <Video size={16} />
            </button>
            <button disabled className="cursor-not-allowed">
              <Mic size={16} />
            </button>
          </div>
          <textarea
            value=""
            disabled
            className="w-full bg-gray-200 border border-gray-300 rounded-2xl pl-24 pr-12 py-3 text-[13px] text-gray-400 placeholder-gray-400 cursor-not-allowed resize-none min-h-[50px] max-h-[120px]"
            placeholder="탈퇴한 회원에게는 메시지를 보낼 수 없습니다."
            rows={1}
          />
          <button
            disabled
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center bg-gray-300 text-gray-400 cursor-not-allowed"
          >
            <Send size={16} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
};
