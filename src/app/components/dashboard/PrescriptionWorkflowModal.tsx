import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X, FileText, Send, Pill, Minus, Plus,
  ChevronRight, AlertCircle, Calendar as CalendarIcon,
  Settings, Loader2, CheckCircle, Pencil, Trash2, Check,
  Bell, RefreshCw, RotateCcw, Search, User
} from 'lucide-react';
import { clsx } from 'clsx';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import type { Prescription } from './PrescriptionDetailModal';
import { ConsultationData } from './ConsultationDetailModal';

// ── Types ──────────────────────────────────────────────────────────────

interface ReminderSettings {
  frequency: number;
  times: string[];
  relation: string;
}

interface DrugItem {
  id: string;
  name: string;
  category: string;
  dosageAmount: number;   // "1회 N정" 의 N
  frequencyCount: number; // "하루 N회" 의 N
  days: number;
}

// ── Constants ──────────────────────────────────────────────────────────

const FREQUENCY_DEFAULTS: Record<number, { times: string[]; relation: string }> = {
  1: { times: ['아침'], relation: '식후 30분' },
  2: { times: ['아침', '저녁'], relation: '식후 30분' },
  3: { times: ['아침', '점심', '저녁'], relation: '식후 30분' },
};

const INITIAL_DRUGS: DrugItem[] = [
  { id: '1', name: '메트포르민 500mg',   category: '혈당강하제',         dosageAmount: 1, frequencyCount: 3, days: 30 },
  { id: '2', name: '글리메피리드 2mg',   category: '인슐린 분비 촉진제', dosageAmount: 1, frequencyCount: 1, days: 30 },
  { id: '3', name: '로수바스타틴 10mg',  category: '고지혈증약',         dosageAmount: 1, frequencyCount: 1, days: 30 },
  { id: '4', name: '오메프라졸 20mg',    category: '위장보호제',         dosageAmount: 1, frequencyCount: 1, days: 30 },
];

const OCR_SMART_TAGS: string[] = [
  '식후 30분에 복용하세요.',
  '식사를 거르지 마세요.',
  '정기적으로 혈당을 체크하세요.',
  '저혈당 증상 시 사탕이나 주스를 드세요.',
  '근육통이 생기면 즉시 내원하세요.',
];

const COMMON_TAGS: string[] = [
  '공복에 복용하세요.',
  '충분한 물과 함께 드세요.',
  '잠이 올 수 있으니 주의하세요.',
  '술을 드시지 마세요.',
  '임의로 복용을 중단하지 마세요.',
];

// Mock 단골 고객 목록
const REGULAR_CUSTOMERS: { name: string; phone: string; birth: string }[] = [
  { name: '김철수', phone: '010-1234-5678', birth: '1980-01-01' },
  { name: '이영희', phone: '010-2345-6789', birth: '1975-05-12' },
  { name: '박민준', phone: '010-3456-7890', birth: '1990-11-23' },
  { name: '최수진', phone: '010-4567-8901', birth: '1968-03-07' },
  { name: '정현우', phone: '010-5678-9012', birth: '1985-09-30' },
  { name: '강지은', phone: '010-6789-0123', birth: '1993-07-15' },
  { name: '윤성호', phone: '010-7890-1234', birth: '1955-12-28' },
  { name: '임세아', phone: '010-8901-2345', birth: '2001-02-14' },
];

const STEP_LABELS = ['처방전 확인', '복약 상담 메시지', '복약 알림', '메시지 전송'];

// Mock: DB 조회 결과 (앱 가입 여부)
const MOCK_IS_APP_USER = false;

// ── Props ───────────────────────────────────────────────────────────────

interface PrescriptionWorkflowModalProps {
  prescription: Prescription;
  onClose: () => void;
  onComplete?: (data: ConsultationData) => void;
  onOpenSettings?: () => void;
}

// ── Toast ───────────────────────────────────────────────────────────────

interface ToastState { message: string; type: 'success' | 'error' }

const Toast: React.FC<ToastState & { onDismiss: () => void }> = ({ message, type, onDismiss }) => (
  <div className={clsx(
    'fixed top-6 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-2.5 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-semibold animate-in slide-in-from-top-4 fade-in duration-300',
    type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'
  )}>
    {type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
    {message}
    <button onClick={onDismiss} className="ml-2 opacity-70 hover:opacity-100 transition-opacity">
      <X className="w-3.5 h-3.5" />
    </button>
  </div>
);

// ── NumberInput (숫자만 입력) ─────────────────────────────────────────
const NumberInput: React.FC<{
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  className?: string;
}> = ({ value, onChange, min = 1, max = 99, className }) => (
  <input
    type="number"
    inputMode="numeric"
    value={value}
    min={min}
    max={max}
    onChange={e => {
      const v = parseInt(e.target.value);
      if (!isNaN(v) && v >= min && v <= max) onChange(v);
    }}
    className={clsx(
      'w-10 text-center text-xs font-bold border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white py-1',
      '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
      className
    )}
  />
);

// ═══════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════

export const PrescriptionWorkflowModal: React.FC<PrescriptionWorkflowModalProps> = ({
  prescription,
  onClose,
  onComplete,
  onOpenSettings,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── STEP 1: Drug list
  const [drugs, setDrugs] = useState<DrugItem[]>(INITIAL_DRUGS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<DrugItem | null>(null);

  // ── STEP 2: Customer search + phone
  const [customerQuery, setCustomerQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<{ name: string; phone: string; birth: string } | null>(null);
  const [patientPhone, setPatientPhone] = useState(prescription.phone || '');
  const [phoneError, setPhoneError] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const phoneRef = useRef<HTMLInputElement>(null);
  const [showCustomerDrop, setShowCustomerDrop] = useState(false);
  const phoneDropRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.trim();
    if (!q) return [];
    return REGULAR_CUSTOMERS.filter(c =>
      c.name.includes(q) ||
      c.phone.replace(/-/g, '').includes(q.replace(/-/g, ''))
    ).slice(0, 6);
  }, [customerQuery]);

  // Reset focus index when query changes
  useEffect(() => {
    setFocusedIndex(-1);
  }, [customerQuery]);

  const handleSelectCustomer = (c: typeof REGULAR_CUSTOMERS[0]) => {
    setSelectedCustomer(c);
    setPatientPhone(c.phone);
    setPhoneTouched(true);
    setPhoneError('');
    setShowCustomerDrop(false);
    setCustomerQuery('');
    setFocusedIndex(-1);
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setPatientPhone('');
    setPhoneTouched(false);
    setPhoneError('');
    setCustomerQuery('');
    setFocusedIndex(-1);
    setTimeout(() => phoneRef.current?.focus(), 50);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (phoneDropRef.current && !phoneDropRef.current.contains(e.target as Node)) {
        setShowCustomerDrop(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [isMessageOverridden, setIsMessageOverridden] = useState(false);

  // ── STEP 3: Reminder
  const [reminder, setReminder] = useState<ReminderSettings>({
    frequency: 3,
    times: FREQUENCY_DEFAULTS[3].times,
    relation: FREQUENCY_DEFAULTS[3].relation,
  });
  const [startDate] = useState(new Date());
  const [durationDays, setDurationDays] = useState(30);
  const [refillAlertEnabled, setRefillAlertEnabled] = useState(true);

  const isAppUser = MOCK_IS_APP_USER;

  // ── Auto-generate message ──
  const autoMessage = useMemo(() => {
    const pharmacyName = '웰체크약국';
    const usage = `하루 ${reminder.frequency}번, ${reminder.times.join(', ')} ${reminder.relation}에 복약하세요.`;
    const tagLines = selectedTags.length > 0
      ? `\n\n[주의사항]\n${selectedTags.map(t => `· ${t}`).join('\n')}`
      : '';
    const drugSection = drugs.length > 0
      ? `\n\n[처방 약품]\n${drugs.map((d, i) => `${i + 1}. ${d.name} (${d.category})`).join('\n')}`
      : '';

    return `[복약 상담 안내]\n안녕하세요, ${pharmacyName}입니다.\n처방받으신 약품을 안내드립니다.${drugSection}\n\n[복약 방법]\n${usage}${tagLines}\n\n문의사항은 약국으로 연락주세요.`;
  }, [drugs, reminder, selectedTags]);

  useEffect(() => {
    if (!isMessageOverridden) setMessage(autoMessage);
  }, [autoMessage, isMessageOverridden]);

  // ── Auto-focus phone on STEP 2
  useEffect(() => {
    if (currentStep === 2) setTimeout(() => phoneRef.current?.focus(), 100);
  }, [currentStep]);

  // ── Toast
  const showToast = (msg: string, type: 'success' | 'error') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message: msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  // ── Phone validation
  const validatePhone = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '');
    if (!raw) return '고객 휴대폰 번호를 입력해 주세요.';
    if (raw.length < 10 || raw.length > 11) return '올바른 형식으로 입력해 주세요. (예: 010-1234-5678)';
    return '';
  };
  const isPhoneValid = !validatePhone(patientPhone);

  const formatPhone = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '');
    if (raw.length > 7) return `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
    if (raw.length > 3) return `${raw.slice(0, 3)}-${raw.slice(3)}`;
    return raw;
  };

  // ── Drug edit handlers
  const startEdit = (drug: DrugItem) => { setEditingId(drug.id); setEditingDraft({ ...drug }); };
  const cancelEdit = () => { setEditingId(null); setEditingDraft(null); };
  const saveEdit = () => {
    if (!editingDraft) return;
    setDrugs(prev => prev.map(d => d.id === editingDraft.id ? editingDraft : d));
    setEditingId(null); setEditingDraft(null);
  };
  const deleteDrug = (id: string) => setDrugs(prev => prev.filter(d => d.id !== id));
  const addDrug = () => {
    const newDrug: DrugItem = { id: Date.now().toString(), name: '', category: '', dosageAmount: 1, frequencyCount: 1, days: 30 };
    setDrugs(prev => [...prev, newDrug]);
    startEdit(newDrug);
  };

  // ── Tag toggle
  const toggleTag = (tag: string) => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  // ── Navigation
  const goStep = (n: number) => setCurrentStep(n);
  const nextStep = () => { if (currentStep < 4) goStep(currentStep + 1); };
  const prevStep = () => { if (currentStep > 1) goStep(currentStep - 1); };
  const canGoNext = () => currentStep === 2 ? isPhoneValid : true;

  // ── Send
  const handleSend = async () => {
    if (isSending) return;
    setIsSending(true);
    try {
      await new Promise(res => setTimeout(res, 1500));
      const consultationData: ConsultationData = {
        id: `CS-${Date.now()}`,
        patientName: prescription.patientName,
        phone: patientPhone,
        sendMethod: isAppUser ? '웰체크 앱' : '알림톡',
        sentAt: new Date().toLocaleString('ko-KR', { 
          year: 'numeric', month: '2-digit', day: '2-digit', 
          hour: '2-digit', minute: '2-digit', hour12: false 
        }).replace(/\. /g, '-').replace(/\./g, ''),
        frequency: reminder.frequency,
        times: reminder.times,
        relation: reminder.relation,
        duration: durationDays,
        messageContent: message,
      };
      setIsCompleted(true);
      onComplete?.(consultationData);
      showToast(`${prescription.patientName} 님께 복약 안내 메시지를 전송했습니다.`, 'success');
    } catch {
      showToast('전송 중 오류가 발생했습니다. 다시 시도해 주세요.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (d: Date) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} (${days[d.getDay()]})`;
  };

  // ── Footer right button
  const renderFooterRight = () => {
    if (isCompleted) return null;
    if (currentStep === 4) {
      return (
        <button
          onClick={handleSend}
          disabled={isSending}
          className={clsx(
            'px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1',
            !isSending ? 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-sm' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
        >
          {isSending ? <><Loader2 className="w-4 h-4 animate-spin" />전송 중...</> : <><Send className="w-4 h-4" />메시지 전송하기</>}
        </button>
      );
    }
    return (
      <>
        {currentStep === 3 && (
          <button
            onClick={nextStep}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
          >
            이 단계 건너뛰기
          </button>
        )}
        <button
          onClick={nextStep}
          disabled={!canGoNext()}
          className={clsx(
            'px-5 py-2 rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1',
            canGoNext() ? 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-sm' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
        >
          다음 단계 →
        </button>
      </>
    );
  };

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════
  return (
    <>
      {toast && <Toast {...toast} onDismiss={() => setToast(null)} />}
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-5" style={{ backdropFilter: 'blur(2px)' }}>
        <div className="absolute inset-0 bg-black/45" onClick={onClose} />
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[1040px] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-200"
          onClick={e => e.stopPropagation()}
        >
          {/* ── HEADER ── */}
          <div className="border-b border-gray-200 flex-shrink-0">
            <div className="px-7 pt-5 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-base font-bold text-blue-600">
                  {prescription.patientName[0]}
                </div>
                <div>
                  <div className="text-[17px] font-bold text-gray-900">{prescription.patientName}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {prescription.birthDate} · {prescription.gender || ''} · {prescription.id} · {prescription.hospitalName}
                  </div>
                </div>
              </div>
              <button onClick={onClose} aria-label="닫기" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 active:scale-90 transition-all focus:outline-none focus:ring-2 focus:ring-gray-300">
                <X size={16} />
              </button>
            </div>
            <div className="flex">
              {STEP_LABELS.map((label, i) => {
                const step = i + 1;
                const isActive = step === currentStep;
                const isDone = step < currentStep || isCompleted;
                return (
                  <button key={step} onClick={() => !isCompleted && goStep(step)} className={clsx('flex-1 py-2.5 text-center text-xs font-semibold border-b-[3px] transition-all focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-200', isActive && 'text-blue-600 border-blue-600', isDone && !isActive && 'text-emerald-600 border-emerald-500', !isActive && !isDone && 'text-gray-400 border-transparent')}>
                    <span className={clsx('inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] mr-1.5 transition-all', isActive && 'bg-blue-600 text-white', isDone && !isActive && 'bg-emerald-500 text-white', !isActive && !isDone && 'bg-gray-200 text-gray-400')}>
                      {isDone && !isActive ? '✓' : step}
                    </span>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── BODY ── */}
          <div className="flex-1 overflow-y-auto p-6">

            {/* ════ STEP 1 ════ */}
            {currentStep === 1 && (
              <div className="grid grid-cols-2 gap-5 h-full">
                {/* 처방전 원본 */}
                <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col bg-gray-50 min-h-[420px]">
                  <div className="px-4 py-3 border-b border-gray-200 bg-white text-xs font-bold text-gray-500 uppercase tracking-wider">처방전 원본</div>
                  <div className="flex-1 p-4 flex items-start justify-center overflow-auto">
                    {prescription.imageUrl ? (
                      <ImageWithFallback src={prescription.imageUrl} alt="처방전 원본" className="max-w-full rounded-lg shadow-md" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-300 py-16 gap-2">
                        <FileText size={40} className="opacity-40" />
                        <p className="text-sm text-gray-400">처방전 이미지 없음</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 조제 내역 (편집 가능) */}
                <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col min-h-[420px]">
                  <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">조제 내역</span>
                    <span className="text-[11px] text-blue-500 font-medium">대체 조제 시 직접 수정하세요</span>
                  </div>
                  <div className="flex-1 p-3 overflow-y-auto space-y-1.5">
                    {drugs.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-10 gap-2">
                        <Pill size={32} className="text-gray-300 opacity-40" />
                        <p className="text-sm text-gray-400">조제 약품이 없습니다.</p>
                      </div>
                    )}
                    {drugs.map((drug, idx) => (
                      <div key={drug.id} className="border border-gray-100 rounded-lg overflow-hidden">
                        {editingId === drug.id && editingDraft ? (
                          /* 편집 모드 */
                          <div className="p-3 bg-blue-50 space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-gray-500 font-semibold mb-1 block">약품명</label>
                                <input autoFocus value={editingDraft.name} onChange={e => setEditingDraft({ ...editingDraft, name: e.target.value })} className="w-full text-xs px-2 py-1.5 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white" placeholder="약품명" />
                              </div>
                              <div>
                                <label className="text-[10px] text-gray-500 font-semibold mb-1 block">분류</label>
                                <input value={editingDraft.category} onChange={e => setEditingDraft({ ...editingDraft, category: e.target.value })} className="w-full text-xs px-2 py-1.5 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white" placeholder="약품 분류" />
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {/* 용량: 1회 N정 — N만 수정 */}
                              <div className="flex items-center gap-1.5">
                                <label className="text-[10px] text-gray-500 font-semibold whitespace-nowrap">용량</label>
                                <span className="text-xs text-gray-500">1회</span>
                                <NumberInput value={editingDraft.dosageAmount} onChange={v => setEditingDraft({ ...editingDraft, dosageAmount: v })} />
                                <span className="text-xs text-gray-500">정</span>
                              </div>
                              {/* 횟수: 하루 N회 — N만 수정 */}
                              <div className="flex items-center gap-1.5">
                                <label className="text-[10px] text-gray-500 font-semibold whitespace-nowrap">횟수</label>
                                <span className="text-xs text-gray-500">하루</span>
                                <NumberInput value={editingDraft.frequencyCount} onChange={v => setEditingDraft({ ...editingDraft, frequencyCount: v })} />
                                <span className="text-xs text-gray-500">회</span>
                              </div>
                              {/* 조제일수 */}
                              <div className="flex items-center gap-1.5 ml-auto">
                                <label className="text-[10px] text-gray-500 font-semibold whitespace-nowrap">일수</label>
                                <NumberInput value={editingDraft.days} onChange={v => setEditingDraft({ ...editingDraft, days: v })} min={1} max={365} className="w-12" />
                                <span className="text-xs text-gray-500">일</span>
                              </div>
                            </div>
                            <div className="flex justify-end gap-1.5">
                              <button onClick={cancelEdit} className="px-3 py-1.5 text-xs border border-gray-200 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300">취소</button>
                              <button onClick={saveEdit} className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-300">
                                <Check className="w-3 h-3" />저장
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* 읽기 모드 */
                          <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 group transition-colors">
                            <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 text-[11px] font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-semibold text-gray-900 truncate">{drug.name || '(약품명 없음)'}</div>
                              <div className="text-[11px] text-gray-400 mt-0.5">
                                {drug.category} · 1회 {drug.dosageAmount}정, 하루 {drug.frequencyCount}회
                              </div>
                            </div>
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[11px] font-bold flex-shrink-0">{drug.days}일분</span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => startEdit(drug)} className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors focus:outline-none" aria-label="수정"><Pencil className="w-3.5 h-3.5" /></button>
                              <button onClick={() => deleteDrug(drug.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors focus:outline-none" aria-label="삭제"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="px-3 pb-3 flex-shrink-0">
                    <button onClick={addDrug} className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-200">
                      + 약품 추가
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ════ STEP 2 ════ */}
            {currentStep === 2 && (
              <div className="flex flex-col gap-4 h-full">
                {/* 고객 검색 (상단 독립 영역) */}
                <div className="border border-gray-200 rounded-xl p-4 flex-shrink-0">
                  <label className="text-xs font-bold text-gray-700 block mb-0.5">
                    고객 휴대폰 번호 <span className="text-red-400">*</span>
                  </label>

                  <div ref={phoneDropRef} className="relative">
                    {selectedCustomer ? (
                      /* 선택 완료 상태 — 칩 + 수정 */
                      <div className={clsx(
                        'flex items-center gap-3 px-3 py-2.5 border rounded-xl transition-all shadow-sm',
                        'border-blue-400 bg-blue-50 ring-2 ring-blue-100'
                      )}>
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-gray-900">{selectedCustomer.name}</div>
                          <div className="text-xs text-gray-500 font-mono">{selectedCustomer.phone}</div>
                        </div>
                        <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <button
                          type="button"
                          onClick={handleClearCustomer}
                          className="p-1.5 ml-1 rounded-full hover:bg-white/60 text-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                          aria-label="선택 해제"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      /* 검색 입력 상태 */
                      <>
                        <div className={clsx(
                          'flex items-center gap-2.5 px-3 py-3 border rounded-xl transition-all shadow-sm',
                          phoneTouched && phoneError
                            ? 'border-red-400 bg-red-50 focus-within:ring-2 focus-within:ring-red-100'
                            : 'border-gray-300 bg-gray-50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'
                        )}>
                          <Search className={clsx("w-5 h-5 flex-shrink-0 transition-colors", showCustomerDrop ? "text-blue-500" : "text-gray-400")} />
                          <input
                            id="customer-phone"
                            ref={phoneRef}
                            type="text"
                            value={customerQuery}
                            onChange={e => {
                              const inputVal = e.target.value;
                              const raw = inputVal.replace(/[^0-9]/g, '');
                              const isNumericOnly = /^[0-9\-]*$/.test(inputVal);

                              if (isNumericOnly && raw.length > 0) {
                                // 숫자 입력: 실시간 하이픈 자동 포맷
                                let formatted = raw.slice(0, 11); // 최대 11자리
                                if (formatted.length > 7) {
                                  formatted = `${formatted.slice(0,3)}-${formatted.slice(3,7)}-${formatted.slice(7)}`;
                                } else if (formatted.length > 3) {
                                  formatted = `${formatted.slice(0,3)}-${formatted.slice(3)}`;
                                }
                                setCustomerQuery(formatted);
                                const phoneVal = raw.length >= 11 ? formatted : (raw.length >= 10 ? formatted : '');
                                setPatientPhone(phoneVal);
                                // 11자리 완성 시 자동 선택 처리
                                if (raw.length === 11) {
                                  setSelectedCustomer({ name: '', phone: formatted, birth: '' });
                                  setPhoneTouched(true);
                                  setPhoneError('');
                                  setShowCustomerDrop(false);
                                  setCustomerQuery('');
                                }
                              } else {
                                // 이름 검색 모드
                                setCustomerQuery(inputVal);
                                setPatientPhone('');
                              }
                              setShowCustomerDrop(true);
                            }}
                            onKeyDown={e => {
                              if (!showCustomerDrop || customerQuery.trim() === '') return;
                              if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                setFocusedIndex(prev => (prev < filteredCustomers.length - 1 ? prev + 1 : prev));
                              } else if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0));
                              } else if (e.key === 'Enter') {
                                e.preventDefault();
                                if (focusedIndex >= 0 && focusedIndex < filteredCustomers.length) {
                                  handleSelectCustomer(filteredCustomers[focusedIndex]);
                                } else if (filteredCustomers.length > 0) {
                                  handleSelectCustomer(filteredCustomers[0]);
                                }
                              } else if (e.key === 'Escape') {
                                setShowCustomerDrop(false);
                              }
                            }}
                            onFocus={() => {
                              if (customerQuery.trim() !== '') setShowCustomerDrop(true);
                            }}
                            onBlur={() => {
                              setPhoneTouched(true);
                              setPhoneError(validatePhone(patientPhone));
                            }}
                            placeholder="이름 또는 휴대폰 번호 검색..."
                            className="flex-1 text-[15px] font-medium bg-transparent outline-none placeholder-gray-400 text-gray-900"
                            autoComplete="off"
                          />
                          {customerQuery && (
                            <button
                              type="button"
                              onMouseDown={e => {
                                // onBlur 보다 먼저 동작하도록 onMouseDown 사용
                                e.preventDefault();
                                setCustomerQuery(''); 
                                setPatientPhone(''); 
                                setShowCustomerDrop(false);
                                phoneRef.current?.focus();
                              }}
                              className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors focus:outline-none"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        {phoneTouched && phoneError && (
                          <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3.5 h-3.5" />{phoneError}
                          </p>
                        )}
                      </>
                    )}

                    {/* 실시간 검색 드롭다운 */}
                    {showCustomerDrop && customerQuery.trim() !== '' && (
                      <div className="absolute z-30 top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                        {filteredCustomers.length > 0 ? (
                          <>
                            <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                              <span className="text-[11px] text-gray-500 font-bold tracking-wider">검색 결과</span>
                              <span className="text-[11px] text-blue-500 font-bold">{filteredCustomers.length}건</span>
                            </div>
                            <div className="py-1 max-h-[220px] overflow-y-auto">
                              {filteredCustomers.map((c, i) => {
                                const q = customerQuery.trim();
                                const isFocused = i === focusedIndex;
                                const highlightName = (text: string) => {
                                  if (!q || !/[가-힣a-zA-Z]/.test(q)) return text;
                                  const idx = text.indexOf(q);
                                  if (idx < 0) return text;
                                  return (
                                    <>
                                      {text.slice(0, idx)}
                                      <span className={clsx("font-extrabold", isFocused ? "text-blue-900" : "text-blue-600")}>{text.slice(idx, idx + q.length)}</span>
                                      {text.slice(idx + q.length)}
                                    </>
                                  );
                                };
                                return (
                                  <button
                                    key={c.phone}
                                    type="button"
                                    onMouseEnter={() => setFocusedIndex(i)}
                                    // mousedown을 써야 blur보다 আগে 선택됨
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      handleSelectCustomer(c);
                                    }}
                                    className={clsx(
                                      'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
                                      isFocused ? 'bg-blue-50' : 'hover:bg-gray-50'
                                    )}
                                  >
                                    <div className={clsx(
                                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-colors",
                                      isFocused ? "bg-blue-200 text-blue-700" : "bg-gray-100 text-gray-500"
                                    )}>
                                      {c.name.slice(0, 1)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className={clsx("text-[14px] font-semibold", isFocused ? "text-blue-900" : "text-gray-900")}>
                                        {highlightName(c.name)}
                                      </div>
                                      <div className={clsx("text-xs font-mono mt-0.5", isFocused ? "text-blue-700" : "text-gray-500")}>
                                        {c.phone.includes(q) ? (
                                          <>{c.phone.slice(0, c.phone.indexOf(q))}<span className="font-bold text-gray-900">{q}</span>{c.phone.slice(c.phone.indexOf(q) + q.length)}</>
                                        ) : c.phone} · {c.birth}
                                      </div>
                                    </div>
                                    {isFocused && (
                                      <span className="text-[10px] font-bold text-blue-500 mr-2">Enter로 선택</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                            {/* Footer shortcut hints */}
                            <div className="px-3 py-1.5 border-t border-gray-100 bg-gray-50 text-[10px] text-gray-400 flex items-center justify-end gap-3">
                              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded border border-gray-200 bg-white shadow-sm font-sans font-medium text-gray-500">↑</kbd> <kbd className="px-1 py-0.5 rounded border border-gray-200 bg-white shadow-sm font-sans font-medium text-gray-500">↓</kbd> 이동</span>
                              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded border border-gray-200 bg-white shadow-sm font-sans font-medium text-gray-500">↵</kbd> 선택</span>
                              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded border border-gray-200 bg-white shadow-sm font-sans font-medium text-gray-500">Esc</kbd> 닫기</span>
                            </div>
                          </>
                        ) : (
                          <div className="px-4 py-8 text-center bg-gray-50/50">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                              <Search className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="text-sm font-bold text-gray-700 mb-1">검색 결과가 없습니다</div>
                            <div className="text-xs text-gray-500">새로운 고객이라면 전체 번호를 직접 입력해주세요.</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2열: 태그 선택 | 메시지 편집 */}
                <div className="grid grid-cols-[1fr_1fr] gap-4 flex-1 min-h-0">
                  {/* 좌: 태그 */}
                  <div className="border border-gray-200 rounded-xl flex flex-col overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex-shrink-0">
                      <p className="text-xs font-bold text-gray-700 mb-0.5">전달할 복약 안내 내용을 선택하세요.</p>
                      <p className="text-[11px] text-gray-400">클릭하면 메시지에 자동 추가됩니다.</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-4">
                      {/* 자주 사용하는 태그 */}
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">자주 사용하는 태그</div>
                        <div className="space-y-1.5">
                          {COMMON_TAGS.map(tag => (
                            <button key={tag} onClick={() => toggleTag(tag)} className={clsx('w-full text-left px-3 py-2 rounded-lg text-xs transition-all border focus:outline-none focus:ring-2 focus:ring-blue-200 active:scale-[0.98]', selectedTags.includes(tag) ? 'bg-blue-600 text-white border-blue-600 font-medium' : 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700')}>
                              {selectedTags.includes(tag) ? `✓ ${tag}` : tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* OCR 분석 기반 맞춤 태그 — 강조 디자인 */}
                      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-200 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center flex-shrink-0">
                            <Pill className="w-3 h-3 text-white" />
                          </div>
                          <div className="text-[11px] font-bold text-blue-700 leading-none">OCR 분석 기반 맞춤 태그</div>
                        </div>
                        <div className="space-y-1.5">
                          {OCR_SMART_TAGS.map(tag => (
                            <button key={tag} onClick={() => toggleTag(tag)} className={clsx('w-full text-left px-3 py-2 rounded-lg text-xs transition-all border focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-[0.98]', selectedTags.includes(tag) ? 'bg-blue-600 text-white border-blue-600 font-medium shadow-sm' : 'bg-white/80 text-blue-800 border-blue-200 hover:bg-blue-100 hover:border-blue-300')}>
                              {selectedTags.includes(tag) ? `✓ ${tag}` : tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 우: 메시지 직접 편집 */}
                  <div className="border border-gray-200 rounded-xl flex flex-col overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                      <div>
                        <div className="text-xs font-bold text-gray-700">메시지 편집</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">카카오 알림톡으로 발송됩니다.</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-400">{message.length}자</span>
                        <button
                          onClick={() => { setIsMessageOverridden(false); setMessage(autoMessage); }}
                          disabled={!isMessageOverridden}
                          className={clsx(
                            'flex items-center gap-1 text-[11px] font-medium transition-colors focus:outline-none',
                            isMessageOverridden
                              ? 'text-blue-500 hover:text-blue-700'
                              : 'text-gray-300 cursor-default'
                          )}
                          title="자동 생성 내용으로 초기화"
                        >
                          <RotateCcw className="w-3 h-3" />초기화
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 relative overflow-hidden">
                      <textarea
                        value={message}
                        onChange={e => { setMessage(e.target.value); setIsMessageOverridden(true); }}
                        className="w-full h-full p-4 text-sm leading-[1.7] text-gray-800 resize-none outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder="메시지를 직접 입력하거나 왼쪽 태그를 클릭하세요."
                      />
                    </div>
                    <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-[11px] text-gray-400 flex-shrink-0">
                      메시지를 직접 수정할 수 있습니다. 초기화 버튼을 누르면 자동 생성 내용으로 돌아갑니다.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════ STEP 3 ════ */}
            {currentStep === 3 && (
              <div className="space-y-4 max-w-2xl mx-auto">


                {/* 복약 알림 설정 */}
                <div className="border border-gray-200 rounded-xl p-5 space-y-5">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-500" />
                      복약 알림
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">약을 복용하는 시점에 푸시 알림을 보냅니다.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">복약 횟수</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map(freq => (
                        <button key={freq} onClick={() => setReminder({ ...reminder, frequency: freq, times: FREQUENCY_DEFAULTS[freq].times, relation: FREQUENCY_DEFAULTS[freq].relation })} className={clsx('py-2.5 rounded-lg text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-95', reminder.frequency === freq ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300')}>{freq}회</button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">복약 시간</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['아침', '점심', '저녁', '취침전'].map(time => (
                        <button key={time} onClick={() => setReminder(prev => ({ ...prev, times: prev.times.includes(time) ? prev.times.filter(t => t !== time) : [...prev.times, time] }))} className={clsx('py-2.5 rounded-lg text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-95', reminder.times.includes(time) ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300')}>{time}</button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">복약 시점</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['식전', '식후', '식후 30분'].map(rel => (
                        <button key={rel} onClick={() => setReminder({ ...reminder, relation: rel })} className={clsx('py-2.5 rounded-lg text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-95', reminder.relation === rel ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300')}>{rel}</button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">복약 시작일</label>
                      <button className="w-full flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all text-left focus:outline-none focus:ring-2 focus:ring-blue-300">
                        <CalendarIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />{formatDate(startDate)}
                      </button>
                    </div>
                    <div className="w-[160px] space-y-2 flex-shrink-0">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">복약 기간</label>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setDurationDays(p => Math.max(1, p - 1))} aria-label="줄이기" className="w-9 h-[42px] rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-300"><Minus className="w-3.5 h-3.5" /></button>
                        <div className="flex-1 relative">
                          <input type="number" min={1} max={365} value={durationDays} onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 1 && v <= 365) setDurationDays(v); }} className="w-full text-center py-2.5 text-sm font-medium border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">일</span>
                        </div>
                        <button onClick={() => setDurationDays(p => Math.min(365, p + 1))} aria-label="늘리기" className="w-9 h-[42px] rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-300"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-xs text-blue-700">복약 알림 기본 설정은 약국 설정에서 변경 할 수 있습니다.</span>
                    <button
                      onClick={() => { onOpenSettings?.(); onClose(); }}
                      className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-0.5 ml-auto flex-shrink-0 focus:outline-none"
                    >설정 바로가기 <ChevronRight className="w-3 h-3" /></button>
                  </div>
                </div>

                {/* 재처방 알림 — 복약 알림과 동일한 패널 스타일, 토글만 */}
                <div className="border border-gray-200 rounded-xl p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-blue-500" />
                        재처방 알림
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">약이 떨어지기 3일 전에 내방을 권유하는 푸시 알림을 보냅니다.</p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={refillAlertEnabled}
                      onClick={() => setRefillAlertEnabled(p => !p)}
                      className={clsx('relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 mt-0.5 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1', refillAlertEnabled ? 'bg-blue-600' : 'bg-gray-200')}
                    >
                      <span className={clsx('inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm', refillAlertEnabled ? 'translate-x-6' : 'translate-x-1')} />
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* ════ STEP 4 ════ */}
            {currentStep === 4 && (
              <div className="h-full">
                {isCompleted ? (
                  <div className="flex flex-col items-center justify-center h-full py-10 gap-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-gray-900 mb-1">전송 완료</h2>
                      <p className="text-sm text-gray-400">{prescription.patientName} 님께 복약 안내 메시지가 발송되었습니다.</p>
                    </div>
                    <button onClick={onClose} className="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-lg transition-all text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2">목록으로 돌아가기</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-5 h-full">
                    {/* 좌: 메시지 미리보기 */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500">카카오 알림톡 미리보기</div>
                      <div className="flex-1 overflow-y-auto p-4">
                        <div className="bg-[#FEE500] rounded-2xl rounded-tl-sm p-4 max-w-[280px] shadow-sm">
                          <div className="text-[11px] font-bold text-gray-700 mb-1">웰체크약국</div>
                          <div className="text-[12px] leading-[1.7] text-gray-900 whitespace-pre-wrap">{message}</div>
                        </div>
                      </div>
                    </div>

                    {/* 우: 전송 요약 (이름·번호·앱 가입 여부만) */}
                    <div className="flex flex-col gap-3">
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 text-xs font-bold text-gray-500">전송 요약</div>
                        <div className="divide-y divide-gray-100">
                          <div className="flex items-center justify-between px-4 py-3.5">
                            <span className="text-xs text-gray-400">고객 이름</span>
                            <span className="font-semibold text-sm text-gray-800">{prescription.patientName}</span>
                          </div>
                          <div className="flex items-center justify-between px-4 py-3.5">
                            <span className="text-xs text-gray-400">고객 휴대폰 번호</span>
                            <span className={clsx('font-semibold text-sm', patientPhone ? 'text-gray-800' : 'text-red-400')}>
                              {patientPhone || '번호 미입력'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between px-4 py-3.5">
                            <span className="text-xs text-gray-400">웰체크 앱 가입 여부</span>
                            <span className={clsx('text-xs font-bold px-2.5 py-1 rounded-full', isAppUser ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                              {isAppUser ? '가입' : '미가입'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 비가입자 경고 */}
                      {!isAppUser && (
                        <div className="flex items-start gap-2.5 px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-800 leading-relaxed">
                            웰체크 앱 미가입자인 경우, 복약 알림과 재처방 알림을 받을 수 없습니다.
                          </p>
                        </div>
                      )}


                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── FOOTER ── */}
          {!isCompleted && (
            <div className="px-7 py-4 border-t border-gray-200 flex items-center justify-between bg-white flex-shrink-0">
              <div className="text-xs text-gray-400 font-medium">Step {currentStep} / 4 · {STEP_LABELS[currentStep - 1]}</div>
              <div className="flex gap-2.5 items-center">
                {currentStep > 1 && (
                  <button onClick={prevStep} disabled={isSending} className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-300">← 이전</button>
                )}
                {renderFooterRight()}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
