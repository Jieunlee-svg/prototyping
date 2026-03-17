import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Send,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';
import { clsx } from 'clsx';

interface PatientDetailProps {
  onBack: () => void;
  patientId: string | null;
}

export const PatientDetailLater: React.FC<PatientDetailProps> = ({ onBack, patientId }) => {
  const [memo, setMemo] = useState("나중에 고객 특이사항:\n- 상담을 뒤로 미루는 경향이 있음\n- 주기적인 팔로업 필요");

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex-none z-20 shadow-sm relative">
        <div className="flex justify-between items-start">
          <div className="flex items-start">
            <button
              onClick={onBack}
              className="mr-4 mt-1 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">나중에</h1>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">여성 / 26세</span>
                <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">관찰 필요</span>
              </div>
              <div className="text-sm text-gray-500">차후 상세 관리가 필요한 고객입니다.</div>
            </div>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden p-6 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-blue-500" />
              상담 일정
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm font-bold text-blue-900">상담 대기</p>
                <p className="text-xs text-blue-600 mt-1">고객님이 나중에 상담을 원하셨습니다. 3일 후 재연락 예정.</p>
              </div>
              <button className="w-full py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium">
                일정 추가하기
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MessageSquare size={18} className="text-green-500" />
              간편 메모
            </h3>
            <textarea
              className="w-full h-32 p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 resize-none"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="메모를 입력하세요..."
            />
          </div>

          <div className="md:col-span-2 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock size={32} className="text-gray-400" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">상담 대기 고객</h4>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              현재 "나중에" 고객님과는 정기 상담이 예약되어 있지 않습니다.<br />
              필요시 앱 Push 알림을 통해 상담을 제안해보세요.
            </p>
            <button className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg">
              상담 제안 보내기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
