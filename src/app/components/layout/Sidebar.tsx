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
  Menu,
  PlayCircle,
  ClipboardList,
  BellRing
} from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onSmsClick?: () => void;
  onSmsHistoryClick?: () => void;
  onDashboardClick?: () => void;
  onPrescriptionClick?: () => void;
  onConsultationCClick?: () => void;
  onConsultationHistoryClick?: () => void;
  onConsultationReminderClick?: () => void;
  onSettingsClick?: () => void;
  onNoticeClick?: () => void;
  onMyInfoClick?: () => void;
  onLogout?: () => void;
  activeView?: 'list' | 'detail' | 'sms' | 'sms-history' | 'prescription' | 'settings' | 'notice' | 'consultation-c' | 'consultation-history' | 'consultation-reminder' | 'my-info';
}

export const Sidebar: React.FC<SidebarProps> = ({
  className,
  collapsed = false,
  onToggleCollapse,
  onSmsClick,
  onSmsHistoryClick,
  onDashboardClick,
  onPrescriptionClick,
  onConsultationCClick,
  onConsultationHistoryClick,
  onConsultationReminderClick,
  onSettingsClick,
  onNoticeClick,
  onMyInfoClick,
  onLogout,
  activeView = 'list'
}) => {
  const isConsultationActive = activeView === 'consultation-c' || activeView === 'consultation-history' || activeView === 'consultation-reminder';
  const [consultationOpen, setConsultationOpen] = useState(isConsultationActive);
  const isSmsActive = activeView === 'sms' || activeView === 'sms-history';
  const [smsOpen, setSmsOpen] = useState(isSmsActive);

  const handleMenuClick = (e: React.MouseEvent, label: string) => {
    e.preventDefault();
    if (label === '단골 고객' && onDashboardClick) {
      onDashboardClick();
    } else if (label === '처방전' && onPrescriptionClick) {
      onPrescriptionClick();
    } else if (label === '공지사항' && onNoticeClick) {
      onNoticeClick();
    }
  };

  const isItemActive = (label: string) => {
    if (label === '처방전' && activeView === 'prescription') return true;
    if (label === '단골 고객' && (activeView === 'list' || activeView === 'detail')) return true;
    if (label === '공지사항' && activeView === 'notice') return true;
    if (label === '내 정보' && activeView === 'my-info') return true;
    return false;
  };

  if (collapsed) {
    return (
      <div className={clsx("w-16 bg-white border-r border-gray-200 flex flex-col h-screen items-center py-4 shrink-0", className)}>
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors mb-4"
        >
          <Menu size={20} />
        </button>
        <span className="text-xs font-bold text-blue-600 writing-mode-vertical select-none tracking-widest">W</span>
      </div>
    );
  }

  return (
    <div className={clsx("w-64 bg-white border-r border-gray-200 flex flex-col h-screen shrink-0 transition-all", className)}>
      {/* Logo Area */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-600">Wellcheck</h1>
        <button
          onClick={onToggleCollapse}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
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
                const willOpen = !consultationOpen;
                setConsultationOpen(willOpen);
                if (willOpen && onConsultationCClick) {
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
                  { icon: PlayCircle, label: '복약 상담', view: 'consultation-c' as const, onClick: onConsultationCClick },
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

          {/* 앱 설치문자 발송 with sub-menu */}
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                const willOpen = !smsOpen;
                setSmsOpen(willOpen);
                if (willOpen && onSmsClick) {
                  onSmsClick();
                }
              }}
              className={clsx(
                "flex items-center px-5 py-3 text-sm font-medium transition-colors",
                isSmsActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <MessageSquare size={18} className="mr-3" />
              앱 설치문자 발송
              <span className="ml-auto">
                {smsOpen ? <ChevronDown size={14} /> : <ChevronRightIcon size={14} />}
              </span>
            </a>
            {smsOpen && (
              <ul className="mt-1 space-y-0.5">
                {[
                  { icon: MessageSquare, label: '앱 설치 문자 발송', view: 'sms' as const, onClick: onSmsClick },
                  { icon: ClipboardList, label: '앱 설치 문자 발송 내역', view: 'sms-history' as const, onClick: onSmsHistoryClick },
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
            <button
              onClick={onMyInfoClick}
              className={clsx(
                "flex-1 px-2 py-1 text-xs border rounded transition-colors",
                activeView === 'my-info'
                  ? "bg-blue-50 border-blue-200 text-blue-700 font-medium"
                  : "border-gray-300 hover:bg-gray-50 text-gray-700"
              )}
            >
              내 정보
            </button>
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