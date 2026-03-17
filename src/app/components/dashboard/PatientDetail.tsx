import React from 'react';
import { PatientDetail17 } from './PatientDetail17';
import { PatientDetailFull } from './PatientDetailFull';

interface PatientDetailProps {
  onBack: () => void;
  patientId: string | null;
}

export const PatientDetail: React.FC<PatientDetailProps> = ({ onBack, patientId }) => {
  // Router logic based on patientId
  // ID 1: 십칠스프린트
  // ID 2: 미정스프린트
  
  if (patientId === '1') {
    return <PatientDetail17 onBack={onBack} patientId={patientId} />;
  }
  
  if (patientId === '2') {
    return <PatientDetailFull onBack={onBack} patientId={patientId} />;
  }

  // Fallback
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-gray-500">
      <p>상세 정보를 불러올 수 없는 회원입니다.</p>
      <button 
        onClick={onBack}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        목록으로 돌아가기
      </button>
    </div>
  );
};
