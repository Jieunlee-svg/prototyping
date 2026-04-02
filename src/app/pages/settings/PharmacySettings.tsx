import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  MapPin,
  Clock,
  Store,
  Save,
  Search,
  Check,
  Copy,
  Sparkles,
  Smartphone,
  Info,
  EyeOff,
  Bell,
  RotateCcw,
  X,
  Printer,
} from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';

const HideTimePickerIcon = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    input[type="time"]::-webkit-calendar-picker-indicator {
      display: none !important;
      -webkit-appearance: none;
    }
  `}} />
);

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | 'holiday';

interface DaySchedule {
  start: string;
  end: string;
  active: boolean;
  hasLunch: boolean;
  lunchStart: string;
  lunchEnd: string;
}

// ── 복약 알림 상수 ──
const TIME_OPTIONS = ['아침', '점심', '저녁', '취침전'] as const;
const RELATION_OPTIONS = ['식전', '식후', '식후 30분'] as const;
const INITIAL_FREQ = [
  { count: 1, defaultTimes: ['아침'], defaultRelation: '식후 30분' },
  { count: 2, defaultTimes: ['아침', '저녁'], defaultRelation: '식후 30분' },
  { count: 3, defaultTimes: ['아침', '점심', '저녁'], defaultRelation: '식후 30분' },
  { count: 4, defaultTimes: ['아침', '점심', '저녁', '취침전'], defaultRelation: '식후 30분' },
];
const INITIAL_TIMES = [
  { label: '아침', defaultTime: '10:00' },
  { label: '점심', defaultTime: '13:00' },
  { label: '저녁', defaultTime: '18:00' },
  { label: '취침전', defaultTime: '22:00' },
];

// ── 컴포넌트 외부에 정의: 내부 정의 시 매 렌더마다 재생성되어 자식 언마운트 발생 ──
const SectionCard = ({ icon: Icon, title, children, headerRight }: { icon: React.ElementType; title: string; children: React.ReactNode; headerRight?: React.ReactNode }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-blue-600" />
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      </div>
      {headerRight}
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

// ── 커스텀 Time Picker ──
const formatTimeDisplay = (val: string) => {
  const [hStr, mStr] = val.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr ?? '00';
  const ampm = h < 12 ? 'AM' : 'PM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${String(h12).padStart(2, '0')}:${m} ${ampm}`;
};

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

const TimePicker = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current && !wrapperRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (open && listRef.current) {
      const idx = TIME_SLOTS.indexOf(value);
      if (idx !== -1) {
        const item = listRef.current.children[idx] as HTMLElement;
        if (item) item.scrollIntoView({ block: 'center' });
      }
    }
  }, [open, value]);

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    setOpen(o => !o);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={handleToggle}
        className={clsx(
          'flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-[13px] font-medium w-[120px] justify-end transition-all',
          open
            ? 'border-blue-400 bg-white ring-2 ring-blue-100 text-blue-700'
            : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-300'
        )}
      >
        <Clock size={12} className={open ? 'text-blue-400' : 'text-gray-400'} />
        {formatTimeDisplay(value)}
      </button>
      {open && (
        <div
          ref={dropdownRef}
          style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
          className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden w-36"
        >
          <div ref={listRef} className="max-h-52 overflow-y-auto py-1">
            {TIME_SLOTS.map(slot => (
              <button
                key={slot}
                type="button"
                onClick={() => { onChange(slot); setOpen(false); }}
                className={clsx(
                  'w-full px-4 py-1.5 text-left text-[13px] transition-colors',
                  slot === value
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                {formatTimeDisplay(slot)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SaveBtn = ({ disabled = false, loading, onClick }: { disabled?: boolean; loading: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    disabled={loading || disabled}
    className={clsx(
      'flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-colors shadow-sm',
      !disabled && !loading
        ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
    )}
  >
    {loading ? (
      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />저장 중...</>
    ) : (
      <><Save size={16} />설정 저장</>
    )}
  </button>
);

interface PharmacySettingsProps {
  initialTab?: 'basic' | 'reminder' | 'app';
}

export const PharmacySettings: React.FC<PharmacySettingsProps> = ({ initialTab }) => {
  const [loading, setLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [allowAppPrescription, setAllowAppPrescription] = useState(true);
  const [deliveryMethods, setDeliveryMethods] = useState({
    self:   true,   // 본인 수령
    family: true,   // 가족 수령
    quick:  true,   // 퀵
    parcel: true,   // 택배
    cod:    false,  // 착불 배송
  });
  const [hidePhone, setHidePhone] = useState(false);
  const [notifyPhone, setNotifyPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const notifyPhoneRef = useRef<HTMLInputElement>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressSearch, setAddressSearch] = useState('');
  const [addressResults, setAddressResults] = useState<{ address: string; zipCode: string }[]>([]);
  const [formData, setFormData] = useState({
    name: '약국',
    phone: '02-1234-5678',
    fax: '',
    address: '서울특별시 종로구 종로 123 (종로3가)',
    addressDetail: '',
    intro: '안녕하세요. 약국입니다. 정성을 다해 상담해드립니다.',
    hours: {
      monday: { start: '09:00', end: '19:00', active: true, hasLunch: true, lunchStart: '13:00', lunchEnd: '14:00' },
      tuesday: { start: '09:00', end: '19:00', active: true, hasLunch: true, lunchStart: '13:00', lunchEnd: '14:00' },
      wednesday: { start: '09:00', end: '19:00', active: true, hasLunch: true, lunchStart: '13:00', lunchEnd: '14:00' },
      thursday: { start: '09:00', end: '19:00', active: true, hasLunch: true, lunchStart: '13:00', lunchEnd: '14:00' },
      friday: { start: '09:00', end: '19:00', active: true, hasLunch: true, lunchStart: '13:00', lunchEnd: '14:00' },
      saturday: { start: '09:00', end: '14:00', active: true, hasLunch: false, lunchStart: '12:00', lunchEnd: '13:00' },
      sunday: { start: '10:00', end: '18:00', active: false, hasLunch: false, lunchStart: '12:00', lunchEnd: '13:00' },
      holiday: { start: '10:00', end: '18:00', active: false, hasLunch: false, lunchStart: '12:00', lunchEnd: '13:00' },
    } as Record<DayKey, DaySchedule>
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'app' | 'reminder'>(initialTab ?? 'basic');

  // ── 복약 알림 기본 설정 state ──
  const [freqSettings, setFreqSettings] = useState<typeof INITIAL_FREQ>(() => JSON.parse(JSON.stringify(INITIAL_FREQ)));
  const [timeMappings, setTimeMappings] = useState<typeof INITIAL_TIMES>(() => JSON.parse(JSON.stringify(INITIAL_TIMES)));
  const [showFourTimes, setShowFourTimes] = useState(false);
  const [showAfterMeal30, setShowAfterMeal30] = useState(true);
  const [reminderSaved, setReminderSaved] = useState(false);

  const toggleFreqTime = (count: number, time: string) => {
    const order = ['아침', '점심', '저녁', '취침전'];
    setFreqSettings(prev => prev.map(item => {
      if (item.count !== count || item.count === 4) return item;
      const isSelected = item.defaultTimes.includes(time);
      if (item.count === 1) return { ...item, defaultTimes: isSelected ? [] : [time] };
      let next = isSelected ? item.defaultTimes.filter(t => t !== time) : [...item.defaultTimes, time];
      next.sort((a, b) => order.indexOf(a) - order.indexOf(b));
      return { ...item, defaultTimes: next };
    }));
  };
  const setFreqRelation = (count: number, rel: string) => {
    setFreqSettings(prev => prev.map(item => item.count === count ? { ...item, defaultRelation: rel } : item));
  };
  const updateTimeMapping = (label: string, newTime: string) => {
    setTimeMappings(prev => prev.map(item => item.label === label ? { ...item, defaultTime: newTime } : item));
  };
  const handleReminderReset = () => {
    setFreqSettings(JSON.parse(JSON.stringify(INITIAL_FREQ)));
    setTimeMappings(JSON.parse(JSON.stringify(INITIAL_TIMES)));
    setShowFourTimes(false);
    setShowAfterMeal30(true);
    setReminderSaved(false);
  };
  const handleReminderSave = () => {
    setReminderSaved(true);
    setTimeout(() => setReminderSaved(false), 2000);
  };
  const visibleRelations = showAfterMeal30 ? RELATION_OPTIONS : RELATION_OPTIONS.filter(r => r !== '식후 30분');
  const displayedFreq = showFourTimes ? freqSettings : freqSettings.filter(s => s.count <= 3);

  // "설정 저장" 활성 조건: 약국명, 주소, 번호 중 하나라도 비어있으면 비활성
  const isFormValid =
    formData.name.trim() !== '' &&
    formData.address.trim() !== '' &&
    (hidePhone || formData.phone.trim() !== '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (day: DayKey, field: keyof DaySchedule, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: { ...prev.hours[day], [field]: value }
      }
    }));
  };

  const toggleDay = (day: DayKey) => {
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: { ...prev.hours[day], active: !prev.hours[day].active }
      }
    }));
  };

  // ── 주소 검색 mock 데이터 ──
  const MOCK_ADDRESSES = [
    { address: '서울특별시 종로구 종로 1가 1', zipCode: '03154' },
    { address: '서울특별시 종로구 종로 2가 1', zipCode: '03155' },
    { address: '서울특별시 종로구 종로 3가 1', zipCode: '03156' },
    { address: '서울특별시 중구 을지로 1가 1', zipCode: '04523' },
    { address: '서울특별시 강남구 테헤란로 123', zipCode: '06133' },
    { address: '경기도 성남시 분당구 판교역로 166', zipCode: '13529' },
  ];

  const handleAddressSearch = (query: string) => {
    setAddressSearch(query);
    if (query.trim().length < 2) { setAddressResults([]); return; }
    const q = query.trim().toLowerCase();
    setAddressResults(MOCK_ADDRESSES.filter(a => a.address.toLowerCase().includes(q)));
  };

  const handleAddressSelect = (item: { address: string; zipCode: string }) => {
    setFormData(prev => ({ ...prev, address: item.address, addressDetail: '' }));
    setShowAddressModal(false);
    setAddressSearch('');
    setAddressResults([]);
  };

  const applyMondayToWeekdays = () => {
    const mondaySchedule = formData.hours.monday;
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        tuesday: { ...mondaySchedule },
        wednesday: { ...mondaySchedule },
        thursday: { ...mondaySchedule },
        friday: { ...mondaySchedule },
      }
    }));
    toast.success('월요일 시간이 평일(화~금)에 적용되었습니다.');
  };

  // 앱 처방전 탭: 토글 ON 시 전화번호 입력 필드 자동 포커스
  useEffect(() => {
    if (allowAppPrescription && activeTab === 'app') {
      const timer = setTimeout(() => notifyPhoneRef.current?.focus(), 350);
      return () => clearTimeout(timer);
    }
  }, [allowAppPrescription, activeTab]);

  // 알림 수신 번호 자동 포맷 + 실시간 유효성 검사
  const handleNotifyPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
    let formatted = digits;
    if (digits.length > 7) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    } else if (digits.length > 3) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
    }
    setNotifyPhone(formatted);
    if (digits.length > 0 && digits.length < 11) {
      setPhoneError('휴대전화 번호 11자리를 입력해주세요.');
    } else {
      setPhoneError('');
    }
  };

  const isValidNotifyPhone = notifyPhone === '' || notifyPhone.replace(/\D/g, '').length === 11;

  const handleSave = () => {
    if (activeTab === 'basic' && !isFormValid) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('설정이 저장되었습니다.');
    }, 1000);
  };

  const dayLabels: Record<DayKey, string> = {
    monday: '월요일',
    tuesday: '화요일',
    wednesday: '수요일',
    thursday: '목요일',
    friday: '금요일',
    saturday: '토요일',
    sunday: '일요일',
    holiday: '공휴일',
  };

  const dayKeys: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'holiday'];

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      <HideTimePickerIcon />
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col gap-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Settings className="text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">약국 설정</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1 ml-8">
              약국 기본 정보와 운영 시간을 관리합니다.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 -mb-4 mt-2">
          {[
            { id: 'basic', label: '기본 정보', icon: Store },
            { id: 'reminder', label: '복약 알림 기본 설정', icon: Bell },
            { id: 'app', label: '앱 처방전 설정', icon: Smartphone },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={clsx(
                "flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all relative",
                activeTab === tab.id
                  ? "text-blue-600 font-bold"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          ))}
        </div>
      </header>

          {/* ── 기본 정보 탭 ── */}
          {activeTab === 'basic' && (
            <section className="space-y-5 animate-in fade-in duration-300 px-6 py-5 overflow-y-auto">
              <div className="flex justify-end">
                <SaveBtn disabled={!isFormValid} loading={loading} onClick={handleSave} />
              </div>

              <SectionCard icon={Store} title="기본 정보">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                      약국명 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="약국 이름을 입력하세요"
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5">
                      약국 주소 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2 mb-2">
                      <div className="relative flex-1">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          readOnly
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="주소 검색 버튼을 눌러 검색하세요"
                          onClick={() => setShowAddressModal(true)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddressModal(true)}
                        className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 border border-gray-200"
                      >
                        <Search size={16} />
                        주소 검색
                      </button>
                    </div>
                    <input
                      type="text"
                      name="addressDetail"
                      value={formData.addressDetail}
                      onChange={handleChange}
                      disabled={!formData.address}
                      className={clsx(
                        'w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
                        !formData.address ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-300'
                      )}
                      placeholder="상세 주소를 입력하세요 (동/호수, 층 등)"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                      약국 전화 번호 <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={hidePhone}
                        className={clsx(
                          'w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
                          hidePhone ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-300'
                        )}
                        placeholder="예) 02-1234-5678"
                      />
                      {!formData.phone.trim() && !hidePhone && (
                        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <Info size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-amber-700 leading-relaxed">
                            약국 전화 번호를 입력하지 않으면 고객이 앱에서 전화 문의를 할 수 없습니다.<br />
                            번호를 노출하고 싶지 않으시면 아래 <strong>'번호 노출 안 함'</strong> 체크박스를 선택해주세요.
                          </p>
                        </div>
                      )}
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={hidePhone}
                          onChange={(e) => setHidePhone(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <EyeOff size={14} className="text-gray-400" />
                          번호 노출 안 함
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="fax" className="block text-sm font-medium text-gray-700 mb-1.5">
                      약국 Fax 번호
                    </label>
                    <input
                      type="text"
                      id="fax"
                      name="fax"
                      value={formData.fax}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="예) 02-1234-5679"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label htmlFor="intro" className="block text-sm font-medium text-gray-700">
                        인사말
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="text-xs flex items-center gap-1 text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-100 px-2 py-1 rounded transition-colors"
                      >
                        <Sparkles size={12} />
                        {showTemplates ? '인사말 추천 닫기' : '인사말 추천'}
                      </button>
                    </div>
                    {showTemplates && (
                      <div className="mb-3 grid gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
                        {[
                          { label: '😊 친절/미소', text: '안녕하세요! 언제나 밝은 미소로 맞이하고, 정확한 복약 지도를 위해 최선을 다하는 약국입니다. 궁금한 점은 언제든 물어봐주세요.' },
                          { label: '🏥 전문성/신뢰', text: '환자분들의 건강을 최우선으로 생각합니다. 전문적인 지식을 바탕으로 꼼꼼하게 상담해 드리며, 믿을 수 있는 약국이 되겠습니다.' },
                          { label: '🏡 이웃/지역', text: '우리 동네 건강 지킴이, 약국입니다. 가족처럼 따뜻하게 상담해 드리며, 365일 여러분의 건강을 책임지겠습니다.' }
                        ].map((template, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFormData({ ...formData, intro: template.text })}
                            className="text-left p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all group"
                          >
                            <span className="block text-xs font-bold text-gray-700 mb-1 group-hover:text-blue-700">{template.label}</span>
                            <p className="text-xs text-gray-500 line-clamp-1 group-hover:text-blue-600">{template.text}</p>
                          </button>
                        ))}
                      </div>
                    )}
                    <textarea
                      id="intro"
                      name="intro"
                      value={formData.intro}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="고객들에게 보여질 약국 인사말을 작성해주세요."
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">{formData.intro.length} / 200자</p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                icon={Clock}
                title="영업 시간 설정"
                headerRight={
                  <button
                    onClick={applyMondayToWeekdays}
                    className="text-xs text-blue-600 font-medium hover:bg-blue-50 px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 border border-transparent hover:border-blue-100"
                  >
                    <Copy size={14} />
                    월요일 시간을 평일에 모두 적용
                  </button>
                }
              >
                <div className="space-y-3">
                  {dayKeys.map((day) => (
                    <div key={day} className={clsx(
                      "flex items-center gap-4 py-3.5 px-6 rounded-2xl border transition-all duration-200 group",
                      formData.hours[day].active
                        ? "bg-white border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 shadow-sm"
                        : "bg-gray-50/50 border-transparent border-dashed"
                    )}>
                      <div className="flex items-center gap-3 w-32 flex-shrink-0">
                        <input
                          type="checkbox"
                          id={`check-${day}`}
                          checked={formData.hours[day].active}
                          onChange={() => toggleDay(day)}
                          className="w-5 h-5 text-blue-600 rounded-md border-gray-300 focus:ring-blue-500 cursor-pointer transition-transform group-hover:scale-105"
                        />
                        <label htmlFor={`check-${day}`} className={clsx(
                          "font-bold text-[15px] cursor-pointer transition-colors",
                          formData.hours[day].active ? "text-gray-900" : "text-gray-400"
                        )}>
                          {dayLabels[day]}
                        </label>
                      </div>
                      <div className="flex items-center flex-1 gap-4">
                        {formData.hours[day].active ? (
                          <div className="flex items-center w-full">
                            <div className="flex items-center gap-2 w-[240px] flex-shrink-0">
                              <div className="relative flex-shrink-0">
                                <input type="time" value={formData.hours[day].start} onChange={(e) => handleTimeChange(day, 'start', e.target.value)} className="pl-3 pr-8 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-[13px] w-[110px] font-semibold text-gray-700 transition-all cursor-pointer" />
                                <Clock size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                              </div>
                              <span className="text-gray-300 font-medium">—</span>
                              <div className="relative flex-shrink-0">
                                <input type="time" value={formData.hours[day].end} onChange={(e) => handleTimeChange(day, 'end', e.target.value)} className="pl-3 pr-8 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-[13px] w-[110px] font-semibold text-gray-700 transition-all cursor-pointer" />
                                <Clock size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                              </div>
                            </div>
                            <div className="flex-1 flex justify-center px-4">
                              <div className="h-6 w-px bg-gray-100 relative"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-gray-200"></div></div>
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0 justify-end">
                              <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                                <input type="checkbox" checked={formData.hours[day].hasLunch} onChange={(e) => handleTimeChange(day, 'hasLunch', e.target.checked)} className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500" />
                                <span className={clsx("text-[12px] font-bold px-2 py-0.5 rounded transition-all", formData.hours[day].hasLunch ? "bg-orange-50 text-orange-600 border border-orange-100" : "text-gray-400 border border-transparent")}>점심 시간</span>
                              </label>
                              <div className={clsx("flex items-center gap-2 transition-all duration-300", !formData.hours[day].hasLunch && "opacity-20 pointer-events-none grayscale blur-[1px]")}>
                                <div className="relative flex-shrink-0">
                                  <input type="time" value={formData.hours[day].lunchStart} onChange={(e) => handleTimeChange(day, 'lunchStart', e.target.value)} className="pl-3 pr-8 py-2 border border-orange-100 bg-orange-50/20 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-[13px] w-[110px] font-semibold text-gray-700 transition-all cursor-pointer" />
                                  <Clock size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-orange-300 pointer-events-none" />
                                </div>
                                <span className="text-orange-200 text-xs">~</span>
                                <div className="relative flex-shrink-0">
                                  <input type="time" value={formData.hours[day].lunchEnd} onChange={(e) => handleTimeChange(day, 'lunchEnd', e.target.value)} className="pl-3 pr-8 py-2 border border-orange-100 bg-orange-50/20 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-[13px] w-[110px] font-semibold text-gray-700 transition-all cursor-pointer" />
                                  <Clock size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-orange-300 pointer-events-none" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex justify-center py-2 bg-gray-100/30 rounded-xl border border-dotted border-gray-200">
                            <span className="text-[13px] text-gray-400 font-bold tracking-[0.2em]">휴무일</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* ── 약 전달 방법 선택 ── */}
              <SectionCard icon={Store} title="약 전달 방법 선택">
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    고객이 선택할 수 있는 수령 방법을 설정합니다. 선택한 방법만 앱에서 노출됩니다.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-1">
                    {(([
                      { key: 'self',   label: '본인 수령' },
                      { key: 'family', label: '가족 수령' },
                      { key: 'quick',  label: '퀵' },
                      { key: 'parcel', label: '택배' },
                      { key: 'cod',    label: '착불 배송(약국 자체배송)' },
                    ]) as { key: keyof typeof deliveryMethods; label: string }[]).map(({ key, label }) => (
                      <label
                        key={key}
                        className={clsx(
                          'flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 cursor-pointer select-none transition-all duration-150',
                          deliveryMethods[key]
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                        )}
                      >
                        <div
                          className={clsx(
                            'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors',
                            deliveryMethods[key] ? 'bg-blue-500' : 'border-2 border-gray-300 bg-white'
                          )}
                        >
                          {deliveryMethods[key] && (
                            <Check size={12} strokeWidth={3} className="text-white" />
                          )}
                        </div>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={deliveryMethods[key]}
                          onChange={() =>
                            setDeliveryMethods(prev => ({ ...prev, [key]: !prev[key] }))
                          }
                        />
                        <span className="text-sm font-medium">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </SectionCard>
            </section>
          )}

          {/* ── 앱 처방전 설정 탭 ── */}
          {activeTab === 'app' && (
            <section className="space-y-5 animate-in fade-in duration-300 px-6 py-5 overflow-y-auto">
              <div className="flex justify-end">
                <SaveBtn disabled={allowAppPrescription && !isValidNotifyPhone} loading={loading} onClick={handleSave} />
              </div>

              <SectionCard icon={Smartphone} title="앱 처방전 접수 설정">
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-1">앱 처방전 접수 허용</p>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        웰체크 앱 사용자가 처방전을 촬영하여 이 약국으로 접수할 수 있도록 허용합니다.
                        허용 시 <span className="text-blue-600 font-medium">[웰체크 앱] &gt; [약국 찾기]</span>에서 처방전 접수 가능 약국으로 표시됩니다.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={allowAppPrescription}
                      onClick={() => setAllowAppPrescription(!allowAppPrescription)}
                      className={clsx(
                        'relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                        allowAppPrescription ? 'bg-blue-600 shadow-inner shadow-blue-800' : 'bg-gray-300'
                      )}
                    >
                      <span className={clsx('inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 border border-gray-100', allowAppPrescription ? 'translate-x-8' : 'translate-x-1')} />
                    </button>
                  </div>

                  {allowAppPrescription && (
                    <div className="pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500">
                      <label htmlFor="notifyPhone" className="block text-sm font-medium text-gray-700 mb-1.5">
                        알림 수신 휴대전화 번호
                      </label>
                      <input
                        ref={notifyPhoneRef}
                        type="tel"
                        id="notifyPhone"
                        inputMode="numeric"
                        value={notifyPhone}
                        onChange={handleNotifyPhoneChange}
                        placeholder="휴대전화 번호를 입력하세요 (예: 010-1234-5678)"
                        className={clsx(
                          'w-full max-w-sm px-4 py-2.5 bg-white border rounded-lg focus:ring-2 focus:border-transparent transition-all text-sm placeholder:text-gray-300',
                          phoneError
                            ? 'border-red-400 focus:ring-red-400'
                            : 'border-gray-300 focus:ring-blue-500'
                        )}
                      />
                      {phoneError ? (
                        <p className="mt-1.5 text-xs text-red-500">{phoneError}</p>
                      ) : (
                        <div className="mt-2 flex items-start gap-1.5 text-gray-400">
                          <Info size={13} className="mt-0.5 flex-shrink-0" />
                          <p className="text-xs leading-relaxed">고객이 앱에서 처방전을 전송했을 때 즉시 카카오 알림톡을 전송받을 번호입니다.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </SectionCard>
            </section>
          )}

          {/* ── 복약 알림 기본 설정 탭 ── */}
          {activeTab === 'reminder' && (
            <section className="space-y-5 animate-in fade-in duration-300 px-6 py-5 overflow-y-auto">
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleReminderReset}
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RotateCcw size={14} />
                  초기화
                </button>
                <button
                  type="button"
                  onClick={handleReminderSave}
                  disabled={reminderSaved}
                  className={clsx(
                    'flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-colors shadow-sm',
                    reminderSaved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                  )}
                >
                  {reminderSaved ? <><Check size={16} />저장 완료!</> : <><Save size={16} />설정 저장</>}
                </button>
              </div>

              <SectionCard icon={Bell} title="복용 횟수별 기본 설정">
                <div className="space-y-0">
                  <div className="grid grid-cols-2 gap-6 pb-6 mb-6 border-b border-gray-100">
                    {[
                      { label: '복용 횟수 4회 버튼', desc: "복용 횟수 선택에 '4회' 버튼을 추가합니다", checked: showFourTimes, onChange: () => setShowFourTimes(v => !v) },
                      { label: '식후 30분 버튼', desc: "복용 시점 선택에 '식후 30분' 버튼을 표시합니다", checked: showAfterMeal30, onChange: () => setShowAfterMeal30(v => !v) },
                    ].map(t => (
                      <div key={t.label} className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">{t.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                        </div>
                        <button type="button" role="switch" aria-checked={t.checked} onClick={t.onChange}
                          className={clsx('relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1', t.checked ? 'bg-blue-600' : 'bg-gray-200')}>
                          <span className={clsx('inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform', t.checked ? 'translate-x-6' : 'translate-x-1')} />
                        </button>
                      </div>
                    ))}
                  </div>
                  {displayedFreq.map((setting, idx) => (
                    <div key={setting.count} className={clsx('flex gap-4 py-4', idx < displayedFreq.length - 1 && 'border-b border-dashed border-gray-100')}>
                      <div className="w-14 shrink-0 flex flex-col items-center pt-1">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full text-blue-600 bg-blue-50 text-[15px] font-medium">{setting.count}회</span>
                      </div>
                      <div className="flex-1 flex items-start gap-6">
                        <div>
                          <label className="block mb-2 text-xs font-medium text-gray-500 tracking-wide">복용 시간</label>
                          <div className="flex gap-2 flex-wrap">
                            {TIME_OPTIONS.map(time => (
                              <button key={time} type="button" onClick={() => toggleFreqTime(setting.count, time)}
                                className={clsx('px-4 py-[7px] border transition-all text-[13px] font-medium rounded-md', setting.defaultTimes.includes(time) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600')}
                              >{time}</button>
                            ))}
                          </div>
                          {setting.defaultTimes.length !== setting.count && (
                            <p className="mt-1.5 text-red-500 text-[11px] font-medium">복용 시간을 {setting.count}개 선택해주세요 (현재 {setting.defaultTimes.length}개)</p>
                          )}
                        </div>
                        <div>
                          <label className="block mb-2 text-xs font-medium text-gray-500 tracking-wide">복용 시점</label>
                          <div className="flex gap-2 flex-wrap">
                            {visibleRelations.map(rel => (
                              <button key={rel} type="button" onClick={() => setFreqRelation(setting.count, rel)}
                                className={clsx('px-4 py-[7px] border transition-all text-[13px] font-medium rounded-md', setting.defaultRelation === rel ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600')}
                              >{rel}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard icon={Clock} title="웰체크 앱 전송 시간 설정">
                <div className="flex items-start gap-2 p-3 mb-4 rounded-lg border border-gray-100 bg-gray-50/70">
                  <Info size={13} className="mt-0.5 shrink-0 text-gray-400" />
                  <p className="text-xs text-gray-500 leading-relaxed">고객의 웰체크 앱으로 알림 설정이 전송될 때 기본값으로 사용됩니다. 고객이 앱에서 변경할 수 있습니다.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {timeMappings.map(mapping => (
                    <div key={mapping.label} className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 bg-white hover:border-blue-400 transition-colors">
                      <span className="text-sm font-medium text-gray-700">{mapping.label}</span>
                      <TimePicker value={mapping.defaultTime} onChange={v => updateTimeMapping(mapping.label, v)} />
                    </div>
                  ))}
                </div>
              </SectionCard>
            </section>
          )}

      {/* ── 주소 검색 모달 ── */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddressModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 flex flex-col overflow-hidden" style={{ maxHeight: '560px' }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">주소검색</h2>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Input */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                <input
                  type="text"
                  autoFocus
                  value={addressSearch}
                  onChange={e => handleAddressSearch(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Escape') setShowAddressModal(false); }}
                  className="flex-1 px-4 py-2.5 text-sm outline-none"
                  placeholder="예) 판교역로 166,  분당 주공,  백현동 532"
                />
                <div className="px-3 text-gray-400">
                  <Search size={18} />
                </div>
              </div>
            </div>

            {/* Results / Tip */}
            <div className="flex-1 overflow-y-auto">
              {addressResults.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {addressResults.map((item, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => handleAddressSelect(item)}
                        className="w-full text-left px-6 py-4 hover:bg-blue-50 transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <MapPin size={16} className="mt-0.5 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">{item.address}</p>
                            <p className="text-xs text-gray-400 mt-0.5">우편번호 {item.zipCode}</p>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : addressSearch.trim().length >= 2 ? (
                <div className="px-6 py-12 text-center text-gray-400 text-sm">
                  검색 결과가 없습니다.
                </div>
              ) : (
                <div className="px-6 py-8">
                  <p className="text-base font-bold text-gray-800 mb-2">tip</p>
                  <p className="text-sm text-gray-500 mb-6">아래와 같은 조합으로 검색을 하시면 더욱 정확한 결과가 검색됩니다.</p>
                  <dl className="space-y-4 text-sm">
                    {[
                      { term: '도로명 + 건물번호', examples: ['예) 판교역로 166', '제주 점단로 242'] },
                      { term: '지역명(동/리) + 번지', examples: ['예) 백현동 532', '제주 영평동 2181'] },
                      { term: '지역명(동/리) + 건물명(아파트명)', examples: ['예) 분당 주공', '연수동 주공3차'] },
                      { term: '사서함명 + 번호', examples: ['예) 분당우체국사서함 1~100'] },
                    ].map(({ term, examples }) => (
                      <div key={term}>
                        <dt className="font-medium text-gray-700">{term}</dt>
                        {examples.map(ex => (
                          <dd key={ex} className="text-blue-500 mt-0.5">{ex}</dd>
                        ))}
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
