import React from 'react';
import { PatientDetailSprint17 } from './PatientDetailSprint17';
import { PatientDetailLater } from './PatientDetailLater';

interface PatientDetailProps {
  onBack: () => void;
  patientId: string | null;
}

export const PatientDetail: React.FC<PatientDetailProps> = ({ onBack, patientId }) => {
  // Router logic based on patientId
  // ID 1: Sprint 17 (formerly 이채림)
  // ID 2: Later (formerly 황소영)
  
  if (patientId === '1') {
    return <PatientDetailSprint17 onBack={onBack} patientId={patientId} />;
  }
  
  if (patientId === '2') {
    return <PatientDetailLater onBack={onBack} patientId={patientId} />;
  }

  // Fallback or other patients (though others are now unclickable in PatientList)
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
