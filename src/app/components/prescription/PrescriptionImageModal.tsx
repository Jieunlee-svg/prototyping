import React, { useState } from 'react';
import {
  ChevronLeft,
  Download,
  Printer,
  Eye,
  EyeOff,
  ImageOff,
  Ban,
} from 'lucide-react';
import type { Prescription } from './PrescriptionDetailModal';

/* ─── 섹션 타이틀 ──────────────────────────────────────────────────────── */
const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
    <span className="inline-block w-1 h-5 bg-blue-500 rounded-full" />
    {children}
  </h2>
);

/* ─── Props ────────────────────────────────────────────────────────────── */
interface PrescriptionImageModalProps {
  prescription: Prescription;
  onClose: () => void;
  readOnly?: boolean;
}

/* ─── 메인 컴포넌트 ────────────────────────────────────────────────────── */
export const PrescriptionImageModal: React.FC<PrescriptionImageModalProps> = ({
  prescription,
  onClose,
  readOnly = false,
}) => {
  const [showRrn, setShowRrn] = useState(false);
  const [imageError, setImageError] = useState(false);

  const maskedRrn = prescription.birthDate
    ? `${prescription.birthDate.replace(/-/g, '').slice(2)}-*******`
    : '------*******';

  const age = prescription.birthDate
    ? new Date().getFullYear() - new Date(prescription.birthDate).getFullYear()
    : '-';

  const handleDownload = () => {
    if (!prescription.imageUrl) return;
    const link = document.createElement('a');
    link.href = prescription.imageUrl;
    link.download = `처방전_${prescription.patientName}_${prescription.receivedAt.replace(/\s/g, '_')}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (!prescription.imageUrl) return;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html>
          <head><title>처방전 프린트</title></head>
          <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#fff;">
            <img src="${prescription.imageUrl}" style="max-width:100%;max-height:100vh;" onload="window.print();window.close();" />
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  return (
    /* ── 전체 화면 오버레이 (TelemedPrescriptionDetail과 동일) ── */
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

        {/* 우측 — 빈 공간 (비대면 진료와 달리 결제/취소/완료 버튼 없음) */}
        <div className="w-32" />
      </div>

      {/* 조회 전용 경고 배너 */}
      {readOnly && (
        <div className="mx-6 mt-4 px-5 py-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
          <Ban size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-700 mb-0.5">탈퇴한 회원 입니다.</p>
            <p className="text-xs text-red-500">조회만 가능하며, 정보 수정 및 상태 변경이 제한됩니다.</p>
          </div>
        </div>
      )}

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
                  {prescription.gender === '남성' ? 'M' : 'F'} / {age}
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
                  {showRrn ? maskedRrn.replace('*******', '1234567') : maskedRrn}
                </p>
              </div>
              {/* 연락처 */}
              <div>
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                  연락처
                  <Eye size={12} className="text-gray-300" />
                </p>
                <p className="text-sm font-medium text-gray-800">
                  {readOnly
                    ? prescription.phone?.replace(/-\d{4}-/, '-****-')
                    : prescription.phone}
                </p>
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
                  {prescription.imageUrl && !imageError ? (
                    <img
                      src={prescription.imageUrl}
                      alt="처방전 이미지"
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-500 text-sm text-center gap-2">
                      <ImageOff size={32} className="text-gray-600" />
                      <span>이미지 없음</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 우측 입력 영역 */}
              <div className="flex-1 space-y-6">
                {/* 처방전 이미지 다운로드/프린트 */}
                <div>
                  <p className="text-xs text-gray-400 mb-2">처방전 이미지</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Download size={14} /> 다운로드
                    </button>
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Printer size={14} /> 프린트
                    </button>
                  </div>
                </div>

                {/* 접수 경로 */}
                <div>
                  <p className="text-xs text-gray-400 mb-1">접수 경로</p>
                  <p className="text-sm font-medium text-gray-800">고객 앱 촬영</p>
                </div>

                {/* 대체조제 동의 */}
                <div>
                  <p className="text-xs text-gray-400 mb-1">대체조제 동의</p>
                  <p className="text-sm font-medium text-gray-800">
                    {prescription.isConsentSubstitute ? '동의' : '미동의'}
                  </p>
                </div>

                {/* 수령 방법 */}
                <div>
                  <p className="text-xs text-gray-400 mb-1">수령 방법</p>
                  <p className="text-sm font-medium text-gray-800">
                    {prescription.deliveryMethod || <span className="text-gray-300">—</span>}
                  </p>
                </div>

                {/* 발행 병원 */}
                <div>
                  <p className="text-xs text-gray-400 mb-1">발행 병원</p>
                  <p className="text-sm font-medium text-gray-800">
                    {prescription.hospitalName === '확인 안됨' ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-400">확인 안됨</span>
                    ) : (
                      prescription.hospitalName
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 하단 여백 */}
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
};
