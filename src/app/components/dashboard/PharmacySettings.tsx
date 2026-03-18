import React, { useState } from 'react';
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
  EyeOff
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

export const PharmacySettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [allowAppPrescription, setAllowAppPrescription] = useState(true);
  const [hidePhone, setHidePhone] = useState(false);
  const [notifyPhone, setNotifyPhone] = useState('');
  const [formData, setFormData] = useState({
    name: '약국',
    phone: '02-1234-5678',
    address: '서울특별시 종로구 종로 123 (종로3가)',
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

  const [activeTab, setActiveTab] = useState<'basic' | 'hours' | 'app'>('basic');

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

  const SaveButton = ({ disabled = false }: { disabled?: boolean }) => (
    <div className="pt-6 border-t border-gray-100 flex justify-end">
      <button
        onClick={handleSave}
        disabled={loading || disabled}
        className={`flex items-center gap-2 px-6 py-2.5 font-semibold rounded-lg transition-colors shadow-sm
          ${!disabled && !loading
            ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
      >
        {loading ? (
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
    </div>
  );

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
            { id: 'hours', label: '영업 시간 설정', icon: Clock },
            { id: 'app', label: '앱 처방전 설정', icon: Smartphone },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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

      <div className="flex-1 overflow-auto p-6 pb-20">
        <div className="max-w-5xl mx-auto w-full">
        
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-300">
              <div className="p-8 space-y-8">
                {/* 약국명 */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
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

                {/* 약국 주소 */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    약국 주소 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="주소를 검색해주세요"
                      />
                    </div>
                    <button 
                      type="button"
                      className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 border border-gray-200"
                    >
                      <Search size={16} />
                      주소 검색
                    </button>
                  </div>
                </div>

                {/* 약국 번호 */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    약국 번호 {!hidePhone && <span className="text-red-500">*</span>}
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={hidePhone}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                        ${hidePhone ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-300'}`}
                      placeholder="약국 전화번호를 입력하세요 (예: 02-1234-5678)"
                    />
                    {/* 번호 없을 때 안내 */}
                    {!formData.phone.trim() && !hidePhone && (
                      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <Info size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-700 leading-relaxed">
                          약국 번호를 입력하지 않으면 고객이 앱에서 전화 문의를 할 수 없습니다.<br />
                          번호를 노출하고 싶지 않으시면 아래 <strong>'번호 노출 안 함'</strong> 체크박스를 선택해주세요.
                        </p>
                      </div>
                    )}
                    {/* 노출 안 함 토글 */}
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

                {/* 인사말 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
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
                    <div className="mb-4 grid gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
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
                  <p className="text-xs text-gray-500 mt-1 text-right">{formData.intro.length} / 200자</p>
                </div>

                <SaveButton disabled={!isFormValid} />
              </div>
            </section>
          )}

          {/* Operating Hours Tab */}
          {activeTab === 'hours' && (
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-300">
              <div className="px-8 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock size={18} className="text-gray-500" />
                  영업 시간 설정
                </h2>
                <button 
                  onClick={applyMondayToWeekdays}
                  className="text-xs text-blue-600 font-medium hover:bg-blue-50 px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 border border-transparent hover:border-blue-100"
                >
                  <Copy size={14} />
                  월요일 시간을 평일에 모두 적용
                </button>
              </div>
              <div className="p-8">
                <div className="space-y-3">
                  {dayKeys.map((day) => (
                    <div key={day} className={clsx(
                      "flex items-center gap-4 py-3.5 px-6 rounded-2xl border transition-all duration-200 group",
                      formData.hours[day].active 
                        ? "bg-white border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 shadow-sm" 
                        : "bg-gray-50/50 border-transparent border-dashed"
                    )}>
                      {/* Day Selector */}
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

                      {/* Content Area */}
                      <div className="flex items-center flex-1 gap-4">
                        {formData.hours[day].active ? (
                          <div className="flex items-center w-full">
                            {/* Operating Hours: Fixed Width Section */}
                            <div className="flex items-center gap-2 w-[240px] flex-shrink-0">
                              <div className="relative flex-shrink-0">
                                <input
                                  type="time"
                                  value={formData.hours[day].start}
                                  onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                                  className="pl-3 pr-8 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-[13px] w-[110px] font-semibold text-gray-700 transition-all cursor-pointer"
                                />
                                <Clock size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                              </div>
                              <span className="text-gray-300 font-medium">—</span>
                              <div className="relative flex-shrink-0">
                                <input
                                  type="time"
                                  value={formData.hours[day].end}
                                  onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                                  className="pl-3 pr-8 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-[13px] w-[110px] font-semibold text-gray-700 transition-all cursor-pointer"
                                />
                                <Clock size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                              </div>
                            </div>

                            {/* Center Separator with Dot */}
                            <div className="flex-1 flex justify-center px-4">
                              <div className="h-6 w-px bg-gray-100 relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-gray-200"></div>
                              </div>
                            </div>

                            {/* Lunch Break: Aligned Right */}
                            <div className="flex items-center gap-4 flex-shrink-0 justify-end">
                              <label className="flex items-center gap-2 cursor-pointer group/lunch whitespace-nowrap">
                                <input 
                                  type="checkbox" 
                                  checked={formData.hours[day].hasLunch}
                                  onChange={(e) => handleTimeChange(day, 'hasLunch', e.target.checked)}
                                  className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                                />
                                <span className={clsx(
                                  "text-[12px] font-bold px-2 py-0.5 rounded transition-all",
                                  formData.hours[day].hasLunch 
                                    ? "bg-orange-50 text-orange-600 border border-orange-100" 
                                    : "text-gray-400 border border-transparent"
                                )}>
                                  점심 시간
                                </span>
                              </label>
                              
                              <div className={clsx(
                                "flex items-center gap-2 transition-all duration-300",
                                !formData.hours[day].hasLunch && "opacity-20 pointer-events-none grayscale blur-[1px]"
                              )}>
                                <div className="relative flex-shrink-0">
                                  <input
                                    type="time"
                                    value={formData.hours[day].lunchStart}
                                    onChange={(e) => handleTimeChange(day, 'lunchStart', e.target.value)}
                                    className="pl-3 pr-8 py-2 border border-orange-100 bg-orange-50/20 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-[13px] w-[110px] font-semibold text-gray-700 transition-all cursor-pointer"
                                  />
                                  <Clock size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-orange-300 pointer-events-none" />
                                </div>
                                <span className="text-orange-200 text-xs">~</span>
                                <div className="relative flex-shrink-0">
                                  <input
                                    type="time"
                                    value={formData.hours[day].lunchEnd}
                                    onChange={(e) => handleTimeChange(day, 'lunchEnd', e.target.value)}
                                    className="pl-3 pr-8 py-2 border border-orange-100 bg-orange-50/20 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-[13px] w-[110px] font-semibold text-gray-700 transition-all cursor-pointer"
                                  />
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

                <SaveButton />
              </div>
            </section>
          )}

          {/* App Prescription Tab */}
          {activeTab === 'app' && (
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-300">
              <div className="p-10">
                <div className="flex items-start justify-between gap-8 bg-blue-50/30 p-8 rounded-2xl border border-blue-100/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <Smartphone size={20} className="text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        앱 처방전 접수 허용
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed max-w-xl ml-11">
                      웰체크 앱 사용자가 처방전을 촬영하여 이 약국으로 접수할 수 있도록 허용합니다.
                      허용 시 <span className="text-blue-600 font-bold">[웰체크 앱] &gt; [약국 찾기]</span>에서 처방전 접수 가능 약국으로 표시됩니다.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={allowAppPrescription}
                    onClick={() => setAllowAppPrescription(!allowAppPrescription)}
                    className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      allowAppPrescription ? 'bg-blue-600 shadow-inner shadow-blue-800' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 border border-gray-100 ${
                        allowAppPrescription ? 'translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {allowAppPrescription && (
                  <div className="mt-10 space-y-6 pt-10 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div>
                      <label htmlFor="notifyPhone" className="block text-sm font-bold text-gray-900 mb-2">
                        알림 수신 휴대폰 번호
                      </label>
                      <input
                        type="tel"
                        id="notifyPhone"
                        value={notifyPhone}
                        onChange={(e) => setNotifyPhone(e.target.value)}
                        placeholder="010-0000-0000"
                        className="w-full max-w-xs px-5 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-[15px] font-medium placeholder:text-gray-300"
                      />
                      <div className="mt-3 flex items-start gap-2 text-gray-500">
                        <Info size={14} className="mt-0.5" />
                        <p className="text-xs leading-relaxed font-medium">
                          고객이 앱에서 처방전을 전송했을 때 즉시 카카오 알림톡을 전송받을 번호입니다.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-10">
                  <SaveButton />
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
