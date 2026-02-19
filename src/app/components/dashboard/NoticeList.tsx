import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  ChevronRight,
  Megaphone
} from 'lucide-react';

interface Notice {
  id: number;
  category: '공지' | '이벤트' | '점검';
  title: string;
  date: string;
  isImportant: boolean;
}

const MOCK_NOTICES: Notice[] = [
  {
    id: 1,
    category: '공지',
    title: '2024년 설 연휴 약국 운영 안내',
    date: '2024-02-01',
    isImportant: true
  },
  {
    id: 2,
    category: '점검',
    title: '시스템 정기 점검 안내 (2/10 00:00 ~ 04:00)',
    date: '2024-02-05',
    isImportant: true
  },
  {
    id: 3,
    category: '이벤트',
    title: '신규 약사님을 위한 웰컴 키트 신청 안내',
    date: '2024-01-28',
    isImportant: false
  },
  {
    id: 4,
    category: '공지',
    title: '약국 정보 수정 기능 업데이트 안내',
    date: '2024-01-20',
    isImportant: false
  },
  {
    id: 5,
    category: '공지',
    title: '처방전 접수 알림 서비스 개선',
    date: '2024-01-15',
    isImportant: false
  },
  {
    id: 6,
    category: '이벤트',
    title: '1월 우수 약국 선정 결과 발표',
    date: '2024-01-10',
    isImportant: false
  },
];

export const NoticeList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotices = MOCK_NOTICES.filter(notice => 
    notice.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="text-blue-600" />
            공지사항
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Wellcheck 서비스의 주요 소식과 업데이트 내용을 확인하세요.
          </p>
        </div>
      </header>

      {/* Search & Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex items-center justify-between">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="제목으로 검색하세요"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>

          {/* Notice Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 text-center">
                    번호
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 text-center">
                    구분
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제목
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 text-center">
                    작성일
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredNotices.length > 0 ? (
                  filteredNotices.map((notice) => (
                    <tr key={notice.id} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {notice.isImportant ? <Megaphone size={16} className="text-red-500 mx-auto" /> : notice.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${notice.category === '공지' ? 'bg-blue-100 text-blue-800' : 
                            notice.category === '이벤트' ? 'bg-purple-100 text-purple-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                          {notice.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`text-sm font-medium ${notice.isImportant ? 'text-gray-900 font-semibold' : 'text-gray-700'} group-hover:text-blue-600 transition-colors`}>
                            {notice.title}
                          </span>
                          {notice.isImportant && (
                            <span className="ml-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {notice.date}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-500 text-sm">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Pagination (Visual only) */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                총 {filteredNotices.length}건의 공지사항
              </span>
              <div className="flex gap-1">
                <button className="px-3 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50" disabled>이전</button>
                <button className="px-3 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50" disabled>다음</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
