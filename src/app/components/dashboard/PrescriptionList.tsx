import React, { useState, useCallback, useRef } from 'react';
import {
  FileText,
  Camera,
  Printer,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  X,
  Monitor,
  Bell,
  RefreshCw,
  Truck,
  Ban,
  Zap,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { clsx } from 'clsx';
import { ImageWithFallback } from '../figma/ImageWithFallback';

// ── Types ──────────────────────────────────────────────────────────────
type PrescriptionStatus = 'received' | 'dispensing' | 'payment_done' | 'ready_pickup' | 'rejected';
type PrescriptionSource = 'app_camera' | 'fax_telemed' | 'kiosk';

interface Prescription {
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

// ── Mock Data ──────────────────────────────────────────────────────────
const prescriptionImage = 'https://placehold.co/400x560/e2e8f0/64748b?text=처방전';

const BASE_PRESCRIPTIONS: Prescription[] = [
  { id: 'RX-001', source: 'app_camera', patientName: '김철수', birthDate: '1980-01-01', phone: '010-1234-5678', hospitalName: '확인 안됨', diseaseCode: 'J20.9', status: 'received', paymentStatus: 'na', deliveryMethod: '방문 수령', isMember: true, receivedAt: '2026-03-12 14:30', imageUrl: prescriptionImage },
  { id: 'RX-002', source: 'app_camera', patientName: '박지민', birthDate: '2015-05-05', phone: '010-3333-7777', hospitalName: '확인 안됨', diseaseCode: 'J30.4', status: 'dispensing', paymentStatus: 'na', deliveryMethod: '배송', isMember: false, receivedAt: '2026-03-12 13:45', imageUrl: prescriptionImage },
  { id: 'RX-003', source: 'app_camera', patientName: '정수정', birthDate: '1998-07-07', phone: '010-6666-2222', hospitalName: '확인 안됨', diseaseCode: 'F41.0', status: 'payment_done', paymentStatus: 'paid', deliveryMethod: '방문 수령', isMember: true, receivedAt: '2026-03-12 10:10', imageUrl: prescriptionImage },
  { id: 'RX-004', source: 'fax_telemed', patientName: '이영희', birthDate: '1992-03-15', phone: '010-9876-5432', hospitalName: '굿닥터이비인후과', diseaseCode: 'J00', status: 'dispensing', paymentStatus: 'paid', paymentAmount: '12,500원', deliveryMethod: '방문 수령', isMember: true, receivedAt: '2026-03-12 14:15', imageUrl: prescriptionImage },
  { id: 'RX-005', source: 'fax_telemed', patientName: '최민수', birthDate: '1975-12-12', phone: '010-5555-1111', hospitalName: '서울대병원', diseaseCode: 'E11.9', status: 'rejected', paymentStatus: 'refunded', paymentAmount: '28,000원', deliveryMethod: '배송', isMember: false, receivedAt: '2026-03-12 11:20', imageUrl: prescriptionImage },
  { id: 'RX-006', source: 'fax_telemed', patientName: '김하준', birthDate: '1990-02-14', phone: '010-2222-8888', hospitalName: '강북삼성병원', diseaseCode: 'J06.9', status: 'received', paymentStatus: 'pending', paymentAmount: '8,400원', deliveryMethod: '방문 수령', isMember: true, receivedAt: '2026-03-12 10:50', imageUrl: prescriptionImage },
  { id: 'RX-007', source: 'kiosk', patientName: '한지수', birthDate: '2001-03-20', phone: '010-4444-9999', hospitalName: '연세세브란스병원', diseaseCode: 'I10', status: 'ready_pickup', paymentStatus: 'paid', paymentAmount: '15,200원', receivedAt: '2026-03-12 09:50', imageUrl: prescriptionImage },
  { id: 'RX-008', source: 'kiosk', patientName: '오민준', birthDate: '1988-09-22', phone: '010-7777-3333', hospitalName: '강남성심병원', diseaseCode: 'M54.5', status: 'dispensing', paymentStatus: 'na', paymentAmount: '9,800원', receivedAt: '2026-03-12 09:35', imageUrl: prescriptionImage },
  { id: 'RX-009', source: 'kiosk', patientName: '임태양', birthDate: '1973-04-30', phone: '010-1111-6666', hospitalName: '고려대안암병원', diseaseCode: 'J45.9', status: 'received', paymentStatus: 'na', paymentAmount: '11,400원', receivedAt: '2026-03-12 08:55', imageUrl: prescriptionImage },
];

const REJECT_REASONS = [
  { id: 'no_drug',  label: '약 재고 없음',    desc: '처방된 약품이 현재 재고에 없습니다.' },
  { id: 'unclear',  label: '처방전 불명확',    desc: '처방전 이미지가 흐리거나 내용을 확인할 수 없습니다.' },
  { id: 'expired',  label: '처방전 기간 만료', desc: '처방전 유효기간이 지났습니다.' },
  { id: 'other',    label: '기타',            desc: '직접 사유를 입력합니다.' },
];

// ── Helpers ────────────────────────────────────────────────────────────
const getSourceIcon = (source: PrescriptionSource) => {
  if (source === 'app_camera') return <Camera size={15} className="text-blue-500" />;
  if (source === 'kiosk') return <Monitor size={15} className="text-green-600" />;
  return <Printer size={15} className="text-purple-500" />;
};

const getSourceLabel = (source: PrescriptionSource) => {
  if (source === 'app_camera') return '고객 앱 촬영';
  if (source === 'kiosk') return '키오스크 스캔';
  return '의사 웹 전송';
};

// Status labels only (no icons in badge — icons removed per request)
const STATUS_LABEL: Record<PrescriptionStatus, { label: string; color: string }> = {
  received:     { label: '신규 접수', color: 'text-blue-600 font-semibold' },
  dispensing:   { label: '조제 중',   color: 'text-yellow-600 font-semibold' },
  payment_done: { label: '결제 완료', color: 'text-indigo-600 font-semibold' },
  ready_pickup: { label: '수령 대기', color: 'text-green-600 font-semibold' },
  rejected:     { label: '거절/반려', color: 'text-red-600 font-semibold' },
};

const StatusText: React.FC<{ status: PrescriptionStatus }> = ({ status }) => {
  const { label, color } = STATUS_LABEL[status];
  return <span className={clsx('text-sm', color)}>{label}</span>;
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
export const PrescriptionList: React.FC = () => {
  const [filter, setFilter] = useState<'all' | PrescriptionSource>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PrescriptionStatus>('all');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(BASE_PRESCRIPTIONS);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [newCount, setNewCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [zoom, setZoom] = useState(1);
  const notifTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── 신규 처방전 트리거
  const triggerNewPrescription = useCallback(() => {
    const newRx: Prescription = {
      id: `RX-NEW-${Date.now()}`, source: 'app_camera', patientName: '신규 고객', birthDate: '1990-06-15',
      phone: '010-0000-0000', hospitalName: '확인 안됨', diseaseCode: 'NEW', status: 'received',
      paymentStatus: 'na', deliveryMethod: '방문 수령', isMember: false,
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
  }, []);

  // ── Status update
  const updateStatus = (newStatus: PrescriptionStatus) => {
    if (!selectedPrescription) return;
    const updated = { ...selectedPrescription, status: newStatus, isNew: false };
    setPrescriptions(prev => prev.map(p => p.id === selectedPrescription.id ? updated : p));
    setSelectedPrescription(updated);
    const label = STATUS_LABEL[newStatus].label;
    setToast(`상태가 '${label}'(으)로 변경되었습니다.`);
    if (newStatus === 'rejected') { setRejectOpen(false); setRejectReason(''); setRejectNote(''); }
  };

  // ── Confirm reject
  const confirmReject = () => {
    if (!rejectReason) return;
    updateStatus('rejected');
  };

  // ── Filtered rows
  const filteredPrescriptions = prescriptions.filter(p => {
    return (filter === 'all' || p.source === filter) && (statusFilter === 'all' || p.status === statusFilter);
  });

  // ── Table classes
  const th = 'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider';
  const thC = 'px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider';
  const td = 'px-4 py-3 whitespace-nowrap text-sm text-gray-600';
  const tdB = 'px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900';

  // ── Header
  const renderHeader = () => {
    if (filter === 'app_camera') return (
      <tr>
        <th className={th}>접수일시</th><th className={th}>고객명</th><th className={th}>생년월일</th>
        <th className={th}>휴대폰 번호</th><th className={th}>발행 병원</th><th className={th}>접수 경로</th>
        <th className={th}>수령 방법</th><th className={thC}>대체조제 동의</th>
        <th className={th}>조제 상태</th><th className={thC}>처방전 보기</th>
      </tr>
    );
    if (filter === 'fax_telemed') return (
      <tr>
        <th className={th}>접수일시</th><th className={th}>고객명</th><th className={th}>생년월일</th>
        <th className={th}>휴대폰 번호</th><th className={th}>발행 병원</th><th className={th}>접수 경로</th>
        <th className={th}>수령 방법</th><th className={th}>결제 금액</th><th className={th}>결제 상태</th>
        <th className={th}>조제 상태</th><th className={thC}>처방전 보기</th>
      </tr>
    );
    if (filter === 'kiosk') return (
      <tr>
        <th className={th}>접수일시</th><th className={th}>고객명</th><th className={th}>생년월일</th>
        <th className={th}>휴대폰 번호</th><th className={th}>발행 병원</th><th className={th}>접수 경로</th>
        <th className={th}>결제 금액</th><th className={th}>조제 상태</th><th className={thC}>처방전 보기</th>
      </tr>
    );
    return (
      <tr>
        <th className={th}>접수일시</th><th className={th}>고객명</th><th className={th}>생년월일</th>
        <th className={th}>휴대폰 번호</th><th className={th}>발행 병원</th><th className={th}>접수 경로</th>
        <th className={th}>조제 상태</th><th className={thC}>처방전 보기</th>
      </tr>
    );
  };

  // ── Row
  const renderRow = (p: Prescription) => {
    const rowCls = clsx('transition-colors hover:bg-blue-50/30', p.isNew && p.status === 'received' && 'bg-blue-50');

    const commonCells = (
      <>
        <td className={td}>
          <span className="text-xs">{p.receivedAt}</span>
          {p.isNew && <span className="ml-1 inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600">NEW</span>}
        </td>
        <td className={tdB}>{p.patientName}</td>
        <td className={td}>{p.birthDate}</td>
        <td className={td}>{p.phone}</td>
        <td className={td}>
          {p.source === 'app_camera'
            ? <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-400">확인 안됨</span>
            : p.hospitalName}
        </td>
        <td className={td}>
          <div className="flex items-center gap-1.5">
            <span className={clsx('h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0',
              p.source === 'app_camera' ? 'bg-blue-100' : p.source === 'kiosk' ? 'bg-green-100' : 'bg-purple-100'
            )}>{getSourceIcon(p.source)}</span>
            <span className="text-xs font-medium text-gray-700">{getSourceLabel(p.source)}</span>
          </div>
        </td>
      </>
    );

    // 대체조제 동의: 필수이므로 항상 "동의" (아이콘 없음)
    const substituteCell = (
      <td className={thC}>
        <span className="text-sm text-gray-700">동의</span>
      </td>
    );

    // 수령 방법 cell
    const deliveryCell = (
      <td className={td}>{p.deliveryMethod ?? <span className="text-gray-300">—</span>}</td>
    );

    // 결제 금액
    const amountCell = <td className={td}>{p.paymentAmount ?? <span className="text-gray-300">—</span>}</td>;

    // 결제 상태
    const paymentStatusCell = (
      <td className={td}>
        {p.paymentStatus === 'paid' && <span className="text-xs text-green-600 font-medium">결제완료</span>}
        {p.paymentStatus === 'pending' && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-orange-50 text-orange-500 border border-orange-200"><Clock size={11} />결제 대기</span>}
        {p.paymentStatus === 'refunded' && <span className="text-xs text-gray-500">환불</span>}
        {p.paymentStatus === 'na' && <span className="text-xs text-gray-400">해당없음</span>}
      </td>
    );

    // 조제 상태 (아이콘 없음)
    const statusCell = <td className={td}><StatusText status={p.status} /></td>;

    const viewBtn = (
      <td className={thC}>
        <button
          onClick={() => { setSelectedPrescription(p); setRejectOpen(false); setRejectReason(''); setRejectNote(''); setZoom(1); }}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md bg-white hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          <Eye size={13} />보기
        </button>
      </td>
    );

    if (filter === 'app_camera') return <tr key={p.id} className={rowCls}>{commonCells}{deliveryCell}{substituteCell}{statusCell}{viewBtn}</tr>;
    if (filter === 'fax_telemed') return <tr key={p.id} className={rowCls}>{commonCells}{deliveryCell}{amountCell}{paymentStatusCell}{statusCell}{viewBtn}</tr>;
    if (filter === 'kiosk') return <tr key={p.id} className={rowCls}>{commonCells}{amountCell}{statusCell}{viewBtn}</tr>;
    return <tr key={p.id} className={rowCls}>{commonCells}{statusCell}{viewBtn}</tr>;
  };

  // ── What button to show at bottom of modal
  const dispenseLabel = selectedPrescription?.status === 'dispensing' ? '조제 완료 및 결제 요청' : '조제 시작';
  const dispenseNext: PrescriptionStatus = selectedPrescription?.status === 'dispensing' ? 'payment_done' : 'dispensing';
  const showDispenseBtn = selectedPrescription && !['payment_done', 'ready_pickup', 'rejected'].includes(selectedPrescription.status);
  const showRejectBtn = selectedPrescription && !['rejected'].includes(selectedPrescription.status);

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
            { value: 'fax_telemed', label: '의사 웹 전송', icon: <Printer size={13} /> as React.ReactNode },
            { value: 'kiosk', label: '키오스크 스캔', icon: <Monitor size={13} /> as React.ReactNode },
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
            <option value="received">신규 접수</option>
            <option value="dispensing">조제 중</option>
            <option value="payment_done">결제 완료</option>
            <option value="ready_pickup">수령 대기</option>
            <option value="rejected">거절/반려</option>
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
                {filteredPrescriptions.map(p => renderRow(p))}
                {filteredPrescriptions.length === 0 && (
                  <tr><td colSpan={11} className="py-16 text-center text-gray-400 text-sm">접수된 처방전이 없습니다.</td></tr>
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

      {/* ── 처방전 검토 팝업 모달 (left: image, right: info + actions) ── */}
      {selectedPrescription && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedPrescription(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex overflow-hidden max-h-[90vh] animate-in zoom-in-95 fade-in duration-200">

            {/* Left: image viewer */}
            <div className="flex-1 bg-gray-100 flex flex-col min-w-0">
              <div className="flex justify-end gap-2 p-3 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
                <button onClick={() => setZoom(z => Math.min(z + 0.25, 3))} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"><ZoomIn size={16} /></button>
                <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"><ZoomOut size={16} /></button>
              </div>
              <div className="flex-1 overflow-auto flex items-center justify-center p-4">
                {selectedPrescription.imageUrl ? (
                  <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center top', transition: 'transform 0.2s' }}>
                    <ImageWithFallback src={selectedPrescription.imageUrl} alt="처방전" className="max-w-full rounded-lg shadow" />
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
                <button onClick={() => setSelectedPrescription(null)} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"><X size={16} /></button>
              </div>

              {/* Scrollable info */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                {/* 조제 상태 */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">조제 상태</span>
                  <StatusText status={selectedPrescription.status} />
                </div>

                {/* 환자 정보 */}
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-3">환자 정보</p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">고객명</p>
                        <p className="text-sm font-medium text-gray-900">{selectedPrescription.patientName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">생년월일</p>
                        <p className="text-sm font-medium text-gray-900">{selectedPrescription.birthDate}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 mb-0.5">휴대폰 번호</p>
                      <p className="text-sm font-medium text-blue-600">{selectedPrescription.phone}</p>
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
                        {selectedPrescription.source === 'app_camera' ? '확인 안됨' : selectedPrescription.hospitalName}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">대체조제 동의</p>
                        <p className="text-sm font-medium text-gray-900">동의</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">수령 방법</p>
                        <p className="text-sm font-medium text-gray-900">{selectedPrescription.deliveryMethod ?? '—'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 mb-0.5">접수 경로</p>
                      <p className="text-sm font-medium text-blue-600">{getSourceLabel(selectedPrescription.source)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons at bottom */}
              <div className="px-5 pb-5 pt-3 border-t border-gray-100 space-y-2">
                {/* 조제 시작 / 조제 완료 */}
                {showDispenseBtn && (
                  <button
                    onClick={() => updateStatus(dispenseNext)}
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

                {selectedPrescription.status === 'rejected' && (
                  <div className="w-full py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium text-center">
                    거절/반려 처리된 처방전입니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
