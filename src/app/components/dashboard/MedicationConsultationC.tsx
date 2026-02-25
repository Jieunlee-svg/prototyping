import React, { useState, useEffect } from 'react';
import { Search, X, Plus, Phone, Send, User, ChevronRight, Trash2, Bell, Clock, Info, CheckCircle, AlertCircle, Smartphone, Users, Calendar as CalendarIcon, Pill, FileText, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// --- Types ---
interface DrugInfo {
  code: string;
  name: string;
  company: string;
  category: string;
  shape: string;
  color: string;
  imageUrl: string;
  effect: string;
  usage: string;
  precautions: string;
}

interface ReminderSettings {
  frequency: number; // 1, 2, 3
  times: string[]; // '아침', '점심', '저녁', '취침전'
  relation: string; // '식후 30분', '식전', '식후 즉시'
}

// --- Mock Data ---
const MOCK_DRUG_DB: DrugInfo[] = [
  {
    code: '201403634',
    name: '케이페리정 50mg',
    company: '(주)제뉴원사이언스',
    category: '골격근이완제',
    shape: '원형',
    color: '하양',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=200&h=200',
    effect: '근골격계 질환에 수반하는 동통성 근육연축',
    usage: '성인 : 1회 1정, 1일 3회 식후에 경구투여',
    precautions: '간장애 환자, 신장애 환자 신중 투여'
  },
  {
    code: '199000001',
    name: '타이레놀정 500mg',
    company: '(주)한국얀센',
    category: '해열진통제',
    shape: '장방형',
    color: '하양',
    imageUrl: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&q=80&w=200&h=200',
    effect: '해열 및 진통',
    usage: '1회 1~2정씩 1일 3~4회',
    precautions: '매일 3잔 이상 술을 마시는 경우 의사와 상의'
  },
  {
    code: '200502341',
    name: '노바스크정 5mg',
    company: '한국화이자제약(주)',
    category: '혈압강하제',
    shape: '팔각형',
    color: '하양',
    imageUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=200&h=200',
    effect: '고혈압, 관상동맥의 고정폐쇄',
    usage: '1일 1회 5mg',
    precautions: '임부 또는 임신하고 있을 가능성이 있는 부인 금기'
  },
  {
    code: '202001234',
    name: '가스모틴정 5mg',
    company: '대웅제약',
    category: '소화기관용약',
    shape: '장방형',
    color: '하양',
    imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=200&h=200',
    effect: '기능성소화불량으로 인한 소화기증상',
    usage: '1일 3회 식전 또는 식후',
    precautions: '이 약은 유당을 함유하고 있음'
  },
  {
    code: '202105678',
    name: '아스피린프로텍트정 100mg',
    company: '바이엘코리아',
    category: '동맥경화용제',
    shape: '원형',
    color: '하양',
    imageUrl: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=200&h=200',
    effect: '혈전 생성 억제',
    usage: '1일 1회 1정',
    precautions: '위장관 출혈 환자 금기'
  }
];

const FullDrugListModal = ({ 
  isOpen, 
  onClose, 
  onSelect,
  selectedCodes
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSelect: (drug: DrugInfo) => void;
  selectedCodes: string[];
}) => {
  const [query, setQuery] = useState('');
  
  if (!isOpen) return null;

  const filteredDrugs = MOCK_DRUG_DB.filter(d => 
    d.name.includes(query) || d.company.includes(query)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
              <Pill className="w-5 h-5" />
            </div>
            전체 약품 리스트
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="약품명, 성분명, 제약사, 증상, 모양, 색깔로 검색"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 bg-gray-50/50">
          <div className="grid grid-cols-1 gap-2">
            {filteredDrugs.map((drug) => {
              const isSelected = selectedCodes.includes(drug.code);
              return (
                <div 
                  key={drug.code} 
                  className={clsx(
                    "flex items-center gap-4 p-3 rounded-lg border transition-all",
                    isSelected 
                      ? "bg-blue-50 border-blue-200 opacity-70" 
                      : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm cursor-pointer"
                  )}
                  onClick={() => !isSelected && onSelect(drug)}
                >
                  <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                    <img src={drug.imageUrl} alt={drug.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 truncate">{drug.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200">{drug.category}</span>
                    </div>
                    <div className="text-xs text-gray-500 truncate">{drug.company} | {drug.shape} | {drug.color}</div>
                    <div className="text-xs text-gray-400 mt-1 truncate">{drug.effect}</div>
                  </div>
                  <div className="px-2">
                    {isSelected ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        <CheckCircle className="w-3.5 h-3.5" />
                        선택됨
                      </span>
                    ) : (
                      <button className="p-2 rounded-full hover:bg-blue-50 text-blue-600 transition-colors">
                        <Plus className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export const MedicationConsultationC = () => {
  // --- State ---
  const [medicines, setMedicines] = useState<DrugInfo[]>([]);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DrugInfo[]>([]);

  const [reminder, setReminder] = useState<ReminderSettings>({
    frequency: 3,
    times: ['아침', '점심', '저녁'],
    relation: '식후 30분'
  });

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [durationDays, setDurationDays] = useState<number>(7);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // --- Recipient State (From Plan B) ---
  const [recipientMode, setRecipientMode] = useState<'search' | 'direct'>('direct');
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [directPhone, setDirectPhone] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<{name: string, condition: string, phone: string, lastVisit: string} | null>(null);
  
  // App Notification Settings State
  const [sendAppReminder, setSendAppReminder] = useState(false);
  const [isAppUser, setIsAppUser] = useState<boolean | null>(null);

  const [pharmacyName, setPharmacyName] = useState('서울종로약국');

  const [message, setMessage] = useState('');

  const [isFullListOpen, setIsFullListOpen] = useState(false);

  // --- Effects ---
  
  // Check if user is app user (Mock)
  useEffect(() => {
    // Determine phone number based on mode
    const phoneToCheck = recipientMode === 'search' 
      ? (selectedPatient?.phone || '') 
      : directPhone;

    // Reset status when phone changes
    setIsAppUser(null);
    
    // Simulate API check with debounce
    const timer = setTimeout(() => {
      if (phoneToCheck.length >= 10) {
        // Mock logic: Ends with even number = App User
        const isUser = ['0', '2', '4', '6', '8'].includes(phoneToCheck.slice(-1));
        setIsAppUser(isUser);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [recipientMode, selectedPatient, directPhone]);

  // If user is not app user, auto-turn off app reminder
  // useEffect(() => {
  //   if (isAppUser === false) {
  //     setSendAppReminder(false);
  //   }
  // }, [isAppUser]);
  
  // Search Logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const results = MOCK_DRUG_DB.filter(d => 
      d.name.toLowerCase().includes(query) || 
      d.company.toLowerCase().includes(query) ||
      d.category.toLowerCase().includes(query)
    );
    setSearchResults(results);
  }, [searchQuery]);

  // Auto-generate message when medicines or reminder settings change
  useEffect(() => {
    if (medicines.length === 0) {
      setMessage('');
      return;
    }

    const medList = medicines.map((m, i) => `${i+1}. ${m.name} (${m.company})`).join('\n');
    const times = reminder.times.join(', ');
    const usage = `하루 ${reminder.frequency}번, ${times} ${reminder.relation}에 복용하세요.`;
    
    const precautions = medicines.map(m => `- ${m.name}: ${m.precautions}`).join('\n');

    const newMsg = `[복약 상담 안내]\n안녕하세요, ${pharmacyName}입니다.\n처방받으신 약품 안내드립니다.\n\n[처방 약품]\n${medList}\n\n[복약 알림 설정]\n${usage}\n\n[주의사항]\n${precautions}\n\n문의사항은 약국으로 연락주세요.`;
    
    setMessage(newMsg);
  }, [medicines, reminder, pharmacyName]);

  // --- Handlers ---
  const handleAddMedicine = (drug: DrugInfo) => {
    if (!medicines.find(m => m.code === drug.code)) {
      setMedicines([...medicines, drug]);
    }
    setSearchQuery(''); // Clear search after adding
  };

  const removeMedicine = (code: string) => {
    setMedicines(medicines.filter(m => m.code !== code));
  };

  const toggleTime = (time: string) => {
    if (reminder.times.includes(time)) {
      setReminder({ ...reminder, times: reminder.times.filter(t => t !== time) });
    } else {
      setReminder({ ...reminder, times: [...reminder.times, time] });
    }
  };

  return (
    <div className="flex h-full bg-background font-sans overflow-hidden">
      <FullDrugListModal 
        isOpen={isFullListOpen}
        onClose={() => setIsFullListOpen(false)}
        onSelect={handleAddMedicine}
        selectedCodes={medicines.map(m => m.code)}
      />

      {/* Left Column: Medication Selection & Reminder */}
      <div className="w-[500px] flex flex-col border-r border-border bg-gray-50/30 flex-shrink-0 h-full overflow-hidden">
        <div className="p-5 border-b border-border bg-white flex-shrink-0">
                      <div className="flex items-center">
              <Pill className="mr-2 text-primary w-5 h-5" />
              <h1 className="text-xl font-bold text-foreground">복약 상담</h1>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Upper Left: Medication Selection & Search */}
          <div className="bg-card rounded-[var(--radius-card)] border border-border shadow-sm overflow-hidden flex flex-col min-h-[300px]">
            <div className="p-4 border-b border-border bg-gray-50/50 flex justify-between items-center">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full"></div>
                약물 선택
              </h2>
              <span className="text-xs font-medium px-2 py-0.5 bg-white border border-gray-200 rounded-full text-gray-600">
                {medicines.length}개 선택됨
              </span>
            </div>

            {/* Inline Search Bar */}
            <div className="p-3 border-b border-border bg-white sticky top-0 z-10 flex gap-2">
              <div className="relative group focus-within:ring-2 focus-within:ring-primary/20 rounded-md transition-all flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="약품명, 성분명, 제약사 검색 (예: 타이레놀)" 
                  className="w-full pl-9 pr-8 py-2 text-sm border border-input rounded-md focus:border-primary outline-none bg-gray-50 focus:bg-white transition-all placeholder:text-gray-400"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <button 
                onClick={() => setIsFullListOpen(true)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md border border-gray-200 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                title="전체 리스트 보기"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="w-3 h-0.5 bg-current rounded-full"></div>
                  <div className="w-3 h-0.5 bg-current rounded-full"></div>
                  <div className="w-3 h-0.5 bg-current rounded-full"></div>
                </div>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 min-h-[200px] bg-gray-50/30">
              {searchQuery ? (
                // Search Results State
                <div className="space-y-2">
                  <div className="px-2 py-1 text-xs font-semibold text-primary flex justify-between">
                    <span>검색 결과 {searchResults.length}건</span>
                    <span className="text-gray-400 font-normal">선택하여 추가</span>
                  </div>
                  {searchResults.length > 0 ? (
                    searchResults.map((drug) => {
                      const isSelected = medicines.some(m => m.code === drug.code);
                      return (
                        <div 
                          key={drug.code} 
                          className={clsx(
                            "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all group",
                            isSelected 
                              ? "bg-blue-50 border-blue-200 opacity-60 cursor-default" 
                              : "bg-white border-border hover:border-primary hover:shadow-sm hover:translate-x-0.5"
                          )}
                          onClick={() => !isSelected && handleAddMedicine(drug)}
                        >
                          <div className="w-10 h-10 rounded-md bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                            <img src={drug.imageUrl} alt={drug.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-bold text-foreground text-sm truncate">{drug.name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200">{drug.category}</span>
                            </div>
                            <div className="text-xs text-muted-foreground truncate">{drug.company} | {drug.shape}</div>
                          </div>
                          {isSelected ? (
                            <CheckCircle className="w-5 h-5 text-blue-500" />
                          ) : (
                            <Plus className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <Search className="w-8 h-8 mb-2 opacity-20" />
                      <p className="text-sm">검색 결과가 없습니다.</p>
                    </div>
                  )}
                </div>
              ) : (
                // Selected List State (Default)
                <div className="space-y-3">
                  {medicines.length > 0 ? (
                    <div className="space-y-2">
                      <div className="px-2 py-1 text-xs font-semibold text-gray-500">
                        처방 목록
                      </div>
                      {medicines.map((med) => (
                        <div key={med.code} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-border relative group hover:shadow-sm transition-all">
                          <div className="w-12 h-12 bg-gray-50 rounded-md border border-gray-200 overflow-hidden flex-shrink-0">
                            <img src={med.imageUrl} alt={med.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-foreground text-sm">{med.name}</h4>
                                <p className="text-xs text-muted-foreground mt-0.5">{med.company}</p>
                              </div>
                              <button 
                                onClick={() => removeMedicine(med.code)}
                                className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="mt-1.5 flex gap-2">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500 border border-gray-100">{med.category}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50 m-2">
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                        <Search className="w-6 h-6 text-blue-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-600 mb-1">약품을 검색해보세요</p>
                      <p className="text-xs text-gray-400 text-center px-4">
                        상단의 검색창에 약품명이나 성분을<br/>입력하여 추가할 수 있습니다.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Lower Left: Reminder Settings */}
          <div className="bg-card rounded-[var(--radius-card)] border border-border shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border bg-gray-50/50">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                복약 알림
              </h2>
            </div>
            <div className="p-4 space-y-6">
               {/* Frequency */}
               <div className="space-y-3">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">복용 횟수</label>
                 <div className="grid grid-cols-3 gap-2">
                   {[1, 2, 3].map(freq => (
                     <button
                       key={freq}
                       onClick={() => setReminder({...reminder, frequency: freq})}
                       className={clsx(
                         "py-2.5 rounded-lg text-sm font-medium border transition-all",
                         reminder.frequency === freq 
                           ? "bg-primary text-primary-foreground border-primary shadow-sm ring-1 ring-primary/20" 
                           : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                       )}
                     >
                       {freq}회
                     </button>
                   ))}
                 </div>
               </div>

               {/* Times */}
               <div className="space-y-3">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">복용 시간</label>
                 <div className="grid grid-cols-4 gap-2">
                   {['아침', '점심', '저녁', '취침전'].map(time => (
                     <button
                       key={time}
                       onClick={() => toggleTime(time)}
                       className={clsx(
                         "py-2.5 rounded-lg text-sm font-medium border transition-all",
                         reminder.times.includes(time)
                           ? "bg-primary text-primary-foreground border-primary shadow-sm ring-1 ring-primary/20" 
                           : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                       )}
                     >
                       {time}
                     </button>
                   ))}
                 </div>
               </div>

               {/* Relation */}
               <div className="space-y-3">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">복용 시점</label>
                 <div className="grid grid-cols-3 gap-2">
                   {['식사 전', '식후 즉시', '식후 30분'].map(rel => (
                     <button
                       key={rel}
                       onClick={() => setReminder({...reminder, relation: rel})}
                       className={clsx(
                         "py-2.5 rounded-lg text-sm font-medium border transition-all flex items-center justify-center whitespace-nowrap font-sans",
                         reminder.relation === rel
                           ? "bg-primary text-primary-foreground border-primary shadow-sm ring-1 ring-primary/20" 
                           : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                       )}
                     >
                       {rel}
                     </button>
                   ))}
                 </div>
               </div>

               {/* Start Date & Duration in one row */}
               <div className="flex gap-4">
                 <div className="flex-1 space-y-3">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">복용 시작일</label>
                   <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                     <PopoverTrigger asChild>
                       <button
                         className="w-full flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all text-left"
                       >
                         <CalendarIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                         <span className="truncate">{format(startDate, 'yyyy.M.d (EEE)', { locale: ko })}</span>
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

                 <div className="w-[160px] space-y-3 flex-shrink-0">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">복용 기간</label>
                   <div className="flex items-center gap-1.5">
                     <button
                       onClick={() => setDurationDays(prev => Math.max(1, prev - 1))}
                       className="w-9 h-[42px] rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 flex items-center justify-center transition-all text-gray-600 flex-shrink-0"
                     >
                       <Minus className="w-3.5 h-3.5" />
                     </button>
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
                         className="w-full text-center py-2.5 text-sm font-medium border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                       />
                       <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">일</span>
                     </div>
                     <button
                       onClick={() => setDurationDays(prev => Math.min(365, prev + 1))}
                       className="w-9 h-[42px] rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 flex items-center justify-center transition-all text-gray-600 flex-shrink-0"
                     >
                       <Plus className="w-3.5 h-3.5" />
                     </button>
                   </div>
                 </div>
               </div>

               {/* App Reminder Setting Toggle */}
               <div className="pt-4 border-t border-gray-100">
                 <div className="flex items-center justify-between mb-2">
                   <label className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                     <Smartphone className="w-4 h-4 text-blue-500" />
                     웰체크 앱으로 설정 전송
                   </label>
                   <div 
                     className={clsx(
                       "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer",
                       sendAppReminder ? "bg-blue-600" : "bg-gray-200"
                     )}
                     onClick={() => setSendAppReminder(!sendAppReminder)}
                   >
                     <span
                       className={clsx(
                         "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                         sendAppReminder ? "translate-x-6" : "translate-x-1"
                       )}
                     />
                   </div>
                 </div>
                 
                 {/* Default Help Message */}
                 <p className="text-xs text-gray-400">
                   웰체크 앱 가입자인 경우 복약 알림 설정 값을 전송합니다.
                 </p>

                 {/* Extra Box and Controls when Toggle is ON */}
                 {sendAppReminder && (
                   <>
                     <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg animate-in fade-in slide-in-from-top-1 duration-200">
                       {!selectedPatient ? (
                         <p className="text-sm font-medium text-blue-800 flex items-center gap-1.5">
                           <Info className="w-4 h-4" />
                           수신자를 선택하세요.
                         </p>
                       ) : isAppUser === false ? (
                         <p className="text-sm font-medium text-red-600 flex items-center gap-1.5">
                           <AlertCircle className="w-4 h-4" />
                           웰체크 앱 미가입자입니다. 문자/알림톡으로만 발송됩니다.
                         </p>
                       ) : (
                         <p className="text-sm font-medium text-blue-800 flex items-center gap-1.5">
                           <CheckCircle className="w-4 h-4" />
                           웰체크 앱 가입자입니다. 복약 설정이 앱으로 자동 연동됩니다.
                         </p>
                       )}
                     </div>

                     {/* Debug Handler for Testing */}
                     <div className="mt-4 pt-3 border-t border-dashed border-gray-200 flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                       <button 
                         onClick={() => setSelectedPatient(null)}
                         className="flex-1 py-2 text-[10px] font-medium bg-white border border-gray-200 text-gray-500 rounded hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all shadow-sm"
                       >
                         Test: 수신자 미선택
                       </button>
                       <button 
                         onClick={() => {
                           if (!selectedPatient) setSelectedPatient({ name: '김철수', condition: '고혈압 관리', phone: '010-1234-5678', lastVisit: '2023.10.15' });
                           setIsAppUser(false);
                         }}
                         className="flex-1 py-2 text-[10px] font-medium bg-white border border-gray-200 text-gray-500 rounded hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all shadow-sm"
                       >
                         Test: 미가입자 설정
                       </button>
                       <button 
                         onClick={() => {
                           if (!selectedPatient) setSelectedPatient({ name: '김철수', condition: '고혈압 관리', phone: '010-1234-5678', lastVisit: '2023.10.15' });
                           setIsAppUser(true);
                         }}
                         className="flex-1 py-2 text-[10px] font-medium bg-white border border-gray-200 text-gray-500 rounded hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all shadow-sm"
                       >
                         Test: 가입자 설정
                       </button>
                     </div>
                   </>
                 )}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Column: Consultation Content Preview */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative h-full overflow-hidden">
         <div className="p-5 border-b border-border flex justify-between items-center flex-shrink-0 h-[72px]">
             <h2 className="text-lg font-bold text-foreground flex items-center">
            <FileText className="mr-2 text-primary w-5 h-5" />
            상담 내용 미리보기
          </h2>
         </div>
         
         <div className="flex-1 p-6 overflow-y-auto bg-gray-50/30">
             <div className="h-full flex flex-col gap-4 max-w-3xl mx-auto">
                 <div className="flex-1 border border-input rounded-xl bg-white shadow-sm overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-ring/50 transition-all">
                    <textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="flex-1 w-full p-6 bg-transparent resize-none outline-none text-base leading-relaxed text-gray-800 placeholder:text-gray-300"
                      placeholder="약품을 추가하면 상담 내용이 자동으로 작성됩니다."
                    />
                    <div className="p-3 bg-gray-50 border-t border-gray-100 flex flex-col gap-3">
                      <div className="flex gap-2 flex-wrap">
                        {[
                          '식후 30분 복용하세요',
                          '졸음이 올 수 있습니다',
                          '충분한 물과 함께 드세요',
                          '음주를 피하세요',
                          '하루 3번 복용하세요',
                          '증상이 호전되면 중단하세요'
                        ].map(phrase => (
                          <button 
                            key={phrase}
                            onClick={() => setMessage(prev => prev + `\n- ${phrase}`)}
                            className="px-3 py-1.5 text-xs bg-white hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-full transition-colors font-medium border border-gray-200 hover:border-blue-200 shadow-sm"
                          >
                            + {phrase}
                          </button>
                        ))}
                      </div>
                      <div className="text-xs text-gray-400 text-right border-t border-gray-100 pt-2">
                        {message.length}자 작성됨
                      </div>
                    </div>
                 </div>
                 
                 {/* Static Tips Removed */}

             </div>
         </div>
      </div>

      {/* Right Column: Customer Info */}
      <div className="w-[400px] bg-white border-l border-border flex flex-col shadow-sm shrink-0 h-full overflow-hidden z-10">
         {/* 타이틀 영역 */}
         <div className="p-5 border-b border-border h-[72px] flex items-center">
            <h3 className="text-lg font-bold text-foreground flex items-center">
              <User className="mr-2 text-primary w-5 h-5" />
              받는 사람
            </h3>
         </div>

         {/* 모드 전환 탭 (직접 입력 vs 단골 검색) */}
         <div className="p-2 bg-gray-50 flex gap-1 m-4 rounded-lg border border-border">
            <button
              onClick={() => setRecipientMode('direct')}
              className={clsx(
                "flex-1 py-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1",
                recipientMode === 'direct' ? "bg-white text-primary shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Smartphone className="w-3.5 h-3.5" /> 직접 입력
            </button>
            <button
              onClick={() => setRecipientMode('search')}
              className={clsx(
                "flex-1 py-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1",
                recipientMode === 'search' ? "bg-white text-primary shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="w-3.5 h-3.5" /> 단골 검색
            </button>
         </div>

         <div className="flex-1 px-5 pb-5 overflow-y-auto">
            {/* CASE 1: 단골 검색 모드 */}
            {recipientMode === 'search' ? (
              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type="text" 
                    value={patientSearchQuery}
                    onChange={(e) => setPatientSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="이름/번호 검색"
                  />
                  <Search className="absolute left-3 top-2.5 text-muted-foreground w-4 h-4" />
                </div>

                {selectedPatient ? (
                  /* 선택된 환자 정보 카드 */
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-blue-900">{selectedPatient.name}</span>
                    </div>
                    <div className="space-y-2 text-xs text-blue-800/80">
                      <div className="flex items-center"><Phone className="mr-2 w-3 h-3" />{selectedPatient.phone}</div>
                      <div className="flex items-center"><CalendarIcon className="mr-2 w-3 h-3" />최근: {selectedPatient.lastVisit}</div>
                    </div>
                    <button 
                      onClick={() => setSelectedPatient(null)}
                      className="mt-3 w-full py-1.5 text-xs text-red-500 hover:bg-red-50 rounded border border-transparent hover:border-red-100 transition-colors"
                    >
                      선택 취소
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground bg-gray-50 rounded-xl border border-dashed text-xs border-gray-200">검색 결과 없음</div>
                )}
              </div>
            ) : (
              /* CASE 2: 직접 입력 모드 (전화번호 자동 포맷팅 포함) */
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">휴대폰 번호</label>
                  <input 
                    type="tel" 
                    value={directPhone}
                    maxLength={13}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      let formatted = raw;
                      if (raw.length > 3 && raw.length <= 7) formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
                      else if (raw.length > 7) formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
                      setDirectPhone(formatted);
                    }}
                    className="w-full px-3 py-2.5 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="010-0000-0000"
                  />
                  <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    메시지는 카카오 알림톡으로 우선 발송되며, 실패 시 문자로 발송됩니다.
                  </p>
                </div>
              </div>
            )}
         </div>

         {/* 전송 버튼 활성화 로직 */}
         <div className="p-5 border-t border-gray-100 bg-gray-50/50">
           <button
             disabled={!(message.trim().length > 0 && (recipientMode === 'search' ? !!selectedPatient : directPhone.trim().length > 0))}
             className={clsx(
               "w-full py-3.5 text-sm font-bold rounded-xl flex items-center justify-center shadow-lg transition-all",
               (message.trim().length > 0 && (recipientMode === 'search' ? !!selectedPatient : directPhone.trim().length > 0))
                 ? "text-primary-foreground bg-primary hover:bg-blue-600 hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[0px]" 
                 : "text-muted-foreground bg-gray-200 cursor-not-allowed shadow-none"
             )}
             onClick={() => {
                let msg = '메시지가 전송되었습니다.';
                if (sendAppReminder && isAppUser) {
                  msg += '\n(앱 알림 설정값 포함)';
                }
                alert(msg);
             }}
           >
             <Send className="w-4 h-4 mr-2" /> 상담 메시지 전송
           </button>

         </div>
      </div>
    </div>
  );
};