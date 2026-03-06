import React, { useState } from 'react';
import {
  FileText,
  Camera,
  Printer,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Download,
  Eye,
  Phone,
  X,
  Monitor
} from 'lucide-react';
import { clsx } from 'clsx';
import { ImageWithFallback } from '../figma/ImageWithFallback';

const prescriptionImage = 'https://placehold.co/400x560/e2e8f0/64748b?text=처방전';

interface Prescription {
  id: string;
  source: 'app_camera' | 'fax_telemed' | 'kiosk';
  patientName: string;
  patientRrn: string;
  hospitalName: string;
  diseaseCode: string;
  status: 'received' | 'dispensing' | 'done' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  receivedAt: string;
  imageUrl?: string;
}

const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'RX-20240205-01',
    source: 'app_camera',
    patientName: '김철수',
    patientRrn: '800101-1******',
    hospitalName: '서울내과의원',
    diseaseCode: 'J20.9',
    status: 'received',
    paymentStatus: 'pending',
    receivedAt: '2024-02-05 14:30',
    imageUrl: prescriptionImage
  },
  {
    id: 'RX-20240205-02',
    source: 'fax_telemed',
    patientName: '이영희',
    patientRrn: '920315-2******',
    hospitalName: '굿닥터이비인후과',
    diseaseCode: 'J00',
    status: 'dispensing',
    paymentStatus: 'paid',
    receivedAt: '2024-02-05 14:15',
    imageUrl: prescriptionImage
  },
  {
    id: 'RX-20240205-03',
    source: 'app_camera',
    patientName: '박지민',
    patientRrn: '150505-3******',
    hospitalName: '튼튼소아과',
    diseaseCode: 'J30.4',
    status: 'done',
    paymentStatus: 'paid',
    receivedAt: '2024-02-05 13:45',
    imageUrl: prescriptionImage
  },
  {
    id: 'RX-20240205-04',
    source: 'fax_telemed',
    patientName: '최민수',
    patientRrn: '751212-1******',
    hospitalName: '서울대병원',
    diseaseCode: 'E11.9',
    status: 'cancelled',
    paymentStatus: 'refunded',
    receivedAt: '2024-02-05 11:20',
    imageUrl: prescriptionImage
  },
  {
    id: 'RX-20240205-05',
    source: 'app_camera',
    patientName: '정수정',
    patientRrn: '980707-2******',
    hospitalName: '마음편한정신건강의학과',
    diseaseCode: 'F41.0',
    status: 'received',
    paymentStatus: 'paid',
    receivedAt: '2024-02-05 10:10',
    imageUrl: prescriptionImage
  },
  {
    id: 'RX-20240205-06',
    source: 'kiosk',
    patientName: '한지수',
    patientRrn: '010320-4******',
    hospitalName: '연세세브란스병원',
    diseaseCode: 'I10',
    status: 'received',
    paymentStatus: 'pending',
    receivedAt: '2024-02-05 09:50',
    imageUrl: prescriptionImage
  },
  {
    id: 'RX-20240205-07',
    source: 'kiosk',
    patientName: '오민준',
    patientRrn: '880922-1******',
    hospitalName: '강남성심병원',
    diseaseCode: 'M54.5',
    status: 'dispensing',
    paymentStatus: 'paid',
    receivedAt: '2024-02-05 09:35',
    imageUrl: prescriptionImage
  },
  {
    id: 'RX-20240205-08',
    source: 'kiosk',
    patientName: '서예린',
    patientRrn: '950614-2******',
    hospitalName: '아산병원내과',
    diseaseCode: 'K21.0',
    status: 'done',
    paymentStatus: 'paid',
    receivedAt: '2024-02-05 09:10',
    imageUrl: prescriptionImage
  },
  {
    id: 'RX-20240205-09',
    source: 'kiosk',
    patientName: '임태양',
    patientRrn: '730430-1******',
    hospitalName: '고려대안암병원',
    diseaseCode: 'J45.9',
    status: 'received',
    paymentStatus: 'pending',
    receivedAt: '2024-02-05 08:55',
    imageUrl: prescriptionImage
  },
  {
    id: 'RX-20240205-10',
    source: 'kiosk',
    patientName: '문소희',
    patientRrn: '040808-4******',
    hospitalName: '이화여대목동병원',
    diseaseCode: 'L20.9',
    status: 'dispensing',
    paymentStatus: 'paid',
    receivedAt: '2024-02-05 08:40',
    imageUrl: prescriptionImage
  },
];

export const PrescriptionList: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'app_camera' | 'fax_telemed' | 'kiosk'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'received' | 'dispensing' | 'done'>('all');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  const getSourceIcon = (source: string) => {
    if (source === 'app_camera') {
      return <Camera size={16} className="text-blue-500" />;
    }
    if (source === 'kiosk') {
      return <Monitor size={16} className="text-green-600" />;
    }
    return <Printer size={16} className="text-purple-500" />;
  };

  const getSourceLabel = (source: string) => {
    if (source === 'app_camera') return '고객 앱';
    if (source === 'kiosk') return '키오스크';
    return '의사 웹';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            접수
          </span>
        );
      case 'dispensing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            조제중
          </span>
        );
      case 'done':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            조제완료
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            취소됨
          </span>
        );
      default:
        return null;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="flex items-center text-xs text-green-600 font-medium">
            <CheckCircle2 size={12} className="mr-1" /> 결제완료
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center text-xs text-orange-500 font-medium">
            <Clock size={12} className="mr-1" /> 결제대기
          </span>
        );
      case 'refunded':
        return (
          <span className="flex items-center text-xs text-gray-500 font-medium">
            <XCircle size={12} className="mr-1" /> 환불완료
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-600" />
            처방전 접수 현황
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            앱 카메라 촬영 및 비대면 진료 팩스 처방전을 관리합니다.
          </p>
        </div>
        <div className="flex gap-2">

        </div>
      </header>

      {/* Filters & Actions */}
      <div className="px-6 pt-4 pb-2 flex items-center gap-2">
        <div className="bg-white rounded-lg border border-gray-200 p-1 flex">
          <button
            onClick={() => setFilter('all')}
            className={clsx(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              filter === 'all' ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            전체
          </button>
          <button
            onClick={() => setFilter('app_camera')}
            className={clsx(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5",
              filter === 'app_camera' ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <Camera size={14} />
            고객 앱
          </button>
          <button
            onClick={() => setFilter('fax_telemed')}
            className={clsx(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5",
              filter === 'fax_telemed' ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <Printer size={14} />
            의사 웹
          </button>
          <button
            onClick={() => setFilter('kiosk')}
            className={clsx(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5",
              filter === 'kiosk' ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <Monitor size={14} />
            키오스크
          </button>
        </div>
      </div>

      <div className="px-6 pb-4 flex items-center justify-between gap-4">
        <h3 className="font-bold text-gray-800 shrink-0">
          총 처방전 접수 <span className="text-blue-600">({MOCK_PRESCRIPTIONS.length}건)</span>
        </h3>
        <div className="flex items-center gap-2">
          <div className="h-6 w-px bg-gray-300 mx-2"></div>
          <select
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">모든 상태</option>
            <option value="received">접수</option>
            <option value="dispensing">조제중</option>
            <option value="done">조제완료</option>
          </select>
        </div>

        <div className="relative w-64">
          <input
            type="text"
            placeholder="고객명, 병원명 검색"
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  접수 경로
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  접수 시간
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  고객명
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  주민등록번호
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  질병분류기호
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  발행 병원
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  진행 상태
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  결제 상태
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  처방전
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {MOCK_PRESCRIPTIONS.map((prescription) => (
                <tr key={prescription.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={clsx(
                        "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-opacity-10",
                        prescription.source === 'app_camera' ? "bg-blue-100" : prescription.source === 'kiosk' ? "bg-green-100" : "bg-purple-100"
                      )}>
                        {getSourceIcon(prescription.source)}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {getSourceLabel(prescription.source)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.receivedAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {prescription.patientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.patientRrn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {prescription.diseaseCode}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {prescription.hospitalName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(prescription.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPaymentStatusBadge(prescription.paymentStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => setSelectedPrescription(prescription)}
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

          {/* Empty State / Pagination (Placeholder) */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end">
            <div className="flex gap-1">
              <button className="px-3 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50">이전</button>
              <button className="px-3 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50">다음</button>
            </div>
          </div>
        </div>
      </div>

      {/* Prescription Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={() => setSelectedPrescription(null)}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        처방전 이미지
                      </h3>
                      <button
                        onClick={() => setSelectedPrescription(null)}
                        className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <span className="sr-only">Close</span>
                        <X size={24} />
                      </button>
                    </div>

                    <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center min-h-[400px]">
                      {selectedPrescription.imageUrl ? (
                        <ImageWithFallback
                          src={selectedPrescription.imageUrl}
                          alt="처방전 이미지"
                          className="max-w-full max-h-[600px] object-contain"
                        />
                      ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                          <FileText size={48} className="mb-2 opacity-50" />
                          <p>처방전 이미지가 없습니다.</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 border-t border-gray-100 pt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="block text-gray-500 text-xs">고객명</span>
                        <span className="font-medium text-gray-900">{selectedPrescription.patientName}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 text-xs">접수일시</span>
                        <span className="font-medium text-gray-900">{selectedPrescription.receivedAt}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 text-xs">발행병원</span>
                        <span className="font-medium text-gray-900">{selectedPrescription.hospitalName}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 text-xs">상태</span>
                        <span className="font-medium text-gray-900">{getStatusBadge(selectedPrescription.status)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setSelectedPrescription(null)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  확인
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  <Printer size={16} className="mr-2" />
                  인쇄
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
