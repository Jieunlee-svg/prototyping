import React, { useState } from 'react';
import { clsx } from 'clsx';
import {
  Bell,
  Clock,
  Check,
  ChevronRight,
  ChevronLeft,
  Settings,
  Smartphone,
  Info,
  RotateCcw,
  Eye,
  Save,
} from 'lucide-react';

/* ─── Types ─── */
interface FrequencySetting {
  count: number;
  defaultTimes: string[];
  defaultRelation: string;
}

interface TimeSetting {
  label: string;
  defaultTime: string;
}

/* ─── Constants ─── */
const TIME_OPTIONS = ['아침', '점심', '저녁', '취침전'] as const;
const RELATION_OPTIONS = ['식전', '식후 즉시', '식후 30분'] as const;

const INITIAL_FREQUENCY_SETTINGS: FrequencySetting[] = [
  { count: 1, defaultTimes: ['아침'], defaultRelation: '식후 30분' },
  { count: 2, defaultTimes: ['아침', '저녁'], defaultRelation: '식후 30분' },
  { count: 3, defaultTimes: ['아침', '점심', '저녁'], defaultRelation: '식후 30분' },
];

const INITIAL_TIME_MAPPINGS: TimeSetting[] = [
  { label: '아침', defaultTime: '10:00' },
  { label: '점심', defaultTime: '13:00' },
  { label: '저녁', defaultTime: '18:00' },
  { label: '취침전', defaultTime: '22:00' },
];

/* ─── Sub-components ─── */

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={clsx(
        'relative inline-flex h-[24px] w-[44px] shrink-0 items-center rounded-full transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
        checked ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
      )}
    >
      <span
        className={clsx(
          'pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-[22px]' : 'translate-x-[3px]'
        )}
      />
    </button>
  );
}

function SectionCard({
  icon,
  title,
  badge,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="bg-[var(--card)] rounded-[var(--radius-card)] border border-[var(--border)] overflow-hidden"
      style={{ boxShadow: 'var(--elevation-sm)' }}
    >
      <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between"
        style={{ backgroundColor: 'rgba(245,246,249,0.5)' }}
      >
        <h2
          className="flex items-center gap-2 text-[var(--foreground)]"
          style={{
            fontFamily: 'var(--font-family-noto)',
            fontSize: 'var(--text-h4)',
            fontWeight: 'var(--font-weight-medium)',
          }}
        >
          {icon}
          {title}
        </h2>
        {badge && (
          <span
            className="px-2.5 py-1 rounded-[var(--radius)] border border-[var(--border)] bg-white text-[var(--muted-foreground)]"
            style={{
              fontFamily: 'var(--font-family-noto)',
              fontSize: '11px',
              fontWeight: 'var(--font-weight-normal)',
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function PillButton({
  label,
  selected,
  variant = 'primary',
  onClick,
  disabled,
}: {
  label: string;
  selected: boolean;
  variant?: 'primary' | 'secondary';
  onClick: () => void;
  disabled?: boolean;
}) {
  const baseStyle: React.CSSProperties = {
    fontFamily: 'var(--font-family-noto)',
    fontSize: 'var(--text-label)',
    fontWeight: 'var(--font-weight-medium)',
    borderRadius: 'var(--radius-button)',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={baseStyle}
      className={clsx(
        'px-4 py-[7px] border transition-all',
        disabled && 'opacity-40 cursor-not-allowed',
        selected && variant === 'primary' &&
          'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]',
        selected && variant === 'secondary' &&
          'bg-[var(--secondary)] text-[var(--secondary-foreground)] border-[var(--secondary)]',
        !selected &&
          'bg-white text-[var(--foreground)] border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
      )}
    >
      {label}
    </button>
  );
}

/* ─── Main Component ─── */
export const MedicationNotificationSettings = ({ onBack }: { onBack?: () => void }) => {
  const [frequencySettings, setFrequencySettings] = useState<FrequencySetting[]>(
    () => JSON.parse(JSON.stringify(INITIAL_FREQUENCY_SETTINGS))
  );
  const [timeMappings, setTimeMappings] = useState<TimeSetting[]>(
    () => JSON.parse(JSON.stringify(INITIAL_TIME_MAPPINGS))
  );
  const [showFourTimes, setShowFourTimes] = useState(false);
  const [showAfterMeal30, setShowAfterMeal30] = useState(true);
  const [defaultAppSend, setDefaultAppSend] = useState(true);
  const [saved, setSaved] = useState(false);

  /* ─── Handlers ─── */
  const toggleFrequencyTime = (count: number, time: string) => {
    setFrequencySettings((prev) =>
      prev.map((item) => {
        if (item.count !== count) return item;
        const order = ['아침', '점심', '저녁', '취침전'];
        let next = item.defaultTimes.includes(time)
          ? item.defaultTimes.filter((t) => t !== time)
          : [...item.defaultTimes, time];
        next.sort((a, b) => order.indexOf(a) - order.indexOf(b));
        return { ...item, defaultTimes: next };
      })
    );
  };

  const setFrequencyRelation = (count: number, rel: string) => {
    setFrequencySettings((prev) =>
      prev.map((item) =>
        item.count === count ? { ...item, defaultRelation: rel } : item
      )
    );
  };

  const updateTimeMapping = (label: string, newTime: string) => {
    setTimeMappings((prev) =>
      prev.map((item) =>
        item.label === label ? { ...item, defaultTime: newTime } : item
      )
    );
  };

  const handleReset = () => {
    setFrequencySettings(JSON.parse(JSON.stringify(INITIAL_FREQUENCY_SETTINGS)));
    setTimeMappings(JSON.parse(JSON.stringify(INITIAL_TIME_MAPPINGS)));
    setShowFourTimes(false);
    setShowAfterMeal30(true);
    setDefaultAppSend(true);
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  /* ─── Derived ─── */
  const visibleRelations = showAfterMeal30
    ? RELATION_OPTIONS
    : RELATION_OPTIONS.filter((r) => r !== '식후 30분');

  const timeEmojiMap: Record<string, string> = {
    아침: '🌅',
    점심: '☀️',
    저녁: '🌇',
    취침전: '🌙',
  };

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{
        backgroundColor: 'var(--background)',
        fontFamily: 'var(--font-family-noto)',
      }}
    >
      {/* ─── Header (PharmacySettings style) ─── */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <div
            className="flex items-center gap-1.5 mb-2 text-[var(--muted-foreground)]"
            style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-normal)' }}
          >
            {onBack && (
              <button
                onClick={onBack}
                className="mr-1 p-1 rounded-[var(--radius)] hover:bg-[var(--accent)] transition-colors text-[var(--muted-foreground)] hover:text-[var(--primary)]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <span
              className={onBack ? "cursor-pointer hover:text-[var(--primary)] transition-colors" : ""}
              onClick={onBack}
            >
              복약 상담
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span
              className="text-[var(--foreground)]"
              style={{ fontWeight: 'var(--font-weight-medium)' }}
            >
              복약 알림 설정
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Settings className="text-blue-600" size={22} />
            <h1 className="text-2xl font-bold text-gray-900">복약 알림 기본 설정</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1 ml-8">
            복약 상담 시 적용될 알림 기본값을 미리 설정합니다
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={16} />
            초기화
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saved}
            className={clsx(
              'flex items-center gap-2 px-5 py-2.5 font-semibold rounded-lg transition-colors shadow-sm',
              saved
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            {saved ? (
              <>
                <Check size={18} />
                저장 완료!
              </>
            ) : (
              <>
                <Save size={18} />
                설정 저장
              </>
            )}
          </button>
        </div>
      </header>

      {/* ─── Content ─── */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-[1200px] mx-auto space-y-6">

          {/* ── Row 1: 버튼 표시 설정 + 복용 횟수별 기본 설정 ── */}
          <div className="grid grid-cols-[1fr_2fr] gap-6 items-start">
            {/* 버튼 표시 설정 */}
            <SectionCard
              icon={<Eye className="w-[18px] h-[18px]" style={{ color: 'var(--primary)' }} />}
              title="버튼 표시 설정"
            >
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className="text-[var(--foreground)]"
                      style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                    >
                      복용 횟수 4회 버튼
                    </p>
                    <p
                      className="text-[var(--muted-foreground)] mt-0.5"
                      style={{ fontSize: '12px', fontWeight: 'var(--font-weight-normal)', lineHeight: 1.5 }}
                    >
                      복용 횟수 선택에 '4회' 버튼을 추가합니다
                    </p>
                  </div>
                  <Toggle checked={showFourTimes} onChange={() => setShowFourTimes(!showFourTimes)} />
                </div>

                <div className="border-t border-[var(--border)]" />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className="text-[var(--foreground)]"
                      style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                    >
                      식후 30분 버튼
                    </p>
                    <p
                      className="text-[var(--muted-foreground)] mt-0.5"
                      style={{ fontSize: '12px', fontWeight: 'var(--font-weight-normal)', lineHeight: 1.5 }}
                    >
                      복용 시점 선택에 '식후 30분' 버튼을 표시합니다
                    </p>
                  </div>
                  <Toggle
                    checked={showAfterMeal30}
                    onChange={() => setShowAfterMeal30(!showAfterMeal30)}
                  />
                </div>

                {/* Preview */}
                <div
                  className="mt-2 p-3 rounded-[var(--radius)] border border-dashed border-[var(--border)]"
                  style={{ backgroundColor: 'rgba(245,246,249,0.5)' }}
                >
                  <p
                    className="text-[var(--muted-foreground)] mb-2"
                    style={{ fontSize: '11px', fontWeight: 'var(--font-weight-medium)' }}
                  >
                    미리보기 — 상담 화면에 표시되는 버튼
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {['1회', '2회', '3회'].map((b) => (
                      <span
                        key={b}
                        className="px-3 py-1 rounded-[var(--radius-button)] border border-[var(--border)] bg-white text-[var(--foreground)]"
                        style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)' }}
                      >
                        {b}
                      </span>
                    ))}
                    {showFourTimes && (
                      <span
                        className="px-3 py-1 rounded-[var(--radius-button)] border border-[var(--primary)] text-[var(--primary)] bg-[var(--accent)]"
                        style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)' }}
                      >
                        4회
                      </span>
                    )}
                    <span className="mx-1 text-[var(--border)]">|</span>
                    {visibleRelations.map((r) => (
                      <span
                        key={r}
                        className="px-3 py-1 rounded-[var(--radius-button)] border border-[var(--border)] bg-white text-[var(--foreground)]"
                        style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)' }}
                      >
                        {r}
                      </span>
                    ))}
                    {!showAfterMeal30 && (
                      <span
                        className="px-3 py-1 rounded-[var(--radius-button)] border border-dashed border-[var(--border)] text-[var(--muted-foreground)] line-through"
                        style={{ fontSize: '12px', fontWeight: 'var(--font-weight-normal)' }}
                      >
                        식후 30분
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* 복용 횟수별 기본 설정 */}
            <SectionCard
              icon={<Bell className="w-[18px] h-[18px]" style={{ color: 'var(--primary)' }} />}
              title="복용 횟수별 기본 설정"
              badge="상담 화면 진입 시 자동 선택됩니다"
            >
              <div className="space-y-0">
                {frequencySettings.map((setting, idx) => (
                  <div
                    key={setting.count}
                    className={clsx(
                      'flex gap-4 py-4',
                      idx < frequencySettings.length - 1 &&
                        'border-b border-dashed border-[var(--border)]'
                    )}
                  >
                    <div className="w-14 shrink-0 flex flex-col items-center pt-1">
                      <span
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full text-[var(--primary)]"
                        style={{
                          backgroundColor: 'var(--accent)',
                          fontSize: 'var(--text-base)',
                          fontWeight: 'var(--font-weight-medium)',
                        }}
                      >
                        {setting.count}회
                      </span>
                    </div>

                    {/* 복용 시간 + 복용 시점 on the same line */}
                    <div className="flex-1 flex items-start gap-6">
                      <div>
                        <label
                          className="block mb-2 text-[var(--muted-foreground)]"
                          style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)', letterSpacing: '0.02em' }}
                        >
                          복용 시간
                        </label>
                        <div className="flex gap-2 flex-wrap">
                          {TIME_OPTIONS.map((time) => (
                            <PillButton
                              key={time}
                              label={time}
                              selected={setting.defaultTimes.includes(time)}
                              variant="primary"
                              onClick={() => toggleFrequencyTime(setting.count, time)}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <label
                          className="block mb-2 text-[var(--muted-foreground)]"
                          style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)', letterSpacing: '0.02em' }}
                        >
                          복용 시점
                        </label>
                        <div className="flex gap-2 flex-wrap">
                          {visibleRelations.map((rel) => (
                            <PillButton
                              key={rel}
                              label={rel}
                              selected={setting.defaultRelation === rel}
                              variant="secondary"
                              onClick={() => setFrequencyRelation(setting.count, rel)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* ── Row 2: 웰체크 앱 전송 설정 + 웰체크 앱 전송 시간 설정 ── */}
          <div className="grid grid-cols-2 gap-6 items-start">
            {/* 웰체크 앱 전송 설정 */}
            <SectionCard
              icon={<Smartphone className="w-[18px] h-[18px]" style={{ color: 'var(--primary)' }} />}
              title="웰체크 앱 전송 설정"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    className="text-[var(--foreground)]"
                    style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                  >
                    앱 전송 기본값
                  </p>
                  <p
                    className="text-[var(--muted-foreground)] mt-0.5"
                    style={{ fontSize: '12px', fontWeight: 'var(--font-weight-normal)', lineHeight: 1.5 }}
                  >
                    상담 화면 진입 시 '앱으로 설정 전송' 토글 기본 상태
                  </p>
                </div>
                <Toggle
                  checked={defaultAppSend}
                  onChange={() => setDefaultAppSend(!defaultAppSend)}
                />
              </div>

              <div
                className="mt-5 p-4 rounded-[var(--radius)] border"
                style={{
                  backgroundColor: defaultAppSend ? 'var(--accent)' : 'var(--muted)',
                  borderColor: defaultAppSend ? 'var(--primary)' : 'var(--border)',
                }}
              >
                <div className="flex gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: defaultAppSend ? 'var(--primary)' : 'var(--border)' }}
                  >
                    <Smartphone
                      className="w-4 h-4"
                      style={{ color: defaultAppSend ? 'var(--primary-foreground)' : 'var(--muted-foreground)' }}
                    />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: defaultAppSend ? 'var(--accent-foreground)' : 'var(--foreground)',
                      }}
                    >
                      {defaultAppSend ? '기본값: 전송함 (ON)' : '기본값: 전송 안 함 (OFF)'}
                    </p>
                    <p
                      className="mt-1"
                      style={{ fontSize: '12px', fontWeight: 'var(--font-weight-normal)', lineHeight: 1.6, color: 'var(--muted-foreground)' }}
                    >
                      {defaultAppSend
                        ? '상담 화면 진입 시 앱 전송 토글이 자동으로 켜져, 앱 사용 환자에게 알림이 자동 설정됩니다.'
                        : '상담 화면 진입 시 앱 전송 토글이 꺼져 있습니다. 필요 시 약사가 수동으로 전송을 켭니다.'}
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* 웰체크 앱 전송 시간 설정 */}
            <SectionCard
              icon={<Clock className="w-[18px] h-[18px]" style={{ color: 'var(--primary)' }} />}
              title="웰체크 앱 전송 시간 설정"
            >
              <div className="grid grid-cols-2 gap-3">
                {timeMappings.map((mapping) => (
                  <div
                    key={mapping.label}
                    className="flex items-center justify-between px-4 py-3 rounded-[var(--radius)] border border-[var(--border)] bg-white hover:border-[var(--primary)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base select-none" style={{ lineHeight: 1 }}>
                        {timeEmojiMap[mapping.label]}
                      </span>
                      <span
                        className="text-[var(--foreground)]"
                        style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                      >
                        {mapping.label}
                      </span>
                    </div>
                    <input
                      type="time"
                      value={mapping.defaultTime}
                      onChange={(e) => updateTimeMapping(mapping.label, e.target.value)}
                      className="px-3 py-1.5 border border-[var(--border)] rounded-[var(--radius-input)] bg-[var(--input-background)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--ring)]/20 focus:border-[var(--primary)] outline-none cursor-pointer w-[120px] text-right"
                      style={{
                        fontFamily: 'var(--font-family-noto)',
                        fontSize: 'var(--text-label)',
                        fontWeight: 'var(--font-weight-medium)',
                      }}
                    />
                  </div>
                ))}
              </div>

              <div
                className="mt-4 flex items-start gap-2 p-3 rounded-[var(--radius)] border border-[var(--border)]"
                style={{ backgroundColor: 'rgba(245,246,249,0.7)' }}
              >
                <Info className="w-4 h-4 mt-0.5 shrink-0 text-[var(--muted-foreground)]" />
                <p
                  className="text-[var(--muted-foreground)]"
                  style={{ fontSize: '12px', fontWeight: 'var(--font-weight-normal)', lineHeight: 1.6 }}
                >
                  설정된 시간은 환자의 웰체크 앱으로 알림 설정이 전송될 때 기본값으로 사용됩니다.
                </p>
              </div>
            </SectionCard>
          </div>

        </div>
      </div>
    </div>
  );
};
