import React, { useState } from 'react';
import {
  ArrowLeft,
  FileText,
  MoreHorizontal
} from 'lucide-react';

interface PatientDetailProps {
  onBack: () => void;
  patientId: string | null;
}

export const PatientDetail17: React.FC<PatientDetailProps> = ({ onBack, patientId }) => {
  const [memo, setMemo] = useState("고객 특이사항:\n- 알약 삼키는 것을 힘들어함\n- 저녁 식후 복약 선호\n\n다음 상담 시 확인:\n- 어지럼증 호전 여부");

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Header Section */}
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
                <h1 className="text-2xl font-bold text-gray-900">십칠스프린트</h1>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">여성 / 40세</span>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">고혈압</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Only Architect Memo */}
      <div className="flex-1 overflow-hidden p-6 max-w-2xl mx-auto w-full">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-sm flex flex-col h-64">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-yellow-800 flex items-center gap-2">
              <FileText size={18} />
              약사 메모 (Private)
            </span>
            <span className="text-xs text-yellow-600">저장됨</span>
          </div>
          <textarea
            className="flex-1 bg-transparent resize-none text-base text-gray-800 placeholder-yellow-800/50 outline-none leading-relaxed custom-scrollbar"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>
        <p className="mt-4 text-center text-sm text-gray-400">
          이 화면은 십칠스프린트 고객 전용 약사 메모 관리 화면입니다.
        </p>
      </div>
    </div>
  );
};
