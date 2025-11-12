"use client";

import Navbar from '@/components/Navbar';
import Overview from '@/components/Overview';
import Sidebar from '@/components/Sidebar';
import UserList from '@/components/UserList';
import AssetList from '@/components/AssetList';
import ResourceList from '@/components/ResourceList';
import MaintenanceDashboard from '@/components/MaintenanceDashboard';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';

const viewMap = {
    overview: 0,
    members: 1,
    assets: 2,
    resources: 3,
    maintenance: 4,
};

const indexMap = Object.keys(viewMap);

const Page = () => {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const orgId = params.id;
    const orgName = "Image Storage";

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

    return (
        <div className=" min-h-screen">
            <Navbar 
                onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <div className='w-full flex'>
                <Sidebar 
                    isOpen={isSidebarOpen} 
                    onClose={() => setIsSidebarOpen(false)}
                    onViewChange={handleViewChange}
                    activeIdx={idx}
                />
                <main className="w-full lg:ml-64 pt-24">
                    {idx === 0 && <Overview orgId={orgId} orgName={orgName} />}
                    {idx === 1 && <UserList orgId={orgId}/>}
                    {idx === 2 && <AssetList orgId={orgId}/>}
                    {idx === 3 && <ResourceList orgId={orgId} />}
                    {idx === 4 && <MaintenanceDashboard orgId={orgId} />}
                </main>
            </div>
        </div>
    );
};

export default Page;