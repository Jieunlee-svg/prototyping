import React, { useState } from 'react';
import { 
  Settings, 
  MapPin, 
  Clock, 
  Store, 
  Save, 
  Search,
  Copy,
  Sparkles,
  Smartphone,
  Info,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

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

  // 회원가입 시 입력받은 정보 (읽기 전용 또는 기본값으로 사용)
  const registeredInfo = {
    name: '웰체크약국',           // 수정 불가
    postcode: '03155',            // 우편번호 (수정 가능, 기본값)
    roadAddress: '서울특별시 종로구 종로 123',  // 도로명 주소 (수정 가능, 기본값)
    phone: '010-1234-5678',       // 알림 수신 번호 (수정 가능, 기본값)
  };

  const [address, setAddress] = useState({
    postcode: registeredInfo.postcode,
    road: registeredInfo.roadAddress,
    detail: '',  // 상세주소는 비어있을 수 있음
  });

  const [notifyPhone, setNotifyPhone] = useState(registeredInfo.phone);

  const [formData, setFormData] = useState({
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

  const isFormValid =
    address.road.trim() !== '' &&
    address.postcode.trim() !== '' &&
    notifyPhone.trim() !== '';

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
    if (!isFormValid) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('약국 설정이 저장되었습니다.');
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
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">약국 설정</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1 ml-8">
            약국 기본 정보와 운영 시간을 관리합니다.
          </p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={loading || !isFormValid}
          title={!isFormValid ? '필수 항목(주소, 알림 수신 번호)을 모두 입력해주세요.' : ''}
          className={`flex items-center gap-2 px-5 py-2.5 font-semibold rounded-lg transition-colors shadow-sm
            ${isFormValid && !loading
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
      </header>

      <div className="flex-1 overflow-auto p-6 pb-20">
        <div className="max-w-4xl mx-auto w-full space-y-6">
        
          {/* Basic Info Section */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Store size={18} className="text-gray-500" />
                기본 정보
              </h2>
            </div>
            <div className="p-6 space-y-6">

              {/* 약국명 — 읽기 전용 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  약국명
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    value={registeredInfo.name}
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 cursor-not-allowed pr-10"
                  />
                  <Lock size={14} className="absolute right-3 top-3.5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Info size={11} className="flex-shrink-0" />
                  약국명은 회원가입 시 등록된 정보로, 변경이 불가합니다.
                </p>
              </div>

              {/* 약국 주소 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  약국 주소 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {/* 우편번호 + 검색 버튼 */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={address.postcode}
                      onChange={(e) => setAddress(prev => ({ ...prev, postcode: e.target.value }))}
                      placeholder="우편번호"
                      className="w-36 px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    />
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 border border-gray-200 text-sm"
                    >
                      <Search size={15} />
                      주소 검색
                    </button>
                  </div>

                  {/* 도로명 주소 */}
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={address.road}
                      onChange={(e) => setAddress(prev => ({ ...prev, road: e.target.value }))}
                      placeholder="도로명 주소"
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    />
                  </div>

                  {/* 상세주소 */}
                  <input
                    type="text"
                    value={address.detail}
                    onChange={(e) => setAddress(prev => ({ ...prev, detail: e.target.value }))}
                    placeholder="상세주소 입력 (예: 2층 201호) — 선택사항"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm placeholder-gray-400"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                  <Info size={11} className="flex-shrink-0" />
                  우편번호와 도로명 주소는 회원가입 시 등록된 정보가 기본으로 입력되어 있습니다.
                </p>
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
                        className="text-left p-2.5 rounded-lg border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all group"
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
                  onChange={(e) => setFormData(prev => ({ ...prev, intro: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="고객들에게 보여질 약국 인사말을 작성해주세요."
                />
                <p className="text-xs text-gray-500 mt-1 text-right">{formData.intro.length} / 200자</p>
              </div>
            </div>
          </section>

          {/* Operating Hours Section */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock size={18} className="text-gray-500" />
                영업 시간 설정
              </h2>
              <button 
                onClick={applyMondayToWeekdays}
                className="text-xs text-blue-600 font-medium hover:bg-blue-50 px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 border border-transparent hover:border-blue-100"
                title="월요일의 시간 설정을 화~금요일에도 동일하게 적용합니다"
              >
                <Copy size={14} />
                월요일 시간을 평일에 모두 적용
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-1">
                {dayKeys.map((day) => (
                  <div key={day} className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 w-32">
                      <input 
                        type="checkbox" 
                        id={`check-${day}`}
                        checked={formData.hours[day].active}
                        onChange={() => toggleDay(day)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor={`check-${day}`} className={`font-medium cursor-pointer ${formData.hours[day].active ? 'text-gray-900' : 'text-gray-400'}`}>
                        {dayLabels[day]}
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-4 flex-1 justify-end">
                      {formData.hours[day].active ? (
                        <>
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={formData.hours[day].start}
                              onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                              className="px-2 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm w-28"
                            />
                            <span className="text-gray-400">~</span>
                            <input
                              type="time"
                              value={formData.hours[day].end}
                              onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                              className="px-2 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm w-28"
                            />
                          </div>

                          <div className="h-4 w-px bg-gray-200 mx-2"></div>

                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              id={`lunch-${day}`}
                              checked={formData.hours[day].hasLunch}
                              onChange={(e) => handleTimeChange(day, 'hasLunch', e.target.checked)}
                              className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500 cursor-pointer"
                            />
                            <label htmlFor={`lunch-${day}`} className="text-sm text-gray-600 mr-2 cursor-pointer select-none">
                              점심 시간
                            </label>
                            
                            {formData.hours[day].hasLunch && (
                              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                                <input
                                  type="time"
                                  value={formData.hours[day].lunchStart}
                                  onChange={(e) => handleTimeChange(day, 'lunchStart', e.target.value)}
                                  className="px-2 py-1.5 border border-orange-200 bg-orange-50/30 rounded-md focus:ring-orange-500 focus:border-orange-500 text-sm w-28 text-gray-700"
                                />
                                <span className="text-gray-400">~</span>
                                <input
                                  type="time"
                                  value={formData.hours[day].lunchEnd}
                                  onChange={(e) => handleTimeChange(day, 'lunchEnd', e.target.value)}
                                  className="px-2 py-1.5 border border-orange-200 bg-orange-50/30 rounded-md focus:ring-orange-500 focus:border-orange-500 text-sm w-28 text-gray-700"
                                />
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400 font-medium px-4 py-2 bg-gray-100 rounded-md w-full text-center">
                          휴무
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* App Prescription Section */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Smartphone size={18} className="text-gray-500" />
                웰체크 앱으로 처방전 받기 허용
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    앱 처방전 접수 허용
                  </p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    웰체크 앱 사용자가 처방전을 촬영하여 이 약국으로 접수할 수 있도록 허용합니다.<br />
                    허용 시 [웰체크 앱] &gt; [약국 찾기]에서 처방전 접수 가능 약국으로 표시됩니다.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={allowAppPrescription}
                  onClick={() => setAllowAppPrescription(!allowAppPrescription)}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                    allowAppPrescription ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                      allowAppPrescription ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* 알림 수신 휴대폰 번호 */}
              {allowAppPrescription && (
                <div className="mt-6 pt-6 border-t border-gray-200 animate-in fade-in slide-in-from-top-1 duration-200">
                  <label htmlFor="notifyPhone" className="block text-sm font-medium text-gray-900 mb-1">
                    알림 수신 휴대폰 번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="notifyPhone"
                    value={notifyPhone}
                    onChange={(e) => setNotifyPhone(e.target.value)}
                    placeholder="알림톡을 받을 휴대폰 번호를 입력하세요"
                    className={`w-full max-w-xs px-4 py-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${
                      notifyPhone.trim() === '' ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    고객이 앱에서 처방전을 전송했을 때 알림톡을 받을 수 있습니다.<br />
                    <span className="text-gray-400">회원가입 시 등록한 번호가 기본으로 입력되어 있습니다.</span>
                  </p>
                  {notifyPhone.trim() === '' && (
                    <div className="flex items-start gap-2 p-3 mt-2 bg-amber-50 border border-amber-200 rounded-lg">
                      <Info size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-700 leading-relaxed">
                        알림 수신 번호를 입력해야 앱 처방전 접수 알림을 받을 수 있습니다.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
