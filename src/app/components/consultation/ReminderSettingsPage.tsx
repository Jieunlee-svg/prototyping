import React, { useState, useEffect } from 'react';
import { BellRing, Clock, Smartphone, Info, CheckCircle, Save, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'sonner';

interface TimeSlotConfig {
  label: string;
  emoji: string;
  defaultHour: number;
  defaultMinute: number;
}

const TIME_SLOTS: Record<string, TimeSlotConfig> = {
  '아침': { label: '아침', emoji: '☀️', defaultHour: 7, defaultMinute: 0 },
  '점심': { label: '점심', emoji: '🌤️', defaultHour: 12, defaultMinute: 0 },
  '저녁': { label: '저녁', emoji: '🌙', defaultHour: 18, defaultMinute: 0 },
  '취침 전': { label: '취침 전', emoji: '😴', defaultHour: 22, defaultMinute: 0 },
};

const FREQUENCY_PRESETS: Record<number, { times: string[]; relation: string }> = {
  1: { times: ['아침'], relation: '식후 30분' },
  2: { times: ['아침', '저녁'], relation: '식후 30분' },
  3: { times: ['아침', '점심', '저녁'], relation: '식후 30분' },
};

export const ReminderSettingsPage: React.FC = () => {
  const [frequency, setFrequency] = useState(3);
  const [selectedTimes, setSelectedTimes] = useState<string[]>(['아침', '점심', '저녁']);
  const [relation, setRelation] = useState('식후 30분');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [durationDays, setDurationDays] = useState(7);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [sendToApp, setSendToApp] = useState(false);
  const [saving, setSaving] = useState(false);

  const [alarmTimes, setAlarmTimes] = useState<Record<string, { hour: number; minute: number }>>({
    '아침': { hour: 7, minute: 0 },
    '점심': { hour: 12, minute: 0 },
    '저녁': { hour: 18, minute: 0 },
    '취침 전': { hour: 22, minute: 0 },
  });

  const handleFrequencyChange = (freq: number) => {
    setFrequency(freq);
    const preset = FREQUENCY_PRESETS[freq];
    if (preset) {
      setSelectedTimes(preset.times);
      setRelation(preset.relation);
    }
  };

  const toggleTime = (time: string) => {
    if (selectedTimes.includes(time)) {
      if (selectedTimes.length > 1) {
        setSelectedTimes(selectedTimes.filter(t => t !== time));
      }
    } else {
      setSelectedTimes([...selectedTimes, time]);
    }
  };

  useEffect(() => {
    setFrequency(selectedTimes.length);
  }, [selectedTimes]);

  const updateAlarmTime = (slot: string, field: 'hour' | 'minute', value: number) => {
    setAlarmTimes(prev => ({
      ...prev,
      [slot]: { ...prev[slot], [field]: value },
    }));
  };

  const resetToDefaults = () => {
    const defaults: Record<string, { hour: number; minute: number }> = {};
    Object.entries(TIME_SLOTS).forEach(([key, config]) => {
      defaults[key] = { hour: config.defaultHour, minute: config.defaultMinute };
    });
    setAlarmTimes(defaults);
    toast.success('기본 알림 시간으로 초기화되었습니다.');
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('복약 알림 설정이 저장되었습니다.');
    }, 800);
  };

  const formatTime = (hour: number, minute: number) => {
    const period = hour < 12 ? '오전' : '오후';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${period} ${displayHour}:${minute.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <div className="flex items-center gap-2">
            <BellRing className="text-blue-600" size={22} />
            <h1 className="text-2xl font-bold text-gray-900">복약 알림 설정</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1 ml-8">
            환자에게 전송할 기본 복약 알림을 설정합니다.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              저장 중...
            </>
          ) : (
            <>
              <Save size={18} />
              설정 저장
            </>
          )}
        </button>
      </header>

      <div className="flex-1 overflow-auto p-6 pb-20">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* 복약 횟수 */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-blue-600 font-bold text-base bg-blue-50 w-7 h-7 rounded-full flex items-center justify-center">1</span>
                복약 횟수
              </h2>
              <p className="text-xs text-gray-500 mt-1 ml-9">횟수를 선택하면 복약 시간이 자동으로 설정됩니다.</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map(freq => (
                  <button
                    key={freq}
                    onClick={() => handleFrequencyChange(freq)}
                    className={clsx(
                      "py-4 rounded-xl text-base font-semibold border-2 transition-all",
                      frequency === freq
                        ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-200"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                    )}
                  >
                    하루 {freq}회
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 복약 시간 */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-blue-600 font-bold text-base bg-blue-50 w-7 h-7 rounded-full flex items-center justify-center">2</span>
                복약 시간
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(TIME_SLOTS).map(([key, config]) => {
                  const isSelected = selectedTimes.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleTime(key)}
                      className={clsx(
                        "py-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5",
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-200"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                      )}
                    >
                      <span className="text-2xl">{config.emoji}</span>
                      <span className="text-sm font-semibold">{config.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 복약 시점 */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-blue-600 font-bold text-base bg-blue-50 w-7 h-7 rounded-full flex items-center justify-center">3</span>
                복약 시점
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-3">
                {['식사 전', '식후', '식후 30분'].map(rel => (
                  <button
                    key={rel}
                    onClick={() => setRelation(rel)}
                    className={clsx(
                      "py-4 rounded-xl text-sm font-semibold border-2 transition-all",
                      relation === rel
                        ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-200"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                    )}
                  >
                    {rel}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 복약 기간 */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-blue-600 font-bold text-base bg-blue-50 w-7 h-7 rounded-full flex items-center justify-center">4</span>
                복약 기간
              </h2>
            </div>
            <div className="p-6">
              <div className="flex gap-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">시작일</label>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <button className="w-full flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all text-left">
                        <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        {format(startDate, 'yyyy년 M월 d일 (EEE)', { locale: ko })}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                          if (date) {
                            setStartDate(date);
                            setCalendarOpen(false);
                          }
                        }}
                        locale={ko}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">복약 일수</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDurationDays(prev => Math.max(1, prev - 1))}
                      className="w-10 h-[46px] rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 text-lg font-bold"
                    >−</button>
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        min={1}
                        max={365}
                        value={durationDays}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val >= 1 && val <= 365) setDurationDays(val);
                        }}
                        className="w-full text-center py-3 text-sm font-semibold border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">일</span>
                    </div>
                    <button
                      onClick={() => setDurationDays(prev => Math.min(365, prev + 1))}
                      className="w-10 h-[46px] rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 text-lg font-bold"
                    >+</button>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  {format(startDate, 'M월 d일', { locale: ko })}부터 {durationDays}일간 ({format(new Date(startDate.getTime() + (durationDays - 1) * 86400000), 'M월 d일', { locale: ko })}까지) 알림이 발송됩니다.
                </p>
              </div>
            </div>
          </section>

          {/* 앱 알림 시간 설정 */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-500" />
                  웰체크 앱으로 설정 전송
                </h2>
                <p className="text-xs text-gray-500 mt-1 ml-7">앱 가입자에게 복약 알림 시간을 전송합니다.</p>
              </div>
              <div
                className={clsx(
                  "relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer flex-shrink-0",
                  sendToApp ? "bg-blue-600" : "bg-gray-200"
                )}
                onClick={() => setSendToApp(!sendToApp)}
              >
                <span
                  className={clsx(
                    "inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm",
                    sendToApp ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </div>
            </div>

            {sendToApp && (
              <div className="p-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    선택된 복약 시간별 알림이 울릴 시각을 설정하세요. 환자는 앱에서 수정할 수 있습니다.
                  </p>
                  <button
                    onClick={resetToDefaults}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition-colors flex-shrink-0"
                  >
                    <RotateCcw className="w-3 h-3" />
                    초기화
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedTimes.map(timeKey => {
                    const config = TIME_SLOTS[timeKey];
                    const alarm = alarmTimes[timeKey];
                    if (!config || !alarm) return null;

                    return (
                      <div
                        key={timeKey}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <div className="flex items-center gap-3 w-28 flex-shrink-0">
                          <span className="text-2xl">{config.emoji}</span>
                          <span className="text-sm font-semibold text-gray-800">{config.label}</span>
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <select
                            value={alarm.hour}
                            onChange={(e) => updateAlarmTime(timeKey, 'hour', parseInt(e.target.value))}
                            className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none cursor-pointer"
                          >
                            {Array.from({ length: 24 }, (_, i) => {
                              const period = i < 12 ? '오전' : '오후';
                              const displayHour = i === 0 ? 12 : i > 12 ? i - 12 : i;
                              return (
                                <option key={i} value={i}>
                                  {period} {displayHour}시
                                </option>
                              );
                            })}
                          </select>
                          <span className="text-gray-400 font-bold">:</span>
                          <select
                            value={alarm.minute}
                            onChange={(e) => updateAlarmTime(timeKey, 'minute', parseInt(e.target.value))}
                            className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none cursor-pointer"
                          >
                            {[0, 10, 15, 20, 30, 40, 45, 50].map(m => (
                              <option key={m} value={m}>{m.toString().padStart(2, '0')}분</option>
                            ))}
                          </select>
                        </div>
                        <div className="text-sm text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg flex-shrink-0">
                          {formatTime(alarm.hour, alarm.minute)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">미리보기</p>
                    <p className="text-xs text-green-700 mt-1 leading-relaxed">
                      환자에게 매일{' '}
                      {selectedTimes.map(t => {
                        const alarm = alarmTimes[t];
                        return alarm ? `${TIME_SLOTS[t]?.emoji} ${t} ${formatTime(alarm.hour, alarm.minute)}` : t;
                      }).join(', ')}{' '}
                      에 "{relation}" 알림이 전송됩니다.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
};
