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
import { MedicationNotificationSettings } from './components/dashboard/MedicationNotificationSettings';
import { ConsultationHistory } from './components/dashboard/ConsultationHistory';
import { LoginScreen } from './components/auth/LoginScreen';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState<'list' | 'detail' | 'sms' | 'prescription' | 'settings' | 'notice' | 'consultation-c' | 'consultation-history' | 'consultation-reminder'>('consultation-c');
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
            <div className="absolute inset-0 overflow-hidden">
              <ConsultationHistory />
            </div>
          ) : view === 'consultation-reminder' ? (
            <div className="absolute inset-0 overflow-hidden">
              <MedicationNotificationSettings onBack={() => setView('consultation-c')} />
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