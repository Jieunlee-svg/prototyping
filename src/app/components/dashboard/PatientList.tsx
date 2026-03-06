import React from 'react';
import {
  Search,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { clsx } from 'clsx';

// Mock Data
interface Patient {
  id: string;
  name: string;
  status: 'new' | 'risk' | 'normal';
  medicationStatus: string;
  birthDate: string;
  gender: '남성' | '여성';
  age: number;
  prescriptionNo: string;
  comorbidities: string;
  adherenceRate: number; // 0-100
  phone: string;
  pharmacist: string;
  lastVisit: string;
  membership: boolean;
  managementStatus: string;
}

const MOCK_DATA: Patient[] = [
  { id: '1', name: '이채림', status: 'normal', medicationStatus: '고혈압', birthDate: '1987-08-03', gender: '여성', age: 40, prescriptionNo: '2305-1201', comorbidities: '-', adherenceRate: 85, phone: '010-3423-7918', pharmacist: '김약사', lastVisit: '2026-02-05', membership: true, managementStatus: '정기 상담 예정' },
  { id: '2', name: '황소영', status: 'new', medicationStatus: '당뇨', birthDate: '2001-04-18', gender: '여성', age: 26, prescriptionNo: '2305-1202', comorbidities: '-', adherenceRate: 40, phone: '010-2488-3976', pharmacist: '김약사', lastVisit: '2026-02-05', membership: true, managementStatus: '상담 필요' },
  { id: '3', name: '최수리', status: 'risk', medicationStatus: '고혈압', birthDate: '1998-03-04', gender: '여성', age: 29, prescriptionNo: '-', comorbidities: '비만', adherenceRate: 20, phone: '010-7793-6958', pharmacist: '이약사', lastVisit: '2026-02-05', membership: true, managementStatus: '집중 관리' },
  { id: '4', name: '박민지', status: 'risk', medicationStatus: '당뇨(전) • 고혈압', birthDate: '1996-05-08', gender: '여성', age: 31, prescriptionNo: '2305-1150', comorbidities: '수면장애', adherenceRate: 95, phone: '010-6485-1585', pharmacist: '박약사', lastVisit: '2026-02-04', membership: false, managementStatus: '가입 권유' },
  { id: '5', name: '김미래', status: 'normal', medicationStatus: '미실시', birthDate: '1987-03-17', gender: '여성', age: 40, prescriptionNo: '-', comorbidities: '-', adherenceRate: 0, phone: '010-6371-5228', pharmacist: '김약사', lastVisit: '2026-02-04', membership: true, managementStatus: '정기 상담' },
  { id: '6', name: '류현미', status: 'normal', medicationStatus: '미실시', birthDate: '1982-04-22', gender: '여성', age: 45, prescriptionNo: '-', comorbidities: '-', adherenceRate: 0, phone: '010-8867-6868', pharmacist: '최약사', lastVisit: '2026-02-04', membership: true, managementStatus: '정기 상담' },
  { id: '7', name: '이용운', status: 'normal', medicationStatus: '미실시', birthDate: '1977-05-20', gender: '남성', age: 50, prescriptionNo: '-', comorbidities: '-', adherenceRate: 0, phone: '010-2626-6159', pharmacist: '최약사', lastVisit: '2026-02-04', membership: false, managementStatus: '초대하기' },
  { id: '8', name: '임유미', status: 'normal', medicationStatus: '미실시', birthDate: '1992-11-14', gender: '여성', age: 35, prescriptionNo: '-', comorbidities: '-', adherenceRate: 0, phone: '010-3616-8575', pharmacist: '최약사', lastVisit: '2026-02-04', membership: true, managementStatus: '정기 상담' },
  { id: '9', name: '수민테스트', status: 'risk', medicationStatus: '당뇨 • 고혈압', birthDate: '1971-02-04', gender: '남성', age: 56, prescriptionNo: '-', comorbidities: '-', adherenceRate: 60, phone: '010-0160-0247', pharmacist: '박약사', lastVisit: '2026-02-04', membership: true, managementStatus: '상담 필요' },
  { id: '10', name: '박서희', status: 'risk', medicationStatus: '당뇨(전) • 고혈압(전)', birthDate: '1996-08-24', gender: '여성', age: 31, prescriptionNo: '-', comorbidities: '비만, 우울증', adherenceRate: 88, phone: '010-9914-8158', pharmacist: '김약사', lastVisit: '2026-02-03', membership: true, managementStatus: '집중 관리' },
];

interface PatientListProps {
  onPatientClick?: (id: string) => void;
}

export const PatientList: React.FC<PatientListProps> = ({ onPatientClick }) => {
  const handlePatientClick = (patientId: string) => {
    if (onPatientClick) {
      onPatientClick(patientId);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-[calc(100vh-64px)]">
      {/* Search */}
      <div className="flex items-center justify-end mb-6">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="이름 또는 휴대폰 번호 검색"
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>
      </div>

      {/* Summary */}
      <div className="mb-4">
        <h3 className="font-bold text-gray-800">
          총 등록 고객 수 <span className="text-blue-600">(560)</span>
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          키오스크에 휴대폰 번호를 입력했거나 웰체크 앱에 회원가입한 고객입니다.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">이름</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">휴대폰 번호</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">생년월일(나이)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">관리질환</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">복약 순응도<br />(30일 이내)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">최근 복약 상담 일자</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {MOCK_DATA.map((patient) => (
                <tr key={patient.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handlePatientClick(patient.id)}
                      className="flex items-center space-x-2 text-left group"
                    >
                      <span className="font-medium text-gray-900 group-hover:text-blue-600 group-hover:underline">{patient.name}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{patient.phone}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {patient.birthDate} <span className="text-gray-400">({patient.age})</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <span className={clsx(
                      "px-2 py-0.5 rounded text-xs",
                      patient.medicationStatus === '미실시' ? 'bg-gray-100 text-gray-500' :
                        patient.medicationStatus.includes('당뇨') || patient.medicationStatus.includes('고혈압') ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                          'text-gray-600'
                    )}>
                      {patient.medicationStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center">
                      <span className={clsx(
                        "text-sm font-bold",
                        patient.adherenceRate >= 80 ? "text-green-600" :
                          patient.adherenceRate >= 50 ? "text-orange-500" : "text-gray-400"
                      )}>
                        {patient.adherenceRate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{patient.prescriptionNo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
  );
};

