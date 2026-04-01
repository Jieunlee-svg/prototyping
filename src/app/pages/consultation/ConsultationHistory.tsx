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
import { ConsultationDetailModal, ConsultationData as Consultation } from '../../components/consultation/ConsultationDetailModal';

const DEFAULT_MESSAGE = `[복약 상담 안내]
안녕하세요, 웰체크약국입니다.
처방받으신 약품을 안내드립니다.

[처방 약품]
1. 메트포르민 500mg (혈당강하제)
2. 글리메피리드 2mg (인슐린 분비 촉진제)
3. 로수바스타틴 10mg (고지혈증약)
4. 오메프라졸 20mg (위장보호제)

[복약 방법]
하루 3번, 아침, 점심, 저녁 식후 30분에 복약하세요.

문의사항은 약국으로 연락주세요.`;

const MOCK_CONSULTATIONS: Consultation[] = [
  {
    id: 'CS-20240205-01',
    patientName: '김철수',
    age: 45,
    isRegular: true,
    phone: '010-1234-5678',
    sendMethod: '알림톡',
    sentAt: '2024-02-05 14:30',
    summary: '하루 3회 (아침, 점심, 저녁) · 식후 30분 · 7일',
    frequency: 3,
    times: ['아침', '점심', '저녁'],
    relation: '식후 30분',
    duration: 14,
    messageContent: DEFAULT_MESSAGE,
  },
  {
    id: 'CS-20240205-02',
    patientName: '이영희',
    age: 34,
    isRegular: false,
    phone: '010-2345-6789',
    sendMethod: '웰체크 앱',
    sentAt: '2024-02-05 14:15',
    summary: '하루 2회 (아침, 저녁) · 식후 · 14일',
    frequency: 3,
    times: ['아침', '점심', '저녁'],
    relation: '식후 30분',
    duration: 14,
    messageContent: DEFAULT_MESSAGE,
  },
  {
    id: 'CS-20240205-03',
    patientName: '박지민',
    age: 12,
    isRegular: true,
    phone: '010-3456-7890',
    sendMethod: '문자',
    sentAt: '2024-02-05 13:45',
    summary: '하루 3회 (아침, 점심, 저녁) · 식점 · 5일',
    frequency: 3,
    times: ['아침', '점심', '저녁'],
    relation: '식후 30분',
    duration: 14,
    messageContent: DEFAULT_MESSAGE,
  },
  {
    id: 'CS-20240205-04',
    patientName: '최민수',
    age: 52,
    isRegular: false,
    phone: '010-4567-8901',
    sendMethod: '알림톡',
    sentAt: '2024-02-05 11:20',
    summary: '하루 1회 (아침) · 식후 30분 · 30일',
    frequency: 3,
    times: ['아침', '점심', '저녁'],
    relation: '식후 30분',
    duration: 14,
    messageContent: DEFAULT_MESSAGE,
  },
  {
    id: 'CS-20240205-05',
    patientName: '정수정',
    birthDate: '1998-07-07',
    age: 28,
    isRegular: false,
    phone: '010-5678-9012',
    sendMethod: '웰체크 앱',
    sentAt: '2024-02-05 10:10',
    summary: '하루 2회 (아침, 저녁) · 식후 · 7일',
    frequency: 3,
    times: ['아침', '점심', '저녁'],
    relation: '식후 30분',
    duration: 14,
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
    if (sortKey === 'patientName') {
      const cmp = valA.localeCompare(valB, 'ko');
      return sortDir === 'asc' ? cmp : -cmp;
    }
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

      {/* Filter & Search Toolbar */}
      <div className="px-6 py-2.5 bg-white border-b border-gray-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[13px] text-gray-400">
          총 <span className="text-blue-600 font-semibold">{MOCK_CONSULTATIONS.length}</span>건
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="고객명 검색"
            className="w-52 pl-8 pr-3 py-1.5 text-[13px] border border-gray-200 rounded-full bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400"
          />
          <Search className="absolute left-2.5 top-2 text-gray-400" size={14} />
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
                  휴대전화 번호
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

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-gray-200 bg-white flex items-center relative">
            {/* Center: page buttons */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
              <button className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 text-xs disabled:opacity-30" disabled>«</button>
              <button className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 text-xs disabled:opacity-30" disabled>‹</button>
              {[1, 2, 3, 4, 5].map((p) => (
                <button key={p} className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium ${p === 1 ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>
              ))}
              <button className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 text-xs">›</button>
              <button className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 text-xs">»</button>
            </div>
            {/* Right: rows per page */}
            <div className="ml-auto flex items-center gap-1.5">
              <select className="border border-gray-300 rounded text-xs text-gray-600 px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option>20</option>
                <option>50</option>
                <option>100</option>
              </select>
              <span className="text-xs text-gray-500">건씩 보기</span>
            </div>
          </div>
        </div>
      </div>

      {selectedConsultation && (
        <ConsultationDetailModal
          data={selectedConsultation}
          onClose={() => setSelectedConsultation(null)}
        />
      )}    </div>
  );
};
