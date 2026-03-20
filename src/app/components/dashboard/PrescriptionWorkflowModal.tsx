import React, { useState, useEffect } from 'react';
import {
  X, FileText, CheckCircle, Bell, Clock, Send, Pill, Info, Smartphone, Minus, Plus, ChevronRight, AlertCircle, Calendar as CalendarIcon, Settings
} from 'lucide-react';
import { clsx } from 'clsx';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import type { Prescription } from './PrescriptionDetailModal';

// ── Types & Constants ──────────────────────────────────────────────────

interface ReminderSettings {
  frequency: number;
  times: string[];
  relation: string;
}

const FREQUENCY_DEFAULTS: Record<number, { times: string[]; relation: string }> = {
  1: { times: ['아침'], relation: '식후 30분' },
  2: { times: ['아침', '저녁'], relation: '식후 30분' },
  3: { times: ['아침', '점심', '저녁'], relation: '식후 30분' },
};

// ── Mock OCR Data ──────────────────────────────────────────────────────
interface OcrDrug {
  name: string;
  category: string;
  dosage: string;
  frequency: string;
  days: number;
  emoji: string;
  smartTags?: string[];
}

const MOCK_OCR_RESULTS: Record<string, { hospitalName: string; doctorName: string; prescriptionDate: string; drugs: OcrDrug[] }> = {
  default: {
    hospitalName: '연세내과의원',
    doctorName: '이재훈',
    prescriptionDate: '2026.03.20',
    drugs: [
      { name: '메트포르민 500mg', category: '혈당강하제', dosage: '1회 1정', frequency: '하루 3회', days: 30, emoji: '💉', smartTags: ['식후 30분 복약하세요', '식사를 거르지 마세요', '정기 혈당 체크 권장'] },
      { name: '글리메피리드 2mg', category: '인슐린 분비 촉진제', dosage: '1회 1정', frequency: '하루 1회', days: 30, emoji: '🩸', smartTags: ['아침 식전 복용', '저혈당 증상 시 사탕/주스 섭취'] },
      { name: '로수바스타틴 10mg', category: '고지혈증약', dosage: '1회 1정', frequency: '하루 1회', days: 30, emoji: '❤️', smartTags: ['근육통 시 즉시 내원', '꾸준히 복용 필요'] },
      { name: '오메프라졸 20mg', category: '위장보호제', dosage: '1회 1정', frequency: '하루 1회', days: 30, emoji: '💊', smartTags: ['식전 30분 복용'] },
    ],
  },
};

// ── Step Labels ─────────────────────────────────────────────────────────
const STEP_LABELS = ['처방전 확인', '복약 상담 메시지', '복약 알림', '메시지 전송'];

// ── Props ───────────────────────────────────────────────────────────────
interface PrescriptionWorkflowModalProps {
  prescription: Prescription;
  onClose: () => void;
  onComplete?: () => void;
}

// ═══════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════
export const PrescriptionWorkflowModal: React.FC<PrescriptionWorkflowModalProps> = ({
  prescription,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  // Step 2 state
  const [message, setMessage] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Step 3 state
  const [reminder, setReminder] = useState<ReminderSettings>({
    frequency: 3,
    times: FREQUENCY_DEFAULTS[3].times,
    relation: FREQUENCY_DEFAULTS[3].relation,
  });
  const [startDate] = useState(new Date());
  const [durationDays, setDurationDays] = useState(30);
  const [patientPhone, setPatientPhone] = useState(prescription.phone || '');
  const [sendAppReminder, setSendAppReminder] = useState(false);
  const [refillAlerts, setRefillAlerts] = useState<string[]>(['7일 전', '3일 전']);

  // OCR data
  const ocrData = MOCK_OCR_RESULTS.default;
  const allSmartTags = Array.from(new Set(ocrData.drugs.flatMap(d => d.smartTags || [])));

  // ── Auto-generate message ──
  useEffect(() => {
    const pharmacyName = '웰체크약국';
    const medList = ocrData.drugs.map((d, i) => `${i + 1}. ${d.name} (${d.category})`).join('\n');
    const usage = `하루 ${reminder.frequency}번, ${reminder.times.join(', ')} ${reminder.relation}에 복약하세요.`;
    const tagLines = selectedTags.length > 0 ? `\n[주의사항]\n${selectedTags.map(t => `- ${t}`).join('\n')}` : '';

    const newMsg = `[복약 상담 안내]\n안녕하세요, ${pharmacyName}입니다.\n처방받으신 약품 안내드립니다.\n\n[처방 약품]\n${medList}\n\n[복약 알림 설정]\n${usage}${tagLines}\n\n문의사항은 약국으로 연락주세요.`;
    setMessage(newMsg);
  }, [selectedTags, reminder, ocrData.drugs]);

  // ── Handlers ──
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleTime = (time: string) => {
    setReminder(prev => ({
      ...prev,
      times: prev.times.includes(time) ? prev.times.filter(t => t !== time) : [...prev.times, time],
    }));
  };

  const toggleRefillAlert = (alert: string) => {
    setRefillAlerts(prev =>
      prev.includes(alert) ? prev.filter(a => a !== alert) : [...prev, alert]
    );
  };

  const goStep = (n: number) => setCurrentStep(n);
  const nextStep = () => {
    if (currentStep < 4) goStep(currentStep + 1);
    else handleSend();
  };
  const prevStep = () => { if (currentStep > 1) goStep(currentStep - 1); };

  const handleSend = () => {
    setIsCompleted(true);
    onComplete?.();
  };

  const formatDate = (d: Date) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} (${days[d.getDay()]})`;
  };

  const formatPhoneInput = (value: string) => {
    const raw = value.replace(/[^0-9]/g, '');
    if (raw.length > 7) return `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
    if (raw.length > 3) return `${raw.slice(0, 3)}-${raw.slice(3)}`;
    return raw;
  };

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-5" style={{ backdropFilter: 'blur(2px)' }}>
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[980px] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* ── MODAL HEADER ── */}
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
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors">
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
                    'flex-1 py-2.5 text-center text-xs font-semibold border-b-[3px] transition-all',
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

        {/* ── MODAL BODY ── */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ════════════ STEP 1: 처방전 확인 ════════════ */}
          {currentStep === 1 && (
            <div className="grid grid-cols-2 gap-5 h-full">
              {/* Left: Prescription Image */}
              <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col bg-gray-50 min-h-[420px]">
                <div className="px-4 py-3 border-b border-gray-200 bg-white text-xs font-bold text-gray-500 uppercase tracking-wider">
                  📋 처방전 원본
                </div>
                <div className="flex-1 p-4 flex items-start justify-center overflow-auto">
                  {prescription.imageUrl ? (
                    <ImageWithFallback src={prescription.imageUrl} alt="처방전" className="max-w-full rounded-lg shadow-md" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-300 py-16">
                      <FileText size={48} className="mb-2 opacity-40" />
                      <p className="text-sm">처방전 이미지 없음</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: OCR Parsed Result */}
              <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col min-h-[420px]">
                <div className="px-4 py-3 border-b border-gray-200 bg-white text-xs font-bold text-gray-500 uppercase tracking-wider">
                  💊 조제 내역 요약 <span className="text-blue-500 ml-1">(OCR)</span>
                </div>
                <div className="flex-1 p-3 overflow-y-auto space-y-1">
                  {ocrData.drugs.map((drug, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 border-b border-gray-100 last:border-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-sm flex-shrink-0">
                        {drug.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-gray-900">{drug.name}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {drug.category} · {drug.dosage}, {drug.frequency}
                        </div>
                      </div>
                      <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[11px] font-bold flex-shrink-0">
                        {drug.days}일분
                      </span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
                  ✅ AI 자동 분석 완료 · <strong>{ocrData.drugs.map(d => d.category).join(', ')}</strong> {ocrData.drugs[0]?.days}일분
                </div>
              </div>
            </div>
          )}

          {/* ════════════ STEP 2: 복약 상담 메시지 ════════════ */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-4 max-w-3xl mx-auto">
              {/* Smart Tags from MedicationConsultationC pattern */}
              <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col bg-white">
                <div className="p-3 bg-gray-50 border-b border-gray-100 flex flex-col gap-3">
                  {ocrData.drugs.length > 0 ? (
                    <>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
                          <Pill className="w-3 h-3" />
                          스마트 태그
                        </span>
                        <span className="text-[10px] text-gray-400">— OCR 분석 약물 기반 추천</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {allSmartTags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={clsx(
                              'px-3 py-1.5 text-xs rounded-full transition-colors font-semibold border shadow-sm',
                              selectedTags.includes(tag)
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 border-blue-200 hover:border-blue-300'
                            )}
                          >
                            {selectedTags.includes(tag) ? `✓ ${tag}` : `+ ${tag}`}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 py-4 justify-center text-gray-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">약물을 불러오지 못했습니다.</span>
                    </div>
                  )}
                </div>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full p-5 bg-transparent resize-none outline-none text-sm leading-relaxed text-gray-800 placeholder:text-gray-300 min-h-[280px]"
                  placeholder="약품을 추가하면 상담 내용이 자동으로 작성됩니다."
                />
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                  <div className="text-xs text-gray-400 text-right">{message.length}자 작성됨</div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════ STEP 3: 복약 알림 ════════════ */}
          {currentStep === 3 && (
            <div className="space-y-4 max-w-2xl mx-auto">
              {/* 환자 연락처 */}
              <div className="border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <Smartphone className="w-4 h-4 text-blue-500" />
                  환자 연락처
                </h3>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-500 min-w-[90px]">핸드폰 번호</label>
                  <input
                    type="tel"
                    value={patientPhone}
                    maxLength={13}
                    onChange={e => setPatientPhone(formatPhoneInput(e.target.value))}
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all font-mono"
                    placeholder="010-0000-0000"
                  />
                  <span className="text-xs text-emerald-600">✓ 문자 발송에 사용됩니다</span>
                </div>
              </div>

              {/* 복약 알림 설정 (from MedicationConsultationC) */}
              <div className="border border-gray-200 rounded-xl p-5 space-y-5">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-500" />
                  복약 알림 설정
                </h3>

                {/* Frequency */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">복약 횟수</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map(freq => (
                      <button
                        key={freq}
                        onClick={() => setReminder({
                          ...reminder,
                          frequency: freq,
                          times: FREQUENCY_DEFAULTS[freq].times,
                          relation: FREQUENCY_DEFAULTS[freq].relation,
                        })}
                        className={clsx(
                          'py-2.5 rounded-lg text-sm font-medium border transition-all',
                          reminder.frequency === freq
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-1 ring-blue-600/20'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        )}
                      >
                        {freq}회
                      </button>
                    ))}
                  </div>
                </div>

                {/* Times */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">복약 시간</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['아침', '점심', '저녁', '취침전'].map(time => (
                      <button
                        key={time}
                        onClick={() => toggleTime(time)}
                        className={clsx(
                          'py-2.5 rounded-lg text-sm font-medium border transition-all',
                          reminder.times.includes(time)
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-1 ring-blue-600/20'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Relation */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">복약 시점</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['식전', '식후', '식후 30분'].map(rel => (
                      <button
                        key={rel}
                        onClick={() => setReminder({ ...reminder, relation: rel })}
                        className={clsx(
                          'py-2.5 rounded-lg text-sm font-medium border transition-all',
                          reminder.relation === rel
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-1 ring-blue-600/20'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        )}
                      >
                        {rel}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start Date & Duration */}
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">복약 시작일</label>
                    <button className="w-full flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all text-left">
                      <CalendarIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      {formatDate(startDate)}
                    </button>
                  </div>
                  <div className="w-[160px] space-y-2 flex-shrink-0">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">복약 기간</label>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setDurationDays(prev => Math.max(1, prev - 1))}
                        className="w-9 h-[42px] rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-all text-gray-600"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex-1 relative">
                        <input
                          type="number"
                          min={1} max={365}
                          value={durationDays}
                          onChange={e => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val >= 1 && val <= 365) setDurationDays(val);
                          }}
                          className="w-full text-center py-2.5 text-sm font-medium border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">일</span>
                      </div>
                      <button
                        onClick={() => setDurationDays(prev => Math.min(365, prev + 1))}
                        className="w-9 h-[42px] rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-all text-gray-600"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* App Reminder Toggle */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-blue-500" />
                      웰체크 앱으로 설정 전송
                    </label>
                    <div
                      className={clsx(
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer',
                        sendAppReminder ? 'bg-blue-600' : 'bg-gray-200'
                      )}
                      onClick={() => setSendAppReminder(!sendAppReminder)}
                    >
                      <span className={clsx(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        sendAppReminder ? 'translate-x-6' : 'translate-x-1'
                      )} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    웰체크 앱 가입자인 경우 복약 알림 설정 값을 전송합니다.
                  </p>
                </div>
              </div>

              {/* 리필(재처방) 알림 */}
              <div className="border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
                  🔔 리필(재처방) 알림
                </h3>
                <p className="text-xs text-gray-400 mb-4">약이 다 떨어지기 전에 자동으로 알림을 보냅니다.</p>

                <div className="flex items-center gap-3 mb-4">
                  <label className="text-sm text-gray-500 min-w-[80px]">조제일수</label>
                  <input
                    type="number"
                    value={durationDays}
                    className="w-20 text-center py-2 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:border-blue-400"
                    readOnly
                  />
                  <span className="text-sm text-gray-500">일분</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-500 min-w-[80px]">알림 시점</label>
                  <div className="flex gap-2">
                    {['7일 전', '3일 전', '당일'].map(alert => (
                      <button
                        key={alert}
                        onClick={() => toggleRefillAlert(alert)}
                        className={clsx(
                          'flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all',
                          refillAlerts.includes(alert)
                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                        )}
                      >
                        <div className={clsx(
                          'w-2 h-2 rounded-full transition-colors',
                          refillAlerts.includes(alert) ? 'bg-blue-500' : 'bg-gray-300'
                        )} />
                        {alert}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 기본 설정 링크 */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="text-xs text-blue-700">
                  복약 알림 기본 설정은 여기서 수정할 수 있습니다.
                </span>
                <button className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-0.5 ml-auto flex-shrink-0">
                  기본 설정으로 이동 <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* ════════════ STEP 4: 메시지 전송 ════════════ */}
          {currentStep === 4 && (
            <div className="max-w-[560px] mx-auto">
              {isCompleted ? (
                /* Success Screen */
                <div className="text-center py-10">
                  <div className="w-[72px] h-[72px] rounded-full bg-emerald-50 flex items-center justify-center text-3xl mx-auto mb-4">
                    ✅
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">전송 완료!</h2>
                  <p className="text-sm text-gray-400 mb-6">
                    {prescription.patientName} 님께 복약 안내 메시지와 복약알림이 발송되었습니다.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-sm"
                  >
                    목록으로 돌아가기
                  </button>
                </div>
              ) : (
                /* Send Form */
                <div className="space-y-5">
                  {/* Message Preview */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 relative">
                    <div className="text-[11px] font-bold text-blue-600 mb-3 tracking-wider">📱 전송될 문자메시지</div>
                    <div className="text-sm leading-[1.85] text-gray-800 whitespace-pre-wrap">{message}</div>
                  </div>

                  {/* Summary */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    {[
                      { key: '수신자', value: `${prescription.patientName} (${patientPhone || '미입력'})` },
                      { key: '조제약', value: `${ocrData.drugs.map(d => d.category).join(', ')} · ${ocrData.drugs[0]?.days}일분` },
                      { key: '복약알림', value: `${reminder.times.join(', ')} (${reminder.relation})` },
                      { key: '리필 알림', value: refillAlerts.length > 0 ? `${refillAlerts.join(', ')} 자동발송` : '설정 안됨' },
                    ].map(({ key, value }, i) => (
                      <div key={key} className={clsx('flex items-center justify-between px-5 py-3 text-sm', i < 3 && 'border-b border-gray-100')}>
                        <span className="text-gray-400 text-xs">{key}</span>
                        <span className="font-semibold text-gray-800">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Send Buttons */}
                  <div className="flex gap-3">
                    <button onClick={prevStep} className="px-5 py-3.5 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap text-sm">
                      ← 수정
                    </button>
                    <button
                      onClick={handleSend}
                      className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 text-[15px] active:scale-[0.98]"
                    >
                      <Send className="w-4 h-4" />
                      메시지 전송하기
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── MODAL FOOTER ── */}
        {!isCompleted && (
          <div className="px-7 py-4 border-t border-gray-200 flex items-center justify-between bg-white flex-shrink-0">
            <div className="text-xs text-gray-400 font-medium">
              Step {currentStep} / 4 · {STEP_LABELS[currentStep - 1]}
            </div>
            <div className="flex gap-2.5">
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ← 이전
                </button>
              )}
              {currentStep < 4 && (
                <button
                  onClick={nextStep}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                >
                  다음 단계 →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
