import React, { useState } from 'react';
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  X,
  ClipboardList,
  HeartPulse,
  Smartphone,
} from 'lucide-react';
import { clsx } from 'clsx';

interface Consultation {
  id: string;
  patientName: string;
  patientRrn: string;
  frequency: number;
  times: string[];
  relation: string;
  duration: number;
  status: 'completed' | 'in_progress' | 'cancelled';
  appSent: boolean;
  consultedAt: string;
  pharmacist: string;
}

const MOCK_CONSULTATIONS: Consultation[] = [
  {
    id: 'CS-20240205-01',
    patientName: '김철수',
    patientRrn: '800101-1******',
    frequency: 3,
    times: ['아침', '점심', '저녁'],
    relation: '식후 30분',
    duration: 7,
    status: 'completed',
    appSent: true,
    consultedAt: '2024-02-05 14:30',
    pharmacist: '김약사',
  },
  {
    id: 'CS-20240205-02',
    patientName: '이영희',
    patientRrn: '920315-2******',
    frequency: 2,
    times: ['아침', '저녁'],
    relation: '식후',
    duration: 14,
    status: 'completed',
    appSent: true,
    consultedAt: '2024-02-05 14:15',
    pharmacist: '김약사',
  },
  {
    id: 'CS-20240205-03',
    patientName: '박지민',
    patientRrn: '150505-3******',
    frequency: 3,
    times: ['아침', '점심', '저녁'],
    relation: '식전',
    duration: 5,
    status: 'in_progress',
    appSent: false,
    consultedAt: '2024-02-05 13:45',
    pharmacist: '김약사',
  },
  {
    id: 'CS-20240205-04',
    patientName: '최민수',
    patientRrn: '751212-1******',
    frequency: 1,
    times: ['아침'],
    relation: '식후 30분',
    duration: 30,
    status: 'cancelled',
    appSent: false,
    consultedAt: '2024-02-05 11:20',
    pharmacist: '김약사',
  },
  {
    id: 'CS-20240205-05',
    patientName: '정수정',
    patientRrn: '980707-2******',
    frequency: 2,
    times: ['아침', '저녁'],
    relation: '식후',
    duration: 7,
    status: 'completed',
    appSent: true,
    consultedAt: '2024-02-05 10:10',
    pharmacist: '김약사',
  },
];

export const ConsultationHistory: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress' | 'cancelled'>('all');
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

  const filtered = MOCK_CONSULTATIONS.filter((c) => {
    if (statusFilter === 'all') return true;
    return c.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 size={12} className="mr-1" />
            상담완료
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock size={12} className="mr-1" />
            진행중
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircle size={12} className="mr-1" />
            취소됨
          </span>
        );
      default:
        return null;
    }
  };

  const getAppSentBadge = (sent: boolean) => {
    if (sent) {
      return (
        <span className="flex items-center text-xs text-green-600 font-medium">
          <Smartphone size={12} className="mr-1" /> 전송완료
        </span>
      );
    }
    return (
      <span className="flex items-center text-xs text-gray-400 font-medium">
        <Smartphone size={12} className="mr-1" /> 미전송
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="text-blue-600" />
            복약 상담 내역
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            고객별 복약 상담 이력을 조회하고 관리합니다.
          </p>
        </div>
      </header>

      <div className="px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-white rounded-lg border border-gray-200 p-1 flex">
            {([
              { value: 'all', label: '전체' },
              { value: 'completed', label: '상담완료' },
              { value: 'in_progress', label: '진행중' },
              { value: 'cancelled', label: '취소됨' },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={clsx(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  statusFilter === opt.value
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상담일시
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  고객명
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  주민등록번호
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  복용 횟수
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  복용 시간
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  복용 시점
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  복약 일수
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  앱 전송
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상세
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((consultation) => (
                <tr key={consultation.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {consultation.consultedAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {consultation.patientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {consultation.patientRrn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                      하루 {consultation.frequency}회
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {consultation.times.join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {consultation.relation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {consultation.duration}일
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(consultation.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getAppSentBadge(consultation.appSent)}
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
            <span className="text-xs text-gray-500">
              총 {filtered.length}건의 상담 내역이 조회되었습니다.
            </span>
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
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
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
                      <span className="block text-xs text-gray-500 mb-1">주민등록번호</span>
                      <span className="text-sm font-medium text-gray-900">{selectedConsultation.patientRrn}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500 mb-1">상담일시</span>
                      <span className="text-sm font-medium text-gray-900">{selectedConsultation.consultedAt}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500 mb-1">담당 약사</span>
                      <span className="text-sm font-medium text-gray-900">{selectedConsultation.pharmacist}</span>
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-xs text-gray-500 mb-1">상태</span>
                        {getStatusBadge(selectedConsultation.status)}
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500 mb-1">앱 전송</span>
                        {getAppSentBadge(selectedConsultation.appSent)}
                      </div>
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
