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

const hidocLogo = 'https://placehold.co/120x40/e2e8f0/64748b?text=HiDoc';

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
  relation: string; // '식후 30분', '식전', '식후'
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
  {
    id: 2,
    type: 'pharmacist',
    text: `안녕하세요, 스프린트십칠님 😊\n\n웰체크와 함께해 주셔서 감사합니다.\n\n건강한 삶은 작은 습관에서 시작됩니다. 웰체크는 스프린트십칠님의 복약 관리부터 건강 지표 모니터링까지 꾸준히 함께하겠습니다.\n\n오늘도 활기차고 건강한 하루 보내세요! 💪\n\n서울종로약국 드림`,
    time: '09:02 AM'
  },
  {
    id: 3,
    type: 'pharmacist',
    text: `[복약 상담 안내]\n안녕하세요, 서울종로약국입니다.\n처방받으신 약품 안내드립니다.\n\n[처방 약품]\n1. 노바스크정 5mg (한국화이자제약)\n2. 타이레놀정 500mg (한국얀센)\n\n[복약 방법]\n· 노바스크정: 1일 1회, 아침 식후 복용\n· 타이레놀정: 1일 3회, 식후 30분 복용\n\n[주의사항]\n· 노바스크정: 임부 또는 임신 가능성 있는 경우 반드시 의사와 상담하세요.\n· 타이레놀정: 매일 3잔 이상 음주 시 의사와 상의하세요.\n\n복용 중 이상 증상이 있으시면 언제든지 문의해 주세요.`,
    time: '09:04 AM'
  },
  { id: 4, type: 'patient', text: '감사합니다.', time: '09:06 AM' },
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
    summary: '혈압약 변경 후 부작용 확인. 특별한 이상 없었음. 식후 30분 복약 강조.',
    isAI: true,
    isVoice: true,
    status: 'sent',
    previewText: '안녕하세요 스프린트십칠님, 오늘 상담 내용을 요약해 드립니다. 혈압약 변경 후 특이사항은 없으셨고, 식후 30분 복약을 잘 지켜주세요.'
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

const formatPhoneNumber = (value: string) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return value;
};

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

        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="flex items-baseline justify-between border-b border-gray-100 pb-4">
            <span className="text-sm font-bold text-gray-500">받는 사람</span>
            <div className="text-right">
              <span className="font-bold text-gray-900 text-lg mr-2">{recipientName}</span>
              <span className="text-gray-600 font-mono text-base">{formatPhoneNumber(recipientPhone)}</span>
            </div>
          </div>

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

          <div>
            <p className="text-sm font-bold text-gray-500 mb-2">메시지 내용</p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {messageContent}
            </div>
          </div>

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
                    <span className="text-xs font-bold text-gray-500 block mb-1">복약 시기</span>
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

export const PatientDetailSprint17: React.FC<PatientDetailProps> = ({ onBack, patientId }) => {
  const [memo, setMemo] = useState("스프린트십칠 고객 특이사항:\n- 빠른 처방 선호\n- 최신 디지털 헬스케어 기기에 관심 많음");
  const [activeTab, setActiveTab] = useState<'counseling' | 'education' | 'products'>('counseling');
  const [resourceFilter, setResourceFilter] = useState<'all' | 'video' | 'pdf'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [chatMessages, setChatMessages] = useState(INITIAL_MESSAGES);
  const [counselingHistory, setCounselingHistory] = useState(INITIAL_COUNSELING_HISTORY);

  const [medicines, setMedicines] = useState<DrugInfo[]>([]);
  const [medSearchQuery, setMedSearchQuery] = useState('');
  const [medSearchResults, setMedSearchResults] = useState<DrugInfo[]>([]);

  const [reminder, setReminder] = useState<ReminderSettings>({
    frequency: 3,
    times: ['아침', '점심', '저녁'],
    relation: '식후 30분'
  });

  const [sendAppReminder, setSendAppReminder] = useState(false);
  const [isAppUser, setIsAppUser] = useState(true);
  const [messageText, setMessageText] = useState('');

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

  useEffect(() => {
    if (medicines.length === 0) {
      if (messageText.includes('[복약 상담 안내]')) {
        setMessageText('');
      }
      return;
    }

    const medList = medicines.map((m, i) => `${i + 1}. ${m.name} (${m.company})`).join('\n');
    const times = reminder.times.join(', ');
    const usage = `하루 ${reminder.frequency}번, ${times} ${reminder.relation}에 복약하세요.`;
    const precautions = medicines.map(m => `- ${m.name}: ${m.precautions}`).join('\n');

    const newMsg = `[복약 상담 안내]\n안녕하세요, 서울종로약국입니다.\n처방받으신 약품 안내드립니다.\n\n[처방 약품]\n${medList}\n\n[복약 알림 설정]\n${usage}\n\n[주의사항]\n${precautions}\n\n문의사항은 약국으로 연락주세요.`;

    setMessageText(newMsg);
  }, [medicines, reminder]);

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
  };

  return (
    <div className="flex flex-col h-full bg-blue-50/30 overflow-hidden">
      <ResultModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        type={modalState.type}
        title={modalState.title}
        recipientName="스프린트십칠"
        recipientPhone="010-3423-7918"
        mainStatusText={modalState.mainStatusText}
        subStatusText={modalState.subStatusText}
        messageContent={modalState.messageContent}
        reminderSettings={modalState.reminderSettings}
      />

      <header className="bg-white border-b border-blue-200 px-6 py-4 flex-none z-20 shadow-sm relative">
        <div className="flex justify-between items-start">
          <div className="flex items-start">
            <button
              onClick={onBack}
              className="mr-4 mt-1 p-1 hover:bg-blue-50 rounded-full transition-colors font-bold text-blue-600"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-blue-900">스프린트십칠</h1>
                <span className="text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold border border-blue-100">VIP 회원</span>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">여성 / 40세</span>
              </div>
              <div className="text-sm text-blue-500 font-medium">Sprint 17 전용 프리미엄 관리 화면</div>
            </div>
          </div>
          <div className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-200">
            고객 등급: A+
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden p-4 grid grid-cols-12 gap-4">
        <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <div className="bg-blue-900 text-white rounded-xl p-4 shadow-lg flex flex-col h-40 flex-none">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold flex items-center gap-1 opacity-80">
                <Sparkles size={14} />
                Sprint 17 특별 메모
              </span>
            </div>
            <textarea
              className="flex-1 bg-transparent resize-none text-sm text-blue-50 placeholder-blue-300 outline-none leading-relaxed custom-scrollbar"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm border-t-4 border-t-blue-500">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Activity size={16} className="text-blue-500" />
              핵심 모니터링
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500">혈압</span>
                <span className="text-lg font-black text-blue-600">122/80</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500">복약 준수</span>
                <span className="text-lg font-black text-green-600">98%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-5 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-blue-50/50">
            <h3 className="font-bold text-blue-900 flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-600" />
              전담 상담 채널
            </h3>
          </div>
          <div className="flex-1 bg-white p-4 overflow-y-auto space-y-4">
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
                      "px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap",
                      msg.type === 'pharmacist'
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200"
                    )}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-2 items-end bg-white border border-gray-300 rounded-lg p-2">
              <textarea
                placeholder="메시지 입력..."
                className="flex-1 max-h-32 min-h-[44px] py-2 resize-none outline-none text-sm"
                rows={1}
              />
              <button className="p-2 bg-blue-600 text-white rounded-md">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-4 flex flex-col gap-4 overflow-hidden">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-bold text-gray-800 mb-3">Sprint 17 추천 가이드</h3>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs font-bold text-blue-900 mb-1">고혈압 정밀 관리</p>
                <p className="text-[11px] text-blue-700">생활 습관 데이터를 기반으로 한 맞춤형 상담을 진행하세요.</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <p className="text-xs font-bold text-green-900 mb-1">신규 기능 안내</p>
                <p className="text-[11px] text-green-700">웰체크의 새로운 AI 분석 기능을 먼저 체험해보시도록 권유하세요.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
