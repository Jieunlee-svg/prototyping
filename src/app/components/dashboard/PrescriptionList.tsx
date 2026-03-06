import React, { useState } from 'react';
import {
  FileText,
  Camera,
  Printer,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  X,
  Monitor,
  Star,
  Package,
  CreditCard
} from 'lucide-react';
import { clsx } from 'clsx';
import { ImageWithFallback } from '../figma/ImageWithFallback';

const prescriptionImage = 'https://placehold.co/400x560/e2e8f0/64748b?text=처방전';

interface Prescription {
  id: string;
  source: 'app_camera' | 'fax_telemed' | 'kiosk';
  patientName: string;
  birthDate: string;
  phone: string;
  hospitalName: string;
  diseaseCode: string;
  status: 'received' | 'dispensing' | 'done' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'refunded' | 'na';
  paymentAmount?: string;
  deliveryMethod?: '방문 수령' | '배송';
  isMember?: boolean;
  receivedAt: string;
  imageUrl?: string;
}

const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'RX-20240205-01',
    source: 'app_camera',
    patientName: '김철수',
    birthDate: '1980-01-01',
    phone: '010-1234-5678',
    hospitalName: '확인 안됨',
    diseaseCode: 'J20.9',
    status: 'received',
    paymentStatus: 'na',
    isMember: true,
    receivedAt: '2024-02-05 14:30',
    imageUrl: prescriptionImage
  },
  {
    id: 'RX-20240205-02',
    source: 'fax_telemed',
    patientName: '이영희',
    birthDate: '1992-03-15',
    phone: '010-9876-5432',
    hospitalName: '굿닥터이비인후과',
    diseaseCode: 'J00',
    status: 'dispensing',
    paymentStatus: 'paid',
    paymentAmount: '12,500원',
    deliveryMethod: '방문 수령',
    isMember: true,
    receivedAt: '2024-02-05 14:15',
    imageUrl: prescriptionImage
  },
  {
    id: 'RX-20240205-03',
    source: 'app_camera',
    patientName: '박지민',
    birthDate: '2015-05-05',
    phone: '010-3333-7777',
    hospitalName: '확인 안됨',
    diseaseCode: 'J30.4',
    status: 'done',
    paymentStatus: 'na',
    isMember: false,
    receivedAt: '2024-02-05 13:45',
    imageUrl: prescriptionImage
  },
  {
    id: 'RX-20240205-04',
    source: 'fax_telemed',
    patientName: '최민수',
    birthDate: '1975-12-12',
    phone: '010-5555-1111',
    hospitalName: '서울대병원',
    diseaseCode: 'E11.9',
    status: 'cancelled',
    paymentStatus: 'refunded',
    paymentAmount: '28,000원',
    deliveryMethod: '배송',
    isMember: false,
    receivedAt: '2024-02-05 11:20',
    imageUrl: prescriptionImage
  },
  {
    id: 'RX-20240205-05',
    source: 'fax_telemed',
    patientName: '김하준',
    birthDate: '1990-02-14',
    phone: '010-2222-8888',
    hospitalName: '강북삼성병원',
    diseaseCode: 'J06.9',
    status: 'received',
    paymentStatus: 'pending',
    paymentAmount: '8,400원',
    deliveryMethod: '방문 수령',
    isMember: true,
    receivedAt: '2024-02-05 10:50',
    imageUrl: prescriptionImage
  },
  {
    id: 'RX-20240205-06',
    source: 'app_camera',
    patientName: '정수정',
    birthDate: '1998-07-07',
    phone: '010-6666-2222',
    hospitalName: '확인 안됨',
    diseaseCode: 'F41.0',
    status: 'received',
    paymentStatus: 'na',
    isMember: true,
    receivedAt: '2024-02-05 10:10',
    imageUrl: prescriptionImage
  },
  {
    id: 'RX-20240205-07',
    source: 'kiosk',
    patientName: '한지수',
    birthDate: '2001-03-20',
    phone: '010-4444-9999',
    hospitalName: '연세세브란스병원',
    diseaseCode: 'I10',
    status: 'received',
    paymentStatus: 'na',
    paymentAmount: '15,200원',
    receivedAt: '2024-02-05 09:50',
    imageUrl: prescriptionImage
  },
  {
    id: 'RX-20240205-08',
    source: 'kiosk',
    patientName: '오민준',
    birthDate: '1988-09-22',
    phone: '010-7777-3333',
    hospitalName: '강남성심병원',
    diseaseCode: 'M54.5',
    status: 'dispensing',
    paymentStatus: 'na',
    paymentAmount: '9,800원',
    receivedAt: '2024-02-05 09:35',
    imageUrl: prescriptionImage
  },
  {
    id: 'RX-20240205-09',
    source: 'kiosk',
    patientName: '서예린',
    birthDate: '1995-06-14',
    phone: '010-8888-4444',
    hospitalName: '아산병원내과',
    diseaseCode: 'K21.0',
    status: 'done',
    paymentStatus: 'na',
    paymentAmount: '22,600원',
    receivedAt: '2024-02-05 09:10',
    imageUrl: prescriptionImage
  },
  {
    id: 'RX-20240205-10',
    source: 'kiosk',
    patientName: '임태양',
    birthDate: '1973-04-30',
    phone: '010-1111-6666',
    hospitalName: '고려대안암병원',
    diseaseCode: 'J45.9',
    status: 'received',
    paymentStatus: 'na',
    paymentAmount: '11,400원',
    receivedAt: '2024-02-05 08:55',
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
    if (source === 'app_camera') return '고객 앱 촬영';
    if (source === 'kiosk') return '키오스크 스캔';
    return '의사 웹 전송';
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-500 border border-orange-200">
            <Clock size={11} /> 결제 대기
          </span>
        );
      case 'refunded':
        return (
          <span className="flex items-center text-xs text-gray-500 font-medium">
            <XCircle size={12} className="mr-1" /> 환불완료
          </span>
        );
      case 'na':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400 border border-gray-200">
            해당없음
          </span>
        );
      default:
        return null;
    }
  };

  const filteredPrescriptions = MOCK_PRESCRIPTIONS.filter((p) => {
    const matchesSource = filter === 'all' || p.source === filter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSource && matchesStatus;
  });

  // --- Dynamic table header based on filter ---
  const renderTableHeader = () => {
    const thClass = 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
    const thCenterClass = 'px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider';

    if (filter === 'app_camera') {
      return (
        <tr>
          <th scope="col" className={thClass}>접수일시</th>
          <th scope="col" className={thClass}>고객명</th>
          <th scope="col" className={thClass}>생년월일</th>
          <th scope="col" className={thClass}>휴대폰 번호</th>
          <th scope="col" className={thClass}>발행 병원</th>
          <th scope="col" className={thClass}>접수 경로</th>
          <th scope="col" className={thClass}>단골 여부</th>
          <th scope="col" className={thCenterClass}>처방전</th>
        </tr>
      );
    }

    if (filter === 'fax_telemed') {
      return (
        <tr>
          <th scope="col" className={thClass}>접수일시</th>
          <th scope="col" className={thClass}>고객명</th>
          <th scope="col" className={thClass}>생년월일</th>
          <th scope="col" className={thClass}>휴대폰 번호</th>
          <th scope="col" className={thClass}>발행 병원</th>
          <th scope="col" className={thClass}>접수 경로</th>
          <th scope="col" className={thClass}>단골 여부</th>
          <th scope="col" className={thClass}>수령 방법</th>
          <th scope="col" className={thClass}>결제 액</th>
          <th scope="col" className={thClass}>결제 상태</th>
          <th scope="col" className={thCenterClass}>처방전</th>
        </tr>
      );
    }

    if (filter === 'kiosk') {
      return (
        <tr>
          <th scope="col" className={thClass}>접수일시</th>
          <th scope="col" className={thClass}>고객명</th>
          <th scope="col" className={thClass}>생년월일</th>
          <th scope="col" className={thClass}>휴대폰 번호</th>
          <th scope="col" className={thClass}>발행 병원</th>
          <th scope="col" className={thClass}>접수 경로</th>
          <th scope="col" className={thClass}>결제 액</th>
          <th scope="col" className={thCenterClass}>처방전</th>
        </tr>
      );
    }

    // Default: 'all'
    return (
      <tr>
        <th scope="col" className={thClass}>접수일시</th>
        <th scope="col" className={thClass}>고객명</th>
        <th scope="col" className={thClass}>생년월일</th>
        <th scope="col" className={thClass}>휴대폰 번호</th>
        <th scope="col" className={thClass}>발행 병원</th>
        <th scope="col" className={thClass}>접수 경로</th>
        <th scope="col" className={thCenterClass}>처방전</th>
      </tr>
    );
  };

  // --- Dynamic table row based on filter ---
  const renderTableRow = (prescription: Prescription) => {
    const tdClass = 'px-4 py-3.5 whitespace-nowrap text-sm text-gray-600';
    const tdBold = 'px-4 py-3.5 whitespace-nowrap text-sm font-medium text-gray-900';
    const tdCenter = 'px-4 py-3.5 whitespace-nowrap text-center';

    const sourceCell = (
      <td className={tdClass}>
        <div className="flex items-center gap-2">
          <div className={clsx(
            'flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center',
            prescription.source === 'app_camera' ? 'bg-blue-100' : prescription.source === 'kiosk' ? 'bg-green-100' : 'bg-purple-100'
          )}>
            {getSourceIcon(prescription.source)}
          </div>
          <span className="text-xs font-medium text-gray-700">{getSourceLabel(prescription.source)}</span>
        </div>
      </td>
    );

    const memberCell = (
      <td className={tdClass}>
        {prescription.isMember ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Star size={10} fill="currentColor" /> 단골
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400">
            일반
          </span>
        )}
      </td>
    );

    const deliveryCell = (
      <td className={tdClass}>
        {prescription.deliveryMethod ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700">
            <Package size={12} className="text-gray-400" />
            {prescription.deliveryMethod}
          </span>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>
    );

    const paymentAmountCell = (
      <td className={tdClass}>
        {prescription.paymentAmount ? (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-800">
            <CreditCard size={12} className="text-gray-400" />
            {prescription.paymentAmount}
          </span>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>
    );

    const paymentStatusCell = (
      <td className="px-4 py-3.5 whitespace-nowrap">
        {getPaymentStatusBadge(prescription.paymentStatus)}
      </td>
    );

    const prescriptionBtn = (
      <td className={tdCenter}>
        <button
          onClick={() => setSelectedPrescription(prescription)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Eye size={14} />
          보기
        </button>
      </td>
    );

    const commonCells = (
      <>
        <td className={tdClass}>{prescription.receivedAt}</td>
        <td className={tdBold}>{prescription.patientName}</td>
        <td className={tdClass}>{prescription.birthDate}</td>
        <td className={tdClass}>{prescription.phone}</td>
        <td className={tdClass}>
          {prescription.source === 'app_camera' ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400 border border-gray-200">
              확인 안됨
            </span>
          ) : (
            prescription.hospitalName
          )}
        </td>
        {sourceCell}
      </>
    );

    if (filter === 'app_camera') {
      return (
        <tr key={prescription.id} className="hover:bg-gray-50 transition-colors">
          {commonCells}
          {memberCell}
          {prescriptionBtn}
        </tr>
      );
    }

    if (filter === 'fax_telemed') {
      return (
        <tr key={prescription.id} className="hover:bg-gray-50 transition-colors">
          {commonCells}
          {memberCell}
          {deliveryCell}
          {paymentAmountCell}
          {paymentStatusCell}
          {prescriptionBtn}
        </tr>
      );
    }

    if (filter === 'kiosk') {
      return (
        <tr key={prescription.id} className="hover:bg-gray-50 transition-colors">
          {commonCells}
          {paymentAmountCell}
          {prescriptionBtn}
        </tr>
      );
    }

    // Default: 'all'
    return (
      <tr key={prescription.id} className="hover:bg-gray-50 transition-colors">
        {commonCells}
        {prescriptionBtn}
      </tr>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-600" />
            처방전 접수 목록
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            처방전을 관리합니다.
          </p>
        </div>
        <div className="flex gap-2">
        </div>
      </header>

      {/* Filter & Search Toolbar */}
      <div className="px-6 py-2.5 bg-white border-b border-gray-100 flex items-center justify-between gap-3">
        {/* Left: filter chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {([
            { value: 'all', label: '전체', icon: undefined as React.ReactNode },
            { value: 'app_camera', label: '고객 앱 촬영', icon: <Camera size={13} /> as React.ReactNode },
            { value: 'fax_telemed', label: '의사 웹 전송', icon: <Printer size={13} /> as React.ReactNode },
            { value: 'kiosk', label: '키오스크 스캔', icon: <Monitor size={13} /> as React.ReactNode },
          ]).map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => setFilter(value as 'all' | 'app_camera' | 'fax_telemed' | 'kiosk')}
              className={clsx(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium border transition-all',
                filter === value
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-gray-200 text-gray-500 bg-white hover:border-gray-400 hover:text-gray-700'
              )}
            >
              {icon}
              {label}
            </button>
          ))}
          <div className="w-px h-4 bg-gray-200 mx-1" />
          <select
            className="text-[13px] border border-gray-200 text-gray-500 rounded-full px-3 py-1 bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">모든 상태</option>
            <option value="received">접수</option>
            <option value="dispensing">조제중</option>
            <option value="done">조제완료</option>
          </select>
        </div>
        {/* Right: count + search */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-[13px] text-gray-400">
            총 <span className="text-blue-600 font-semibold">{filteredPrescriptions.length}</span>건
          </span>
          <div className="relative">
            <input
              type="text"
              placeholder="고객명, 병원명 검색"
              className="w-52 pl-8 pr-3 py-1.5 text-[13px] border border-gray-200 rounded-full bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400"
            />
            <Search className="absolute left-2.5 top-2 text-gray-400" size={14} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {renderTableHeader()}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPrescriptions.map((prescription) => renderTableRow(prescription))}
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
