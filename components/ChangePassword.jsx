"use client";
import React, { useState } from 'react';
import { X, KeyRound } from 'lucide-react';
import { toast } from 'react-toastify';

const ChangePassword = ({ isOpen, onClose }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/profile/change-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to update password.");
            }

            toast.success("Password changed successfully!");
            onClose();
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleClose = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError(null);
        setLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={handleClose}>
            <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold">Change Your Password</h3>
                    <button type="button" className="text-gray-400 p-1.5 cursor-pointer" onClick={handleClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {error && <div className="p-3 text-sm text-red-800 bg-red-100 rounded-lg">{error}</div>}
                    <div>
                        <label className="block mb-2 text-sm font-medium">Current Password</label>
                        <input 
                            type="password" 
                            value={currentPassword} 
                            onChange={(e) => setCurrentPassword(e.target.value)} 
                            required 
                            autoFocus 
                            className="w-full p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-600 dark:border-gray-300"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">New Password</label>
                        <input 
                            type="password" 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            required 
                            autoFocus
                            className="w-full p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-600 dark:border-gray-300"
                        />
                    </div>
                     <div>
                        <label className="block mb-2 text-sm font-medium">Confirm New Password</label>
                        <input 
                            type="password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required 
                            autoFocus
                            className="w-full p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-600 dark:border-gray-300"
                        />
                    </div>
                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-600 dark:border-gray-300">
                        <button 
                            type="button" 
                            onClick={handleClose} 
                            className="px-4 py-2 text-sm font-medium bg-white text-red-500 border border-gray-200 rounded-lg cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;