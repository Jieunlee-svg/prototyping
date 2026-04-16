import React from 'react';
import { PatientDetail17 } from './PatientDetail17';
import { PatientDetailFull } from './PatientDetailFull';
import { PatientDetailWithdrawn } from './PatientDetailWithdrawn';

interface PatientDetailProps {
  onBack: () => void;
  patientId: string | null;
}

export const PatientDetail: React.FC<PatientDetailProps> = ({ onBack, patientId }) => {
  // Router logic based on patientId
  // ID 1: 십칠스프린트
  // ID 2: 미정스프린트
  // ID 11: 십칠스프린트탈퇴 (탈퇴 회원)
  
  if (patientId === '1') {
    return <PatientDetail17 onBack={onBack} patientId={patientId} />;
  }
  
  if (patientId === '2') {
    return <PatientDetailFull onBack={onBack} patientId={patientId} />;
  }

  if (patientId === '11') {
    return <PatientDetailWithdrawn onBack={onBack} patientId={patientId} />;
  }

  // Fallback: 처방전 목록 등에서 클릭 시 PatientDetail17로 이동
  return <PatientDetail17 onBack={onBack} patientId={patientId} />;
};
