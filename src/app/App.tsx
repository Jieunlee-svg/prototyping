import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { PatientList } from './components/dashboard/PatientList';
import { PatientDetail } from './components/dashboard/PatientDetail';
import { SmsInvite } from './components/dashboard/SmsInvite';
import { PrescriptionList } from './components/dashboard/PrescriptionList';
import { PharmacySettings } from './components/dashboard/PharmacySettings';
import { NoticeList } from './components/dashboard/NoticeList';
import { MedicationConsultationC } from './components/dashboard/MedicationConsultationC';
import { ReminderSettingsPage } from './components/dashboard/ReminderSettingsPage';
import { LoginScreen } from './components/auth/LoginScreen';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [view, setView] = useState<'list' | 'detail' | 'sms' | 'prescription' | 'settings' | 'notice' | 'consultation-c' | 'consultation-history' | 'consultation-reminder'>('list');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const handlePatientClick = (id: string) => {
    setSelectedPatientId(id);
    setView('detail');
  };

  const handleBack = () => {
    setView('list');
    setSelectedPatientId(null);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar 
        activeView={view} 
        onSmsClick={() => setView('sms')} 
        onDashboardClick={() => setView('list')}
        onPrescriptionClick={() => setView('prescription')}
        onConsultationCClick={() => setView('consultation-c')}
        onConsultationHistoryClick={() => setView('consultation-history')}
        onConsultationReminderClick={() => setView('consultation-reminder')}
        onSettingsClick={() => setView('settings')}
        onNoticeClick={() => setView('notice')}
        onLogout={() => setIsLoggedIn(false)}
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-hidden relative">
          {view === 'list' ? (
            <div className="absolute inset-0 overflow-y-auto">
              <PatientList onPatientClick={handlePatientClick} />
            </div>
          ) : view === 'sms' ? (
            <div className="absolute inset-0 overflow-hidden">
              <SmsInvite />
            </div>
          ) : view === 'prescription' ? (
            <div className="absolute inset-0 overflow-hidden">
              <PrescriptionList />
            </div>
          ) : view === 'consultation-c' ? (
            <div className="absolute inset-0 overflow-hidden">
              <MedicationConsultationC />
            </div>
          ) : view === 'consultation-history' ? (
            <div className="absolute inset-0 overflow-auto">
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <p className="text-lg font-semibold text-gray-500">복약 상담 내역</p>
                <p className="text-sm mt-1">상담 내역이 여기에 표시됩니다.</p>
              </div>
            </div>
          ) : view === 'consultation-reminder' ? (
            <div className="absolute inset-0 overflow-hidden">
              <ReminderSettingsPage />
            </div>
          ) : view === 'settings' ? (
            <div className="absolute inset-0 overflow-hidden">
              <PharmacySettings />
            </div>
          ) : view === 'notice' ? (
            <div className="absolute inset-0 overflow-hidden">
              <NoticeList />
            </div>
          ) : (
            <div className="absolute inset-0 overflow-hidden">
              <PatientDetail onBack={handleBack} patientId={selectedPatientId} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;