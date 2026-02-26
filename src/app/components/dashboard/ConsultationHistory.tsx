import React, { useState } from 'react';
import {
  Search,
  Eye,
  X,
  ClipboardList,
  HeartPulse,
  MessageSquare,
  Smartphone,
  Send,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { clsx } from 'clsx';

interface Consultation {
  id: string;
  patientName: string;
  phone: string;
  sendMethod: '알림톡' | '웰체크 앱' | '문자';
  sentAt: string;
  summary: string;
  frequency: number;
  times: string[];
  relation: string;
  duration: number;
  messageContent: string;
}

const DEFAULT_MESSAGE = `[복약 상담 안내]
안녕하세요, 서울종로약국입니다.
처방받으신 약품 안내드립니다.

[처방 약품]
1. 타이레놀정 500mg ((주)한국얀센)

[복약 알림 설정]
하루 3번, 아침, 점심, 저녁 식후 30분에 복약하세요.

[주의사항]
- 타이레놀정 500mg: 매일 3잔 이상 술을 마시는 경우 의사와 상의

문의사항은 약국으로 연락주세요.`;

const MOCK_CONSULTATIONS: Consultation[] = [
  {
    id: 'CS-20240205-01',
    patientName: '김철수',
    phone: '010-1234-5678',
    sendMethod: '알림톡',
    sentAt: '2024-02-05 14:30',
    summary: '하루 3회 (아침, 점심, 저녁) · 식후 30분 · 7일',
    frequency: 3,
    times: ['아침', '점심', '저녁'],
    relation: '식후 30분',
    duration: 7,
    messageContent: DEFAULT_MESSAGE,
  },
  {
    id: 'CS-20240205-02',
    patientName: '이영희',
    phone: '010-2345-6789',
    sendMethod: '웰체크 앱',
    sentAt: '2024-02-05 14:15',
    summary: '하루 2회 (아침, 저녁) · 식후 · 14일',
    frequency: 2,
    times: ['아침', '저녁'],
    relation: '식후',
    duration: 14,
    messageContent: DEFAULT_MESSAGE,
  },
  {
    id: 'CS-20240205-03',
    patientName: '박지민',
    phone: '010-3456-7890',
    sendMethod: '문자',
    sentAt: '2024-02-05 13:45',
    summary: '하루 3회 (아침, 점심, 저녁) · 식전 · 5일',
    frequency: 3,
    times: ['아침', '점심', '저녁'],
    relation: '식전',
    duration: 5,
    messageContent: DEFAULT_MESSAGE,
  },
  {
    id: 'CS-20240205-04',
    patientName: '최민수',
    phone: '010-4567-8901',
    sendMethod: '알림톡',
    sentAt: '2024-02-05 11:20',
    summary: '하루 1회 (아침) · 식후 30분 · 30일',
    frequency: 1,
    times: ['아침'],
    relation: '식후 30분',
    duration: 30,
    messageContent: DEFAULT_MESSAGE,
  },
  {
    id: 'CS-20240205-05',
    patientName: '정수정',
    phone: '010-5678-9012',
    sendMethod: '웰체크 앱',
    sentAt: '2024-02-05 10:10',
    summary: '하루 2회 (아침, 저녁) · 식후 · 7일',
    frequency: 2,
    times: ['아침', '저녁'],
    relation: '식후',
    duration: 7,
    messageContent: DEFAULT_MESSAGE,
  },
];

const getSendMethodBadge = (method: string) => {
  switch (method) {
    case '알림톡':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <MessageSquare size={12} />
          알림톡
        </span>
      );
    case '웰체크 앱':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Smartphone size={12} />
          웰체크 앱
        </span>
      );
    case '문자':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Send size={12} />
          문자
        </span>
      );
    default:
      return null;
  }
};

type SortKey = 'sentAt' | 'patientName';
type SortDir = 'asc' | 'desc';

export const ConsultationHistory = ({ onBack }: { onBack?: () => void }) => {
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('sentAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'sentAt' ? 'desc' : 'asc');
    }
  };

  const sortedConsultations = [...MOCK_CONSULTATIONS].sort((a, b) => {
    const valA = a[sortKey];
    const valB = b[sortKey];
    const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown size={14} className="text-gray-400" />;
    return sortDir === 'asc'
      ? <ArrowUp size={14} className="text-blue-600" />
      : <ArrowDown size={14} className="text-blue-600" />;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-2 text-gray-500 text-[13px] font-normal">
            {onBack && (
              <button
                onClick={onBack}
                className="mr-1 p-1 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-blue-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <span
              className={onBack ? "cursor-pointer hover:text-blue-600 transition-colors" : ""}
              onClick={onBack}
            >
              복약 상담
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium">
              복약 상담 내역
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ClipboardList className="text-blue-600" size={22} />
            <h1 className="text-2xl font-bold text-gray-900">복약 상담 내역</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1 ml-8">
            고객별 복약 상담 이력을 조회하고 관리합니다.
          </p>
        </div>
      </header>

      <div className="px-6 py-4 flex items-center justify-end">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="고객명 검색"
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 pb-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700"
                  onClick={() => toggleSort('sentAt')}
                >
                  <span className="inline-flex items-center gap-1">
                    상담 전송 시각
                    <SortIcon column="sentAt" />
                  </span>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700"
                  onClick={() => toggleSort('patientName')}
                >
                  <span className="inline-flex items-center gap-1">
                    고객명
                    <SortIcon column="patientName" />
                  </span>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  휴대폰 번호
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  전송 방법
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상담 상세 내역 보기
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedConsultations.map((consultation) => (
                <tr key={consultation.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {consultation.sentAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {consultation.patientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {consultation.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getSendMethodBadge(consultation.sendMethod)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => setSelectedConsultation(consultation)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Eye size={14} />
                      보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-800">
              총 상담 내역 <span className="text-blue-600">({MOCK_CONSULTATIONS.length}건)</span>
            </h3>
            <div className="flex gap-1">
              <button className="px-3 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50">이전</button>
              <button className="px-3 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50">다음</button>
            </div>
          </div>
        </div>
      </div>

      {selectedConsultation && (
        <div className="fixed inset-0 z-[100] overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
            <div
              className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
              onClick={() => setSelectedConsultation(null)}
            />
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
              <div className="bg-white px-6 pt-5 pb-4">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <HeartPulse size={20} className="text-blue-600" />
                    복약 상담 상세
                  </h3>
                  <button
                    onClick={() => setSelectedConsultation(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-xs text-gray-500 mb-1">고객명</span>
                      <span className="text-sm font-medium text-gray-900">{selectedConsultation.patientName}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500 mb-1">휴대폰 번호</span>
                      <span className="text-sm font-medium text-gray-900">{selectedConsultation.phone}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500 mb-1">전송 방법</span>
                      {getSendMethodBadge(selectedConsultation.sendMethod)}
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500 mb-1">전송 시각</span>
                      <span className="text-sm font-medium text-gray-900">{selectedConsultation.sentAt}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">복약 설정</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-xs text-gray-500 mb-1">복용 횟수</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                          하루 {selectedConsultation.frequency}회
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500 mb-1">복용 시점</span>
                        <span className="text-sm font-medium text-gray-900">{selectedConsultation.relation}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500 mb-1">복용 시간</span>
                        <span className="text-sm font-medium text-gray-900">{selectedConsultation.times.join(', ')}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500 mb-1">복약 일수</span>
                        <span className="text-sm font-medium text-gray-900">{selectedConsultation.duration}일</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">전송 내용</h4>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                      {selectedConsultation.messageContent}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedConsultation(null)}
                  className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
