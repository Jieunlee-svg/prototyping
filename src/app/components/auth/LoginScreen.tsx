import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
  onClose?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-2xl p-10 font-sans">
      {/* Logo Area */}
      <div className="flex justify-center mb-8">
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
            type={showPassword ? 'text' : 'password'}
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
          onClick={() => window.open('https://mims-account.mcircle.co.kr/regist', '_blank')}
          className="w-full bg-white border border-[#4460C3] text-[#4460C3] font-medium py-3.5 rounded-full hover:bg-blue-50 transition-colors"
        >
          통합회원 가입하기
        </button>

        {/* Developer Note (Prototype Instruction) */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-sm text-gray-700 leading-relaxed font-medium">
            이 팝업은 자체 개발 하지 않습니다.<br />
            <a 
              href="https://mims-account.mcircle.co.kr/login" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline break-all block my-2"
            >
              https://mims-account.mcircle.co.kr/login
            </a>
            링크를 엽니다.<br />
            로그인 버튼을 누르고 탐색을 계속 하세요.
          </p>
        </div>
      </div>
    </div>
  );
};
