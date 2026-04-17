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
  Info
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
import { PatientEditModal } from '../../components/patient/PatientEditModal';
import { TelemedPrescriptionDetail } from '../../components/prescription/TelemedPrescriptionDetail';
import { CancelReasonModal } from '../../components/prescription/CancelReasonModal';
import { CompleteConfirmModal } from '../../components/prescription/CompleteConfirmModal';
import { PrescriptionImageModal } from '../../components/prescription/PrescriptionImageModal';

const StatusToast: React.FC<{ message: string; onDone: () => void }> = ({ message, onDone }) => {
  React.useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-top-2 fade-in duration-300 pointer-events-none">
      <div className="flex items-center gap-2.5 bg-white border border-green-200 text-green-800 rounded-xl shadow-xl px-5 py-3 text-sm font-medium whitespace-nowrap">
        <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
        {message}
      </div>
    </div>
  );
};

const MOCK_PRESCRIPTIONS: Prescription[] = [
  { id: 'RX-17-005', receivedAt: '2026-03-17 10:30', source: 'app_camera',  status: 'received',  hospitalName: '성모병원',        patientName: '십칠스프린트', birthDate: '1987-03-12', phone: '010-1234-5678', diseaseCode: 'I10', isConsentSubstitute: true, deliveryMethod: '본인 방문' },
  { id: 'RX-17-004', receivedAt: '2026-03-17 09:15', source: 'fax_telemed', status: 'received',  hospitalName: '서울내과',        patientName: '십칠스프린트', birthDate: '1987-03-12', phone: '010-1234-5678', diseaseCode: 'I10', isConsentSubstitute: true, deliveryMethod: '본인 방문' },
  { id: 'RX-17-003', receivedAt: '2026-03-16 16:45', source: 'fax_telemed', status: 'completed', hospitalName: '연세세브란스',    patientName: '십칠스프린트', birthDate: '1987-03-12', phone: '010-1234-5678', diseaseCode: 'I10', isConsentSubstitute: true, deliveryMethod: '가족 방문' },
  { id: 'RX-17-002', receivedAt: '2026-03-15 14:30', source: 'app_camera',  status: 'cancelled', hospitalName: '김민수이비인후과', patientName: '십칠스프린트', birthDate: '1987-03-12', phone: '010-1234-5678', diseaseCode: 'I10', isConsentSubstitute: true, deliveryMethod: '본인 방문' },
  { id: 'RX-17-001', receivedAt: '2026-03-14 11:20', source: 'app_camera',  status: 'completed', hospitalName: '우리들병원',      patientName: '십칠스프린트', birthDate: '1987-03-12', phone: '010-1234-5678', diseaseCode: 'I10', isConsentSubstitute: true, deliveryMethod: '본인 방문' },
];

const STATUS_LABEL: Record<PrescriptionStatus, { label: string; color: string; bgColor: string }> = {
  received:  { label: '접수됨',   color: 'text-blue-600',    bgColor: 'bg-blue-50' },
  completed: { label: '조제 완료', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  cancelled: { label: '취소됨',   color: 'text-gray-500',    bgColor: 'bg-gray-100' },
};

const getSourceIcon = (source: string) => {
  if (source === 'app_camera') return <Camera size={14} className="text-blue-500" />;
  if (source === 'kiosk') return <Printer size={14} className="text-purple-500" />;
  return <Printer size={14} className="text-purple-500" />;
};

const getSourceLabel = (source: string) => {
  if (source === 'app_camera') return '고객 앱 촬영';
  if (source === 'kiosk') return '키오스크 스캔(TBD)';
  return '비대면 진료';
};

export const PatientDetail17: React.FC<PatientDetailProps> = ({ onBack, patientId }) => {
  const [memo, setMemo] = useState("고객 특이사항:\n- 알약 삼키는 것을 힘들어함\n- 저녁 식후 복약 선호\n\n다음 상담 시 확인:\n- 어지럼증 호전 여부");
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMemo(e.target.value);
    setIsSaving(true);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(MOCK_PRESCRIPTIONS);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [telemedPrescription, setTelemedPrescription] = useState<Prescription | null>(null);
  const [imagePrescription, setImagePrescription] = useState<Prescription | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Filters
  const [filter, setFilter] = useState<'all' | PrescriptionSource>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PrescriptionStatus>('all');

  // Consultation & Workflow
  const [workflowPrescription, setWorkflowPrescription] = useState<Prescription | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationData | null>(null);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [completeTargetId, setCompleteTargetId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set(['RX-17-003']));
  const [sentConsultations, setSentConsultations] = useState<Record<string, ConsultationData>>({
    'RX-17-003': {
      id: 'RX-17-003',
      patientName: '십칠스프린트',
      birthDate: '1987-03-12',
      gender: '여성',
      phone: '010-1234-5678',
      sendMethod: '알림톡',
      sentAt: '2026-03-16 16:45',
      frequency: 3,
      times: ['아침', '점심', '저녁'],
      relation: '식후 30분',
      duration: 14,
      messageContent: '[복약 상담 안내]\n안녕하세요, 웰체크약국입니다.\n처방받으신 약품을 안내드립니다.\n\n[처방 약품]\n1. 메트포르민 500mg (혈당강하제)\n2. 글리메피리드 2mg (인슐린 분비 촉진제)\n3. 로수바스타틴 10mg (고지혈증약)\n4. 오메프라졸 20mg (위장보호제)\n\n[복약 방법]\n하루 3번, 아침, 점심, 저녁 식후 30분에 복약하세요.\n\n문의사항은 약국으로 연락주세요.',
      reminderEnabled: true,
      refillAlertEnabled: true,
      adherenceRate: 85,
    },
  });
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const statusDropdownRef = React.useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setOpenStatusDropdown(null);
      }
    };
    if (openStatusDropdown) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openStatusDropdown]);

  const handleStatusChange = (id: string, newStatus: PrescriptionStatus) => {
    if (newStatus === 'cancelled') {
      setOpenStatusDropdown(null);
      setCancelTargetId(id);
      return;
    }
    if (newStatus === 'completed') {
      setOpenStatusDropdown(null);
      setCompleteTargetId(id);
      return;
    }
    const target = prescriptions.find(p => p.id === id);
    setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    setOpenStatusDropdown(null);
    if (target) {
      setToast(`'${target.patientName}' 님의 상태가 '${STATUS_LABEL[newStatus].label}'(으)로 변경되었습니다.`);
    }
  };

  const confirmCancel = () => {
    if (!cancelTargetId) return;
    const target = prescriptions.find(p => p.id === cancelTargetId);
    setPrescriptions(prev => prev.map(p => p.id === cancelTargetId ? { ...p, status: 'cancelled' } : p));
    setCancelTargetId(null);
    if (target) {
      setToast(`'${target.patientName}' 님의 상태가 '취소됨'(으)로 변경되었습니다.`);
    }
  };

  const confirmComplete = () => {
    if (!completeTargetId) return;
    const target = prescriptions.find(p => p.id === completeTargetId);
    setPrescriptions(prev => prev.map(p => p.id === completeTargetId ? { ...p, status: 'completed' } : p));
    setCompleteTargetId(null);
    if (target) {
      setToast(`'${target.patientName}' 님의 상태가 '조제 완료'(으)로 변경되었습니다.`);
    }
  };

  const filteredPrescriptions = prescriptions.filter(p => {
    return (filter === 'all' || p.source === filter) && (statusFilter === 'all' || p.status === statusFilter);
  });
  const [patientInfo, setPatientInfo] = useState({
    name: '십칠스프린트',
    birthDate: '1987-03-12',
    gender: '여성' as '여성' | '남성',
    phone: '010-1234-5678',
    disease: '고혈압',
    isRegular: true,
    regularDate: '2026-03-01'
  });

  const updateStatus = (newStatus: PrescriptionStatus) => {
    if (!selectedPrescription) return;
    const updated = { ...selectedPrescription, status: newStatus };
    setPrescriptions(prev => prev.map(p => p.id === selectedPrescription.id ? updated : p));
    setSelectedPrescription(updated);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Toast */}
      {toast && <StatusToast message={toast} onDone={() => setToast(null)} />}

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
                  <h1 className="text-2xl font-bold text-gray-900">{patientInfo.name}</h1>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <span>{patientInfo.birthDate}</span>
                  <span className="text-gray-300">·</span>
                  <span>만 40세</span>
                  <span className="text-gray-300">·</span>
                  <span>{patientInfo.gender}</span>
                  <span className="text-gray-300">·</span>
                  <span>{patientInfo.phone}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-6 w-full h-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          {/* Left Column: Pharmacist Memo (2 cols) */}
          <section className="lg:col-span-2 flex flex-col min-h-0">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
              <FileText size={18} className="text-yellow-600" />
              약사 메모
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 shadow-sm flex flex-col flex-1 min-h-0 relative overflow-hidden">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] font-bold text-yellow-800 flex items-center gap-1.5">
                  <FileText size={14} />
                </span>
                <span className={clsx("text-[10px] transition-colors", isSaving ? "text-blue-600 font-bold" : "text-yellow-600")}>
                  {isSaving ? "작성 중" : "자동 저장됨"}
                </span>
              </div>
              <textarea
                className="flex-1 bg-transparent resize-none text-sm text-gray-800 placeholder-yellow-800/40 outline-none leading-relaxed custom-scrollbar"
                value={memo}
                onChange={handleMemoChange}
                placeholder="환자에 대한 특이사항을 입력하세요..."
              />
            </div>
          </section>

          {/* Center Column: Chat UI (4 cols) */}
          <section className="lg:col-span-4 flex flex-col min-h-0">
            <ChatChannel patientName={patientInfo.name} />
          </section>

          {/* Right Column: Prescription List Section (6 cols) */}
          <section className="lg:col-span-6 flex flex-col min-h-0 space-y-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <FileText size={18} className="text-blue-600" />
                  보낸 처방전 목록
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
                  <div className="relative">
                    <input type="text" placeholder="병원명 검색" className="w-44 pl-8 pr-3 py-1.5 text-[13px] border border-gray-200 rounded-full bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400" />
                    <Search className="absolute left-2.5 top-2 text-gray-400" size={14} />
                  </div>
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
                  {filteredPrescriptions.map((rx: Prescription, index: number) => {
                    const isCancelled = rx.status === 'cancelled';
                    const isSent = sentIds.has(rx.id);
                    const { label, color, bgColor } = STATUS_LABEL[rx.status];

                    return (
                      <tr key={rx.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {rx.receivedAt}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={clsx(
                              "h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0",
                              rx.source === 'app_camera' ? 'bg-blue-100' : 'bg-purple-100'
                            )}>
                              {getSourceIcon(rx.source)}
                            </span>
                            {rx.source === 'fax_telemed' ? (
                              <button
                                onClick={() => setTelemedPrescription(rx)}
                                className="text-xs font-semibold text-purple-600 hover:underline focus:outline-none"
                              >
                                {getSourceLabel(rx.source)}
                              </button>
                            ) : (
                              <button
                                onClick={() => setImagePrescription(rx)}
                                className="text-xs font-semibold text-blue-600 hover:underline focus:outline-none"
                              >
                                {getSourceLabel(rx.source)}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {rx.isConsentSubstitute ? '동의' : '미동의'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {rx.deliveryMethod || <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {rx.hospitalName}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap relative">
                          <button
                            onClick={() => setOpenStatusDropdown(openStatusDropdown === rx.id ? null : rx.id)}
                            className={clsx(
                              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-opacity hover:opacity-80 border',
                              bgColor, color,
                              rx.status === 'received' ? 'border-blue-100' : rx.status === 'completed' ? 'border-emerald-100' : 'border-gray-200'
                            )}
                          >
                            {label}
                            <ChevronDown size={11} className="flex-shrink-0" />
                          </button>

                          {/* Dropdown Panel */}
                          {openStatusDropdown === rx.id && (
                            <div
                              ref={statusDropdownRef}
                              className={clsx(
                                "absolute right-0 z-[150] bg-white border border-gray-200 rounded-xl shadow-xl w-44 py-3",
                                index >= filteredPrescriptions.length - 2 ? "bottom-full mb-1" : "top-full mt-1"
                              )}
                            >
                              <p className="px-4 pb-2 text-xs font-bold text-gray-700 border-b border-gray-100 mb-2">상태 변경</p>
                              {(
                                [
                                  { value: 'received',  label: '접수됨',   bgColor: 'bg-blue-100',  color: 'text-blue-700' },
                                  { value: 'completed', label: '조제 완료', bgColor: 'bg-emerald-100', color: 'text-emerald-700' },
                                  { value: 'cancelled', label: '취소됨',   bgColor: 'bg-gray-100',  color: 'text-gray-500' },
                                ] as { value: PrescriptionStatus; label: string; bgColor: string; color: string }[]
                              ).map(opt => (
                                <button
                                  key={opt.value}
                                  onClick={() => handleStatusChange(rx.id, opt.value)}
                                  className="flex items-center justify-between w-full px-4 py-1.5 hover:bg-gray-50 transition-colors"
                                >
                                  <span className={clsx('inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium', opt.bgColor, opt.color)}>
                                    {opt.label}
                                  </span>
                                  {rx.status === opt.value && <Check size={13} className="text-gray-500 flex-shrink-0" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          {isCancelled ? (
                            <span className="text-xs text-gray-400">취소됨</span>
                          ) : isSent ? (
                            <button
                              onClick={() => setSelectedConsultation(sentConsultations[rx.id])}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors shadow-sm text-gray-500"
                            >
                              <CheckCircle2 size={13} className="text-green-500" />전송됨
                            </button>
                          ) : (
                            <button
                              onClick={() => setWorkflowPrescription(rx)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                            >
                              <Send size={12} />전송하기
                            </button>
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

      <Modals
        selectedPrescription={selectedPrescription}
        setSelectedPrescription={setSelectedPrescription}
        telemedPrescription={telemedPrescription}
        setTelemedPrescription={setTelemedPrescription}
        updateStatus={updateStatus}
        workflowPrescription={workflowPrescription}
        setWorkflowPrescription={setWorkflowPrescription}
        selectedConsultation={selectedConsultation}
        setSelectedConsultation={setSelectedConsultation}
        onWorkflowComplete={(data) => {
          if (workflowPrescription) {
            const rxId = workflowPrescription.id;
            setSentIds(prev => new Set([...prev, rxId]));
            setSentConsultations(prev => ({ ...prev, [rxId]: data }));
            setPrescriptions(prev => prev.map(rx =>
              rx.id === rxId ? { ...rx, status: 'completed' } : rx
            ));
          }
        }}
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        patientInfo={patientInfo}
        setPatientInfo={setPatientInfo}
      />

      {cancelTargetId && (
        <CancelReasonModal
          onConfirm={confirmCancel}
          onClose={() => setCancelTargetId(null)}
        />
      )}

      {completeTargetId && (
        <CompleteConfirmModal
          onConfirm={confirmComplete}
          onClose={() => setCompleteTargetId(null)}
        />
      )}

      {imagePrescription && (
        <PrescriptionImageModal
          prescription={imagePrescription}
          onClose={() => setImagePrescription(null)}
          readOnly={false}
        />
      )}
    </div>
  );
};

/* ── Modals Layer ── */
const Modals: React.FC<{
  selectedPrescription: Prescription | null;
  setSelectedPrescription: (p: Prescription | null) => void;
  telemedPrescription: Prescription | null;
  setTelemedPrescription: (p: Prescription | null) => void;
  updateStatus: (s: PrescriptionStatus) => void;
  workflowPrescription: Prescription | null;
  setWorkflowPrescription: (p: Prescription | null) => void;
  selectedConsultation: ConsultationData | null;
  setSelectedConsultation: (c: ConsultationData | null) => void;
  onWorkflowComplete: (data: ConsultationData) => void;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (o: boolean) => void;
  patientInfo: any;
  setPatientInfo: (p: any) => void;
}> = ({
  selectedPrescription, setSelectedPrescription, telemedPrescription, setTelemedPrescription, updateStatus,
  workflowPrescription, setWorkflowPrescription,
  selectedConsultation, setSelectedConsultation, onWorkflowComplete,
  isEditModalOpen, setIsEditModalOpen, patientInfo, setPatientInfo
}) => (
  <>
    {/* {selectedPrescription && (
      <PrescriptionDetailModal
        prescription={selectedPrescription}
        onClose={() => setSelectedPrescription(null)}
        onUpdateStatus={updateStatus}
      />
    )} */}

    {telemedPrescription && (
      <TelemedPrescriptionDetail
        prescription={telemedPrescription}
        onClose={() => setTelemedPrescription(null)}
      />
    )}


    {workflowPrescription && (
      <PrescriptionWorkflowModal
        prescription={workflowPrescription}
        onClose={() => setWorkflowPrescription(null)}
        onComplete={onWorkflowComplete}
      />
    )}

    {selectedConsultation && (
      <ConsultationDetailModal
        data={selectedConsultation}
        onClose={() => setSelectedConsultation(null)}
      />
    )}

    {isEditModalOpen && (
      <PatientEditModal
        patient={patientInfo}
        onClose={() => setIsEditModalOpen(false)}
        onSave={(updated) => {
          setPatientInfo(updated);
          setIsEditModalOpen(false);
        }}
      />
    )}
  </>
);

/* ── Sub-Components ── */

const ChatChannel: React.FC<{ patientName: string }> = ({ patientName }) => {
  const [inputText, setInputText] = useState('');
  
  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0 bg-white shadow-sm z-10">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-blue-50 flex items-center justify-center">
            <MessageSquare size={13} className="text-blue-600" />
          </div>
          <span className="text-sm font-bold text-gray-800">통합 상담 채널</span>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto bg-[#F9FAFB] p-4 flex flex-col gap-6 custom-scrollbar">
        <div className="flex flex-col items-center gap-4 py-2">
          <span className="px-3 py-1 bg-white/60 border border-gray-100 rounded-full text-[11px] text-gray-400 font-medium">2026년 2월 5일 목요일</span>
          <div className="px-5 py-1.5 rounded-lg bg-gray-100/80 text-[11px] text-gray-500 font-medium border border-gray-200/50">
            상담이 시작되었습니다.
          </div>
        </div>

        {/* Pharmacy Message */}
        <div className="flex flex-col items-end gap-1 max-w-[90%] self-end">
          <div className="bg-blue-600 text-white p-3.5 rounded-2xl rounded-tr-sm text-[13px] leading-relaxed shadow-sm">
            안녕하세요, {patientName}님 😊<br /><br />
            웰체크와 함께해 주셔서 감사합니다.<br /><br />
            건강한 삶은 작은 습관에서 시작됩니다. 웰체크는 {patientName}님의 복약 관리부터 건강 지표 모니터링까지 꾸준히 함께하겠습니다.<br /><br />
            오늘도 활기차고 건강한 하루 보내세요! 💪<br /><br />
            서울종로약국 드림
          </div>
          <span className="text-[10px] text-gray-400 font-medium mr-1.5 uppercase">09:02 AM</span>
        </div>

        {/* Prescription Info Message */}
        <div className="flex flex-col items-end gap-1 max-w-[90%] self-end">
          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm shadow-sm overflow-hidden">
            <div className="p-3.5 text-[13px] leading-relaxed">
              <p className="font-bold underline underline-offset-4 mb-3 text-white/90">[복약 상담 안내]</p>
              안녕하세요, 서울종로약국입니다.<br />
              처방받으신 약품 안내드립니다.<br /><br />
              <span className="font-bold text-white/90">[처방 약품]</span><br />
              1. 노바스크정 5mg (한국화이자제약)<br />
              2. 타이레놀정 500mg (한국얀센)<br /><br />
              <span className="font-bold text-white/90">[복약 방법]</span><br />
              - 노바스크정: 1일 1회, 아침 식후 복용<br />
              - 타이레놀정: 1일 3회, 식후 30분 복용<br /><br />
              <span className="font-bold text-white/90">[주의사항]</span><br />
              - 노바스크정: 임부 또는 임신 가능성 있는 경우 반드시 의사와 상담하세요.<br />
              - 타이레놀정: 매일 3잔 이상 음주 시 의사와 상의하세요.<br /><br />
              복용 중 이상 증상이 있으시면 언제든지 문의해 주세요.
            </div>
            <div className="border-t border-white/20">
              <button className="w-full py-2.5 text-[13px] font-semibold text-white/90 hover:bg-white/10 transition-colors text-center">
                복약 알림 보기
              </button>
            </div>
          </div>
          <span className="text-[10px] text-gray-400 font-medium mr-1.5 uppercase">09:04 AM</span>
        </div>

        {/* Patient Message */}
        <div className="flex flex-col items-start gap-1 max-w-[80%]">
          <div className="bg-white border border-gray-200 text-gray-800 p-3 rounded-2xl rounded-tl-sm text-sm shadow-sm font-medium">
            감사합니다.
          </div>
          <span className="text-[10px] text-gray-400 font-medium ml-1.5 uppercase">09:05 AM</span>
        </div>
      </div>

      {/* Input Area — 서비스 준비 중 (비활성) */}
      <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
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
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-24 pr-12 py-3 text-[13px] text-gray-300 placeholder-gray-300 cursor-not-allowed resize-none min-h-[50px] max-h-[120px]"
            placeholder="서비스 준비 중입니다."
            rows={1}
          />
          <button
            disabled
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 text-gray-300 cursor-not-allowed"
          >
            <Send size={16} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface PatientDetailProps {
  onBack: () => void;
  patientId: string | null;
}
