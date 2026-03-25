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
  Send
} from 'lucide-react';
import { 
  PrescriptionWorkflowModal 
} from './PrescriptionWorkflowModal';
import { 
  ConsultationDetailModal, 
  ConsultationData 
} from './ConsultationDetailModal';
import { clsx } from 'clsx';
import { 
  Prescription, 
  PrescriptionDetailModal, 
  StatusText, 
  PrescriptionStatus,
  PrescriptionSource
} from './PrescriptionDetailModal';
import { PatientEditModal } from './PatientEditModal';

const MOCK_PRESCRIPTIONS: Prescription[] = [
  { id: 'RX-17-005', receivedAt: '2026-03-17 10:30', source: 'app_camera',  status: 'received',  hospitalName: '성모병원',        patientName: '십칠스프린트', birthDate: '1987-03-12', phone: '010-1234-5678', diseaseCode: 'I10', isConsentSubstitute: true, deliveryMethod: '본인 방문' },
  { id: 'RX-17-004', receivedAt: '2026-03-17 09:15', source: 'fax_telemed', status: 'received',  hospitalName: '서울내과',        patientName: '십칠스프린트', birthDate: '1987-03-12', phone: '010-1234-5678', diseaseCode: 'I10', isConsentSubstitute: true, deliveryMethod: '본인 방문' },
  { id: 'RX-17-003', receivedAt: '2026-03-16 16:45', source: 'fax_telemed', status: 'completed', hospitalName: '연세세브란스',    patientName: '십칠스프린트', birthDate: '1987-03-12', phone: '010-1234-5678', diseaseCode: 'I10', isConsentSubstitute: true, deliveryMethod: '가족 방문' },
  { id: 'RX-17-002', receivedAt: '2026-03-15 14:30', source: 'app_camera',  status: 'cancelled', hospitalName: '김민수이비인후과', patientName: '십칠스프린트', birthDate: '1987-03-12', phone: '010-1234-5678', diseaseCode: 'I10', isConsentSubstitute: false },
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Filters
  const [filter, setFilter] = useState<'all' | PrescriptionSource>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PrescriptionStatus>('all');

  // Consultation & Workflow
  const [workflowPrescription, setWorkflowPrescription] = useState<Prescription | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationData | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [sentConsultations, setSentConsultations] = useState<Record<string, ConsultationData>>({});
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(null);

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
    setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    setOpenStatusDropdown(null);
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
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{patientInfo.disease}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <span>{patientInfo.birthDate}</span>
                  <span className="text-gray-300">·</span>
                  <span>만 40세</span>
                  <span className="text-gray-300">·</span>
                  <span>{patientInfo.gender}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-blue-600 font-semibold">{patientInfo.phone}</span>
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
      <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Pharmacist Memo (4 cols) */}
          <section className="lg:col-span-4 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileText size={20} className="text-yellow-600" />
              약사 메모
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-sm flex flex-col h-[450px]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-yellow-800 flex items-center gap-2">
                  <FileText size={18} />
                </span>
                <span className={clsx("text-xs transition-colors", isSaving ? "text-blue-600 font-bold" : "text-yellow-600")}>
                  {isSaving ? "작성 중" : "자동 저장됨"}
                </span>
              </div>
              <textarea
                className="flex-1 bg-transparent resize-none text-base text-gray-800 placeholder-yellow-800/50 outline-none leading-relaxed custom-scrollbar"
                value={memo}
                onChange={handleMemoChange}
                placeholder="환자에 대한 특이사항을 입력하세요..."
              />
            </div>
          </section>

          {/* Right Column: Prescription List Section (8 cols) */}
          <section className="lg:col-span-8 space-y-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileText size={20} className="text-blue-600" />
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

              <p className="text-xs text-blue-600 flex items-center gap-1.5 leading-relaxed bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                <CheckCircle2 size={14} />
                최근 접수된 처방전부터 상단에 표시됩니다. "보기" 버튼을 클릭하여 상세 내용을 확인하고 조제를 시작할 수 있습니다.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
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
                  {filteredPrescriptions.map((rx) => {
                    const isCancelled = rx.status === 'cancelled';
                    const isSent = sentIds.has(rx.id);
                    const { label, color, bgColor } = STATUS_LABEL[rx.status];

                    return (
                      <tr key={rx.id} className="hover:bg-blue-50/30 transition-colors">
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
                            <span className="text-xs font-medium text-gray-600">{getSourceLabel(rx.source)}</span>
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
                              className="absolute left-0 top-full mt-1 z-[150] bg-white border border-gray-200 rounded-xl shadow-xl w-44 py-3"
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
    </div>
  );
};

/* ── Modals Layer ── */
const Modals: React.FC<{
  selectedPrescription: Prescription | null;
  setSelectedPrescription: (p: Prescription | null) => void;
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
  selectedPrescription, setSelectedPrescription, updateStatus,
  workflowPrescription, setWorkflowPrescription,
  selectedConsultation, setSelectedConsultation, onWorkflowComplete,
  isEditModalOpen, setIsEditModalOpen, patientInfo, setPatientInfo
}) => (
  <>
    {selectedPrescription && (
      <PrescriptionDetailModal
        prescription={selectedPrescription}
        onClose={() => setSelectedPrescription(null)}
        onUpdateStatus={updateStatus}
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

interface PatientDetailProps {
  onBack: () => void;
  patientId: string | null;
}
