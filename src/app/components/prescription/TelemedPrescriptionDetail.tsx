import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Printer,
  Upload,
  ChevronLeft,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { Prescription } from './PrescriptionDetailModal';
import { CancelReasonModal } from './CancelReasonModal';
import { CompleteConfirmModal } from './CompleteConfirmModal';

/* ─── 상수 ────────────────────────────────────────────────────────────── */
const DELIVERY_OPTIONS = [
  { id: 'visit_self',     label: '본인 수령' },
  { id: 'visit_family',  label: '대리인 수령' },
  { id: 'wellcheck',     label: '웰체크 퀵(재택 수령)' },
  { id: 'kakao',         label: '웰체크 택배(재택 수령)' },
  { id: 'self_delivery', label: '착불 배송(약국자체 배송)' },
  { id: 'wellcheck2',    label: '웰체크 퀵(약국 요청)' },
  { id: 'kakao2',        label: '웰체크 택배(약국 요청)' },
] as const;

type DeliveryId = typeof DELIVERY_OPTIONS[number]['id'];

/* ─── 수령 방법 라디오 ──────────────────────────────────────────────────── */
const DeliveryRadios: React.FC<{
  value: DeliveryId;
  onChange: (v: DeliveryId) => void;
}> = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-x-8 gap-y-2">
    {DELIVERY_OPTIONS.map(opt => (
      <label
        key={opt.id}
        className="flex items-center gap-2 cursor-pointer select-none"
      >
        <input
          type="radio"
          name="delivery"
          value={opt.id}
          checked={value === opt.id}
          onChange={() => onChange(opt.id)}
          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">{opt.label}</span>
      </label>
    ))}
  </div>
);

/* ─── 섹션 타이틀 ──────────────────────────────────────────────────────── */
const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
    <span className="inline-block w-1 h-5 bg-blue-500 rounded-full" />
    {children}
  </h2>
);

/* ─── Props ────────────────────────────────────────────────────────────── */
interface TelemedPrescriptionDetailProps {
  prescription: Prescription;
  onClose: () => void;
}

/* ─── 메인 컴포넌트 ────────────────────────────────────────────────────── */
export const TelemedPrescriptionDetail: React.FC<TelemedPrescriptionDetailProps> = ({
  prescription,
  onClose,
}) => {
  /* 상태 */
  const [copay, setCopay] = useState('');
  const [substituteConsent, setSubstituteConsent] = useState<'yes' | 'no'>('yes');
  const [memo, setMemo] = useState('');
  const [delivery, setDelivery] = useState<DeliveryId>('visit_self');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [showRrn, setShowRrn] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  /* 파일 첨부 */
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).filter(f =>
      ['image/jpeg', 'image/png', 'application/pdf'].includes(f.type)
    );
    setAttachedFiles(prev => [...prev, ...arr].slice(0, 10));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  /* 마스킹된 주민등록번호 mock */
  const maskedRrn = '800212-1******';
  const visibleRrn = '800212-1234567';

  return (
    /* ── 전체 화면 오버레이 ── */
    <div className="fixed inset-0 z-[200] bg-white flex flex-col overflow-hidden animate-in fade-in duration-200">

      {/* ── 상단 글로벌 헤더 ── */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 sticky top-0 z-10">
        {/* 뒤로가기 */}
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft size={18} />
          <span className="font-medium">처방전 목록으로</span>
        </button>

        <h1 className="text-lg font-bold text-gray-900 absolute left-1/2 -translate-x-1/2">
          처방전 상세 조회
        </h1>

        {/* 우측 액션 */}
        <div className="flex items-center gap-3">
          <button className="px-4 py-1.5 text-sm font-semibold border border-emerald-400 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors">
            결제 완료
          </button>
          <button
            onClick={() => setShowCancelModal(true)}
            className="px-4 py-1.5 text-sm font-semibold border border-red-300 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
          >
            접수 취소
          </button>
          <button
            onClick={() => setShowCompleteModal(true)}
            className="px-4 py-1.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            조제 완료
          </button>
        </div>
      </div>

      {/* ── 스크롤 영역 ── */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

          {/* ── 1. 조제 신청 정보 ── */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <SectionTitle>조제 신청 정보</SectionTitle>
            <div className="grid grid-cols-5 gap-6">
              {/* 조제 요청 일시 */}
              <div>
                <p className="text-xs text-gray-400 mb-1">조제 요청 일시</p>
                <p className="text-sm font-medium text-gray-800">{prescription.receivedAt}</p>
              </div>
              {/* 이름 */}
              <div>
                <p className="text-xs text-gray-400 mb-1">이름</p>
                <p className="text-sm font-bold text-gray-900">{prescription.patientName}</p>
              </div>
              {/* 성/나이 */}
              <div>
                <p className="text-xs text-gray-400 mb-1">성/나이</p>
                <p className="text-sm font-medium text-gray-800">
                  {prescription.gender === '남성' ? 'M' : 'F'} / {
                    new Date().getFullYear() - new Date(prescription.birthDate).getFullYear()
                  }
                </p>
              </div>
              {/* 주민등록번호 */}
              <div>
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                  주민등록번호
                  <button
                    onClick={() => setShowRrn(v => !v)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showRrn ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                </p>
                <p className="text-sm font-medium text-gray-800 font-mono">
                  {showRrn ? visibleRrn : maskedRrn}
                </p>
              </div>
              {/* 연락처 */}
              <div>
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                  연락처
                  <Eye size={12} className="text-gray-300" />
                </p>
                <p className="text-sm font-medium text-gray-800">{prescription.phone}</p>
              </div>
            </div>
          </section>

          {/* ── 2. 처방전 정보 ── */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <SectionTitle>처방전 정보</SectionTitle>
            <div className="flex gap-6">
              {/* 처방전 이미지 */}
              <div className="w-64 flex-shrink-0">
                <div className="aspect-[3/4] bg-gray-900 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200">
                  {prescription.imageUrl ? (
                    <img
                      src={prescription.imageUrl}
                      alt="처방전 이미지"
                      className="w-full h-full object-cover"
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-gray-500 text-sm text-center">이미지 없음</div>
                  )}
                </div>
              </div>

              {/* 우측 입력 영역 */}
              <div className="flex-1 space-y-6">
                {/* 처방전 이미지 다운로드/프린트 */}
                <div>
                  <p className="text-xs text-gray-400 mb-2">처방전 이미지</p>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                      <Download size={14} /> 다운로드
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                      <Printer size={14} /> 프린트
                    </button>
                  </div>
                </div>

                {/* 본인 부담금 */}
                <div>
                  <label className="block text-xs text-gray-500 font-medium mb-1.5">
                    본인 부담금(조제, 복약지도 등)
                    <a href="#" className="ml-1 text-blue-500 hover:underline">보기</a>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={copay}
                      onChange={e => setCopay(e.target.value.replace(/\D/g, ''))}
                      className="w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-right"
                      placeholder="0"
                    />
                    <span className="text-sm text-gray-500">원</span>
                  </div>
                </div>

                {/* 대체조제 여부 */}
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1.5">대체조제 여부</p>
                  <p className="text-xs text-gray-400 mb-2">
                    대체조제 진행 여부를 체크해주세요. 대체조제를 진행한 경우 조제 후 해당 사실을 환자에게 안내해야합니다.
                  </p>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="substitute"
                        checked={substituteConsent === 'yes'}
                        onChange={() => setSubstituteConsent('yes')}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">예 (대체 조제함)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="substitute"
                        checked={substituteConsent === 'no'}
                        onChange={() => setSubstituteConsent('no')}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">아니요</span>
                    </label>
                  </div>
                </div>

                {/* 이미지 첨부 */}
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1.5">
                    이미지 첨부
                    <span className="ml-1 text-gray-400 font-normal">.jpg, .png, .pdf 등 / 이미지는 최대 10개까지 첨부 가능합니다.</span>
                  </p>
                  <div
                    onDragEnter={() => setIsDragging(true)}
                    onDragLeave={() => setIsDragging(false)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={clsx(
                      'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
                      isDragging
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    )}
                  >
                    <Upload size={20} className="mx-auto mb-2 text-blue-400" />
                    <p className="text-sm text-blue-500 font-medium">이미지를 선택하거나, 파일을 여기로 끌어오세요</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      multiple
                      className="hidden"
                      onChange={e => handleFiles(e.target.files)}
                    />
                  </div>
                  {attachedFiles.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {attachedFiles.map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs border border-blue-100">
                          <span className="max-w-[120px] truncate">{f.name}</span>
                          <button onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))}>
                            <X size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ── 3. 수령 방법 ── */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <SectionTitle>수령 방법</SectionTitle>
            <p className="text-xs text-gray-500 mb-4">배송 시 발생하는 비용은 환자가 부담합니다.</p>
            <DeliveryRadios value={delivery} onChange={setDelivery} />
          </section>

          {/* ── 4. 재택 수령 허용 유형 ── */}
          {(delivery === 'wellcheck' || delivery === 'kakao' || delivery === 'wellcheck2' || delivery === 'kakao2') && (
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <SectionTitle>재택 수령 허용 유형</SectionTitle>
              <div className="flex gap-6">
                {/* 허용 타입 배지 */}
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100">
                    등록 완료
                  </span>
                  {/* 증명 서류 미리보기 */}
                  <div className="flex gap-2 mt-3">
                    {[1, 2].map(i => (
                      <div key={i} className="w-20 h-24 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                        <div className="w-12 h-16 bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">증명 서류(환자 제출)</p>
                </div>

                {/* 허용 기준 */}
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-700 mb-2">재택 수령 허용 유형 기준</p>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                    <p className="text-xs text-gray-500 font-medium">※ 재택 수령 허용 유형 기준은 다음과 같습니다.</p>
                    <ol className="text-xs text-gray-500 space-y-1 list-none">
                      <li>1) 임·병력자로서 보험 정상 고시에 규정된&nbsp;
                        <button className="text-blue-500 underline hover:text-blue-700">설비(Backwoods/Modal이true)</button>
                        &nbsp;→&nbsp;
                        <button className="text-blue-500 underline hover:text-blue-700">세부 지역</button>
                        에 거주하고 있는 환자
                      </li>
                      <li>2) 거동 불편자로 만 65세 이상이거나 정부규정에 규정된 통원을 받을 또는 이에 준하는 의료기관이라 불편 동반 환자</li>
                      <li>3) 감염병 확인 환자로서 감염병예방법상&nbsp;
                        <button className="text-blue-500 underline hover:text-blue-700">설비(CommunicableDisease/Modal이true)</button>
                        &nbsp;→&nbsp;
                        <button className="text-blue-500 underline hover:text-blue-700">1급 또는 2급 감염병</button>
                        으로 확인하여 처방(감고 포함) 동사 타 여류기관의 전파가 필요한 자
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── 5. 수령 정보 ── */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <SectionTitle>수령 정보</SectionTitle>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-gray-400 mb-1">이름</p>
                <div className="border-b border-gray-200 pb-2">
                  <p className="text-sm font-medium text-gray-800">이에방팀</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                  연락처
                  <Eye size={12} className="text-gray-300" />
                </p>
                <div className="border-b border-gray-200 pb-2">
                  <p className="text-sm font-medium text-gray-800">{prescription.phone}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">배송 방법</p>
                <div className="border-b border-gray-200 pb-2">
                  <p className="text-sm font-medium text-gray-800">
                    {DELIVERY_OPTIONS.find(o => o.id === delivery)?.label ?? '—'}
                  </p>
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-400 mb-1">주소</p>
                <div className="border-b border-gray-200 pb-2">
                  <p className="text-sm font-medium text-gray-800">경기 성남시 분당구 판교역로 5</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">동</p>
                <div className="border-b border-gray-200 pb-2">
                  <p className="text-sm font-medium text-gray-800">&nbsp;</p>
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-400 mb-1">상세 주소</p>
                <div className="border-b border-gray-200 pb-2">
                  <p className="text-sm font-medium text-gray-800">111호</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">상세 주소</p>
                <div className="border-b border-gray-200 pb-2">
                  <p className="text-sm text-gray-300">&nbsp;</p>
                </div>
              </div>
            </div>
          </section>

          {/* 하단 여백 */}
          <div className="h-4" />
        </div>
      </div>

      {showCancelModal && (
        <CancelReasonModal
          onConfirm={() => { setShowCancelModal(false); onClose(); }}
          onClose={() => setShowCancelModal(false)}
        />
      )}

      {showCompleteModal && (
        <CompleteConfirmModal
          onConfirm={() => { setShowCompleteModal(false); onClose(); }}
          onClose={() => setShowCompleteModal(false)}
        />
      )}
    </div>
  );
};
