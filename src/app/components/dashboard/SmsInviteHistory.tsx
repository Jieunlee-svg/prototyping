import React from 'react';
import { MessageSquare } from 'lucide-react';

export const SmsInviteHistory: React.FC = () => {
    return (
        <div className="flex flex-col h-full bg-gray-50">
            <header className="bg-white border-b border-gray-200 px-6 py-4">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="text-blue-600" />
                    앱 설치 문자 발송 내역
                </h1>
                <p className="text-sm text-gray-500 mt-1">앱 설치 문자 발송 내역을 확인합니다.</p>
            </header>
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                준비 중입니다.
            </div>
        </div>
    );
};
