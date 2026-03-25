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
  const [messageText, setMessageText] = useState(
    `<광고> [약국과 더 가꺝게 '웰체크'로 관리하세요!]\n\n안녕하세요.\n웰체크 앱을 설치하고 복약 상담 내역을 누적 관리하세요.\n\n👉 설치하기:\nhttps://api.well-check.co.kr/download\n\n복약 상담 문의: \n02-123-4567\n\n웰체크 고객센터:\n1551-3633\n\n무료수신거부:\n080-870-0486`
  );

  // ── 고객 검색 상태 ──────────────────────────────────────────
  const [customerQuery, setCustomerQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<SelectedCustomer | null>(null);
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
    const q = customerQuery.trim();
    if (!q) return [];
    return MOCK_PATIENTS.filter(c =>
      c.name.includes(q) ||
      c.phone.replace(/-/g, '').includes(q.replace(/-/g, ''))
    ).slice(0, 6);
  }, [customerQuery]);

  const handleSelectCustomer = (c: SelectedCustomer) => {
    setSelectedCustomer(c);
    setCustomerQuery('');
    setShowCustomerDrop(false);
    setFocusedIndex(-1);
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setCustomerQuery('');
    setShowCustomerDrop(false);
    setTimeout(() => phoneRef.current?.focus(), 50);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    const raw = inputVal.replace(/[^0-9]/g, '');
    const isNumericOnly = /^[0-9\-]*$/.test(inputVal);
    if (isNumericOnly && raw.length > 0) {
      let formatted = raw.slice(0, 11);
      if (formatted.length > 7) formatted = `${formatted.slice(0, 3)}-${formatted.slice(3, 7)}-${formatted.slice(7)}`;
      else if (formatted.length > 3) formatted = `${formatted.slice(0, 3)}-${formatted.slice(3)}`;
      setCustomerQuery(formatted);
      // 11자리 입력 완료 시 자동 선택 (DB에 없으면 미가입 고객으로 처리)
      if (raw.length === 11) {
        const matched = MOCK_PATIENTS.find(c => c.phone.replace(/-/g, '') === raw);
        setSelectedCustomer(matched ?? { name: '', phone: formatted, isAppUser: false });
        setShowCustomerDrop(false);
        setCustomerQuery('');
        return;
      }
    } else {
      setCustomerQuery(inputVal);
    }
    setShowCustomerDrop(true);
  };

  // 발송 가능 여부: 수신자가 선택됐고 이미 앱 가입자가 아닐 때
  const canSend = !!selectedCustomer && !selectedCustomer.isAppUser;
  const isAlreadyMember = !!selectedCustomer && selectedCustomer.isAppUser;

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
    setSelectedCustomer(null);
    setCustomerQuery('');
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    고객 휴대전화 번호
                  </label>

                  <div ref={phoneDropRef} className="relative">
                    {selectedCustomer ? (
                      /* 선택 완료 상태 — 칩 */
                      <div className={clsx(
                        'flex items-center gap-3 px-3 py-2.5 border rounded-xl transition-all shadow-sm ring-2',
                        isAlreadyMember
                          ? 'border-amber-400 bg-amber-50 ring-amber-100'
                          : 'border-blue-400 bg-blue-50 ring-blue-100'
                      )}>
                        <div className={clsx(
                          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                          isAlreadyMember ? 'bg-amber-100' : 'bg-blue-100'
                        )}>
                          <User className={clsx('w-4 h-4', isAlreadyMember ? 'text-amber-600' : 'text-blue-600')} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-gray-900">
                            {selectedCustomer.name || '직접 입력'}
                          </div>
                          <div className="text-xs text-gray-500">{selectedCustomer.phone}</div>
                        </div>
                        {isAlreadyMember
                          ? <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          : <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        }
                        <button
                          type="button"
                          onClick={handleClearCustomer}
                          className={clsx(
                            'p-1.5 ml-1 rounded-full transition-colors focus:outline-none',
                            isAlreadyMember
                              ? 'hover:bg-amber-100 text-amber-500'
                              : 'hover:bg-white/60 text-blue-500'
                          )}
                          aria-label="선택 해제"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      /* 검색 입력 상태 */
                      <div className="flex items-center gap-2.5 px-3 py-3 border rounded-xl transition-all shadow-sm border-gray-300 bg-gray-50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                        <Search className={clsx('w-5 h-5 flex-shrink-0 transition-colors', showCustomerDrop ? 'text-blue-500' : 'text-gray-400')} />
                        <input
                          ref={phoneRef}
                          type="text"
                          value={customerQuery}
                          onChange={handlePhoneChange}
                          onKeyDown={e => {
                            if (!showCustomerDrop || customerQuery.trim() === '') return;
                            if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedIndex(prev => Math.min(prev + 1, filteredCustomers.length - 1)); }
                            else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusedIndex(prev => Math.max(prev - 1, 0)); }
                            else if (e.key === 'Enter') { e.preventDefault(); if (focusedIndex >= 0 && filteredCustomers[focusedIndex]) handleSelectCustomer(filteredCustomers[focusedIndex]); else if (filteredCustomers.length > 0) handleSelectCustomer(filteredCustomers[0]); }
                            else if (e.key === 'Escape') setShowCustomerDrop(false);
                          }}
                          onFocus={() => { if (customerQuery.trim() !== '') setShowCustomerDrop(true); }}
                          placeholder="이름 또는 휴대전화 번호 검색..."
                          className="flex-1 text-[15px] font-medium bg-transparent outline-none placeholder-gray-400 text-gray-900"
                          autoComplete="off"
                        />
                        {customerQuery && (
                          <button
                            type="button"
                            onMouseDown={e => { e.preventDefault(); setCustomerQuery(''); setShowCustomerDrop(false); phoneRef.current?.focus(); }}
                            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* 실시간 검색 드롭다운 */}
                    {showCustomerDrop && customerQuery.trim() !== '' && (
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
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex-shrink-0">
                                      앱 가입됨
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
                            <div className="text-xs text-gray-500">전화번호를 직접 입력해 주세요.</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 이미 앱 가입된 고객 경고 */}
                  {isAlreadyMember && (
                    <div className="mt-2 flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
                      <span>이미 웰체크 앱에 가입된 고객입니다. 초대 문자를 발송할 수 없습니다.</span>
                    </div>
                  )}
                </div>

                {/* 약국 번호 */}
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

                {/* 문자 내용 */}
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
                    className="w-full h-96 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none text-sm leading-relaxed"
                  />
                  <p className="text-right text-xs text-gray-400 mt-1">
                    {messageText.length} / 2000자 (LMS)
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
                      {messageText}
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
