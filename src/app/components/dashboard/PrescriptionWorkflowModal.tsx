import React, { useState, useEffect, useRef } from 'react';
import {
  X, FileText, Send, Pill, Smartphone, Minus, Plus,
  ChevronRight, AlertCircle, Calendar as CalendarIcon,
  Settings, Loader2, CheckCircle, Pencil, Trash2, Check,
  Bell, MessageSquare
} from 'lucide-react';
import { clsx } from 'clsx';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import type { Prescription } from './PrescriptionDetailModal';

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
  dosage: string;
  frequency: string;
  days: number;
}

// ── Constants ──────────────────────────────────────────────────────────

const FREQUENCY_DEFAULTS: Record<number, { times: string[]; relation: string }> = {
  1: { times: ['아침'], relation: '식후 30분' },
  2: { times: ['아침', '저녁'], relation: '식후 30분' },
  3: { times: ['아침', '점심', '저녁'], relation: '식후 30분' },
};

const INITIAL_DRUGS: DrugItem[] = [
  { id: '1', name: '메트포르민 500mg', category: '혈당강하제', dosage: '1회 1정', frequency: '하루 3회', days: 30 },
  { id: '2', name: '글리메피리드 2mg', category: '인슐린 분비 촉진제', dosage: '1회 1정', frequency: '하루 1회', days: 30 },
  { id: '3', name: '로수바스타틴 10mg', category: '고지혈증약', dosage: '1회 1정', frequency: '하루 1회', days: 30 },
  { id: '4', name: '오메프라졸 20mg', category: '위장보호제', dosage: '1회 1정', frequency: '하루 1회', days: 30 },
];

const OCR_SMART_TAGS: string[] = [
  '식후 30분에 복용하세요.',
  '식사를 거르지 마세요.',
  '정기적으로 혈당을 체크하세요.',
  '아침 식전에 복용하세요.',
  '저혈당 증상 시 사탕이나 주스를 드세요.',
  '근육통이 생기면 즉시 내원하세요.',
  '꾸준히 복용하는 것이 중요합니다.',
  '식전 30분에 복용하세요.',
];

const COMMON_TAGS: string[] = [
  '공복에 복용하세요.',
  '충분한 물과 함께 드세요.',
  '잠이 올 수 있으니 주의하세요.',
  '술을 드시지 마세요.',
  '씹지 말고 삼켜서 드세요.',
  '냉장 보관하세요.',
  '햇빛을 피해 서늘한 곳에 보관하세요.',
  '임의로 복용을 중단하지 마세요.',
];

const STEP_LABELS = ['처방전 확인', '복약 상담 메시지', '복약 알림', '메시지 전송'];

// ── Mock: DB 조회 결과 (앱 가입 여부)
// 실제 환경에서는 prescription.phone 등으로 DB 조회
const MOCK_IS_APP_USER = false; // false = 비가입자

// ── Props ───────────────────────────────────────────────────────────────

interface PrescriptionWorkflowModalProps {
  prescription: Prescription;
  onClose: () => void;
  onComplete?: () => void;
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

// ═══════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════

export const PrescriptionWorkflowModal: React.FC<PrescriptionWorkflowModalProps> = ({
  prescription,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Step 1: Drug list (editable)
  const [drugs, setDrugs] = useState<DrugItem[]>(INITIAL_DRUGS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<DrugItem | null>(null);

  // ── Step 2: Message & tags & phone
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [patientPhone, setPatientPhone] = useState(prescription.phone || '');
  const [phoneError, setPhoneError] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const phoneRef = useRef<HTMLInputElement>(null);

  // ── Step 3: Reminder
  const [reminder, setReminder] = useState<ReminderSettings>({
    frequency: 3,
    times: FREQUENCY_DEFAULTS[3].times,
    relation: FREQUENCY_DEFAULTS[3].relation,
  });
  const [startDate] = useState(new Date());
  const [durationDays, setDurationDays] = useState(30);
  const [refillAlerts, setRefillAlerts] = useState<string[]>(['7일 전', '3일 전']);

  // DB 조회 기반 앱 가입 여부 (Mock)
  const isAppUser = MOCK_IS_APP_USER;

  // ── Auto-generate message
  const generatedMessage = React.useMemo(() => {
    const pharmacyName = '웰체크약국';
    const medList = drugs.map((d, i) => `${i + 1}. ${d.name} (${d.category})`).join('\n');
    const usage = `하루 ${reminder.frequency}번, ${reminder.times.join(', ')} ${reminder.relation}에 복약하세요.`;
    const tagLines = selectedTags.length > 0 ? `\n\n[주의사항]\n${selectedTags.map(t => `· ${t}`).join('\n')}` : '';
    const custom = customMessage.trim() ? `\n\n${customMessage.trim()}` : '';
    return `[복약 상담 안내]\n안녕하세요, ${pharmacyName}입니다.\n처방받으신 약품을 안내드립니다.\n\n[처방 약품]\n${medList}\n\n[복약 방법]\n${usage}${tagLines}${custom}\n\n문의사항은 약국으로 연락주세요.`;
  }, [drugs, reminder, selectedTags, customMessage]);

  // ── Auto focus phone on step 2
  useEffect(() => {
    if (currentStep === 2) {
      setTimeout(() => phoneRef.current?.focus(), 100);
    }
  }, [currentStep]);

  // ── Toast helper
  const showToast = (message: string, type: 'success' | 'error') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  // ── Phone validation
  const validatePhone = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '');
    if (!raw) return '핸드폰 번호를 입력해 주세요.';
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = formatPhone(e.target.value);
    setPatientPhone(val);
    if (phoneTouched) setPhoneError(validatePhone(val));
  };

  const handlePhoneBlur = () => {
    setPhoneTouched(true);
    setPhoneError(validatePhone(patientPhone));
  };

  // ── Drug edit handlers
  const startEdit = (drug: DrugItem) => {
    setEditingId(drug.id);
    setEditingDraft({ ...drug });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingDraft(null);
  };
  const saveEdit = () => {
    if (!editingDraft) return;
    setDrugs(prev => prev.map(d => d.id === editingDraft.id ? editingDraft : d));
    setEditingId(null);
    setEditingDraft(null);
  };
  const deleteDrug = (id: string) => {
    setDrugs(prev => prev.filter(d => d.id !== id));
  };
  const addDrug = () => {
    const newDrug: DrugItem = {
      id: Date.now().toString(),
      name: '',
      category: '',
      dosage: '1회 1정',
      frequency: '하루 1회',
      days: 30,
    };
    setDrugs(prev => [...prev, newDrug]);
    startEdit(newDrug);
  };

  // ── Tag toggle
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  // ── Navigation
  const goStep = (n: number) => setCurrentStep(n);
  const nextStep = () => { if (currentStep < 4) goStep(currentStep + 1); };
  const prevStep = () => { if (currentStep > 1) goStep(currentStep - 1); };

  const canGoNext = () => {
    if (currentStep === 2) return isPhoneValid;
    return true;
  };

  // ── Send
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isSending) return;
    setIsSending(true);
    try {
      await new Promise(res => setTimeout(res, 1500));
      setIsCompleted(true);
      onComplete?.();
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

  // ── Footer button logic
  const renderFooterRight = () => {
    if (isCompleted) return null;

    if (currentStep === 4) {
      return (
        <button
          onClick={handleSend}
          disabled={isSending}
          className={clsx(
            'px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1',
            !isSending
              ? 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-sm'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
        >
          {isSending ? (
            <><Loader2 className="w-4 h-4 animate-spin" />전송 중...</>
          ) : (
            <><Send className="w-4 h-4" />메시지 전송하기</>
          )}
        </button>
      );
    }

    return (
      <button
        onClick={nextStep}
        disabled={!canGoNext()}
        className={clsx(
          'px-5 py-2 rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1',
          canGoNext()
            ? 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-sm'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        )}
      >
        다음 단계 →
      </button>
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
              <button
                onClick={onClose}
                aria-label="닫기"
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 active:scale-90 transition-all focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <X size={16} />
              </button>
            </div>

            {/* Step Bar */}
            <div className="flex">
              {STEP_LABELS.map((label, i) => {
                const step = i + 1;
                const isActive = step === currentStep;
                const isDone = step < currentStep || isCompleted;
                return (
                  <button
                    key={step}
                    onClick={() => !isCompleted && goStep(step)}
                    className={clsx(
                      'flex-1 py-2.5 text-center text-xs font-semibold border-b-[3px] transition-all focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-200',
                      isActive && 'text-blue-600 border-blue-600',
                      isDone && !isActive && 'text-emerald-600 border-emerald-500',
                      !isActive && !isDone && 'text-gray-400 border-transparent'
                    )}
                  >
                    <span className={clsx(
                      'inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] mr-1.5 transition-all',
                      isActive && 'bg-blue-600 text-white',
                      isDone && !isActive && 'bg-emerald-500 text-white',
                      !isActive && !isDone && 'bg-gray-200 text-gray-400'
                    )}>
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

            {/* ════ STEP 1: 처방전 확인 ════ */}
            {currentStep === 1 && (
              <div className="grid grid-cols-2 gap-5 h-full">
                {/* Left: 처방전 원본 */}
                <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col bg-gray-50 min-h-[420px]">
                  <div className="px-4 py-3 border-b border-gray-200 bg-white text-xs font-bold text-gray-500 uppercase tracking-wider">
                    처방전 원본
                  </div>
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

                {/* Right: 조제 내역 (편집 가능) */}
                <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col min-h-[420px]">
                  <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">조제 내역</span>
                    <span className="text-[11px] text-blue-500 font-medium">대체 조제 시 직접 수정하세요</span>
                  </div>

                  {/* 안내 문구 */}
                  <div className="mx-3 mt-3 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 leading-relaxed">
                    처방전과 다르게 대체 조제한 경우 아래 목록을 수정하거나 삭제할 수 있습니다.
                  </div>

                  <div className="flex-1 p-3 overflow-y-auto space-y-1">
                    {drugs.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-300">
                        <Pill size={32} className="opacity-40" />
                        <p className="text-sm text-gray-400">조제 약품이 없습니다.</p>
                      </div>
                    )}
                    {drugs.map((drug, idx) => (
                      <div key={drug.id} className="border border-gray-100 rounded-lg overflow-hidden">
                        {editingId === drug.id && editingDraft ? (
                          /* 편집 모드 */
                          <div className="p-3 bg-blue-50 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-gray-500 font-semibold mb-1 block">약품명</label>
                                <input
                                  autoFocus
                                  value={editingDraft.name}
                                  onChange={e => setEditingDraft({ ...editingDraft, name: e.target.value })}
                                  className="w-full text-xs px-2 py-1.5 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                                  placeholder="약품명"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-gray-500 font-semibold mb-1 block">분류</label>
                                <input
                                  value={editingDraft.category}
                                  onChange={e => setEditingDraft({ ...editingDraft, category: e.target.value })}
                                  className="w-full text-xs px-2 py-1.5 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                                  placeholder="약품 분류"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-gray-500 font-semibold mb-1 block">용량</label>
                                <input
                                  value={editingDraft.dosage}
                                  onChange={e => setEditingDraft({ ...editingDraft, dosage: e.target.value })}
                                  className="w-full text-xs px-2 py-1.5 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                                  placeholder="1회 1정"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-gray-500 font-semibold mb-1 block">횟수</label>
                                <input
                                  value={editingDraft.frequency}
                                  onChange={e => setEditingDraft({ ...editingDraft, frequency: e.target.value })}
                                  className="w-full text-xs px-2 py-1.5 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                                  placeholder="하루 1회"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-[10px] text-gray-500 font-semibold">조제일수</label>
                              <input
                                type="number"
                                min={1} max={365}
                                value={editingDraft.days}
                                onChange={e => setEditingDraft({ ...editingDraft, days: parseInt(e.target.value) || 1 })}
                                className="w-16 text-xs px-2 py-1.5 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-center"
                              />
                              <span className="text-xs text-gray-500">일</span>
                              <div className="ml-auto flex gap-1.5">
                                <button onClick={cancelEdit} className="px-3 py-1.5 text-xs border border-gray-200 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300">취소</button>
                                <button onClick={saveEdit} className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-300">
                                  <Check className="w-3 h-3" />저장
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* 읽기 모드 */
                          <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 group transition-colors">
                            <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                              {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-semibold text-gray-900 truncate">{drug.name || '(약품명 없음)'}</div>
                              <div className="text-[11px] text-gray-400 mt-0.5">{drug.category} · {drug.dosage}, {drug.frequency}</div>
                            </div>
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[11px] font-bold flex-shrink-0">
                              {drug.days}일분
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => startEdit(drug)} className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors focus:outline-none" aria-label="수정">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => deleteDrug(drug.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors focus:outline-none" aria-label="삭제">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="px-3 pb-3">
                    <button
                      onClick={addDrug}
                      className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      + 약품 추가
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ════ STEP 2: 복약 상담 메시지 ════ */}
            {currentStep === 2 && (
              <div className="flex flex-col gap-4 h-full">
                {/* 전화번호 + 전송 채널 안내 */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-4 flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span className="text-xs text-amber-800 font-medium flex-1">카카오 알림톡으로 발송됩니다. 웰체크 앱 가입 여부와 관계없이 전송됩니다.</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <label htmlFor="step2-phone" className="text-xs text-gray-500 whitespace-nowrap">환자 번호</label>
                    <div className="relative">
                      <input
                        id="step2-phone"
                        ref={phoneRef}
                        type="tel"
                        inputMode="numeric"
                        value={patientPhone}
                        maxLength={13}
                        onChange={handlePhoneChange}
                        onBlur={handlePhoneBlur}
                        placeholder="010-0000-0000"
                        className={clsx(
                          'w-[148px] px-3 py-1.5 border rounded-lg text-xs font-mono outline-none transition-all focus:ring-2',
                          phoneTouched && phoneError
                            ? 'border-red-400 focus:ring-red-100 bg-red-50'
                            : isPhoneValid && patientPhone
                            ? 'border-emerald-400 focus:ring-emerald-100'
                            : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'
                        )}
                      />
                    </div>
                    {phoneTouched && phoneError && (
                      <span className="text-[11px] text-red-500 whitespace-nowrap">{phoneError}</span>
                    )}
                    {isPhoneValid && patientPhone && (
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    )}
                  </div>
                </div>

                {/* 2열 레이아웃: 태그 선택 | 메시지 미리보기 */}
                <div className="grid grid-cols-[1fr_1fr] gap-4 flex-1 min-h-0">
                  {/* 좌측: 태그 선택 */}
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
                            <button
                              key={tag}
                              onClick={() => toggleTag(tag)}
                              className={clsx(
                                'w-full text-left px-3 py-2 rounded-lg text-xs transition-all border focus:outline-none focus:ring-2 focus:ring-blue-200 active:scale-[0.98]',
                                selectedTags.includes(tag)
                                  ? 'bg-blue-600 text-white border-blue-600 font-medium'
                                  : 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700'
                              )}
                            >
                              {selectedTags.includes(tag) ? `✓ ${tag}` : tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* OCR 분석 기반 맞춤 태그 */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">OCR 분석 기반 맞춤 태그</div>
                          <span className="text-[10px] text-gray-400">— 처방 약물 기반 추천</span>
                        </div>
                        <div className="space-y-1.5">
                          {OCR_SMART_TAGS.map(tag => (
                            <button
                              key={tag}
                              onClick={() => toggleTag(tag)}
                              className={clsx(
                                'w-full text-left px-3 py-2 rounded-lg text-xs transition-all border focus:outline-none focus:ring-2 focus:ring-blue-200 active:scale-[0.98]',
                                selectedTags.includes(tag)
                                  ? 'bg-blue-600 text-white border-blue-600 font-medium'
                                  : 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700'
                              )}
                            >
                              {selectedTags.includes(tag) ? `✓ ${tag}` : tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 우측: 메시지 미리보기 */}
                  <div className="border border-gray-200 rounded-xl flex flex-col overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                      <span className="text-xs font-bold text-gray-700">카카오 알림톡 미리보기</span>
                      <span className="text-[11px] text-gray-400">{generatedMessage.length}자</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                      {/* 카카오 말풍선 스타일 */}
                      <div className="bg-[#FEE500] rounded-2xl rounded-tl-sm p-4 max-w-[280px] shadow-sm">
                        <div className="text-[11px] font-bold text-gray-700 mb-1">웰체크약국</div>
                        <div className="text-[12px] leading-[1.7] text-gray-900 whitespace-pre-wrap">{generatedMessage}</div>
                      </div>
                    </div>
                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex-shrink-0">
                      <textarea
                        value={customMessage}
                        onChange={e => setCustomMessage(e.target.value)}
                        placeholder="메시지에 추가할 내용을 직접 입력하세요. (선택)"
                        className="w-full text-xs p-2 border border-gray-200 rounded-lg resize-none outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all min-h-[60px] bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════ STEP 3: 복약 알림 ════ */}
            {currentStep === 3 && (
              <div className="space-y-4 max-w-2xl mx-auto">
                {/* 앱 가입 여부 뱃지 (DB 조회 결과) */}
                <div className={clsx(
                  'rounded-xl px-4 py-3.5 border flex items-start gap-3',
                  isAppUser
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-amber-50 border-amber-200'
                )}>
                  <Smartphone className={clsx('w-4 h-4 mt-0.5 flex-shrink-0', isAppUser ? 'text-emerald-500' : 'text-amber-500')} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={clsx(
                        'text-[11px] font-bold px-2 py-0.5 rounded-full',
                        isAppUser
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      )}>
                        {isAppUser ? '웰체크 앱 가입자' : '앱 미가입 · 카카오 알림톡 3일 발송'}
                      </span>
                      <span className="text-[10px] text-gray-400">DB 조회 결과</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {isAppUser
                        ? '환자가 웰체크 앱에서 확인 버튼을 누르면 설정한 시간마다 푸시 알림을 받습니다.'
                        : '앱 미가입자에게는 카카오 알림톡으로 3일간 맛보기 알림이 발송됩니다. 앱 가입을 유도하면 이후 푸시 알림으로 전환됩니다.'}
                    </p>
                  </div>
                </div>

                {/* 복약 알림 설정 */}
                <div className="border border-gray-200 rounded-xl p-5 space-y-5">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-500" />
                    복약 알림 설정
                  </h3>

                  {/* 횟수 */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">복약 횟수</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map(freq => (
                        <button
                          key={freq}
                          onClick={() => setReminder({ ...reminder, frequency: freq, times: FREQUENCY_DEFAULTS[freq].times, relation: FREQUENCY_DEFAULTS[freq].relation })}
                          className={clsx(
                            'py-2.5 rounded-lg text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-95',
                            reminder.frequency === freq
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                          )}
                        >{freq}회</button>
                      ))}
                    </div>
                  </div>

                  {/* 시간 */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">복약 시간</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['아침', '점심', '저녁', '취침전'].map(time => (
                        <button
                          key={time}
                          onClick={() => setReminder(prev => ({
                            ...prev,
                            times: prev.times.includes(time) ? prev.times.filter(t => t !== time) : [...prev.times, time]
                          }))}
                          className={clsx(
                            'py-2.5 rounded-lg text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-95',
                            reminder.times.includes(time)
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                          )}
                        >{time}</button>
                      ))}
                    </div>
                  </div>

                  {/* 시점 */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">복약 시점</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['식전', '식후', '식후 30분'].map(rel => (
                        <button
                          key={rel}
                          onClick={() => setReminder({ ...reminder, relation: rel })}
                          className={clsx(
                            'py-2.5 rounded-lg text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-95',
                            reminder.relation === rel
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                          )}
                        >{rel}</button>
                      ))}
                    </div>
                  </div>

                  {/* 시작일 & 기간 */}
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">복약 시작일</label>
                      <button className="w-full flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all text-left focus:outline-none focus:ring-2 focus:ring-blue-300">
                        <CalendarIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        {formatDate(startDate)}
                      </button>
                    </div>
                    <div className="w-[160px] space-y-2 flex-shrink-0">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">복약 기간</label>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setDurationDays(p => Math.max(1, p - 1))} aria-label="줄이기" className="w-9 h-[42px] rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-300">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex-1 relative">
                          <input
                            type="number" min={1} max={365} value={durationDays}
                            onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 1 && v <= 365) setDurationDays(v); }}
                            className="w-full text-center py-2.5 text-sm font-medium border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">일</span>
                        </div>
                        <button onClick={() => setDurationDays(p => Math.min(365, p + 1))} aria-label="늘리기" className="w-9 h-[42px] rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-300">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 리필 알림 */}
                <div className="border border-gray-200 rounded-xl p-5">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">리필(재처방) 알림</h3>
                  <p className="text-xs text-gray-400 mb-4">약이 다 떨어지기 전에 자동으로 알림을 보냅니다.</p>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm text-gray-500 min-w-[80px]">조제일수</span>
                    <input type="number" value={durationDays} readOnly className="w-20 text-center py-2 border border-gray-200 rounded-lg text-sm font-medium bg-gray-50 text-gray-400 cursor-not-allowed outline-none" />
                    <span className="text-sm text-gray-500">일분</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 min-w-[80px]">알림 시점</span>
                    <div className="flex gap-2">
                      {['7일 전', '3일 전', '당일'].map(alert => (
                        <button
                          key={alert}
                          onClick={() => setRefillAlerts(p => p.includes(alert) ? p.filter(a => a !== alert) : [...p, alert])}
                          className={clsx(
                            'flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-95',
                            refillAlerts.includes(alert)
                              ? 'border-blue-500 bg-blue-50 text-blue-600'
                              : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                          )}
                        >
                          <div className={clsx('w-2 h-2 rounded-full', refillAlerts.includes(alert) ? 'bg-blue-500' : 'bg-gray-300')} />
                          {alert}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="text-xs text-blue-700">복약 알림 기본 설정은 환경설정에서 변경할 수 있습니다.</span>
                  <button className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-0.5 ml-auto flex-shrink-0 focus:outline-none">
                    설정 바로가기 <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* ════ STEP 4: 메시지 전송 ════ */}
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
                    <button onClick={onClose} className="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-lg transition-all text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2">
                      목록으로 돌아가기
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-5 h-full">
                    {/* 좌: 메시지 미리보기 */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500">카카오 알림톡 미리보기</div>
                      <div className="flex-1 overflow-y-auto p-4">
                        <div className="bg-[#FEE500] rounded-2xl rounded-tl-sm p-4 max-w-[280px] shadow-sm">
                          <div className="text-[11px] font-bold text-gray-700 mb-1">웰체크약국</div>
                          <div className="text-[12px] leading-[1.7] text-gray-900 whitespace-pre-wrap">{generatedMessage}</div>
                        </div>
                      </div>
                    </div>

                    {/* 우: 전송 요약 */}
                    <div className="flex flex-col gap-3">
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 text-xs font-bold text-gray-500">전송 요약</div>
                        {[
                          { key: '수신자', value: `${prescription.patientName} (${patientPhone || '번호 미입력'})`, warn: !patientPhone },
                          { key: '조제약', value: `${drugs.map(d => d.category).filter(Boolean).join(', ')} · ${drugs[0]?.days ?? 0}일분`, warn: false },
                          { key: '복약 알림', value: `${reminder.times.join(', ')} (${reminder.relation})`, warn: false },
                          { key: '리필 알림', value: refillAlerts.length > 0 ? `${refillAlerts.join(', ')} 자동발송` : '설정 안됨', warn: false },
                          { key: '전송 채널', value: isAppUser ? '웰체크 앱 + 카카오 알림톡' : '카카오 알림톡 (알림 3일 맛보기)', warn: false },
                        ].map(({ key, value, warn }, i, arr) => (
                          <div key={key} className={clsx('flex items-center justify-between px-4 py-3 text-sm', i < arr.length - 1 && 'border-b border-gray-100')}>
                            <span className="text-gray-400 text-xs">{key}</span>
                            <span className={clsx('font-semibold text-right text-sm max-w-[220px] truncate', warn ? 'text-red-400' : 'text-gray-800')}>{value}</span>
                          </div>
                        ))}
                      </div>

                      {!patientPhone && (
                        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>환자 번호가 입력되지 않았습니다.</span>
                          <button type="button" onClick={() => goStep(2)} className="ml-auto font-bold hover:underline whitespace-nowrap focus:outline-none">
                            2단계로 이동 →
                          </button>
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
              <div className="text-xs text-gray-400 font-medium">
                Step {currentStep} / 4 · {STEP_LABELS[currentStep - 1]}
              </div>
              <div className="flex gap-2.5 items-center">
                {currentStep > 1 && (
                  <button
                    onClick={prevStep}
                    disabled={isSending}
                    className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    ← 이전
                  </button>
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
