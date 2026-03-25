import React, { useState } from 'react';
import {
    MessageSquare,
    Search,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronDown,
} from 'lucide-react';
import { clsx } from 'clsx';

/* ─── Mock Data ─── */
interface SmsRecord {
    id: string;
    sentAt: string;       // 초대장 발송일시
    phone: string;        // 휴대전화 번호
    joined: 'joined' | 'pending' | 'expired'; // 웰체크 가입 여부
    joinedAt?: string;    // 가입 일시 (joined 상태일 때)
    sendType: 'individual' | 'bulk';
}

const MOCK_RECORDS: SmsRecord[] = [
    { id: '1', sentAt: '2026-03-06 13:42', phone: '010-1234-5678', joined: 'joined', joinedAt: '2026-03-06 14:05', sendType: 'individual' },
    { id: '2', sentAt: '2026-03-06 13:38', phone: '010-9876-5432', joined: 'pending', sendType: 'individual' },
    { id: '3', sentAt: '2026-03-06 13:30', phone: '010-5555-1111', joined: 'joined', joinedAt: '2026-03-06 13:55', sendType: 'bulk' },
    { id: '4', sentAt: '2026-03-06 13:20', phone: '010-2222-3333', joined: 'expired', sendType: 'bulk' },
    { id: '5', sentAt: '2026-03-06 11:10', phone: '010-7777-8888', joined: 'joined', joinedAt: '2026-03-06 11:40', sendType: 'individual' },
    { id: '6', sentAt: '2026-03-05 16:55', phone: '010-4444-9999', joined: 'pending', sendType: 'individual' },
    { id: '7', sentAt: '2026-03-05 15:30', phone: '010-1111-2222', joined: 'joined', joinedAt: '2026-03-05 16:00', sendType: 'bulk' },
    { id: '8', sentAt: '2026-03-05 14:00', phone: '010-3333-4444', joined: 'expired', sendType: 'bulk' },
    { id: '9', sentAt: '2026-03-05 10:22', phone: '010-6666-7777', joined: 'joined', joinedAt: '2026-03-05 10:50', sendType: 'individual' },
    { id: '10', sentAt: '2026-03-04 17:45', phone: '010-8888-0000', joined: 'pending', sendType: 'individual' },
    { id: '11', sentAt: '2026-03-04 13:10', phone: '010-2121-3434', joined: 'joined', joinedAt: '2026-03-04 13:35', sendType: 'bulk' },
    { id: '12', sentAt: '2026-03-04 09:05', phone: '010-5656-7878', joined: 'expired', sendType: 'bulk' },
    { id: '13', sentAt: '2026-03-03 18:20', phone: '010-9090-1212', joined: 'joined', joinedAt: '2026-03-03 18:55', sendType: 'individual' },
    { id: '14', sentAt: '2026-03-03 11:30', phone: '010-3434-5656', joined: 'pending', sendType: 'individual' },
    { id: '15', sentAt: '2026-03-02 14:00', phone: '010-7878-9090', joined: 'expired', sendType: 'bulk' },
];

function JoinedBadge({ status, joinedAt }: { status: SmsRecord['joined']; joinedAt?: string }) {
    if (status === 'joined') {
        return (
            <div className="flex flex-col gap-0.5">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 size={13} />
                    가입 완료
                </span>
                {joinedAt && <span className="text-[11px] text-gray-400">{joinedAt}</span>}
            </div>
        );
    }
    if (status === 'pending') {
        return (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-500">
                <Clock size={13} />
                미가입 (대기중)
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400">
            <XCircle size={13} />
            미가입 (만료)
        </span>
    );
}

export const SmsInviteHistory: React.FC = () => {
    const [joinedFilter, setJoinedFilter] = useState<'all' | 'joined' | 'pending' | 'expired'>('all');
    const [typeFilter, setTypeFilter] = useState<'all' | 'individual' | 'bulk'>('all');
    const [search, setSearch] = useState('');

    const filtered = MOCK_RECORDS.filter((r) => {
        if (joinedFilter !== 'all' && r.joined !== joinedFilter) return false;
        if (typeFilter !== 'all' && r.sendType !== typeFilter) return false;
        if (search && !r.phone.includes(search)) return false;
        return true;
    });

    const joinedCount = MOCK_RECORDS.filter((r) => r.joined === 'joined').length;
    const pendingCount = MOCK_RECORDS.filter((r) => r.joined === 'pending').length;

    return (
        <div className="flex flex-col h-full bg-gray-50 relative">

            {/* Filter & Search Toolbar */}
            <div className="px-4 py-2.5 bg-white border-b border-gray-100 flex items-center justify-between gap-3">
                {/* Left: filter chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    {([
                        { value: 'all', label: '전체 가입상태' },
                        { value: 'joined', label: '가입 완료' },
                        { value: 'pending', label: '대기중' },
                        { value: 'expired', label: '만료' },
                    ] as const).map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => setJoinedFilter(value)}
                            className={clsx(
                                'px-3 py-1 rounded-full text-[13px] font-medium border transition-all',
                                joinedFilter === value
                                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                                    : 'border-gray-200 text-gray-500 bg-white hover:border-gray-400 hover:text-gray-700'
                            )}
                        >
                            {label}
                        </button>
                    ))}
                    <div className="w-px h-4 bg-gray-200 mx-1" />
                    {([
                        { value: 'all', label: '전체 유형' },
                        { value: 'individual', label: '개별 발송' },
                        { value: 'bulk', label: '일괄 발송' },
                    ] as const).map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => setTypeFilter(value)}
                            className={clsx(
                                'px-3 py-1 rounded-full text-[13px] font-medium border transition-all',
                                typeFilter === value
                                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                                    : 'border-gray-200 text-gray-500 bg-white hover:border-gray-400 hover:text-gray-700'
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                {/* Right: count + search */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[13px] text-gray-400">
                        총 <span className="text-blue-600 font-semibold">{filtered.length}</span>건
                    </span>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="휴대전화 번호 검색"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-52 pl-8 pr-3 py-1.5 text-[13px] border border-gray-200 rounded-full bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400"
                        />
                        <Search className="absolute left-2.5 top-2 text-gray-400" size={14} />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-hidden px-6 pb-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
                    <div className="overflow-auto flex-1">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-8">
                                        #
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                                            초대장 발송일시 <ChevronDown size={12} />
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        휴대전화 번호
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        발송 유형
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        웰체크 가입
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-16 text-center text-gray-400 text-sm">
                                            발송 내역이 없습니다.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((r, idx) => (
                                        <tr
                                            key={r.id}
                                            className="hover:bg-blue-50/40 transition-colors"
                                        >
                                            <td className="px-4 py-3.5 text-xs text-gray-400">
                                                {idx + 1}
                                            </td>
                                            <td className="px-4 py-3.5 text-gray-700 font-medium">
                                                {r.sentAt}
                                            </td>
                                            <td className="px-4 py-3.5 text-gray-800 font-mono tracking-wide">
                                                {r.phone}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className={clsx(
                                                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold',
                                                    r.sendType === 'individual'
                                                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                                                        : 'bg-purple-50 text-purple-600 border border-purple-200'
                                                )}>
                                                    {r.sendType === 'individual' ? '개별' : '일괄'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <JoinedBadge status={r.joined} joinedAt={r.joinedAt} />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-4 py-3 border-t border-gray-200 bg-white flex items-center relative">
                        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
                            <button className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 text-xs disabled:opacity-30" disabled>«</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 text-xs disabled:opacity-30" disabled>‹</button>
                            {[1, 2, 3, 4, 5].map((p) => (
                                <button key={p} className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium ${p === 1 ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>
                            ))}
                            <button className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 text-xs">›</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 text-xs">»</button>
                        </div>
                        <div className="ml-auto flex items-center gap-1.5">
                            <select className="border border-gray-300 rounded text-xs text-gray-600 px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                                <option>20</option>
                                <option>50</option>
                                <option>100</option>
                            </select>
                            <span className="text-xs text-gray-500">건씩 보기</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
