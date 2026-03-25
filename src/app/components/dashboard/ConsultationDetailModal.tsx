import React from 'react';
import { HeartPulse, X } from 'lucide-react';

export interface ConsultationData {
  id: string;
  patientName: string;
  phone: string;
  sendMethod: '알림톡' | '웰체크 앱' | '문자';
  sentAt: string;
  summary?: string;
  frequency: number;
  times: string[];
  relation: string;
  duration: number;
  messageContent: string;
}

interface ConsultationDetailModalProps {
  data: ConsultationData;
  onClose: () => void;
}

const getSendMethodBadge = (method: string) => {
  switch (method) {
    case '알림톡':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          알림톡
        </span>
      );
    case '웰체크 앱':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          웰체크 앱
        </span>
      );
    case '문자':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          문자
        </span>
      );
    default:
      return null;
  }
};

export const ConsultationDetailModal: React.FC<ConsultationDetailModalProps> = ({ data, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
          <div className="bg-white px-6 pt-5 pb-4">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <HeartPulse size={20} className="text-blue-600" />
                복약 상담 상세
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs text-gray-500 mb-1">고객명</span>
                  <span className="text-sm font-medium text-gray-900">{data.patientName}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">휴대전화 번호</span>
                  <span className="text-sm font-medium text-gray-900">{data.phone}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">전송 방법</span>
                  {getSendMethodBadge(data.sendMethod)}
                </div>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">전송 시각</span>
                  <span className="text-sm font-medium text-gray-900">{data.sentAt}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">복약 설정</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">복용 횟수</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                      하루 {data.frequency}회
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">복용 시점</span>
                    <span className="text-sm font-medium text-gray-900">{data.relation}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">복용 시간</span>
                    <span className="text-sm font-medium text-gray-900">{data.times.join(', ')}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">복약 일수</span>
                    <span className="text-sm font-medium text-gray-900">{data.duration}일</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">전송 내용</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {data.messageContent}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
