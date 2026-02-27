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
  Smartphone
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
  const [formData, setFormData] = useState({
    name: '서울종로약국',
    phone: '02-1234-5678',
    address: '서울특별시 종로구 종로 123 (종로3가)',
    intro: '안녕하세요. 서울종로약국입니다. 정성을 다해 상담해드립니다.',
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
    setLoading(true);
    // Simulate API call
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
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
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
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  약국명
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="약국 이름을 입력하세요"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  약국 번호
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="약국 전화번호를 입력하세요"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  약국 위치 (주소)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="주소를 검색해주세요"
                    />
                  </div>
                  <button 
                    type="button"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 border border-gray-200"
                  >
                    <Search size={16} />
                    주소 검색
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="intro" className="block text-sm font-medium text-gray-700">
                    약국 소개
                  </label>
                  <button 
                    type="button"
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="text-xs flex items-center gap-1 text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-100 px-2 py-1 rounded transition-colors"
                  >
                    <Sparkles size={12} />
                    {showTemplates ? '소개 메시지 닫기' : '소개 메시지 추천'}
                  </button>
                </div>

                {showTemplates && (
                  <div className="mb-3 grid gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
                    {[
                      { label: '😊 친절/미소', text: '안녕하세요! 언제나 밝은 미소로 맞이하고, 정확한 복약 지도를 위해 최선을 다하는 서울종로약국입니다. 궁금한 점은 언제든 물어봐주세요.' },
                      { label: '🏥 전문성/신뢰', text: '환자분들의 건강을 최우선으로 생각합니다. 전문적인 지식을 바탕으로 꼼꼼하게 상담해 드리며, 믿을 수 있는 약국이 되겠습니다.' },
                      { label: '🏡 이웃/지역', text: '우리 동네 건강 지킴이, 서울종로약국입니다. 가족처럼 따뜻하게 상담해 드리며, 365일 여러분의 건강을 책임지겠습니다.' }
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
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="고객들에게 보여질 약국 소개글을 작성해주세요."
                />
                <p className="text-xs text-gray-500 mt-1 text-right">0 / 200자</p>
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
              <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start gap-3">
                <Check className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                <p className="text-sm text-blue-800">
                  이 설정은 [웰체크 앱] &gt; [약국 찾기]에 반영됩니다.
                </p>
              </div>
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

              {allowAppPrescription && (
                <div className="mt-4 bg-blue-50 p-4 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Check className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                  <p className="text-sm text-blue-800">
                    현재 웰체크 앱에서 처방전 접수가 <strong>허용</strong>된 상태입니다.
                  </p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <label htmlFor="notifyPhone" className="block text-sm font-medium text-gray-900 mb-1">
                  알림 수신 휴대폰 번호
                </label>
                <input
                  type="tel"
                  id="notifyPhone"
                  placeholder="010-0000-0000"
                  className="w-full max-w-xs px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  휴대폰 번호를 입력하면 고객이 앱에서 처방전을 전송 했을 때 알림톡을 받을 수 있습니다.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
