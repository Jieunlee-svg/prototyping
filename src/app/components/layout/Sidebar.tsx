import React, { useState } from 'react';
import { 
  Bell, 
  Users, 
  Stethoscope, 
  HeartPulse, 
  Activity, 
  MonitorSmartphone, 
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  Search,
  PlayCircle,
  ClipboardList,
  BellRing
} from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  className?: string;
  onSmsClick?: () => void;
  onDashboardClick?: () => void;
  onPrescriptionClick?: () => void;
  onConsultationCClick?: () => void;
  onConsultationHistoryClick?: () => void;
  onConsultationReminderClick?: () => void;
  onSettingsClick?: () => void;
  onNoticeClick?: () => void;
  onLogout?: () => void;
  activeView?: 'list' | 'detail' | 'sms' | 'prescription' | 'settings' | 'notice' | 'consultation-c' | 'consultation-history' | 'consultation-reminder';
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  className, 
  onSmsClick, 
  onDashboardClick, 
  onPrescriptionClick,
  onConsultationCClick,
  onConsultationHistoryClick,
  onConsultationReminderClick,
  onSettingsClick,
  onNoticeClick,
  onLogout,
  activeView = 'list' 
}) => {
  const isConsultationActive = activeView === 'consultation-c' || activeView === 'consultation-history' || activeView === 'consultation-reminder';
  const [consultationOpen, setConsultationOpen] = useState(isConsultationActive);

  const handleMenuClick = (e: React.MouseEvent, label: string) => {
    e.preventDefault();
    if (label === '앱 설치문자 발송' && onSmsClick) {
      onSmsClick();
    } else if (label === '단골 고객' && onDashboardClick) {
      onDashboardClick();
    } else if (label === '처방전' && onPrescriptionClick) {
      onPrescriptionClick();
    } else if (label === '공지사항' && onNoticeClick) {
      onNoticeClick();
    }
  };

  const isItemActive = (label: string) => {
    if (label === '앱 설치문자 발송' && activeView === 'sms') return true;
    if (label === '처방전' && activeView === 'prescription') return true;
    if (label === '단골 고객' && (activeView === 'list' || activeView === 'detail')) return true;
    if (label === '공지사항' && activeView === 'notice') return true;
    return false;
  };

  return (
    <div className={clsx("w-64 bg-white border-r border-gray-200 flex flex-col h-screen", className)}>
      {/* Logo Area */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-600">Wellcheck</h1>
        <button className="text-gray-400 hover:text-gray-600">
          <ChevronLeft size={20} />
        </button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="고객 검색" 
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-1">
          {/* 복약 상담 with sub-menu */}
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setConsultationOpen(!consultationOpen);
                if (!isConsultationActive && onConsultationCClick) {
                  onConsultationCClick();
                }
              }}
              className={clsx(
                "flex items-center px-5 py-3 text-sm font-medium transition-colors",
                isConsultationActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <HeartPulse size={18} className="mr-3" />
              복약 상담
              <span className="ml-auto">
                {consultationOpen ? <ChevronDown size={14} /> : <ChevronRightIcon size={14} />}
              </span>
            </a>
            {consultationOpen && (
              <ul className="mt-1 space-y-0.5">
                {[
                  { icon: PlayCircle, label: '복약 상담 시작', view: 'consultation-c' as const, onClick: onConsultationCClick },
                  { icon: ClipboardList, label: '복약 상담 내역', view: 'consultation-history' as const, onClick: onConsultationHistoryClick },
                  { icon: BellRing, label: '복약 알림 설정', view: 'consultation-reminder' as const, onClick: onConsultationReminderClick },
                ].map((sub) => (
                  <li key={sub.view}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        sub.onClick?.();
                      }}
                      className={clsx(
                        "flex items-center pl-11 pr-5 py-2.5 text-sm transition-colors",
                        activeView === sub.view
                          ? "text-white bg-blue-600 font-medium"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <sub.icon size={15} className="mr-2.5" />
                      {sub.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>

          {/* Other menu items */}
          {[
            { icon: Users, label: '단골 고객', id: '단골 고객' },
            { icon: Stethoscope, label: '처방전', id: '처방전' },
            { icon: MessageSquare, label: '앱 설치문자 발송', id: '앱 설치문자 발송' },
            { icon: Bell, label: '공지사항', id: '공지사항' },
          ].map((item, index) => (
            <li key={index}>
              <a 
                href="#" 
                onClick={(e) => handleMenuClick(e, item.id)}
                className={clsx(
                  "flex items-center px-5 py-3 text-sm font-medium transition-colors",
                  isItemActive(item.id)
                    ? "text-white bg-blue-600" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon size={18} className="mr-3" />
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="space-y-1 mb-4">
          <button 
            onClick={onSettingsClick}
            className={clsx(
              "flex items-center w-full px-2 py-2 text-sm rounded",
              activeView === 'settings' 
                ? "bg-blue-50 text-blue-700 font-medium" 
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Settings size={16} className="mr-3" />
            약국 설정
          </button>
          <button className="flex items-center w-full px-2 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">
            <HelpCircle size={16} className="mr-3" />
            1:1 채팅 문의
          </button>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-semibold text-gray-900">김약사 약사</p>
              <p className="text-xs text-gray-500">서울종로약국</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">내 정보</button>
            <button 
              onClick={onLogout}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 text-red-600 hover:bg-red-50 hover:border-red-200"
            >
              로그아웃
            </button>
          </div>
        </div>
        
        {/* Banner area */}

      </div>
    </div>
  );
};