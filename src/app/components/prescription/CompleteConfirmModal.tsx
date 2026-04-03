import React from 'react';

interface CompleteConfirmModalProps {
  onConfirm: () => void;
  onClose: () => void;
}

export const CompleteConfirmModal: React.FC<CompleteConfirmModalProps> = ({ onConfirm, onClose }) => (
  <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-2xl shadow-2xl w-[460px] overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-5">
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          해당 조제 요청 건을 완료하시겠습니까?
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          조제 요청 완료 시 환자에게 웰체크 알림톡 또는 문자로 완료 여부가 자동 안내됩니다.
        </p>
        <p className="text-sm text-red-500 mt-1">
          ※조제 완료 처리 시, 조제 및 배송 변경, 환불이 되지 않습니다.
        </p>
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
          확인
        </button>
      </div>
    </div>
  </div>
);
