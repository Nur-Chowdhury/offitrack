"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import Navbar from '@/components/Navbar';
import { User, Mail, AtSign, Calendar, Lock, Users } from 'lucide-react';
import ChangePassword from '@/components/ChangePassword';

const ProfilePage = () => {
    const { status: sessionStatus } = useSession();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [profileData, setProfileData] = useState({
        user: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        if (sessionStatus === 'authenticated') {
            const fetchProfileData = async () => {
                try {
                    const userRes = await fetch('/api/profile');
                    if (!userRes.ok) throw new Error("Failed to load profile data.");
                    
                    const userData = await userRes.json();
                    
                    setProfileData({
                        user: userData,
                        loading: false,
                        error: null,
                    });
                } catch (err) {
                    toast.error(err.message);
                    setProfileData(prev => ({ ...prev, loading: false, error: err.message }));
                }
            };
            fetchProfileData();
        }
    }, [sessionStatus]);

    const { user, loading } = profileData;

    if (loading || sessionStatus === 'loading') {
        return (
            <div>
                <Navbar />
                <div className="pt-24 text-center">Loading Profile...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div>
                <Navbar />
                <div className="pt-24 text-center text-red-500">Could not load user profile.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
            <Navbar />
            <main className="pt-24 px-4 md:px-8 max-w-4xl mx-auto  mb-12">
                <h1 className="text-3xl font-bold mb-8">My Profile</h1>
                
                <section className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Profile Details</h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4"><User className="text-gray-400"/><span><strong>Name:</strong> {user.name}</span></div>
                        <div className="flex items-center gap-4"><Mail className="text-gray-400"/><span><strong>Email:</strong> {user.email}</span></div>
                        <div className="flex items-center gap-4"><AtSign className="text-gray-400"/><span><strong>Username:</strong> {user.username}</span></div>
                        <div className="flex items-center gap-4"><Calendar className="text-gray-400"/><span><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</span></div>
                        <div className="flex items-center gap-4"><Users className="text-gray-400"/><span><strong>Member of:</strong> {user.orgCnt} Organizations</span></div>
                    </div>
                </section>
                
                <section className="my-8 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Security</h2>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">Update your password to keep your account secure.</p>
                        <button onClick={() => setIsPasswordModalOpen(true)} className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2">
                           <Lock size={16}/> Change Password
                        </button>
                    </div>
                </section>

            </main>

            <ChangePassword
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
        </div>
    );
};

export default ProfilePage;