import React, { useState } from 'react';
import { MessageSquare, ClipboardList, Send } from 'lucide-react';
import { clsx } from 'clsx';
import { SmsInvite } from './SmsInvite';
import { SmsInviteHistory } from './SmsInviteHistory';

interface SmsInviteLayoutProps {
  initialTab?: 'invite' | 'history';
}

export const SmsInviteLayout: React.FC<SmsInviteLayoutProps> = ({ initialTab = 'invite' }) => {
  const [activeTab, setActiveTab] = useState<'invite' | 'history'>(initialTab);

  const tabs = [
    { id: 'invite', label: '문자 발송', icon: Send },
    { id: 'history', label: '문자 발송 내역', icon: ClipboardList },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 pt-6 flex-none">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="text-blue-600" size={24} />
            앱 설치 문자 발송
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeTab === 'invite' 
              ? "고객에게 앱 설치 링크가 포함된 초대 문자를 발송합니다." 
              : "발송된 앱 설치 초대 문자와 웰체크 가입 현황을 확인합니다."}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 -mb-px px-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={clsx(
                "flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all relative border-b-2",
                activeTab === tab.id
                  ? "text-blue-600 font-bold border-blue-600 bg-blue-50/30"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-transparent"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'invite' ? <SmsInvite /> : <SmsInviteHistory />}
      </div>
    </div>
  );
};
