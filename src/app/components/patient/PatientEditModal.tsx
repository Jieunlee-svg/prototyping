import React, { useState } from 'react';
import { X, Calendar, Check, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

interface PatientEditModalProps {
  patient: {
    name: string;
    birthDate: string;
    gender: '여성' | '남성';
    disease: string;
    isRegular: boolean;
    regularDate?: string;
  };
  onClose: () => void;
  onSave: (updatedData: any) => void;
}

export const PatientEditModal: React.FC<PatientEditModalProps> = ({ patient, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...patient });
  const [nameError, setNameError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const diseases = ['고혈압', '당뇨', '고혈압 당뇨 복합', '고혈압(전)', '당뇨(전)'];

  const validateName = (name: string) => {
    const specialChars = /[0-9!@#$%^&*(),.?":{}|<>]/;
    if (specialChars.test(name)) {
      setNameError('이름에는 숫자나 특수문자를 포함할 수 없습니다.');
    } else {
      setNameError('');
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, name: value });
    validateName(value);
  };

  const isFormValid = formData.name.trim() !== '' && 
                      formData.birthDate.trim() !== '' && 
                      formData.gender !== undefined && 
                      !nameError;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="text-lg font-bold text-gray-900">고객 정보 수정</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* 이름 */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-tight flex items-center gap-1">
              이름
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              placeholder="이름을 입력하세요"
              onChange={handleNameChange}
              className={clsx(
                "w-full px-4 py-2.5 bg-white border rounded-xl focus:ring-2 outline-none transition-all text-sm font-medium shadow-sm",
                nameError 
                  ? "border-red-500 focus:ring-red-100" 
                  : "border-gray-300 focus:ring-blue-100 focus:border-blue-500"
              )}
            />
            {nameError && (
              <p className="text-[11px] text-red-500 mt-1 font-medium">{nameError}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 생년월일 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-tight flex items-center gap-1">
                생년월일
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  placeholder="YYYY-MM-DD"
                  className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-medium shadow-sm"
                />
                <button 
                  type="button"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <Calendar size={16} />
                </button>

                {/* Simulated Date Picker */}
                {showDatePicker && (
                  <div className="absolute top-full mt-2 left-0 right-0 p-3 bg-white border border-gray-200 rounded-xl shadow-xl z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="text-xs font-bold text-gray-900">2026년 3월</span>
                      <div className="flex gap-1">
                        <button type="button" className="p-1 hover:bg-gray-100 rounded">‹</button>
                        <button type="button" className="p-1 hover:bg-gray-100 rounded">›</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center mb-1">
                      {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                        <span key={d} className="text-[10px] text-gray-400 font-medium">{d}</span>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, birthDate: `2026-03-${d.toString().padStart(2, '0')}` });
                            setShowDatePicker(false);
                          }}
                          className={clsx(
                            "py-1.5 text-[11px] rounded-lg transition-colors",
                            d === 17 ? "bg-blue-600 text-white font-bold" : "text-gray-600 hover:bg-blue-50"
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 성별 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-tight flex items-center gap-1">
                성별
                <span className="text-red-500">*</span>
              </label>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                {(['남성', '여성'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: g })}
                    className={clsx(
                      "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all",
                      formData.gender === g 
                        ? "bg-white text-blue-600 shadow-sm" 
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 관리 질환 */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-tight">관리 질환</label>
            <div className="flex flex-wrap gap-2">
              {diseases.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFormData({ ...formData, disease: d })}
                  className={clsx(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                    formData.disease === d
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 space-y-5">
            {/* 단골 여부 (Read-only) */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">단골 여부</p>
                <p className="text-[11px] text-gray-400 mt-0.5">환자 앱에서 설정 시 자동으로 반영됩니다.</p>
              </div>
              <div className={clsx(
                "px-3 py-1.5 rounded-lg text-xs font-bold",
                formData.isRegular ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-400"
              )}>
                {formData.isRegular ? '단골 등록됨' : '미등록'}
              </div>
            </div>

            {/* 단골 등록일 (Read-only if regular) */}
            {formData.isRegular && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-tight">단골 등록 일</label>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">
                  <Calendar size={14} className="text-gray-400" />
                  {formData.regularDate || '2026-03-01'}
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-sm font-bold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!isFormValid}
            className={clsx(
              "flex-1 py-3 text-sm font-bold rounded-xl transition-all border",
              isFormValid
                ? "text-white bg-blue-600 border-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                : "text-gray-400 bg-gray-100 border-gray-100 cursor-not-allowed"
            )}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};
