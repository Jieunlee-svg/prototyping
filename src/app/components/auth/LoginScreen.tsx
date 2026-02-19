import React, { useState } from 'react';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative font-sans">
      {/* Top Headline */}
      <div className="text-center mb-8">
        <p className="text-gray-600 text-lg mb-1">모두가 건강한 세상을 꿈꾸는</p>
        <h1 className="text-2xl font-bold text-gray-900">No.1 통합 헬스케어 서비스</h1>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-[480px] bg-white border border-gray-200 rounded-lg shadow-sm p-10 z-10">
        {/* Logo Area */}
        <div className="flex justify-center mb-8">
          {/* Approximating the M Circle logo with text/css since I don't have the vector */}
          <div className="text-3xl font-bold flex items-center tracking-tight">
            <span className="text-[#00A0E9]">m</span>
            <span className="relative mx-0.5">
              <span className="text-[#00A0E9] text-xs absolute -top-1 left-1/2 transform -translate-x-1/2">+</span>
              <span className="text-[#2C3E50]">i</span>
            </span>
            <span className="text-[#2C3E50]">circle</span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-6">통합회원 로그인</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="아이디(이메일)를 입력해주세요"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full px-0 py-3 border-b border-gray-300 focus:border-blue-600 focus:ring-0 focus:outline-none transition-colors placeholder-gray-300 text-base"
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호를 입력해주세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-0 py-3 border-b border-gray-300 focus:border-blue-600 focus:ring-0 focus:outline-none transition-colors placeholder-gray-300 text-base pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-[#4460C3] hover:bg-[#3651b3] text-white font-bold py-4 rounded-lg mt-6 transition-colors text-lg"
          >
            로그인
          </button>

          <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
            <div className="flex items-center gap-4 shrink-0">
              <label className="flex items-center gap-2 cursor-pointer hover:text-gray-700">
                <input type="checkbox" className="w-4 h-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="whitespace-nowrap">아이디 저장</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-gray-700">
                <input type="checkbox" className="w-4 h-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="whitespace-nowrap">로그인 유지</span>
              </label>
            </div>
            <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
              <button type="button" className="hover:text-gray-800">아이디 찾기</button>
              <span className="w-px h-3 bg-gray-300"></span>
              <button type="button" className="hover:text-gray-800">비밀번호 찾기</button>
            </div>
          </div>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-100">
          <p className="text-center text-gray-500 text-sm mb-6 leading-relaxed">
            한번의 가입으로 헬스케어 서비스를 자유롭게 경험하실 수 있습니다.<br />
            기존 회원이신 경우 쉽고 빠른 가입이 가능합니다.
          </p>
          <button
            type="button"
            className="w-full bg-white border border-[#4460C3] text-[#4460C3] font-medium py-3.5 rounded-full hover:bg-blue-50 transition-colors"
          >
            통합회원 가입하기
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-[480px] mt-12 flex flex-col gap-4">
        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
          <div className="flex gap-4 text-sm font-medium text-gray-500">
            <a href="#" className="hover:text-gray-900">개인정보처리방침</a>
            <a href="#" className="hover:text-gray-900">이용약관</a>
            <a href="#" className="hover:text-gray-900">FAQ</a>
          </div>
          <div className="relative group">
            <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
              Family Site
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400">Copyright © mcircle. All right reserved</p>
      </div>
    </div>
  );
};
