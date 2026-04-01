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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';


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
  onChatClick?: () => void;
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
  onChatClick,
  activeView = 'list'
}) => {
  const isConsultationActive = activeView === 'consultation-c' || activeView === 'consultation-history' || activeView === 'consultation-reminder';
  const [consultationOpen, setConsultationOpen] = useState(isConsultationActive);
  const isSmsActive = activeView === 'sms' || activeView === 'sms-history';
  const [smsOpen, setSmsOpen] = useState(isSmsActive);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutAlert(true);
  };

  const confirmLogout = () => {
    setShowLogoutAlert(false);
    if (onLogout) onLogout();
  };


  const handleMenuClick = (e: React.MouseEvent, label: string) => {
    e.preventDefault();
    if (label === '단골 고객' && onDashboardClick) {
      onDashboardClick();
    } else if (label === '처방전' && onPrescriptionClick) {
      onPrescriptionClick();
    } else if (label === '공지사항 TBD' && onNoticeClick) {
      onNoticeClick();
    }
  };

  const isItemActive = (label: string) => {
    if (label === '처방전' && activeView === 'prescription') return true;
    if (label === '단골 고객' && (activeView === 'list' || activeView === 'detail')) return true;
    if (label === '공지사항 TBD' && activeView === 'notice') return true;
    if (label === '계정 정보' && activeView === 'my-info') return true;
    return false;
  };

  if (collapsed) {
    return (
      <div className={clsx("w-20 bg-white border-r border-gray-200 flex flex-col h-screen items-center py-6 shrink-0 z-50", className)}>
        {/* Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="p-2 mb-8 rounded-xl bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all border border-gray-100"
        >
          <Menu size={20} />
        </button>

        {/* Mini Navigation */}
        <div className="flex-1 w-full space-y-4 px-2 overflow-y-auto">
          {[
            { icon: Users, label: '단골 고객', active: isItemActive('단골 고객'), onClick: onDashboardClick },
            { icon: Stethoscope, label: '처방전', active: isItemActive('처방전'), onClick: onPrescriptionClick },
            // { icon: HeartPulse, label: '복약 상담 TBD', active: isConsultationActive, onClick: onConsultationCClick },
            { icon: MessageSquare, label: '앱 설치 문자 발송', active: isSmsActive, onClick: onSmsClick },
            // 공지사항 메뉴 숨김 (복원 시 아래 주석 해제)
            // { icon: Bell, label: '공지사항 TBD', active: isItemActive('공지사항 TBD'), onClick: onNoticeClick },
          ].map((item, idx) => (
            <div key={idx} className="relative group flex justify-center">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  item.onClick?.();
                }}
                className={clsx(
                  "p-3 rounded-xl transition-all relative",
                  item.active 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                    : "text-gray-400 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon size={22} />
                {item.active && (
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-blue-600 rounded-full" />
                )}
              </button>
              
              {/* Tooltip */}
              <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-[11px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[60] font-medium">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions Mini */}
        <div className="pt-4 border-t border-gray-100 w-full flex flex-col items-center gap-4 mb-4">
          <button 
            onClick={onSettingsClick}
            className={clsx(
              "p-2 rounded-lg transition-colors",
              activeView === 'settings' ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:bg-gray-100"
            )}
          >
            <Settings size={20} />
          </button>
          <button 
            onClick={handleLogoutClick}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
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
          {/* 단골 고객, 처방전 */}
          {[
            { icon: Users, label: '단골 고객', id: '단골 고객' },
            { icon: Stethoscope, label: '처방전', id: '처방전' },
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

          {/* 복약 상담 메뉴 숨김 (복원 시 아래 주석 블록 전체를 해제)
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
              복약 상담 TBD
              <span className="ml-auto">
                {consultationOpen ? <ChevronDown size={14} /> : <ChevronRightIcon size={14} />}
              </span>
            </a>
            {consultationOpen && (
              <ul className="mt-1 space-y-0.5">
                {[
                  { icon: PlayCircle, label: '복약 상담 TBD', view: 'consultation-c' as const, onClick: onConsultationCClick },
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
          */}

          {/* 앱 설치 문자 발송 */}
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (onSmsClick) onSmsClick();
              }}
              className={clsx(
                "flex items-center px-5 py-3 text-sm font-medium transition-colors",
                isSmsActive
                  ? "text-white bg-blue-600 shadow-md"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <MessageSquare size={18} className="mr-3" />
              앱 설치 문자 발송
            </a>
          </li>

          {/* 공지사항 메뉴 숨김 (복원 시 아래 주석 블록 전체를 해제)
          {[
            { icon: Bell, label: '공지사항 TBD', id: '공지사항 TBD' },
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
          */}
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
          <button 
            onClick={onChatClick}
            className="flex items-center w-full px-2 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            <HelpCircle size={16} className="mr-3" />
            1:1 채팅 문의
          </button>
          
          <div className="relative group/tooltip w-full">
            <button
              onClick={() => window.open('https://939.co.kr/01414/', '_blank')}
              className="flex items-center w-full px-2 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              <MonitorSmartphone size={16} className="mr-3" />
              원격지원 요청하기
            </button>
            
            {/* Tooltip */}
            <div className="absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-[12px] rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all whitespace-nowrap z-[100] border border-gray-700 pointer-events-none">
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-gray-300">상담원 통화 후 진행해 주세요.</span>
                <span className="font-bold text-white text-[13px]">☎️ 1551-3633</span>
              </div>
              {/* Arrow */}
              <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 border-l border-b border-gray-700 rotate-45" />
            </div>
          </div>
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
              계정 정보
            </button>
            <button
              onClick={handleLogoutClick}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 text-red-600 hover:bg-red-50 hover:border-red-200"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* Banner area */}

      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>로그아웃</AlertDialogTitle>
            <AlertDialogDescription>
              정말 로그아웃 하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>아니오</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout} className="bg-red-600 hover:bg-red-700">예</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};