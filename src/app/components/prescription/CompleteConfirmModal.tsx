import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface CompleteConfirmModalProps {
  onConfirm: () => void;
  onClose: () => void;
}

export const CompleteConfirmModal: React.FC<CompleteConfirmModalProps> = ({ onConfirm, onClose }) => {
  const [hasSubstitute, setHasSubstitute] = useState<boolean>(false);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-[460px] overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            조제 요청 완료 전 확인 해주세요.
          </h2>

          <p className="text-sm font-medium text-gray-700 mb-3">
            처방전에 대체조제된 항목이 있나요?
          </p>

          <div className="space-y-2.5 mb-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="substitute"
                checked={hasSubstitute === true}
                onChange={() => setHasSubstitute(true)}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">있어요</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="substitute"
                checked={hasSubstitute === false}
                onChange={() => setHasSubstitute(false)}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">없어요</span>
            </label>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 font-medium">대체조제시 환자에게 고지해야 합니다.</p>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              조제 요청 완료 시 환자에게 웰체크 알림톡 또는 문자로 완료 여부가 자동 안내됩니다.
            </p>
            <p className="text-sm text-red-500">
              ※조제 완료 처리 시, 조제 및 배송 변경, 환불이 되지 않습니다.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            조제 완료
          </button>
        </div>
      </div>
    </div>
  );
};
