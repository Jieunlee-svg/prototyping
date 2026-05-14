import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Smartphone,
  Send,
  User,
  RefreshCw,
  Search,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { clsx } from 'clsx';

interface SmsInviteProps {
  // Props can be added here if needed
}

// Mock: 기존 고객 DB — 검색으로 조회되는 고객은 모두 앱 가입자
const MOCK_PATIENTS = [
  { name: '김철수', phone: '010-1234-5678', isAppUser: true },
  { name: '이영희', phone: '010-2345-6789', isAppUser: true },
  { name: '박지민', phone: '010-3456-7890', isAppUser: true },
  { name: '최수진', phone: '010-4567-8901', isAppUser: true },
  { name: '정민준', phone: '010-5678-9012', isAppUser: true },
];

type SelectedCustomer = { name: string; phone: string; isAppUser: boolean };

export const SmsInvite: React.FC<SmsInviteProps> = () => {
  const [hospitalPhone, setHospitalPhone] = useState('02-123-4567');
  const [additionalMessage, setAdditionalMessage] = useState('');

  const baseMessageTop = `<광고> [약국과 더 가깝게 관리하세요] 

안녕하세요, {약국명}입니다.

고객님의 안전한 약 복용과 건강 관리를 돕기 위한 서비스 "웰체크"를 도입해 운영하고 있습니다.

고객님이 저희 약국에서 처방받으신 약의 상세 정보와 복용 이력을 스마트폰으로 편하게 확인하실 수 있습니다.

✅ 앱 설치 시 좋아지는 점
- 복약 알림 자동 설정 
- 상담 기록 보관
- 처방전 전송

📱 지금 바로 시작하기
링크를 눌러 앱을 설치하시면, 저희 약국과 연결되어 관리가 시작됩니다.
👉 설치하기: https://api.well-check.co.kr/download`;

  const baseMessageBottom = `약국 문의: ${hospitalPhone}

서비스 문의: 1551-3633

무료수신거부: 080-870-0486`;

  const fullMessageText = `${baseMessageTop}
${additionalMessage ? `\n${additionalMessage}\n` : ''}
${baseMessageBottom}`;

  // ── 수신자 목록 상태 ──────────────────────────────────────────
  const [recipients, setRecipients] = useState<{ phone: string; isAppUser: boolean; name?: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const [showCustomerDrop, setShowCustomerDrop] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const phoneRef = useRef<HTMLInputElement>(null);
  const phoneDropRef = useRef<HTMLDivElement>(null);

  // 최초 진입 시 입력 필드 자동 포커스
  useEffect(() => {
    phoneRef.current?.focus();
  }, []);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (phoneDropRef.current && !phoneDropRef.current.contains(e.target as Node)) {
        setShowCustomerDrop(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredCustomers = useMemo(() => {
    const q = inputValue.trim();
    if (!q) return [];
    return MOCK_PATIENTS.filter(c =>
      c.name.includes(q) ||
      c.phone.replace(/-/g, '').includes(q.replace(/-/g, ''))
    ).slice(0, 6);
  }, [inputValue]);

  const handleSelectCustomer = (c: { name: string; phone: string; isAppUser: boolean }) => {
    addRecipient(c.phone);
    setShowCustomerDrop(false);
    setFocusedIndex(-1);
  };

  const addRecipient = (formattedPhone: string) => {
    if (recipients.length >= 50) {
      setInputError("최대 50명까지만 입력할 수 있습니다.");
      return;
    }
    if (recipients.some(r => r.phone === formattedPhone)) {
      setInputValue('');
      return;
    }
    const matchedUser = MOCK_PATIENTS.find(c => c.phone === formattedPhone);
    const isAppUser = !!matchedUser;
    setInputError(null);
    setRecipients(prev => [...prev, { phone: formattedPhone, isAppUser, name: matchedUser?.name }]);
    setInputValue('');
  };

  const removeRecipient = (phone: string) => {
    setRecipients(prev => prev.filter(r => r.phone !== phone));
    setInputError(null);
    setTimeout(() => phoneRef.current?.focus(), 50);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    const raw = inputVal.replace(/[^0-9]/g, '');
    const isNumericOnly = /^[0-9\-]*$/.test(inputVal);
    
    if (isNumericOnly && raw.length > 0) {
      if (raw.length === 11) {
        let formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7)}`;
        addRecipient(formatted);
        setShowCustomerDrop(false);
      } else {
        let formatted = raw;
        if (raw.length > 7) formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7)}`;
        else if (raw.length > 3) formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
        setInputValue(formatted);
        setShowCustomerDrop(true);
        if (inputError) setInputError(null);
      }
    } else {
      setInputValue(inputVal);
      setShowCustomerDrop(true);
      if (inputError) setInputError(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showCustomerDrop || inputValue.trim() === '') {
      if (e.key === 'Backspace' && inputValue === '' && recipients.length > 0) {
        setRecipients(prev => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const isNumericOnly = /^[0-9\-]*$/.test(inputValue);
        if (isNumericOnly) {
          const raw = inputValue.replace(/[^0-9]/g, '');
          if (raw.length === 11) {
            let formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7)}`;
            addRecipient(formatted);
          } else if (raw.length > 0) {
            setInputError("휴대폰 번호 11자리를 입력해주세요.");
          }
        }
      }
      return;
    }

    if (e.key === 'ArrowDown') { 
      e.preventDefault(); 
      setFocusedIndex(prev => Math.min(prev + 1, filteredCustomers.length - 1)); 
    } else if (e.key === 'ArrowUp') { 
      e.preventDefault(); 
      setFocusedIndex(prev => Math.max(prev - 1, 0)); 
    } else if (e.key === 'Enter') { 
      e.preventDefault(); 
      if (focusedIndex >= 0 && filteredCustomers[focusedIndex]) {
        handleSelectCustomer(filteredCustomers[focusedIndex]); 
      } else if (filteredCustomers.length > 0) {
        handleSelectCustomer(filteredCustomers[0]); 
      } else {
        const isNumericOnly = /^[0-9\-]*$/.test(inputValue);
        if (isNumericOnly) {
          const raw = inputValue.replace(/[^0-9]/g, '');
          if (raw.length === 11) {
            let formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7)}`;
            addRecipient(formatted);
            setShowCustomerDrop(false);
          } else if (raw.length > 0) {
            setInputError("휴대폰 번호 11자리를 입력해주세요.");
          }
        }
      }
    } else if (e.key === 'Escape') {
      setShowCustomerDrop(false);
    } else if (e.key === 'Backspace' && inputValue === '' && recipients.length > 0) {
      setRecipients(prev => prev.slice(0, -1));
    }
  };

  const hasAppUser = recipients.some(r => r.isAppUser);
  // 발송 가능 여부: 1명 이상이고, 단골 고객이 없으며 약국 번호가 있을 때
  const canSend = recipients.length > 0 && !hasAppUser && !!hospitalPhone.trim();

  // ── 발송 확인 / 완료 모달 상태 ──
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  const handleSendClick = () => {
    setConsentChecked(false);
    setShowConfirmModal(true);
  };

  const handleConfirmSend = () => {
    setShowConfirmModal(false);
    setShowSuccessModal(true);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    // 발송 완료 후 초기화
    setRecipients([]);
    setInputValue('');
    setInputError(null);
    setTimeout(() => phoneRef.current?.focus(), 50);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      <div className="flex-1 overflow-hidden p-6">
        <div className="max-w-6xl mx-auto h-full grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left Column: Settings */}
          <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex-1">
              <h3 className="font-bold text-gray-800 mb-4">발송 정보 입력</h3>

              <div className="space-y-4">

                {/* 고객 휴대전화 번호 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      고객 휴대전화 번호
                      <span className="text-red-500 font-bold">*</span>
                    </div>
                    <span className="text-xs text-gray-500 font-normal">
                      <span className={clsx(recipients.length >= 50 ? "text-red-500 font-bold" : "")}>{recipients.length}</span> / 50명
                    </span>
                  </label>

                  <div ref={phoneDropRef} className="relative">
                    <div 
                      className="flex flex-wrap items-center gap-2 px-3 py-2 border rounded-xl transition-all shadow-sm border-gray-300 bg-gray-50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 min-h-[46px]"
                      onClick={() => phoneRef.current?.focus()}
                    >
                      {recipients.length === 0 && <Search className={clsx('w-5 h-5 flex-shrink-0 transition-colors', showCustomerDrop ? 'text-blue-500' : 'text-gray-400')} />}
                      
                      {recipients.map(r => (
                        <div key={r.phone} className={clsx(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-sm font-medium transition-colors",
                          r.isAppUser 
                            ? "bg-red-50 border-red-200 text-red-700" 
                            : "bg-blue-50 border-blue-200 text-blue-700"
                        )}>
                          <span>{r.phone}</span>
                          <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); removeRecipient(r.phone); }}
                            className={clsx(
                              "p-0.5 rounded-full hover:bg-white/60 transition-colors focus:outline-none",
                              r.isAppUser ? "text-red-500" : "text-blue-500"
                            )}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <input
                        ref={phoneRef}
                        type="text"
                        value={inputValue}
                        onChange={handlePhoneChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => { if (inputValue.trim() !== '') setShowCustomerDrop(true); }}
                        placeholder={recipients.length === 0 ? "이름 또는 휴대전화 번호 검색..." : ""}
                        className="flex-1 min-w-[150px] bg-transparent outline-none text-[15px] font-medium text-gray-900 placeholder-gray-400"
                        autoComplete="off"
                        disabled={recipients.length >= 50}
                      />
                      {inputValue && (
                        <button
                          type="button"
                          onMouseDown={e => { e.preventDefault(); setInputValue(''); setShowCustomerDrop(false); phoneRef.current?.focus(); }}
                          className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* 실시간 검색 드롭다운 */}
                    {showCustomerDrop && inputValue.trim() !== '' && (
                      <div className="absolute z-30 top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                        {filteredCustomers.length > 0 ? (
                          <>
                            <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                              <span className="text-[11px] text-gray-500 font-bold tracking-wider">검색 결과</span>
                              <span className="text-[11px] text-blue-500 font-bold">{filteredCustomers.length}건</span>
                            </div>
                            <div className="py-1 max-h-[220px] overflow-y-auto">
                              {filteredCustomers.map((c, i) => {
                                const isFocused = i === focusedIndex;
                                return (
                                  <button
                                    key={c.phone}
                                    type="button"
                                    onMouseEnter={() => setFocusedIndex(i)}
                                    onMouseDown={e => { e.preventDefault(); handleSelectCustomer(c); }}
                                    className={clsx('w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors', isFocused ? 'bg-blue-50' : 'hover:bg-gray-50')}
                                  >
                                    <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold', isFocused ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-500')}>
                                      {c.name.slice(0, 1)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className={clsx('text-[14px] font-semibold', isFocused ? 'text-blue-900' : 'text-gray-900')}>{c.name}</div>
                                      <div className={clsx('text-xs mt-0.5', isFocused ? 'text-blue-700' : 'text-gray-500')}>{c.phone}</div>
                                    </div>
                                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full flex-shrink-0">
                                      단골 등록됨
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        ) : (
                          <div className="px-4 py-8 text-center bg-gray-50/50">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                              <Search className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="text-sm font-bold text-gray-700 mb-1">검색 결과가 없습니다</div>
                            <div className="text-xs text-gray-500">전화번호 11자리를 끝까지 입력해 추가해주세요.</div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* 에러 메시지 */}
                    {(inputError || hasAppUser) && (
                      <p className="mt-1.5 text-sm text-red-500 flex items-start gap-1">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>
                          {inputError || "단골 등록된 사용자에게는 앱 설치 문자를 보낼 수 없습니다, 단골 고객 번호를 삭제해주세요."}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* 약국 번호 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    약국 번호
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={hospitalPhone}
                    onChange={(e) => setHospitalPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    placeholder="02-000-0000"
                  />
                </div>

                {/* 문자 내용 추가 */}
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      문자 내용 추가
                    </label>
                    <button
                      onClick={() => setAdditionalMessage('')}
                      className="text-xs text-gray-500 flex items-center gap-1 hover:text-blue-600"
                    >
                      <RefreshCw size={12} />
                      초기화
                    </button>
                  </div>
                  <textarea
                    value={additionalMessage}
                    onChange={(e) => setAdditionalMessage(e.target.value)}
                    placeholder="추가할 문자 내용 입력"
                    className="w-full h-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none text-sm leading-relaxed"
                  />
                  <p className="text-right text-xs text-gray-400 mt-1">
                    {fullMessageText.length} / 2000자 (LMS)
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <button
                  disabled={!canSend}
                  onClick={handleSendClick}
                  className={clsx(
                    'w-full font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2',
                    canSend
                      ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform active:scale-[0.99]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  )}
                >
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
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-10"></div>

              <div className="w-full h-full bg-white rounded-[2.2rem] overflow-hidden flex flex-col relative">
                <div className="h-12 bg-gray-100 flex items-end justify-between px-6 pb-2 border-b border-gray-200">
                  <span className="text-xs font-semibold text-gray-900">09:41</span>
                  <div className="flex gap-1">
                    <div className="w-4 h-2.5 bg-gray-900 rounded-sm opacity-20"></div>
                    <div className="w-4 h-2.5 bg-gray-900 rounded-sm opacity-40"></div>
                    <div className="w-4 h-2.5 bg-gray-900 rounded-sm"></div>
                  </div>
                </div>

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

                <div className="flex-1 bg-slate-50 p-4 overflow-y-auto">
                  <div className="flex flex-col items-start gap-1 max-w-[90%]">
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-200 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {fullMessageText}
                    </div>
                    <span className="text-[10px] text-gray-400 ml-1">오전 09:41</span>
                  </div>
                </div>

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

      {/* ── 발송 확인 모달 ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowConfirmModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-1">초대장을 보내시겠습니까?</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                * 같은 번호로 하루에 최대 10번까지 보낼 수 있습니다.
              </p>
            </div>

            {/* 동의 체크박스 */}
            <div className="px-6 pb-6">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={e => setConsentChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                />
                <span className="text-sm text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">
                  초대장 문자 발송 대상자가 수신에 동의함을 확인했으며, 해당 정보 제공에 정당한 권한이 있음을 확인합니다.
                </span>
              </label>
            </div>

            {/* 버튼 */}
            <div className="flex border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-4 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                아니오
              </button>
              <div className="w-px bg-gray-100" />
              <button
                type="button"
                disabled={!consentChecked}
                onClick={handleConfirmSend}
                className={clsx(
                  'flex-1 py-4 text-sm font-semibold transition-colors',
                  consentChecked
                    ? 'text-blue-600 hover:bg-blue-50'
                    : 'text-gray-300 cursor-not-allowed'
                )}
              >
                예
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 발송 완료 모달 ── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleSuccessClose} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden text-center">
            <div className="px-6 pt-8 pb-6">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">초대장 발송이 완료되었습니다.</h2>
            </div>
            <div className="border-t border-gray-100">
              <button
                type="button"
                onClick={handleSuccessClose}
                className="w-full py-4 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
