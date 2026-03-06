import React from 'react';

export const AppFooter: React.FC = () => (
    <footer className="bg-white border-t border-gray-200 px-6 py-4 flex-none">
        <div className="flex flex-col gap-2">
            {/* Links */}
            <div className="flex items-center gap-3">
                <button className="text-xs text-gray-500 hover:text-blue-600 underline underline-offset-2 transition-colors">
                    이용약관
                </button>
                <span className="text-gray-300 text-xs">|</span>
                <button className="text-xs text-gray-600 font-semibold hover:text-blue-600 underline underline-offset-2 transition-colors">
                    개인정보 처리방침
                </button>
            </div>
            {/* Company Info */}
            <p className="text-[11px] text-gray-400 leading-relaxed">
                ㈜ 엠서클&nbsp;&nbsp;|&nbsp;&nbsp;사업자등록번호 288-87-03573&nbsp;&nbsp;|&nbsp;&nbsp;통신판매업신고번호 제2009-서울강남-00209호
            </p>
            <p className="text-[11px] text-gray-400 leading-relaxed">
                서울특별시 강남구 봉은사로 114길 12, 7층&nbsp;&nbsp;|&nbsp;&nbsp;대표자 : 이찬란, 정윤미&nbsp;&nbsp;|&nbsp;&nbsp;대표번호 1551-3633
            </p>
            <p className="text-[11px] text-gray-400">
                COPYRIGHT ⓒ Mcircle Corp. ALL RIGHT RESERVED
            </p>
        </div>
    </footer>
);
