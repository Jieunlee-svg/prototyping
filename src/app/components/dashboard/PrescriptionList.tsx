import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  FileText, Camera, Printer, Search, CheckCircle2, X, Bell, Zap, Send, ChevronDown, Check, ArrowUpDown, Info
} from 'lucide-react';
import { clsx } from 'clsx';
import { PrescriptionWorkflowModal } from './PrescriptionWorkflowModal';
import { ConsultationDetailModal, ConsultationData } from './ConsultationDetailModal';
import {
  Prescription,
  PrescriptionStatus,
  PrescriptionSource,
  STATUS_LABEL,
  getSourceLabel,
} from './PrescriptionDetailModal';

// ── Mock Data ──────────────────────────────────────────────────────────
const prescriptionImage = 'https://placehold.co/400x560/e2e8f0/64748b?text=처방전';

const BASE_PRESCRIPTIONS: Prescription[] = [
  { id: 'RX-001', source: 'app_camera',  patientName: '김철수', birthDate: '1980-01-01', phone: '010-1234-5678', gender: '남성', hospitalName: '확인 안됨',        diseaseCode: 'J20.9', status: 'received',  deliveryMethod: '본인 방문', isConsentSubstitute: true, isMember: true,  receivedAt: '2026-03-12 14:30', imageUrl: prescriptionImage },
  { id: 'RX-002', source: 'app_camera',  patientName: '박지민', birthDate: '2015-05-05', phone: '010-3333-7777', gender: '여성', hospitalName: '확인 안됨',        diseaseCode: 'J30.4', status: 'received',  deliveryMethod: '본인 방문', isConsentSubstitute: true, isMember: false, receivedAt: '2026-03-12 13:45', imageUrl: prescriptionImage },
  { id: 'RX-003', source: 'app_camera',  patientName: '정수정', birthDate: '1998-07-07', phone: '010-6666-2222', gender: '여성', hospitalName: '확인 안됨',        diseaseCode: 'F41.0', status: 'completed', deliveryMethod: '본인 방문', isConsentSubstitute: true, isMember: true,  receivedAt: '2026-03-12 10:10', imageUrl: prescriptionImage },
  { id: 'RX-004', source: 'fax_telemed', patientName: '이영희', birthDate: '1992-03-15', phone: '010-9876-5432', gender: '여성', hospitalName: '굿닥터이비인후과', diseaseCode: 'J00',   status: 'received',  deliveryMethod: '가족 방문', isConsentSubstitute: true, isMember: true,  receivedAt: '2026-03-12 14:15', imageUrl: prescriptionImage },
  { id: 'RX-005', source: 'fax_telemed', patientName: '최민수', birthDate: '1975-12-12', phone: '010-5555-1111', gender: '남성', hospitalName: '서울대병원',       diseaseCode: 'E11.9', status: 'cancelled', deliveryMethod: '택배',     isConsentSubstitute: true, isMember: false, receivedAt: '2026-03-12 11:20', imageUrl: prescriptionImage },
  { id: 'RX-006', source: 'fax_telemed', patientName: '김하준', birthDate: '1990-02-14', phone: '010-2222-8888', gender: '남성', hospitalName: '강북삼성병원',     diseaseCode: 'J06.9', status: 'received',  deliveryMethod: '본인 방문', isConsentSubstitute: true, isMember: true,  receivedAt: '2026-03-12 10:50', imageUrl: prescriptionImage },
  { id: 'RX-007', source: 'fax_telemed', patientName: '한지수', birthDate: '2001-03-20', phone: '010-4444-9999', gender: '여성', hospitalName: '연세세브란스병원', diseaseCode: 'I10',   status: 'received',  deliveryMethod: '퀵',       isConsentSubstitute: true, isMember: true,  receivedAt: '2026-03-12 09:50', imageUrl: prescriptionImage },
  { id: 'RX-008', source: 'fax_telemed', patientName: '오민준', birthDate: '1988-09-22', phone: '010-7777-3333', gender: '남성', hospitalName: '강남성심병원',     diseaseCode: 'M54.5', status: 'received',  deliveryMethod: '본인 방문', isConsentSubstitute: true, isMember: true,  receivedAt: '2026-03-12 09:35', imageUrl: prescriptionImage },
  { id: 'RX-009', source: 'fax_telemed', patientName: '임태양', birthDate: '1973-04-30', phone: '010-1111-6666', gender: '남성', hospitalName: '고려대안암병원',   diseaseCode: 'J45.9', status: 'received',  deliveryMethod: '택배',     isConsentSubstitute: true, isMember: true,  receivedAt: '2026-03-12 08:55', imageUrl: prescriptionImage },
];

// ── Helpers ────────────────────────────────────────────────────────────
const getSourceIcon = (source: PrescriptionSource) => {
  if (source === 'app_camera') return <Camera size={15} className="text-blue-500" />;
  return <Printer size={15} className="text-purple-500" />;
};

// ── Toast ──────────────────────────────────────────────────────────────
interface ToastProps { message: string; onDone: () => void; }
const Toast: React.FC<ToastProps> = ({ message, onDone }) => {
  React.useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-top-2 fade-in duration-300 pointer-events-none">
      <div className="flex items-center gap-2.5 bg-white border border-green-200 text-green-800 rounded-xl shadow-xl px-5 py-3 text-sm font-medium">
        <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
        {message}
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────
export const PrescriptionList: React.FC<{ onOpenSettings?: () => void; onPatientClick?: (id: string) => void }> = ({ onOpenSettings, onPatientClick }) => {
  const [filter, setFilter] = useState<'all' | PrescriptionSource>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PrescriptionStatus>('all');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(BASE_PRESCRIPTIONS);
  const [newCount, setNewCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [workflowPrescription, setWorkflowPrescription] = useState<Prescription | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [sentConsultations, setSentConsultations] = useState<Record<string, ConsultationData>>({});
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationData | null>(null);
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(null);
  const notifTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusDropdownRef = useRef<HTMLDivElement | null>(null);

  // ── Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: keyof Prescription | null; direction: 'asc' | 'desc' }>({
    key: 'receivedAt',
    direction: 'desc'
  });

  const handleSort = (key: keyof Prescription) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // ── 상태 드롭다운 click-outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setOpenStatusDropdown(null);
      }
    };
    if (openStatusDropdown) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openStatusDropdown]);

  // ── 상태 변경 핸들러
  const handleStatusChange = (id: string, newStatus: PrescriptionStatus) => {
    const target = prescriptions.find(p => p.id === id);
    setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    setOpenStatusDropdown(null);
    if (target) {
      setToast(`'${target.patientName}' 님의 상태가 '${STATUS_LABEL[newStatus].label}'(으)로 변경되었습니다.`);
    }
  };

  // ── 신규 처방전 트리거
  const triggerNewPrescription = useCallback(() => {
    const newRx: Prescription = {
      id: `RX-NEW-${Date.now()}`, source: 'app_camera', patientName: '신규 고객', birthDate: '1990-06-15',
      phone: '010-0000-0000', hospitalName: '확인 안됨', diseaseCode: 'NEW', status: 'received',
      deliveryMethod: '본인 방문', isMember: false,
      receivedAt: new Date().toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      imageUrl: prescriptionImage, isNew: true,
    };
    setPrescriptions(prev => [newRx, ...prev]);
    setNewCount(c => c + 1);
    setShowNotif(true);
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const tone = (f: number, t: number) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.frequency.value = f; g.gain.setValueAtTime(0.35, ctx.currentTime + t); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.3); o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.3); };
      tone(880, 0); tone(1100, 0.25);
    } catch (_) {}
    if (notifTimer.current) clearTimeout(notifTimer.current);
    notifTimer.current = setTimeout(() => setShowNotif(false), 5000);
  }, [newCount]);

  // ── Filtered rows
  const filteredPrescriptions = prescriptions.filter(p => {
    return (filter === 'all' || p.source === filter) && (statusFilter === 'all' || p.status === statusFilter);
  });

  // ── Sorted rows
  const sortedPrescriptions = [...filteredPrescriptions].sort((a, b) => {
    const key = sortConfig.key || 'receivedAt';
    const aVal = a[key] ?? '';
    const bVal = b[key] ?? '';
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // ── Table classes
  const th = 'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider';
  const thC = 'px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider';
  const td = 'px-4 py-4 whitespace-nowrap text-sm text-gray-600';
  const tdB = 'px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-800';

  // ── Header
  const renderHeader = () => (
    <tr>
      <th className={th}>
        <button
          onClick={() => handleSort('receivedAt')}
          className="flex items-center gap-1.5 hover:text-gray-900 group transition-colors focus:outline-none"
        >
          접수일시
          <ArrowUpDown 
            size={12} 
            className={clsx(
              'transition-colors',
              sortConfig.key === 'receivedAt' ? 'text-blue-500' : 'text-gray-300 group-hover:text-blue-400'
            )} 
          />
        </button>
      </th>
      <th className={th}>
        <button
          onClick={() => handleSort('patientName')}
          className="flex items-center gap-1.5 hover:text-gray-900 group transition-colors focus:outline-none"
        >
          고객명
          <ArrowUpDown 
            size={12} 
            className={clsx(
              'transition-colors',
              sortConfig.key === 'patientName' ? 'text-blue-500' : 'text-gray-300 group-hover:text-blue-400'
            )} 
          />
        </button>
      </th>
      <th className={th}>생년월일</th>
      <th className={th}>휴대전화 번호</th>
      <th className={th}>접수 경로</th>
      <th className={thC}>대체조제 동의</th>
      <th className={th}>수령 방법</th>
      <th className={th}>발행 병원</th>
      <th className={th}>
        <div className="flex items-center gap-1">
          상태
          <span className="relative group inline-flex">
            <Info size={12} className="text-gray-400 cursor-help" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded-xl bg-gray-900 px-3 py-2 text-xs text-white shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 z-[200] normal-case font-normal text-center leading-relaxed invisible group-hover:visible border border-gray-700 whitespace-nowrap">
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 transform rotate-45 border-b border-r border-gray-700" />
              이 상태는 고객 앱에 반영됩니다.
            </span>
          </span>
        </div>
      </th>
      <th className={thC}>복약 상담</th>
    </tr>
  );

  // ── Row
  const renderRow = (p: Prescription) => {
    const rowCls = clsx('transition-colors hover:bg-blue-50/30', p.isNew && p.status === 'received' && 'bg-blue-50');

    const isCancelled = p.status === 'cancelled';
    const isSent = sentIds.has(p.id);

    const { label, color, bgColor } = STATUS_LABEL[p.status];

    const consultationBtn = (
      <td className={thC}>
        {isCancelled ? (
          <span className="text-xs text-gray-400">취소됨</span>
        ) : isSent ? (
          <button
            onClick={() => setSelectedConsultation(sentConsultations[p.id])}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors shadow-sm text-gray-500"
          >
            <CheckCircle2 size={13} className="text-green-500" />전송됨
          </button>
        ) : (
          <button
            onClick={() => setWorkflowPrescription(p)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Send size={12} />전송하기
          </button>
        )}
      </td>
    );

    return (
      <tr key={p.id} className={rowCls}>
        <td className={td}>
          <span className="text-xs">{p.receivedAt}</span>
          {p.isNew && <span className="ml-1 inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600">NEW</span>}
        </td>
        <td className={tdB}>
          <button
            onClick={() => onPatientClick?.(p.id)}
            className="text-blue-600 hover:underline font-medium focus:outline-none"
          >
            {p.patientName}
          </button>
        </td>
        <td className={td}>{p.birthDate}</td>
        <td className={td}>{p.phone}</td>
        <td className={td}>
          <div className="flex items-center gap-1.5">
            <span className={clsx('h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0',
              p.source === 'app_camera' ? 'bg-blue-100' : 'bg-purple-100'
            )}>{getSourceIcon(p.source)}</span>
            <span className="text-xs font-medium text-gray-700">{getSourceLabel(p.source)}</span>
          </div>
        </td>
        <td className={thC}>
          <span className="text-sm text-gray-700">동의</span>
        </td>
        <td className={td}>{p.deliveryMethod ?? <span className="text-gray-300">—</span>}</td>
        <td className={td}>
          {p.source === 'app_camera'
            ? <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-400">확인 안됨</span>
            : p.hospitalName}
        </td>
        <td className={clsx(td, 'relative')}>
          {/* 상태 변경 드롭다운 트리거 */}
          <button
            onClick={() => setOpenStatusDropdown(openStatusDropdown === p.id ? null : p.id)}
            className={clsx(
              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-opacity hover:opacity-80',
              bgColor, color
            )}
          >
            {label}
            <ChevronDown size={11} className="flex-shrink-0" />
          </button>

          {/* 드롭다운 패널 */}
          {openStatusDropdown === p.id && (
            <div
              ref={statusDropdownRef}
              className="absolute left-0 top-full mt-1 z-[150] bg-white border border-gray-200 rounded-xl shadow-xl w-44 py-3"
            >
              <p className="px-4 pb-2 text-xs font-bold text-gray-700 border-b border-gray-100 mb-2">상태 변경</p>
              {(
                [
                  { value: 'received',  label: '접수됨',   bgColor: 'bg-blue-100',  color: 'text-blue-700' },
                  { value: 'completed', label: '조제 완료', bgColor: 'bg-green-100', color: 'text-green-700' },
                  { value: 'cancelled', label: '취소됨',   bgColor: 'bg-gray-100',  color: 'text-gray-500' },
                ] as { value: PrescriptionStatus; label: string; bgColor: string; color: string }[]
              ).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(p.id, opt.value)}
                  className="flex items-center justify-between w-full px-4 py-1.5 hover:bg-gray-50 transition-colors"
                >
                  <span className={clsx('inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium', opt.bgColor, opt.color)}>
                    {opt.label}
                  </span>
                  {p.status === opt.value && <Check size={13} className="text-gray-500 flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </td>
        {consultationBtn}
      </tr>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative overflow-hidden">

      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* 신규 알림 */}
      {showNotif && (
        <div className="fixed top-4 right-4 z-[200] animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="flex items-center gap-3 bg-white border border-blue-200 rounded-xl shadow-2xl px-4 py-3 min-w-[280px]">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 animate-bounce">
              <Bell size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">신규 처방전 {newCount}건</p>
              <p className="text-xs text-gray-500 mt-0.5">고객 앱에서 새 처방전이 접수되었습니다.</p>
            </div>
            <button onClick={() => { setShowNotif(false); setNewCount(0); }} className="text-gray-300 hover:text-gray-500"><X size={16} /></button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-600" />
            처방전 접수 목록
            {newCount > 0 && <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">{newCount}</span>}
          </h1>
          <p className="text-sm text-gray-500 mt-1">접수된 처방전을 검토하고 조제 상태를 관리합니다.</p>
        </div>
        <button onClick={triggerNewPrescription} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
          <Zap size={15} />신규 처방전 인입 테스트
        </button>
      </header>

      {/* Filter Toolbar */}
      <div className="px-6 py-2.5 bg-white border-b border-gray-100 flex items-center justify-between gap-3 flex-shrink-0">
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
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-[13px] text-gray-400">총 <span className="text-blue-600 font-semibold">{filteredPrescriptions.length}</span>건</span>
          <div className="relative">
            <input type="text" placeholder="고객명, 병원명 검색" className="w-52 pl-8 pr-3 py-1.5 text-[13px] border border-gray-200 rounded-full bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400" />
            <Search className="absolute left-2.5 top-2 text-gray-400" size={14} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 pb-6 pt-4">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">{renderHeader()}</thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sortedPrescriptions.map(p => renderRow(p))}
                {sortedPrescriptions.length === 0 && (
                  <tr><td colSpan={10} className="py-16 text-center text-gray-400 text-sm">접수된 처방전이 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-200 bg-white flex items-center relative">
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
              {['«', '‹', '1', '2', '3', '›', '»'].map((p, i) => (
                <button key={i} className={clsx('w-7 h-7 flex items-center justify-center rounded text-xs font-medium', p === '1' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100')}>{p}</button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <select className="border border-gray-300 rounded text-xs text-gray-600 px-2 py-1 bg-white"><option>20</option><option>50</option></select>
              <span className="text-xs text-gray-500">건씩 보기</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4단계 워크플로우 모달 ── */}
      {workflowPrescription && (
        <PrescriptionWorkflowModal
          prescription={workflowPrescription}
          onClose={() => setWorkflowPrescription(null)}
          onComplete={(data) => {
            if (workflowPrescription) {
              const rxId = workflowPrescription.id;
              setSentIds(prev => new Set([...prev, rxId]));
              setSentConsultations(prev => ({ ...prev, [rxId]: data }));
              setPrescriptions(prev => prev.map(rx =>
                rx.id === rxId ? { ...rx, status: 'completed' } : rx
              ));
            }
          }}
          onOpenSettings={onOpenSettings}
        />
      )}

      {selectedConsultation && (
        <ConsultationDetailModal
          data={selectedConsultation}
          onClose={() => setSelectedConsultation(null)}
        />
      )}
    </div>
  );
};
