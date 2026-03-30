import React from 'react';
import { Pill, Clock, Clipboard, AlertTriangle, Phone } from 'lucide-react';
import { clsx } from 'clsx';
import { ConsultationData } from './ConsultationDetailModal';

interface Medicine {
  name: string;
  subName: string;
  effect: string;
  morning: string;
  lunch: string;
  evening: string;
  status?: 'new' | 'caution' | 'stop' | 'normal';
}

const MOCK_MEDICINES: Medicine[] = [
  { name: '케이페리정 50mg', subName: '', effect: '동통성 근육 연축', morning: '1알', lunch: '1알', evening: '1알', status: 'normal' },
  { name: '타이레놀정 500mg', subName: '', effect: '해열 및 진통', morning: '', lunch: '', evening: '', status: 'new' },
  { name: '와파린 2mg', subName: '', effect: '혈액 응고 방지', morning: '1알', lunch: '-', evening: '-', status: 'caution' },
  { name: '가스모틴정 5mg', subName: '', effect: '기능성 소화불량의 증상 완화', morning: '-', lunch: '-', evening: '1알', status: 'normal' },
  { name: '글리메피리드 1mg', subName: '', effect: '췌장의 인슐린 분비 촉진', morning: '1알', lunch: '-', evening: '-', status: 'stop' },
];

export const MedicationGuide: React.FC<{ data: ConsultationData }> = ({ data }) => {
  return (
    <div className="bg-white p-10 max-w-[800px] mx-auto text-gray-900 font-sans print:p-0 print:max-w-none">
      {/* Header */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-2xl font-black leading-tight">
            {data.patientName} 고객님,<br />
            오늘 받아 가시는 약은 이렇게 드세요.
          </h1>
        </div>
        <div className="text-[13px] text-gray-500 font-medium">
          조제일: 2026년 2월 24일
        </div>
      </div>

      <div className="h-[2px] bg-gray-900 mb-6" />

      {/* Section 1: 오늘 받으신 약은요 */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center">
            <Pill size={14} className="text-rose-500" />
          </div>
          <h2 className="text-base font-bold">오늘 받으신 약은요</h2>
        </div>
        <div className="pl-8">
          <p className="text-[15px] leading-relaxed">
            무릎 염증을 가라앉히고 통증을 잡아주는 약 <span className="font-bold text-gray-900">{data.duration}일치</span> 입니다.
          </p>
        </div>
      </section>

      {/* Section 2: 이렇게 드세요 */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
            <Clock size={14} className="text-orange-500" />
          </div>
          <h2 className="text-base font-bold">이렇게 드세요</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 px-2">
          {/* Frequency Card */}
          <div className="bg-white border-2 border-blue-50 rounded-2xl p-5 text-center shadow-sm">
            <p className="text-xs text-gray-400 mb-2">하루</p>
            <p className="text-4xl font-black text-blue-600 tracking-tighter">
              {data.frequency}<span className="text-2xl ml-1">번</span>
            </p>
          </div>
          {/* Time Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center shadow-sm relative overflow-hidden">
            <p className="text-xs text-orange-500 font-bold mb-2">아침</p>
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-orange-400 rounded-full shadow-[0_0_15px_rgba(251,146,60,0.5)] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-dashed border-white/40 animate-[spin_10s_linear_infinite]" />
              </div>
            </div>
          </div>
          {/* Relation Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center shadow-sm">
            <div className="flex items-center justify-center gap-3 mb-2">
               <Pill size={20} className="text-rose-500" />
               <div className="w-4 h-px bg-blue-300" />
               <div className="w-5 h-5 bg-orange-100 rounded flex items-center justify-center text-[10px] text-orange-600 font-bold">밥</div>
            </div>
            <p className="text-2xl font-black text-blue-600 tracking-tighter">
              {data.relation}
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: 약마다 복용법이 달라요 */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <Clipboard size={14} className="text-blue-500" />
          </div>
          <h2 className="text-base font-bold">약마다 복용법이 달라요</h2>
        </div>
        <div className="rounded-xl overflow-hidden border border-gray-200">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr className="bg-[#1E293B] text-white">
                <th className="px-4 py-2.5 font-bold border-r border-white/10 w-[30%]">약 이름 (성분)</th>
                <th className="px-4 py-2.5 font-bold border-r border-white/10 w-[25%]">어떤 약인가요?</th>
                <th className="px-4 py-2.5 font-bold text-center border-r border-white/10">아침</th>
                <th className="px-4 py-2.5 font-bold text-center border-r border-white/10">점심</th>
                <th className="px-4 py-2.5 font-bold text-center">저녁</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_MEDICINES.map((med, idx) => (
                <tr key={idx} className={clsx(
                  med.status === 'new' ? 'bg-orange-50/50' : 
                  med.status === 'caution' ? 'bg-red-50/50' : 
                  'bg-white'
                )}>
                  <td className="px-4 py-3 border-r border-gray-100">
                    <div className="flex flex-col gap-1">
                      {med.status === 'new' && (
                        <span className="inline-flex w-fit px-1.5 py-0.5 rounded-md bg-orange-500 text-white text-[9px] font-black items-center gap-1 mb-1">
                          <span className="w-2.5 h-2.5 bg-white rounded-sm flex items-center justify-center"><div className="w-1.5 h-1.5 bg-orange-500 rounded-sm" /></span>
                          새로추가
                        </span>
                      )}
                      {med.status === 'caution' && (
                        <span className="inline-flex w-fit px-1.5 py-0.5 rounded-md bg-red-500 text-white text-[9px] font-black items-center gap-1 mb-1">
                          <AlertTriangle size={10} fill="white" className="text-red-500" />
                          주의
                        </span>
                      )}
                      {med.status === 'stop' && (
                        <span className="inline-flex w-fit px-1.5 py-0.5 rounded-md bg-gray-400 text-white text-[9px] font-black items-center gap-1 mb-1">
                           <X size={10} />
                           중단
                        </span>
                      )}
                      <span className={clsx("font-bold text-gray-900", med.status === 'stop' && "text-gray-400 line-through")}>{med.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-100 text-gray-600 leading-tight">
                    {med.effect}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-100 text-center font-bold text-gray-700">
                     {med.status === 'new' ? '' : med.morning}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-100 text-center font-bold text-gray-700">
                    {med.status === 'new' ? '' : med.lunch}
                  </td>
                  <td className={clsx("px-4 py-3 text-center font-bold", med.status === 'new' ? "text-orange-600 bg-orange-50" : "text-gray-700")}>
                    {med.status === 'new' ? '5알 미만 복용' : med.evening}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4: 주의해 주세요 */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle size={14} className="text-amber-500" />
          </div>
          <h2 className="text-base font-bold text-orange-600">주의해 주세요</h2>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex gap-5">
           <div className="w-24 h-24 bg-white border border-gray-100 rounded-xl flex flex-col items-center justify-center text-[10px] text-gray-300 gap-1 flex-shrink-0">
              <div className="w-12 h-12 bg-gray-50 rounded-lg" />
              약 사진 첨부
              <p className="text-[11px] font-bold text-gray-400 mt-1">와파린 2mg</p>
           </div>
           <ul className="space-y-2 text-[13px] text-gray-700 py-1">
              <li className="flex gap-2">
                <span className="mt-1.5 w-1 h-1 bg-gray-400 rounded-full flex-shrink-0" />
                이 <span className="font-bold">노란 작은 알약</span>을 드신 후 멍이 잘 들거나 출혈이 오래 지속되면 바로 알려주세요.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 w-1 h-1 bg-gray-400 rounded-full flex-shrink-0" />
                시금치 · 브로콜리 같은 <span className="font-bold underline underline-offset-2">짙은 녹색 채소</span>는 이 약의 효과를 떨어뜨릴 수 있어요.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 w-1 h-1 bg-gray-400 rounded-full flex-shrink-0" />
                복용약과 상호작용을 고려해 <span className="font-bold text-blue-600">"오메가 3"</span>를 추천 드립니다.
              </li>
           </ul>
        </div>
      </section>

      {/* Footer */}
      <div className="h-px bg-gray-900 mb-6" />
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-white border-2 border-gray-900 rounded-xl p-1.5 rotate-[-2deg]">
             <div className="w-full h-full border border-dashed border-gray-200 flex flex-col items-center justify-center">
               <div className="w-2 h-2 bg-gray-900 mb-0.5" />
               <div className="w-6 h-6 border-2 border-gray-900 p-0.5">
                  <div className="w-full h-full bg-gray-900" />
               </div>
             </div>
          </div>
          <div>
            <p className="text-[13px] font-black text-gray-900">약 드실 시간에 알려드릴게요!</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-[#1E293B]">웰체크 약국</p>
          <p className="text-[13px] font-bold text-gray-500 flex items-center justify-end gap-1">
            <Phone size={12} className="fill-gray-400 text-gray-400" /> 
            02-1234-5678
          </p>
        </div>
      </div>
    </div>
  );
};

const X: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);
