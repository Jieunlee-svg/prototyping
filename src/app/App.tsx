import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { AppFooter } from './components/layout/AppFooter';
import { PatientList } from './pages/patient/PatientList';
import { PatientDetail } from './pages/patient/PatientDetail';
import { SmsInviteLayout } from './pages/sms/SmsInviteLayout';
import { PrescriptionList } from './pages/prescription/PrescriptionList';
import { PharmacySettings } from './pages/settings/PharmacySettings';
import { NoticeList } from './pages/settings/NoticeList';
import { MedicationConsultationC } from './pages/consultation/MedicationConsultationC';
import { ReminderSettingsPage } from './components/consultation/ReminderSettingsPage';
import { MedicationNotificationSettings } from './pages/consultation/MedicationNotificationSettings';
import { ConsultationHistory } from './pages/consultation/ConsultationHistory';
import { WellcheckLanding } from './components/auth/WellcheckLanding';
import { MyInfo } from './pages/settings/MyInfo';
import chatIcon from '../assets/chat-icon.png';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState<'list' | 'detail' | 'sms' | 'prescription' | 'settings' | 'notice' | 'consultation-c' | 'consultation-history' | 'consultation-reminder' | 'my-info'>('list');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showChatIcon, setShowChatIcon] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'basic' | 'hours' | 'reminder' | 'app'>('basic');
  const [smsInitialTab, setSmsInitialTab] = useState<'invite' | 'history'>('invite');

  const openSettings = (tab: 'basic' | 'hours' | 'reminder' | 'app' = 'basic') => {
    setSettingsInitialTab(tab);
    setView('settings');
  };

  const openSms = (tab: 'invite' | 'history' = 'invite') => {
    setSmsInitialTab(tab);
    setView('sms');
  };

  const handlePatientClick = (id: string) => {
    setSelectedPatientId(id);
    setView('detail');
  };

  const handleBack = () => {
    setView('list');
    setSelectedPatientId(null);
  };

  if (!isLoggedIn) {
    return (
      <WellcheckLanding
        onLogin={(isFirstTime) => {
          setIsLoggedIn(true);
          if (isFirstTime) {
            setSettingsInitialTab('basic');
            setView('settings');
          } else {
            setView('list');
          }
        }}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans relative">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeView={view}
        onSmsClick={() => openSms('invite')}
        onSmsHistoryClick={() => openSms('history')}
        onDashboardClick={() => setView('list')}
        onPrescriptionClick={() => setView('prescription')}
        onConsultationCClick={() => setView('consultation-c')}
        onConsultationHistoryClick={() => setView('consultation-history')}
        onConsultationReminderClick={() => setView('consultation-reminder')}
        onSettingsClick={() => openSettings('basic')}
        onNoticeClick={() => setView('notice')}
        onMyInfoClick={() => setView('my-info')}
        onChatClick={() => setShowChatIcon(true)}
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
              <SmsInviteLayout key={smsInitialTab} initialTab={smsInitialTab} />
            </div>
          ) : view === 'prescription' ? (
            <div className="absolute inset-0 overflow-hidden">
              <PrescriptionList onOpenSettings={() => openSettings('reminder')} onPatientClick={handlePatientClick} />
            </div>
          ) : view === 'consultation-c' ? (
            <div className="absolute inset-0 overflow-hidden">
              <MedicationConsultationC />
            </div>
          ) : view === 'consultation-history' ? (
            <div className="absolute inset-0 overflow-hidden">
              <ConsultationHistory onBack={() => setView('consultation-c')} />
            </div>
          ) : view === 'consultation-reminder' ? (
            <div className="absolute inset-0 overflow-hidden">
              <MedicationNotificationSettings onBack={() => setView('consultation-c')} />
            </div>
          ) : view === 'settings' ? (
            <div className="absolute inset-0 overflow-hidden">
              <PharmacySettings key={settingsInitialTab} initialTab={settingsInitialTab} />
            </div>
          ) : view === 'notice' ? (
            <div className="absolute inset-0 overflow-hidden">
              <NoticeList />
            </div>
          ) : view === 'my-info' ? (
            <div className="absolute inset-0 overflow-hidden">
              <MyInfo />
            </div>
          ) : (
            <div className="absolute inset-0 overflow-hidden">
              <PatientDetail onBack={handleBack} patientId={selectedPatientId} />
            </div>
          )}
        </main>
        <AppFooter />
      </div>

      {/* Floating Chat Icon */}
      {showChatIcon && (
        <div className="fixed bottom-10 right-10 z-[1000] animate-in fade-in zoom-in duration-300">
          <button 
            className="group relative transition-transform hover:scale-105 active:scale-95 shadow-2xl rounded-full"
            onClick={() => setShowChatIcon(false)}
            title="상담 종료"
          >
            <img 
              src={chatIcon} 
              alt="1:1 채팅 문의" 
              className="w-[70px] h-[70px] object-contain drop-shadow-xl"
            />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;