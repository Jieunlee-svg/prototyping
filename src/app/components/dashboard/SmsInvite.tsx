import React, { useState } from 'react';
import {
  Smartphone,
  Send,
  Users,
  User,
  Copy,
  RefreshCw,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { clsx } from 'clsx';

interface SmsInviteProps {
  // Props can be added here if needed
}

export const SmsInvite: React.FC<SmsInviteProps> = () => {
  const [sendType, setSendType] = useState<'individual' | 'bulk'>('individual');
  const [patientPhone, setPatientPhone] = useState('010-1234-5678');
  const [hospitalPhone, setHospitalPhone] = useState('02-123-4567');
  const [messageText, setMessageText] = useState(
    `<광고> [약국과 더 가꺝게 '웰체크'로 관리하세요!]\n\n안녕하세요.\n웰체크 앱을 설치하고 복약 상담 내역을 누적 관리하세요.\n\n👉 설치하기:\nhttps://api.well-check.co.kr/download\n\n복약 상담 문의: \n02-123-4567\n\n웰체크 고객센터:\n1551-3633\n\n무료수신거부:\n080-870-0486`
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="max-w-6xl mx-auto h-full grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left Column: Settings */}
          <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">

            {/* 1. Send Type Selection */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">발송 대상 선택</h3>
              <div className="flex p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setSendType('individual')}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all",
                    sendType === 'individual'
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <User size={16} />
                  개별 발송
                </button>
                <button
                  onClick={() => setSendType('bulk')}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all",
                    sendType === 'bulk'
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <Users size={16} />
                  일괄 발송
                </button>
              </div>
            </div>

            {/* 2. Input Fields */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex-1">
              <h3 className="font-bold text-gray-800 mb-4">발송 정보 입력</h3>

              <div className="space-y-4">
                {sendType === 'individual' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        고객 휴대폰 번호
                      </label>
                      <input
                        type="text"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        placeholder="010-0000-0000"
                      />
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100 flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold mb-1">관리 고객 전체 선택됨 (560명)</p>
                      <p className="opacity-80">앱 미설치 고객에게만 발송됩니다.</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    약국 번호
                  </label>
                  <input
                    type="text"
                    value={hospitalPhone}
                    onChange={(e) => setHospitalPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    placeholder="02-000-0000"
                  />
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      문자 내용 (편집 가능)
                    </label>
                    <button
                      onClick={() => setMessageText(`<광고> [약국과 더 가꺝게 '웰체크'로 관리하세요!]\n\n안녕하세요.\n웰체크 앱을 설치하고 복약 상담 내역을 누적 관리하세요.\n\n👉 설치하기:\nhttps://api.well-check.co.kr/download\n\n복약 상담 문의: \n02-123-4567\n\n웰체크 고객센터:\n1551-3633\n\n무료수신거부:\n080-870-0486`)}
                      className="text-xs text-gray-500 flex items-center gap-1 hover:text-blue-600"
                    >
                      <RefreshCw size={12} />
                      초기화
                    </button>
                  </div>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full h-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none text-sm leading-relaxed"
                  />
                  <p className="text-right text-xs text-gray-400 mt-1">
                    {messageText.length} / 2000자 (LMS)
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-[0.99]">
                  <Send size={18} />
                  초대장 발송하기
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">
                  * 발송 비용은 웰체크에서 부담합니다.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Preview */}
          <div className="hidden lg:flex flex-col items-center justify-center bg-gray-100 rounded-2xl border border-gray-200 p-8 relative">
            <h3 className="absolute top-6 left-6 font-bold text-gray-400 flex items-center gap-2">
              <Smartphone size={20} />
              미리보기
            </h3>

            {/* Phone Mockup */}
            <div className="w-[320px] h-[640px] bg-black rounded-[3rem] p-3 shadow-2xl relative border-4 border-gray-800">
              {/* Phone Notch/Speaker */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-10"></div>

              {/* Screen Area */}
              <div className="w-full h-full bg-white rounded-[2.2rem] overflow-hidden flex flex-col relative">

                {/* Fake Status Bar */}
                <div className="h-12 bg-gray-100 flex items-end justify-between px-6 pb-2 border-b border-gray-200">
                  <span className="text-xs font-semibold text-gray-900">09:41</span>
                  <div className="flex gap-1">
                    <div className="w-4 h-2.5 bg-gray-900 rounded-sm opacity-20"></div>
                    <div className="w-4 h-2.5 bg-gray-900 rounded-sm opacity-40"></div>
                    <div className="w-4 h-2.5 bg-gray-900 rounded-sm"></div>
                  </div>
                </div>

                {/* Message Header */}
                <div className="px-4 py-3 bg-white/90 backdrop-blur border-b border-gray-100 sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User size={16} className="text-gray-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-900">{hospitalPhone}</span>
                      <span className="text-[10px] text-gray-500">MMS 문자 메시지</span>
                    </div>
                  </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 bg-slate-50 p-4 overflow-y-auto">
                  <div className="flex flex-col items-start gap-1 max-w-[90%] animate-fade-in-up">
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-200 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {messageText}
                    </div>
                    <span className="text-[10px] text-gray-400 ml-1">오전 09:41</span>
                  </div>
                </div>

                {/* Fake Keyboard/Input Area */}
                <div className="h-16 bg-gray-100 border-t border-gray-200 flex items-center px-4 gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                  <div className="flex-1 h-8 bg-white rounded-full border border-gray-300"></div>
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <Send size={14} />
                  </div>
                </div>

              </div>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              실제 발송되는 화면과 약간의 차이가 있을 수 있습니다.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
