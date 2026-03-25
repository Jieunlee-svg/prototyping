import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { LoginScreen } from './LoginScreen';

interface WellcheckLandingProps {
  onLogin: (isFirstTime: boolean) => void;
}

const FAMILY_SITES = [
  { name: 'PharmVille', url: 'https://pharmville.co.kr' },
  { name: 'mcircle', url: 'https://mcircle.co.kr' },
];

export const WellcheckLanding: React.FC<WellcheckLandingProps> = ({ onLogin }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showFamilySite, setShowFamilySite] = useState(false);

  // 로그인 화면 — 랜딩 페이지를 완전히 대체
  if (showLogin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-[480px]">
          <LoginScreen onLogin={onLogin} onClose={() => setShowLogin(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col font-sans overflow-hidden">
      {/* ── Background Image ── */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&auto=format&fit=crop&q=80')",
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* ── Main Content ── */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          {/* Wellcheck icon */}
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/60 flex items-center justify-center shadow-lg">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path
                d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12 12-5.373 12-12S22.627 4 16 4z"
                fill="#4ECDC4"
                opacity="0.9"
              />
              <path
                d="M16 8l2 6h6l-5 3.5 2 6L16 20l-5 3.5 2-6L8 14h6z"
                fill="white"
              />
            </svg>
          </div>
          <span className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">
            well<span className="text-[#4ECDC4]">check</span>
          </span>
        </div>

        {/* Tagline */}
        <p className="text-white/80 text-lg mb-1 drop-shadow">스마트한 단골 관리의 시작</p>
        <h1 className="text-white text-2xl font-bold mb-12 drop-shadow-lg">
          AI가 돕는 복약 상담과 자동화된 환자 CRM
        </h1>

        {/* CTA Buttons */}
        <div className="w-full max-w-sm flex flex-col gap-4">
          <button
            onClick={() => setShowLogin(true)}
            className="w-full py-4 rounded-lg bg-[#4460C3] hover:bg-[#3651b3] text-white font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            로그인
          </button>
          <button
            onClick={() => window.open('https://mims-account.mcircle.co.kr/regist', '_blank')}
            className="w-full py-4 rounded-lg bg-white/90 hover:bg-white text-gray-800 font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            회원가입
          </button>
          <p className="text-white/70 text-sm mt-2">
            wellcheck은 로그인 후 이용 가능합니다.
          </p>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="relative z-10 px-8 py-6 bg-black/40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: logo + links */}
          <div className="flex flex-col items-center sm:items-start gap-2">
            <span className="text-white font-bold text-lg">
              well<span className="text-[#4ECDC4]">check</span>
            </span>
            <div className="flex gap-4 text-sm text-white/70">
              <a href="https://rocky-weight-b00.notion.site/293373c3aa4480058e88c53b9b4485ef" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">개인정보처리방침</a>
              <a href="https://rocky-weight-b00.notion.site/2b0373c3aa4480259390f60c5d13f1fd" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">이용약관</a>
            </div>
            <p className="text-xs text-white/50">
              (주)엠서클 | 서울 강남구 봉은사로 114길 12 (삼성동) | 대표자 : 정윤미, 이찬란 | 사업자번호 : 120-86-10499
            </p>
            <p className="text-xs text-white/40">Copyright ⓒ Mcircle Corp. All rights reserved.</p>
          </div>

          {/* Right: Family Site */}
          <div className="relative">
            <button
              onClick={() => setShowFamilySite(!showFamilySite)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded text-white text-sm transition-colors"
            >
              Family Site
              <ChevronDown
                size={14}
                className={`transition-transform ${showFamilySite ? 'rotate-180' : ''}`}
              />
            </button>
            {showFamilySite && (
              <div className="absolute bottom-full right-0 mb-1 bg-white rounded shadow-lg overflow-hidden min-w-[140px]">
                {FAMILY_SITES.map((site) => (
                  <a
                    key={site.name}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    {site.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
