import React, { useState } from 'react';
import { User, Lock, Save, X, Edit2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

export const MyInfo: React.FC = () => {
    // Mock Data
    const initialData = {
        id: 'pharmacist_kim',
        password: '••••••••', // Display only
    };

    const [id, setId] = useState(initialData.id);
    const [isEditingId, setIsEditingId] = useState(false);
    const [newId, setNewId] = useState(id);

    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSaveId = () => {
        if (!newId.trim()) {
            showNotification('error', '아이디를 입력해주세요.');
            return;
        }
        setId(newId);
        setIsEditingId(false);
        showNotification('success', '아이디가 성공적으로 변경되었습니다.');
    };

    const handleSavePassword = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            showNotification('error', '모든 비밀번호 필드를 입력해주세요.');
            return;
        }
        if (newPassword !== confirmPassword) {
            showNotification('error', '새 비밀번호가 일치하지 않습니다.');
            return;
        }
        if (newPassword.length < 8) {
            showNotification('error', '비밀번호는 8자 이상이어야 합니다.');
            return;
        }

        // In a real app, you would verify currentPassword here.
        setIsEditingPassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showNotification('success', '비밀번호가 성공적으로 변경되었습니다.');
    };

    const cancelEditId = () => {
        setNewId(id);
        setIsEditingId(false);
    };

    const cancelEditPassword = () => {
        setIsEditingPassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden relative">
            {/* Notification Toast */}
            {notification && (
                <div className={clsx(
                    "absolute top-6 right-6 flex items-center p-4 rounded-lg shadow-lg z-50 transform transition-all duration-300",
                    notification.type === 'success' ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
                )}>
                    {notification.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 mr-3 text-green-500" />
                    ) : (
                        <AlertCircle className="w-5 h-5 mr-3 text-red-500" />
                    )}
                    <span className="font-medium text-sm">{notification.message}</span>
                </div>
            )}

            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-6 z-10">
                <h1 className="text-2xl font-bold text-gray-900">계정 정보</h1>
                <p className="text-sm text-gray-500 mt-1">계정 정보를 확인하고 수정할 수 있습니다.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-2xl mx-auto space-y-6">

                    {/* ID Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center text-lg font-semibold text-gray-900">
                                <User className="w-5 h-5 mr-2 text-blue-600" />
                                계정 아이디
                                <span className="ml-3 px-2 py-0.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full">엠서클 통합 회원</span>
                            </div>
                            {!isEditingId && (
                                <button
                                    onClick={() => setIsEditingId(true)}
                                    className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center"
                                >
                                    <Edit2 className="w-4 h-4 mr-1.5" />
                                    변경
                                </button>
                            )}
                        </div>

                        <div className="p-6">
                            {isEditingId ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">새 아이디</label>
                                        <input
                                            type="text"
                                            value={newId}
                                            onChange={(e) => setNewId(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                                            placeholder="새로운 아이디를 입력하세요"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-3 mt-4">
                                        <button
                                            onClick={cancelEditId}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            취소
                                        </button>
                                        <button
                                            onClick={handleSaveId}
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                        >
                                            <Save className="w-4 h-4 mr-1.5" />
                                            저장
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center text-gray-900 font-medium">
                                    {id}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Password Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center text-lg font-semibold text-gray-900">
                                <Lock className="w-5 h-5 mr-2 text-blue-600" />
                                비밀번호
                            </div>
                            {!isEditingPassword && (
                                <button
                                    onClick={() => setIsEditingPassword(true)}
                                    className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center"
                                >
                                    <Edit2 className="w-4 h-4 mr-1.5" />
                                    변경
                                </button>
                            )}
                        </div>

                        <div className="p-6">
                            {isEditingPassword ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">현재 비밀번호</label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                                            placeholder="현재 비밀번호를 입력하세요"
                                        />
                                    </div>
                                    <div className="pt-2 border-t border-gray-100"></div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                                            placeholder="새 비밀번호 (8자 이상)"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호 확인</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                                            placeholder="새 비밀번호를 한번 더 입력하세요"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-3 mt-6">
                                        <button
                                            onClick={cancelEditPassword}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            취소
                                        </button>
                                        <button
                                            onClick={handleSavePassword}
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                        >
                                            <Save className="w-4 h-4 mr-1.5" />
                                            비밀번호 변경
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center text-gray-500 font-medium tracking-widest text-lg">
                                    {initialData.password}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* 회원 탈퇴 */}
            <div className="mt-6 flex justify-end">
                <button className="text-xs text-gray-400 hover:text-red-500 underline underline-offset-2 transition-colors">
                    회원 탈퇴
                </button>
            </div>
        </div>
    );
};
