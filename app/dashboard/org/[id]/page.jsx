"use client";

import Navbar from '@/components/Navbar';
import Overview from '@/components/Overview';
import Sidebar from '@/components/Sidebar';
import UserList from '@/components/UserList';
import AssetList from '@/components/AssetList';
import ResourceList from '@/components/ResourceList';
import MaintenanceDashboard from '@/components/MaintenanceDashboard';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react'
import Reports from '@/components/Reports';

const viewMap = {
    overview: 0,
    members: 1,
    assets: 2,
    resources: 3,
    maintenance: 4,
    reports: 5,
};

const indexMap = Object.keys(viewMap);

const Page = () => {
    const params = useParams();
    const router = useRouter();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    const currentUserMembership = useMemo(() => members.find(m => m.user.id === session?.user?.id), [members, session]);
    const isAdmin = currentUserMembership?.role === "ADMIN";
    const orgId = params.id;
    

    const fetchData = async () => {
        try {
            const membersRes = await fetch(`/api/org/${orgId}/members`);
            if (!membersRes.ok) {
                throw new Error("Failed to fetch all required asset data.");
            }
            const membersData = await membersRes.json();
            setMembers(membersData);
        } catch (error) {
            toast.error(error.message || "An error occurred while fetching data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orgId) {
            setLoading(true);
            fetchData();
        }
    }, [orgId]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const currentView = searchParams.get('view') || 'overview';
    const idx = viewMap[currentView] ?? 0;

    const handleViewChange = (newIdx) => {
        const newView = indexMap[newIdx];
        if (newView) {
            router.push(`/dashboard/org/${orgId}?view=${newView}`);
        }
    };

    if (!orgId) {
        return <div className="pt-24 text-center">Loading Organization...</div>;
    }

    if (loading) return <div className="p-8 w-full text-center">Loading..</div>;

    return (
        <div className=" min-h-screen bg-white dark:bg-black"> 
            <Navbar 
                onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <div className='w-full flex'>
                <Sidebar 
                    isOpen={isSidebarOpen} 
                    onClose={() => setIsSidebarOpen(false)}
                    onViewChange={handleViewChange}
                    activeIdx={idx}
                    isAdmin={isAdmin}
                />
                <main className="w-full lg:ml-64 pt-24">
                    {idx === 0 && <Overview orgId={orgId} />}
                    {idx === 1 && <UserList orgId={orgId}/>}
                    {idx === 2 && <AssetList orgId={orgId}/>}
                    {idx === 3 && <ResourceList orgId={orgId} />}
                    {idx === 4 && <MaintenanceDashboard orgId={orgId} />}
                    {isAdmin && idx === 5 && <Reports orgId={orgId} />}
                </main>
            </div>
        </div>
    );
};

export default Page;