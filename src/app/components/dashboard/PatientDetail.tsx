import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Activity, 
  Heart, 
  Droplet, 
  Pill, 
  FileText, 
  Send, 
  Mic, 
  Video, 
  Paperclip,
  CheckCircle,
  MessageSquare,
  Search,
  Youtube,
  PlayCircle,
  Eye,
  Share2,
  File,
  Filter,
  MoreHorizontal,
  AlertTriangle,
  Sparkles,
  StickyNote,
  AlarmClock,
  Sun,
  Coffee,
  Moon,
  BedDouble,
  Info,
  Calendar,
  Clock,
  AlertCircle,
  X,
  Plus,
  Trash2,
  Bell,
  Smartphone,
  ChevronRight,
  User,
  Users
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { clsx } from 'clsx';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import hidocLogo from 'figma:asset/819b9f721543d20e17c10e6c8d8d6c30e9a9bcb7.png';

interface PatientDetailProps {
  onBack: () => void;
  patientId: string | null;
}

// --- Types from MedicationConsultationC ---
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

// Mock Previous Prescription Data (Patient's last prescribed drugs)
const PREVIOUS_RX_CODES = ['199000001', '200502341']; // Tylenol and Norvasc

const bpData = [
  { date: '1/1', sys: 120, dia: 80, isPharmacyVisit: false },
  { date: '1/8', sys: 125, dia: 82, isPharmacyVisit: true },
  { date: '1/15', sys: 118, dia: 78, isPharmacyVisit: false },
  { date: '1/22', sys: 130, dia: 85, isPharmacyVisit: true },
  { date: '1/29', sys: 122, dia: 80, isPharmacyVisit: false },
];

const glucoseData = [
  { date: '1/1', value: 95, isPharmacyVisit: false },
  { date: '1/8', value: 105, isPharmacyVisit: true },
  { date: '1/15', value: 98, isPharmacyVisit: false },
  { date: '1/22', value: 110, isPharmacyVisit: true },
  { date: '1/29', value: 100, isPharmacyVisit: false },
];

const INITIAL_MESSAGES = [
  { id: 1, type: 'system', text: '상담이 시작되었습니다.', time: '09:00 AM' },
  { id: 2, type: 'patient', text: '약사님, 요즘 아침마다 약간 어지러운데 혈압약 때문일까요?', time: '09:05 AM' },
  { id: 3, type: 'pharmacist', text: '안녕하세요, 이채림님. 복용 중이신 혈압약이 아침에 혈압을 너무 낮출 수도 있습니다. 최근 혈압 수치를 보니 안정적인데, 기립성 저혈압일 수도 있어요.', time: '09:07 AM' },
  { id: 4, type: 'pharmacist', text: '일어나실 때 천천히 일어나보시고, 수분을 충분히 섭취해주세요. 증상이 지속되면 내원 권유드립니다.', time: '09:08 AM' },
];

interface Resource {
  id: string;
  type: 'youtube' | 'pdf';
  title: string;
  description: string;
  thumbnail: string;
  duration?: string;
  pages?: number;
  date: string;
}

const RESOURCES: Resource[] = [
  {
    id: '1',
    type: 'youtube',
    title: '고혈압 고객을 위한 식이요법 가이드',
    description: '나트륨 섭취를 줄이고 혈압을 관리하는 식단 관리법을 HIDOC 전문의가 설명합니다.',
    thumbnail: 'https://images.unsplash.com/photo-1645220559451-aaacbbd7bcc5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwZm9vZCUyMHZlZ2V0YWJsZXN8ZW58MXx8fHwxNzcwMjE0OTI5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '05:30',
    date: '2025.12.15'
  },
  {
    id: '2',
    type: 'pdf',
    title: '당뇨 합병증 예방 체크리스트',
    description: '매일 체크해야 할 발 관리, 혈당 체크 포인트를 정리한 문서입니다.',
    thumbnail: 'https://images.unsplash.com/photo-1631217873436-b0fa88e71f0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjBleHBsYWluaW5nJTIwdG8lMjBwYXRpZW50fGVufDF8fHx8MTc3MDI3ODk2N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    pages: 4,
    date: '2026.01.10'
  },
  {
    id: '3',
    type: 'youtube',
    title: '올바른 혈압 측정법',
    description: '가정에서 혈압계 사용 시 주의사항과 정확한 측정 자세.',
    thumbnail: 'figma:asset/8fa11f440b6e92c2db27690f058145214876b6d0.png', 
    duration: '03:15',
    date: '2025.11.20'
  },
  {
    id: '4',
    type: 'pdf',
    title: '고지혈증 약물 복용 안내서',
    description: '스타틴 계열 약물 복용 시 나타날 수 있는 부작용과 대처법.',
    thumbnail: 'figma:asset/4e44af28a649d2906b2086c8f41164c489c74872.png',
    pages: 2,
    date: '2026.02.01'
  }
];

interface CounselingSession {
  id: string;
  type: 'regular' | 'lifestyle' | 'general';
  title: string;
  date: string;
  summary: string;
  isAI: boolean;
  isVoice: boolean;
  status: 'sent' | 'draft';
  previewText: string;
}

const INITIAL_COUNSELING_HISTORY: CounselingSession[] = [
  {
    id: '1',
    type: 'regular',
    title: '정기 복약 상담',
    date: '2026.01.05',
    summary: '혈압약 변경 후 부작용 확인. 특별한 이상 없었음. 식후 30분 복용 강조.',
    isAI: true,
    isVoice: true,
    status: 'sent',
    previewText: '안녕하세요 이채림님, 오늘 상담 내용을 요약해 드립니다. 혈압약 변경 후 특이사항은 없으셨고, 식후 30분 복용을 잘 지켜주세요.'
  },
  {
    id: '2',
    type: 'lifestyle',
    title: '생활 습관 코칭',
    date: '2025.12.10',
    summary: '저염식 실천 방법 안내. 국물 섭취 줄이기 목표 설정.',
    isAI: true,
    isVoice: false,
    status: 'draft',
    previewText: '저염식 실천을 위한 국물 섭취 줄이기 목표를 설정했습니다. 다음 방문 시까지 화이팅하세요!'
  },
  {
    id: '3',
    type: 'general',
    title: '일반 상담',
    date: '2025.11.22',
    summary: '감기 기운으로 방문. 종합감기약 구매 및 상호작용 체크 완료.',
    isAI: false,
    isVoice: false,
    status: 'sent',
    previewText: '종합감기약 복용 시 기존 약물과의 상호작용은 없으니 안심하고 드셔도 됩니다.'
  }
];

const CustomLineDot = (props: any) => {
  const { cx, cy, payload, stroke } = props;
  if (payload.isPharmacyVisit) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={5} fill="white" stroke={stroke} strokeWidth={2} />
        <circle cx={cx} cy={cy} r={3} fill={stroke} />
      </g>
    );
  }
  return <circle cx={cx} cy={cy} r={2} stroke="none" fill={stroke} />;
};

const CustomAreaDot = (props: any) => {
  const { cx, cy, payload, stroke } = props;
  if (payload.isPharmacyVisit) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={5} fill="white" stroke={stroke} strokeWidth={2} />
        <circle cx={cx} cy={cy} r={3} fill={stroke} />
      </g>
    );
  }
  return null;
};

const InfoTooltip = ({ text, position = 'top' }: { text: string, position?: 'top' | 'bottom' }) => (
  <div className="group relative flex items-center">
    <button className="text-gray-400 hover:text-blue-600 transition-colors cursor-help">
      <Info size={14} />
    </button>
    <div className={clsx(
      "absolute left-1/2 -translate-x-1/2 hidden group-hover:block z-50 w-max max-w-[200px] sm:max-w-xs",
      position === 'top' ? "bottom-full mb-2" : "top-full mt-2"
    )}>
      <div className="bg-gray-800 text-white text-[11px] rounded px-2.5 py-1.5 whitespace-nowrap shadow-lg relative">
        {text}
        <div className={clsx(
          "absolute left-1/2 -translate-x-1/2 border-4 border-transparent",
          position === 'top' ? "top-full border-t-gray-800" : "bottom-full border-b-gray-800"
        )}></div>
      </div>
    </div>
  </div>
);

// Helper to format phone numbers
const formatPhoneNumber = (value: string) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return value;
};

// Modal Component
interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'warning';
  title: string;
  recipientName: string;
  recipientPhone: string;
  mainStatusText: string;
  subStatusText: string;
  messageContent: string;
  reminderSettings?: ReminderSettings;
}

const ResultModal: React.FC<ResultModalProps> = ({ 
  isOpen, 
  onClose, 
  type, 
  title, 
  recipientName, 
  recipientPhone, 
  mainStatusText,
  subStatusText,
  messageContent,
  reminderSettings
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className={clsx(
          "px-6 py-4 flex items-center justify-between border-b flex-shrink-0",
          type === 'success' ? "bg-blue-50 border-blue-100" : "bg-orange-50 border-orange-100"
        )}>
          <div className="flex items-center gap-3">
            <div className={clsx(
              "p-2 rounded-full",
              type === 'success' ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
            )}>
              {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <h3 className={clsx(
              "font-bold text-lg",
              type === 'success' ? "text-blue-900" : "text-orange-900"
            )}>
              {title}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* 1. Recipient Info */}
          <div className="flex items-baseline justify-between border-b border-gray-100 pb-4">
            <span className="text-sm font-bold text-gray-500">받는 사람</span>
            <div className="text-right">
              <span className="font-bold text-gray-900 text-lg mr-2">{recipientName}</span>
              <span className="text-gray-600 font-mono text-base">{formatPhoneNumber(recipientPhone)}</span>
            </div>
          </div>

          {/* 2 & 3. Status Message Block */}
          <div className={clsx(
            "rounded-lg p-4 text-sm border flex gap-3",
            type === 'success' 
              ? "bg-blue-50 border-blue-100 text-blue-900" 
              : "bg-orange-50 border-orange-100 text-orange-900"
          )}>
             <Info size={20} className={clsx(
                "flex-shrink-0 mt-0.5",
                type === 'success' ? "text-blue-600" : "text-orange-600"
             )} />
             <div>
               <p className="font-bold text-base mb-1">{mainStatusText}</p>
               <p className={clsx(
                 "text-sm leading-snug",
                 type === 'success' ? "text-blue-700" : "text-orange-800"
               )}>
                 {subStatusText}
               </p>
             </div>
          </div>

          {/* 4. Message Content */}
          <div>
            <p className="text-sm font-bold text-gray-500 mb-2">메시지 내용</p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {messageContent}
            </div>
          </div>

          {/* 5. Reminder Settings (Only if provided) */}
          {reminderSettings && (
            <div className="animate-in slide-in-from-bottom-2 duration-300">
               <div className="flex items-center gap-2 mb-3">
                 <AlarmClock size={16} className="text-blue-600" />
                 <p className="text-sm font-bold text-gray-900">복약 알림 설정</p>
               </div>
               <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 space-y-3">
                 <div className="flex gap-3">
                    <Clock size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-gray-500 block mb-1">복용 시기</span>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-sm text-gray-800 font-medium">
                          하루 {reminderSettings.frequency}회, {reminderSettings.times.join(', ')} ({reminderSettings.relation})
                        </span>
                      </div>
                    </div>
                 </div>
               </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors shadow-sm text-sm"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export const PatientDetail: React.FC<PatientDetailProps> = ({ onBack, patientId }) => {
  const [memo, setMemo] = useState("고객 특이사항:\n- 알약 삼키는 것을 힘들어함\n- 저녁 식후 복용 선호\n\n다음 상담 시 확인:\n- 어지럼증 호전 여부");
  const [activeTab, setActiveTab] = useState<'counseling' | 'education' | 'products'>('counseling');
  const [resourceFilter, setResourceFilter] = useState<'all' | 'video' | 'pdf'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [chatMessages, setChatMessages] = useState(INITIAL_MESSAGES);
  const [counselingHistory, setCounselingHistory] = useState(INITIAL_COUNSELING_HISTORY);
  
  // --- New Medication Consultation State ---
  const [medicines, setMedicines] = useState<DrugInfo[]>([]);
  const [medSearchQuery, setMedSearchQuery] = useState('');
  const [medSearchResults, setMedSearchResults] = useState<DrugInfo[]>([]);
  
  const [reminder, setReminder] = useState<ReminderSettings>({
    frequency: 3,
    times: ['아침', '점심', '저녁'],
    relation: '식후 30분'
  });
  
  const [sendAppReminder, setSendAppReminder] = useState(false);
  const [isAppUser, setIsAppUser] = useState(true); // Default to true for this patient
  const [messageText, setMessageText] = useState('');

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'success' | 'warning';
    title: string;
    mainStatusText: string;
    subStatusText: string;
    messageContent: string;
    reminderSettings?: ReminderSettings;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    mainStatusText: '',
    subStatusText: '',
    messageContent: ''
  });

  const filteredResources = RESOURCES.filter(r => {
    const matchesFilter = resourceFilter === 'all' || 
                          (resourceFilter === 'video' && r.type === 'youtube') || 
                          (resourceFilter === 'pdf' && r.type === 'pdf');
    const matchesSearch = r.title.includes(searchQuery) || r.description.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  // --- Effects for Medication Logic ---
  
  // Medication Search
  useEffect(() => {
    if (!medSearchQuery.trim()) {
      setMedSearchResults([]);
      return;
    }
    const query = medSearchQuery.toLowerCase();
    const results = MOCK_DRUG_DB.filter(d => 
      d.name.toLowerCase().includes(query) || 
      d.company.toLowerCase().includes(query)
    );
    setMedSearchResults(results);
  }, [medSearchQuery]);

  // Auto-generate message
  useEffect(() => {
    if (medicines.length === 0) {
       // Only clear if empty? Or allow manual edits to persist?
       // For this UX, let's keep it simple: if medicines exist, we overwrite (like MedicationConsultationC)
       // If no medicines, we can leave it empty or user types manually.
       if (messageText.includes('[복약 상담 안내]')) {
         setMessageText('');
       }
       return;
    }

    const medList = medicines.map((m, i) => `${i+1}. ${m.name} (${m.company})`).join('\n');
    const times = reminder.times.join(', ');
    const usage = `하루 ${reminder.frequency}번, ${times} ${reminder.relation}에 복용하세요.`;
    const precautions = medicines.map(m => `- ${m.name}: ${m.precautions}`).join('\n');
    
    const newMsg = `[복약 상담 안내]\n안녕하세요, 서울종로약국입니다.\n처방받으신 약품 안내드립니다.\n\n[처방 약품]\n${medList}\n\n[복약 알림 설정]\n${usage}\n\n[주의사항]\n${precautions}\n\n문의사항은 약국으로 연락주세요.`;
    
    setMessageText(newMsg);
  }, [medicines, reminder]);

  // --- Handlers ---
  const handleAddMedicine = (drug: DrugInfo) => {
    if (!medicines.find(m => m.code === drug.code)) {
      setMedicines([...medicines, drug]);
    }
    setMedSearchQuery(''); 
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

  const isFormValid = () => {
    if (!messageText.trim()) return false;
    return true;
  };

  const handleSend = () => {
    if (!messageText.trim()) return;
    
    // Add to chat
    const newMessage = {
      id: Date.now(),
      type: 'pharmacist',
      text: (
        <div className="flex flex-col gap-2">
          <span>{messageText}</span>
          {sendAppReminder && (
            <div className="mt-1 bg-white rounded-lg p-3 text-left shadow-sm border border-blue-100">
               <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                  <div className="p-1 bg-blue-50 rounded-full text-blue-600">
                    <AlarmClock size={12} />
                  </div>
                  <span className="text-xs font-bold text-gray-800">앱 알림 설정 전송됨</span>
               </div>
               <div className="text-[11px] text-gray-600">
                  하루 {reminder.frequency}회, {reminder.times.join(', ')} ({reminder.relation})
               </div>
            </div>
          )}
        </div>
      ),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    // @ts-ignore
    setChatMessages(prev => [...prev, newMessage]);

    // Modal Logic
    let type: 'success' | 'warning' = 'success';
    let title = '메시지 발송 성공';
    let mainStatusText = '';
    let subStatusText = '';
    let reminderSettings = undefined;

    if (sendAppReminder && isAppUser) {
        type = 'success';
        title = '알림 설정 및 발송 완료';
        mainStatusText = '웰체크 회원입니다.';
        subStatusText = '복약 알림이 앱으로 자동 설정되었습니다.';
        reminderSettings = reminder;
    } else if (sendAppReminder && !isAppUser) {
        type = 'success';
        title = '메시지 전송 완료';
        mainStatusText = '웰체크 미가입 고객입니다.';
        subStatusText = '앱 알림 설정은 제외되고 메시지만 발송되었습니다.';
    } else {
       type = 'success';
       title = '메시지 발송 완료';
       mainStatusText = '일반 메시지 발송';
       subStatusText = '메시지가 성공적으로 전송되었습니다.';
    }

    setModalState({
      isOpen: true,
      type,
      title,
      mainStatusText,
      subStatusText,
      messageContent: messageText || '(내용 없음)',
      reminderSettings
    });

    // Reset Form if needed
    // setMedicines([]);
    // setMessageText('');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      <ResultModal 
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        type={modalState.type}
        title={modalState.title}
        recipientName="이채림"
        recipientPhone="010-1234-5678"
        mainStatusText={modalState.mainStatusText}
        subStatusText={modalState.subStatusText}
        messageContent={modalState.messageContent}
        reminderSettings={modalState.reminderSettings}
      />

      {/* Header Section */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex-none z-20 shadow-sm relative">
        <div className="flex justify-between items-start">
          <div className="flex items-start">
            <button 
              onClick={onBack}
              className="mr-4 mt-1 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">이채림</h1>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">여성 / 40세</span>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">고혈압</span>
              </div>
              <div className="text-sm text-gray-500 flex gap-4">

              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
             <button className="p-2 text-gray-400 hover:text-gray-600">
                <MoreHorizontal size={20} />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="flex-1 overflow-hidden p-4 grid grid-cols-12 gap-4">
        
        {/* Left Column: PHR Dashboard (3/12) */}
        <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
            {/* Memo (Moved from right column, above 건강 지표 요약) */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 shadow-sm flex flex-col h-40 flex-none">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-yellow-800 flex items-center gap-1">
                        <FileText size={14} />
                        약사 메모 (Private)
                    </span>
                    <span className="text-[10px] text-yellow-600">저장됨</span>
                </div>
                <textarea 
                    className="flex-1 bg-transparent resize-none text-sm text-gray-800 placeholder-yellow-800/50 outline-none leading-relaxed custom-scrollbar"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                />
            </div>

          {/* Vitals Summary */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Activity size={16} className="text-blue-500" />
                건강 지표 요약
              </h3>
              <InfoTooltip text="웰체크 앱 > 홈 > 혈압/혈당/복약/체중 입력" position="bottom" />
            </div>
            <div className="grid grid-cols-2 gap-3">
               <div className="bg-blue-50 p-3 rounded-lg">
                  <span className="text-xs text-blue-600 font-medium block mb-1">혈압</span>
                  <div className="flex items-end gap-1">
                    <span className="text-xl font-bold text-gray-900">122/80</span>
                    <span className="text-xs text-gray-500 mb-1">mmHg</span>
                  </div>
               </div>
               <div className="bg-green-50 p-3 rounded-lg">
                  <span className="text-xs text-green-600 font-medium block mb-1">공복혈당</span>
                  <div className="flex items-end gap-1">
                    <span className="text-xl font-bold text-gray-900">100</span>
                    <span className="text-xs text-gray-500 mb-1">mg/dL</span>
                  </div>
               </div>
               <div className="bg-purple-50 p-3 rounded-lg">
                  <span className="text-xs text-purple-600 font-medium block mb-1">복약순응도</span>
                  <div className="flex items-end gap-1">
                    <span className="text-xl font-bold text-gray-900">85</span>
                    <span className="text-xs text-gray-500 mb-1">%</span>
                  </div>
               </div>
               <div className="bg-orange-50 p-3 rounded-lg">
                  <span className="text-xs text-orange-600 font-medium block mb-1">체중</span>
                  <div className="flex items-end gap-1">
                    <span className="text-xl font-bold text-gray-900">58</span>
                    <span className="text-xs text-gray-500 mb-1">kg</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Charts */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <Heart size={16} className="text-red-500" />
                        혈압 추이
                    </h3>
                    <InfoTooltip text="웰체크 앱 > 홈 > 혈압" position="top" />
                </div>
                <select className="text-xs border-gray-200 rounded px-1 py-0.5 bg-gray-50 text-gray-600">
                    <option>최근 1개월</option>
                    <option>최근 3개월</option>
                </select>
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bpData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                  <YAxis domain={[60, 160]} tick={{fontSize: 10}} axisLine={false} tickLine={false} width={25} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="sys" stroke="#3b82f6" strokeWidth={2} dot={<CustomLineDot />} activeDot={{r: 4}} />
                  <Line type="monotone" dataKey="dia" stroke="#60a5fa" strokeWidth={2} dot={<CustomLineDot />} activeDot={{r: 4}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex justify-end">
                <div className="flex items-center gap-1.5">
                    <div className="relative flex items-center justify-center w-3 h-3">
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-blue-500 bg-white"></div>
                        <div className="absolute w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    </div>
                    <span className="text-[10px] text-gray-500">약국 방문일</span>
                </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-1">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <CheckCircle size={16} className="text-purple-500" />
                    검진 결과 (2025.10.15)
                </h3>
                <InfoTooltip text="웰체크 앱 > 더보기 > 건강검진 결과" position="top" />
            </div>
            <ul className="space-y-2 text-xs">
                <li className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">총콜레스테롤</span>
                    <span className="font-semibold text-gray-900">198 mg/dL</span>
                </li>
                <li className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">HDL / LDL</span>
                    <span className="font-semibold text-gray-900">55 / 120</span>
                </li>
                <li className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">간수치 (AST/ALT)</span>
                    <span className="font-semibold text-gray-900">22 / 18</span>
                </li>
            </ul>
          </div>
        </div>

        {/* Center Column: Unified Communication (5/12) */}
        <div className="col-span-5 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
           <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
             <div className="flex items-center gap-2">
                 <h3 className="font-bold text-gray-800 flex items-center gap-2">
                   <MessageSquare size={18} className="text-blue-600" />
                   통합 상담 채널
                 </h3>
                 <InfoTooltip text="웰체크 앱 > 주치의 메시지 > 약국명 채팅방" position="bottom" />
             </div>
             <div className="flex gap-2">
                <button className="p-1.5 bg-white border border-gray-200 rounded text-gray-600 hover:text-blue-600 hover:border-blue-300">
                    <Video size={16} />
                </button>
                <button className="p-1.5 bg-white border border-gray-200 rounded text-gray-600 hover:text-blue-600 hover:border-blue-300">
                    <Mic size={16} />
                </button>
             </div>
           </div>

           {/* Chat Area */}
           <div className="flex-1 bg-white p-4 overflow-y-auto space-y-4">
              <div className="text-center text-xs text-gray-400 my-4">
                 2026년 2월 5일 목요일
              </div>
              
              {chatMessages.map((msg) => (
                <div key={msg.id} className={clsx(
                    "flex flex-col max-w-[85%]", 
                    msg.type === 'pharmacist' ? "ml-auto items-end" : 
                    msg.type === 'system' ? "mx-auto items-center max-w-full" : "items-start"
                )}>
                    {msg.type === 'system' ? (
                        <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">{msg.text}</span>
                    ) : (
                        <>
                            <div className={clsx(
                                "px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                                msg.type === 'pharmacist' 
                                    ? "bg-blue-600 text-white rounded-tr-none" 
                                    : "bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200"
                            )}>
                                {msg.text}
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1 px-1">
                                {msg.time}
                            </span>
                        </>
                    )}
                </div>
              ))}
           </div>

           {/* Input Area */}
           <div className="p-3 border-t border-gray-200 bg-gray-50">
             <div className="flex gap-2 items-end bg-white border border-gray-300 rounded-lg p-2 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Paperclip size={18} />
                </button>
                <textarea 
                    placeholder="메시지를 입력하거나 콘텐츠를 드래그하세요..." 
                    className="flex-1 max-h-32 min-h-[44px] py-2 resize-none outline-none text-sm"
                    rows={1}
                />
                <button className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    <Send size={18} />
                </button>
             </div>
           </div>
        </div>

        {/* Right Column: Utility & Recommendations (4/12) */}
        <div className="col-span-4 flex flex-col gap-4 overflow-hidden">
            
            <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="border-b border-gray-100">
                    <div className="flex">
                        <button 
                          onClick={() => setActiveTab('counseling')}
                          className={clsx(
                            "flex-1 py-3 text-sm font-medium transition-colors",
                            activeTab === 'counseling' 
                              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50" 
                              : "text-gray-500 hover:bg-gray-50"
                          )}
                        >
                            복약 상담
                        </button>
                        <button 
                          onClick={() => setActiveTab('education')}
                          className={clsx(
                            "flex-1 py-3 text-sm font-medium transition-colors",
                            activeTab === 'education' 
                              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50" 
                              : "text-gray-500 hover:bg-gray-50"
                          )}
                        >
                            교육 자료
                        </button>
                        <button 
                          onClick={() => setActiveTab('products')}
                          className={clsx(
                            "flex-1 py-3 text-sm font-medium transition-colors",
                            activeTab === 'products' 
                              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50" 
                              : "text-gray-500 hover:bg-gray-50"
                          )}
                        >
                            추천 상품
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-white custom-scrollbar relative">
                    {/* Tab Content: Counseling - IMPROVED UX */}
                    {activeTab === 'counseling' && (
                      <div className="flex flex-col h-full">
                          {/* 1. Medication Search (Sticky Top) */}
                          <div className="p-3 bg-gray-50 border-b border-gray-100 sticky top-0 z-20">
                             <div className="flex justify-between items-center mb-2">
                               <span className="text-xs font-bold text-gray-700">처방 약품 추가</span>
                               <button 
                                 onClick={() => setMedSearchQuery('가스모틴')}
                                 className="text-[10px] bg-orange-100 text-orange-700 border border-orange-200 px-2 py-1 rounded hover:bg-orange-200 transition-colors font-medium flex items-center gap-1"
                               >
                                 <AlertTriangle size={10} />
                                 테스트: 변경된 약물 검색
                               </button>
                             </div>
                             <div className="relative mb-2">
                               <Search className="absolute left-2.5 top-2.5 text-gray-400 w-4 h-4" />
                               <input 
                                 type="text" 
                                 placeholder="약품 검색 (예: 타이레놀)"
                                 value={medSearchQuery}
                                 onChange={(e) => setMedSearchQuery(e.target.value)}
                                 className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                               />
                               {/* Search Results Dropdown */}
                               {medSearchQuery && (
                                 <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                                    {medSearchResults.length > 0 ? medSearchResults.map(drug => {
                                      // Removed visual alert from search results as per requirement
                                      return (
                                        <div 
                                          key={drug.code}
                                          onClick={() => handleAddMedicine(drug)}
                                          className="p-2 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center gap-2"
                                        >
                                          <img src={drug.imageUrl} alt="" className="w-8 h-8 rounded bg-gray-100 object-cover" />
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                               <div className="text-xs font-bold text-gray-900 truncate">{drug.name}</div>
                                            </div>
                                            <div className="text-[10px] text-gray-500">{drug.company}</div>
                                          </div>
                                          <Plus size={14} className="text-blue-500" />
                                        </div>
                                      );
                                    }) : (
                                      <div className="p-3 text-center text-xs text-gray-500">검색 결과 없음</div>
                                    )}
                                 </div>
                               )}
                             </div>
                             
                             {/* Selected Medicines List - Alert shown here */}
                             {medicines.length > 0 && (
                               <div className="flex flex-wrap gap-2 mt-2 max-h-40 overflow-y-auto custom-scrollbar p-0.5">
                                 {medicines.map(med => {
                                   const isNew = !PREVIOUS_RX_CODES.includes(med.code);
                                   return (
                                     <div key={med.code} className={clsx(
                                       "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all shadow-sm animate-in fade-in zoom-in-95",
                                       isNew ? "bg-orange-50 border-orange-200 text-orange-900" : "bg-white border-gray-200 text-gray-700"
                                     )}>
                                        <div className="flex items-center gap-1.5">
                                           <span className="font-bold">{med.name}</span>
                                           {isNew && (
                                              <span className="flex items-center gap-1 text-[10px] text-orange-600 font-bold bg-white/60 px-1.5 py-0.5 rounded border border-orange-100">
                                                <AlertCircle size={10} />
                                                이전 처방과 다름
                                              </span>
                                           )}
                                        </div>
                                       <button 
                                         onClick={() => removeMedicine(med.code)} 
                                         className={clsx(
                                            "ml-1 p-0.5 rounded-full transition-colors",
                                            isNew ? "hover:bg-orange-200 text-orange-400 hover:text-orange-700" : "hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                                         )}
                                       >
                                         <X size={12} />
                                       </button>
                                     </div>
                                   );
                                 })}
                               </div>
                             )}
                          </div>

                          {/* 2. Scrollable Content: Reminder Settings & Preview */}
                          <div className="flex-1 overflow-y-auto p-4 space-y-5">
                             
                             {/* Reminder Settings */}
                             <div className="space-y-3">
                               <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                                    <Bell size={12} className="text-blue-500" />
                                    복약 알림 설정
                                  </h4>
                                  <div className="flex items-center gap-1.5">
                                     <span className="text-[10px] text-gray-500">앱 전송</span>
                                     <div 
                                       className={clsx(
                                         "relative inline-flex h-4 w-7 items-center rounded-full transition-colors cursor-pointer",
                                         sendAppReminder ? "bg-blue-600" : "bg-gray-200"
                                       )}
                                       onClick={() => setSendAppReminder(!sendAppReminder)}
                                     >
                                       <span className={clsx("inline-block h-3 w-3 transform rounded-full bg-white transition-transform", sendAppReminder ? "translate-x-3.5" : "translate-x-0.5")} />
                                     </div>
                                  </div>
                               </div>
                               
                               <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 space-y-3">
                                  {/* Frequency */}
                                  <div>
                                     <label className="text-[10px] font-bold text-gray-400 block mb-1">횟수</label>
                                     <div className="flex gap-1">
                                       {[1, 2, 3].map(f => (
                                         <button 
                                           key={f} 
                                           onClick={() => setReminder({...reminder, frequency: f})}
                                           className={clsx("flex-1 py-1 text-xs border rounded transition-all", reminder.frequency === f ? "bg-primary text-primary-foreground border-primary" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100")}
                                         >
                                           {f}회
                                         </button>
                                       ))}
                                     </div>
                                  </div>

                                  {/* Times */}
                                  <div>
                                     <label className="text-[10px] font-bold text-gray-400 block mb-1">시간</label>
                                     <div className="grid grid-cols-4 gap-1">
                                       {['아침', '점심', '저녁', '취침전'].map(t => (
                                         <button 
                                           key={t}
                                           onClick={() => toggleTime(t)}
                                           className={clsx("py-1 text-[11px] border rounded transition-all", reminder.times.includes(t) ? "bg-primary text-primary-foreground border-primary" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50")}
                                         >
                                           {t}
                                         </button>
                                       ))}
                                     </div>
                                  </div>

                                  {/* Relation */}
                                  <div>
                                     <label className="text-[10px] font-bold text-gray-400 block mb-1">시점</label>
                                     <div className="flex gap-1">
                                       {['식후 30분', '식전', '식후 즉시'].map(r => (
                                         <button 
                                           key={r}
                                           onClick={() => setReminder({...reminder, relation: r})}
                                           className={clsx("flex-1 py-1 text-[10px] border rounded transition-all whitespace-nowrap", reminder.relation === r ? "bg-primary text-primary-foreground border-primary" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50")}
                                         >
                                           {r}
                                         </button>
                                       ))}
                                     </div>
                                  </div>
                               </div>
                             </div>

                             {/* Message Preview */}
                             <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                   <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                                     <MessageSquare size={12} className="text-green-500" />
                                     메시지 미리보기
                                   </h4>
                                   <span className="text-[10px] text-gray-400">{messageText.length}자</span>
                                </div>
                                <textarea 
                                  value={messageText}
                                  onChange={(e) => setMessageText(e.target.value)}
                                  className="w-full h-32 p-3 text-xs bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none resize-none leading-relaxed"
                                  placeholder="약품을 추가하면 상담 내용이 자동으로 작성됩니다."
                                />
                             </div>

                             {/* Recent Counseling History */}
                             <div className="space-y-3 pt-4 border-t border-gray-100">
                                <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                                  <Clock size={12} className="text-gray-400" />
                                  최근 상담 이력
                                </h4>
                                <div className="space-y-2">
                                  {counselingHistory.map((session) => (
                                    <div key={session.id} className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer group">
                                        <div className="flex justify-between items-start mb-1.5">
                                            <div className="flex items-center gap-1.5">
                                              <span className={clsx(
                                                "text-xs font-bold", 
                                                session.type === 'regular' ? "text-blue-700" : "text-gray-700"
                                              )}>
                                                {session.title}
                                              </span>
                                              {session.isAI && (
                                                <span className="flex items-center gap-0.5 bg-purple-50 text-purple-600 text-[9px] px-1.5 py-0.5 rounded border border-purple-100">
                                                  <Sparkles size={8} />
                                                  AI
                                                </span>
                                              )}
                                            </div>
                                            <span className="text-[10px] text-gray-400">{session.date}</span>
                                        </div>
                                        <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                                            {session.summary}
                                        </p>
                                    </div>
                                  ))}
                                </div>
                             </div>
                          </div>

                          {/* 3. Action Buttons (Sticky Bottom) */}
                          <div className="p-4 border-t border-gray-100 bg-gray-50/50 mt-auto">
                             <button
                               onClick={handleSend}
                               disabled={!isFormValid()}
                               className={clsx(
                                 "w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm",
                                 isFormValid() ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md" : "bg-gray-300 text-gray-500 cursor-not-allowed"
                               )}
                             >
                               <Send size={14} />
                               상담 전송하기
                             </button>
                          </div>
                      </div>
                    )}

                    {/* Tab Content: Education (HIDOC) */}
                    {activeTab === 'education' && (
                      <div className="flex flex-col h-full">
                        {/* Filters & Search */}
                        <div className="p-3 border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10">
                           <div className="flex items-center justify-between mb-3">
                                <ImageWithFallback 
                                    src={hidocLogo} 
                                    alt="HIDOC" 
                                    className="h-6 w-auto" 
                                />
                           </div>
                           <div className="relative mb-3">
                             <Search className="absolute left-2.5 top-2 text-gray-400" size={14} />
                             <input 
                               type="text" 
                               placeholder="교육 자료 검색..." 
                               value={searchQuery}
                               onChange={(e) => setSearchQuery(e.target.value)}
                               className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                             />
                           </div>
                           <div className="flex gap-2">
                              {['all', 'video', 'pdf'].map((filter) => (
                                <button
                                  key={filter}
                                  onClick={() => setResourceFilter(filter as any)}
                                  className={clsx(
                                    "px-3 py-1 text-[11px] rounded-full border transition-colors",
                                    resourceFilter === filter
                                      ? "bg-blue-600 text-white border-blue-600 font-medium"
                                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                                  )}
                                >
                                  {filter === 'all' ? '전체' : filter === 'video' ? '동영상' : '문서'}
                                </button>
                              ))}
                           </div>
                        </div>

                        {/* Content Grid */}
                        <div className="p-4 grid grid-cols-1 gap-4 overflow-y-auto">
                           {filteredResources.map((resource) => (
                             <div key={resource.id} className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                {/* Thumbnail */}
                                <div className="relative aspect-video bg-gray-100">
                                   <ImageWithFallback 
                                      src={resource.thumbnail} 
                                      alt={resource.title} 
                                      className="w-full h-full object-cover"
                                   />
                                   <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                      {resource.type === 'youtube' ? (
                                        <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                                          <PlayCircle size={24} className="text-red-600 ml-0.5" />
                                        </div>
                                      ) : (
                                        <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                                          <FileText size={20} className="text-blue-600" />
                                        </div>
                                      )}
                                   </div>
                                   <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                                      {resource.type === 'youtube' ? resource.duration : `${resource.pages} pages`}
                                   </div>
                                </div>
                                
                                {/* Info */}
                                <div className="p-3">
                                   <div className="flex items-start justify-between mb-1">
                                      <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug flex-1 mr-2">{resource.title}</h4>
                                   </div>
                                   <p className="text-[10px] text-gray-500 line-clamp-2 mb-3">{resource.description}</p>
                                   
                                   <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-auto">
                                      <span className="text-[10px] text-gray-400">{resource.date}</span>
                                      <button className="text-blue-600 hover:text-blue-700 text-[10px] font-bold flex items-center gap-1">
                                        <Send size={10} />
                                        전송
                                      </button>
                                   </div>
                                </div>
                             </div>
                           ))}
                        </div>
                      </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
