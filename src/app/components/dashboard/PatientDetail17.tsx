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
  Monitor
} from 'lucide-react';
import { clsx } from 'clsx';
import { 
  Prescription, 
  PrescriptionDetailModal, 
  StatusText, 
  PrescriptionStatus 
} from './PrescriptionDetailModal';
import { PatientEditModal } from './PatientEditModal';

const MOCK_PRESCRIPTIONS: Prescription[] = [
  { id: 'RX-17-005', receivedAt: '2026-03-17 10:30', source: 'app_camera', status: 'received', hospitalName: '성모병원', patientName: '십칠스프린트', birthDate: '1987-03-12', phone: '010-1234-5678', diseaseCode: 'I10', paymentStatus: 'na' },
  { id: 'RX-17-004', receivedAt: '2026-03-17 09:15', source: 'fax_telemed', status: 'dispensing_done', hospitalName: '서울내과', patientName: '십칠스프린트', birthDate: '1987-03-12', phone: '010-1234-5678', diseaseCode: 'I10', paymentStatus: 'paid', paymentAmount: '12,500원' },
  { id: 'RX-17-003', receivedAt: '2026-03-16 16:45', source: 'fax_telemed', status: 'payment_done', hospitalName: '연세세브란스', patientName: '십칠스프린트', birthDate: '1987-03-12', phone: '010-1234-5678', diseaseCode: 'I10', paymentStatus: 'paid', paymentAmount: '15,200원' },
  { id: 'RX-17-002', receivedAt: '2026-03-15 14:30', source: 'app_camera', status: 'rejected', hospitalName: '김민수이비인후과', patientName: '십칠스프린트', birthDate: '1987-03-12', phone: '010-1234-5678', diseaseCode: 'I10', paymentStatus: 'na' },
  { id: 'RX-17-001', receivedAt: '2026-03-14 11:20', source: 'app_camera', status: 'completed', hospitalName: '우리들병원', patientName: '십칠스프린트', birthDate: '1987-03-12', phone: '010-1234-5678', diseaseCode: 'I10', paymentStatus: 'na' },
];

const getSourceIcon = (source: string) => {
  if (source === 'app_camera') return <Camera size={14} className="text-blue-500" />;
  if (source === 'kiosk') return <Printer size={14} className="text-purple-500" />;
  return <Printer size={14} className="text-purple-500" />;
};

const getSourceLabel = (source: string) => {
  if (source === 'app_camera') return '고객 앱 촬영';
  if (source === 'kiosk') return '의사 웹 전송';
  return '의사 웹 전송';
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
  const [patientInfo, setPatientInfo] = useState({
    name: '십칠스프린트',
    birthDate: '1987-03-12',
    gender: '여성' as '여성' | '남성',
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
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-tight">휴대폰 번호</span>
                    <span className="text-blue-600 font-medium">010-1234-5678</span>
                  </div>
                  <div className="w-px h-3 bg-gray-200" />
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-tight">생년월일</span>
                    <span className="text-gray-700 font-medium">{patientInfo.birthDate} (만 40세)</span>
                  </div>
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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText size={20} className="text-blue-600" />
                보낸 처방전 목록
              </h3>
              <span className="text-sm text-gray-500">총 {prescriptions.length}건</span>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs text-blue-600 flex items-center gap-1.5 leading-relaxed">
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">조제 상태</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">처방전 보기</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {prescriptions.map((rx) => {
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
                        <td className="px-4 py-4 whitespace-nowrap">
                          <StatusText status={rx.status} />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <button 
                            onClick={() => setSelectedPrescription(rx)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md bg-white hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm"
                          >
                            <ExternalLink size={13} />
                            보기
                          </button>
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

      {/* ── 처방전 검토 팝업 모달 ── */}
      {selectedPrescription && (
        <PrescriptionDetailModal
          prescription={selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
          onUpdateStatus={updateStatus}
        />
      )}

      {/* ── 고객 정보 수정 팝업 모달 ── */}
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
    </div>
  );
};

interface PatientDetailProps {
  onBack: () => void;
  patientId: string | null;
}
