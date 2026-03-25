import React, { useState } from 'react';
import {
  Search,
  Info,
  ArrowUpDown
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
  registeredAt: string; // 단골 등록 일시
  prescriptionCount: number; // 처방전 수
}

const MOCK_DATA: Patient[] = [
  { id: '1', name: '십칠스프린트', status: 'normal', medicationStatus: '고혈압', birthDate: '1987-08-03', gender: '여성', age: 40, prescriptionNo: '2305-1201', comorbidities: '-', adherenceRate: 85, phone: '010-3423-7918', pharmacist: '김약사', lastVisit: '2026-02-05', membership: true, managementStatus: '정기 상담 예정', registeredAt: '2026-01-20 14:30', prescriptionCount: 12 },
  { id: '2', name: '미정스프린트', status: 'new', medicationStatus: '당뇨', birthDate: '2001-04-18', gender: '여성', age: 26, prescriptionNo: '2305-1202', comorbidities: '-', adherenceRate: 40, phone: '010-2488-3976', pharmacist: '김약사', lastVisit: '2026-02-05', membership: true, managementStatus: '상담 필요', registeredAt: '2026-02-01 10:15', prescriptionCount: 5 },
  { id: '3', name: '최수리', status: 'risk', medicationStatus: '고혈압', birthDate: '1998-03-04', gender: '여성', age: 29, prescriptionNo: '-', comorbidities: '비만', adherenceRate: 20, phone: '010-7793-6958', pharmacist: '이약사', lastVisit: '2026-02-05', membership: true, managementStatus: '집중 관리', registeredAt: '2025-12-15 09:40', prescriptionCount: 24 },
  { id: '4', name: '박민지', status: 'risk', medicationStatus: '당뇨(전) • 고혈압', birthDate: '1996-05-08', gender: '여성', age: 31, prescriptionNo: '2305-1150', comorbidities: '수면장애', adherenceRate: 95, phone: '010-6485-1585', pharmacist: '박약사', lastVisit: '2026-02-04', membership: false, managementStatus: '가입 권유', registeredAt: '2026-02-10 16:20', prescriptionCount: 3 },
  { id: '5', name: '김미래', status: 'normal', medicationStatus: '미실시', birthDate: '1987-03-17', gender: '여성', age: 40, prescriptionNo: '-', comorbidities: '-', adherenceRate: 0, phone: '010-6371-5228', pharmacist: '김약사', lastVisit: '2026-02-04', membership: true, managementStatus: '정기 상담', registeredAt: '2026-01-05 11:00', prescriptionCount: 8 },
  { id: '6', name: '류현미', status: 'normal', medicationStatus: '미실시', birthDate: '1982-04-22', gender: '여성', age: 45, prescriptionNo: '-', comorbidities: '-', adherenceRate: 0, phone: '010-8867-6868', pharmacist: '최약사', lastVisit: '2026-02-04', membership: true, managementStatus: '정기 상담', registeredAt: '2025-11-20 15:45', prescriptionCount: 15 },
  { id: '7', name: '이용운', status: 'normal', medicationStatus: '미실시', birthDate: '1977-05-20', gender: '남성', age: 50, prescriptionNo: '-', comorbidities: '-', adherenceRate: 0, phone: '010-2626-6159', pharmacist: '최약사', lastVisit: '2026-02-04', membership: false, managementStatus: '초대하기', registeredAt: '2026-02-15 13:10', prescriptionCount: 1 },
  { id: '8', name: '임유미', status: 'normal', medicationStatus: '미실시', birthDate: '1992-11-14', gender: '여성', age: 35, prescriptionNo: '-', comorbidities: '-', adherenceRate: 0, phone: '010-3616-8575', pharmacist: '최약사', lastVisit: '2026-02-04', membership: true, managementStatus: '정기 상담', registeredAt: '2026-01-30 17:20', prescriptionCount: 4 },
  { id: '9', name: '수민테스트', status: 'risk', medicationStatus: '당뇨 • 고혈압', birthDate: '1971-02-04', gender: '남성', age: 56, prescriptionNo: '-', comorbidities: '-', adherenceRate: 60, phone: '010-0160-0247', pharmacist: '박약사', lastVisit: '2026-02-04', membership: true, managementStatus: '상담 필요', registeredAt: '2025-10-10 12:00', prescriptionCount: 30 },
  { id: '10', name: '박서희', status: 'risk', medicationStatus: '당뇨(전) • 고혈압(전)', birthDate: '1996-08-24', gender: '여성', age: 31, prescriptionNo: '-', comorbidities: '비만, 우울증', adherenceRate: 88, phone: '010-9914-8158', pharmacist: '김약사', lastVisit: '2026-02-03', membership: true, managementStatus: '집중 관리', registeredAt: '2026-02-05 08:50', prescriptionCount: 7 },
];

interface PatientListProps {
  onPatientClick?: (id: string) => void;
}

// 복약 순응도 계산식 안내 툴팁
const AdherenceTooltip: React.FC = () => (
  <span className="relative group inline-flex">
    <Info size={12} className="text-gray-400 cursor-help" />
    <span className="absolute top-full right-0 mt-2 w-64 rounded-xl bg-gray-900 px-4 py-3 text-[13px] text-white shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 z-[100] normal-case font-normal text-left leading-relaxed invisible group-hover:visible border border-gray-700">
      <div className="absolute -top-1.5 right-1.5 w-3 h-3 bg-gray-900 transform rotate-45 border-t border-l border-gray-700" />
      <strong className="block mb-2 text-blue-400 font-bold text-sm">복약 순응도 계산식</strong>
      <div className="bg-white/10 rounded-lg p-2.5 mb-3 font-mono text-center text-blue-200">
        (복용 횟수 ÷ 복용해야 할 횟수) × 100
      </div>
      <p className="text-gray-300 text-xs leading-relaxed">
        • 기간 내 총 복용 실적 기준으로 산출됩니다.<br />
        • 실제 복용 정보와 오차가 있을 수 있습니다.
      </p>
    </span>
  </span>
);

// 관리 질환 안내 툴팁
const DiseaseTooltip: React.FC = () => (
  <span className="relative group inline-flex">
    <Info size={12} className="text-gray-400 cursor-help" />
    <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 rounded-xl bg-gray-900 px-4 py-3 text-[13px] text-white shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 z-[100] normal-case font-normal text-left leading-relaxed invisible group-hover:visible border border-gray-700">
      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 transform rotate-45 border-t border-l border-gray-700" />
      <p className="text-gray-200 leading-snug">
        웰체크 앱에서 고객이 응답한 기초 건강 문진 내용을 기반으로 설정 합니다.
      </p>
    </span>
  </span>
);


export const PatientList: React.FC<PatientListProps> = ({ onPatientClick }) => {
  const [sortKey, setSortKey] = useState<keyof Patient>('registeredAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handlePatientClick = (patient: Patient) => {
    if (onPatientClick && (patient.name === '십칠스프린트' || patient.name === '미정스프린트')) {
      onPatientClick(patient.id);
    }
  };

  const handleSort = (key: keyof Patient) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const sortedPatients = [...MOCK_DATA].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            단골 고객 현황
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            웰체크 앱에 가입하고 우리 약국을 단골 약국으로 등록한 고객입니다.
          </p>
        </div>
      </header>

      <div className="p-6">
        {/* Filter & Search Toolbar */}
        <div className="px-4 py-2.5 bg-white border border-gray-100 rounded-t-xl flex items-center justify-between gap-3 mb-0">
          <div className="text-[13px] text-gray-400">
            총 <span className="text-blue-600 font-semibold">560</span>건
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="이름 또는 휴대폰 번호 검색"
              className="w-56 pl-8 pr-3 py-1.5 text-[13px] border border-gray-200 rounded-full bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400"
            />
            <Search className="absolute left-2.5 top-2 text-gray-400" size={14} />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] table-fixed">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-[14%] cursor-pointer group" onClick={() => handleSort('registeredAt')}>
                    <div className="flex items-center gap-1">
                      단골 등록 일시
                      <ArrowUpDown size={14} className={clsx("transition-colors", sortKey === 'registeredAt' ? "text-blue-500" : "text-gray-300 group-hover:text-gray-400")} />
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-[10%] cursor-pointer group" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1">
                      고객명
                      <ArrowUpDown size={14} className={clsx("transition-colors", sortKey === 'name' ? "text-blue-500" : "text-gray-300 group-hover:text-gray-400")} />
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-[10%] cursor-pointer group" onClick={() => handleSort('birthDate')}>
                    <div className="flex items-center gap-1">
                      생년월일
                      <ArrowUpDown size={14} className={clsx("transition-colors", sortKey === 'birthDate' ? "text-blue-500" : "text-gray-300 group-hover:text-gray-400")} />
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-[12%]">휴대폰 번호</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-[8%]">성별</th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-[10%] cursor-pointer group" onClick={() => handleSort('prescriptionCount')}>
                    <div className="flex items-center justify-center gap-1">
                      처방전 수
                      <ArrowUpDown size={14} className={clsx("transition-colors", sortKey === 'prescriptionCount' ? "text-blue-500" : "text-gray-300 group-hover:text-gray-400")} />
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-[22%] cursor-pointer group" onClick={() => handleSort('medicationStatus')}>
                    <div className="flex items-center gap-1">
                      관리 질환
                      <DiseaseTooltip />
                      <ArrowUpDown size={14} className={clsx("transition-colors", sortKey === 'medicationStatus' ? "text-blue-500" : "text-gray-300 group-hover:text-gray-400")} />
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-[14%] cursor-pointer group" onClick={() => handleSort('adherenceRate')}>
                    <div className="flex items-center justify-center gap-1">
                      30일 복약 순응도
                      <AdherenceTooltip />
                      <ArrowUpDown size={14} className={clsx("transition-colors", sortKey === 'adherenceRate' ? "text-blue-500" : "text-gray-300 group-hover:text-gray-400")} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-4 py-4 text-sm text-gray-600 tabular-nums">{patient.registeredAt}</td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handlePatientClick(patient)}
                        disabled={patient.name !== '십칠스프린트' && patient.name !== '미정스프린트'}
                        className={clsx(
                          "flex items-center space-x-2 text-left group",
                          (patient.name === '십칠스프린트' || patient.name === '미정스프린트') ? "cursor-pointer" : "cursor-default"
                        )}
                      >
                        <span className={clsx(
                          "font-bold text-gray-900 text-sm",
                          (patient.name === '십칠스프린트' || patient.name === '미정스프린트') && "group-hover:text-blue-600"
                        )}>
                          {patient.name}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 tabular-nums">{patient.birthDate}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 font-medium">{patient.phone}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{patient.gender}</td>
                    <td className="px-4 py-4 text-center text-sm text-gray-900 font-bold">{patient.prescriptionCount}건</td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      <div className="flex flex-wrap gap-1">
                        {patient.medicationStatus === '미실시' ? (
                          <span className="px-2 py-0.5 rounded-lg text-xs bg-gray-100 text-gray-500 font-medium">
                            미실시
                          </span>
                        ) : (
                          patient.medicationStatus.split(' • ').map((disease, idx) => (
                            <span 
                              key={idx}
                              className={clsx(
                                "px-2.5 py-1 rounded-lg text-[11px] border whitespace-nowrap font-bold",
                                (disease.includes('당뇨') || disease.includes('고혈압')) 
                                  ? 'bg-orange-50 text-orange-600 border-orange-100' 
                                  : 'bg-blue-50 text-blue-600 border-blue-100'
                              )}
                            >
                              {disease}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className={clsx(
                          "text-sm font-bold",
                          patient.adherenceRate >= 80 ? "text-emerald-600" : patient.adherenceRate >= 50 ? "text-orange-600" : "text-red-500"
                        )}>
                          {patient.adherenceRate}%
                        </span>
                      </div>
                    </td>
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
    </div>
  );
};

