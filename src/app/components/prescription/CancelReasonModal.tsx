import React, { useState } from 'react';

const CANCEL_REASONS = [
  { id: 'no_stock',    label: '약품 재고 없음' },
  { id: 'patient_req', label: '환자 요청 취소' },
  { id: 'over_limit',  label: '비대면 조제 가능 건수 초과' },
  { id: 'other',       label: '기타 사유' },
] as const;

interface CancelReasonModalProps {
  onConfirm: () => void;
  onClose: () => void;
}

export const CancelReasonModal: React.FC<CancelReasonModalProps> = ({ onConfirm, onClose }) => {
  const [selected, setSelected] = useState<string>('no_stock');

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-[500px] overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            해당 조제 요청 건을 거절하시겠습니까?
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            조제 거절 및 선택 사유는 환자에게 웰체크 알림톡 또는 문자로 자동 안내 됩니다.
          </p>
          <p className="text-sm text-red-500 mt-1">
            ※조제 거절 시 취소, 변경이 불가합니다.
          </p>
        </div>

        <div className="border-t border-gray-100 mx-6" />

        {/* Body */}
        <div className="px-6 py-5 flex gap-6">
          {/* Left */}
          <div className="flex-shrink-0 pt-1">
            <p className="text-sm font-bold text-blue-600">조제할 수 없습니다.</p>
            <p className="text-xs text-gray-400 mt-0.5">조제 취소 사유를 선택하여 안내합니다.</p>
          </div>

          {/* Divider */}
          <div className="w-px bg-gray-100 flex-shrink-0" />

          {/* Radio group */}
          <div className="flex flex-col gap-3">
            {CANCEL_REASONS.map(r => (
              <label key={r.id} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="cancelReason"
                  value={r.id}
                  checked={selected === r.id}
                  onChange={() => setSelected(r.id)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm text-gray-700">{r.label}</span>
              </label>
            ))}
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
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
