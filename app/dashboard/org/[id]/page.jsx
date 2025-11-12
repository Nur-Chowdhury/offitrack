"use client";

<<<<<<< HEAD
import Navbar from '@/components/Navbar';
import Overview from '@/components/Overview';
import Sidebar from '@/components/Sidebar';
import UserList from '@/components/UserList';
import AssetList from '@/components/AssetList';
import ResourceList from '@/components/ResourceList';
import MaintenanceDashboard from '@/components/MaintenanceDashboard';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
=======
import AssetList from '@/components/AssetList';
import Navbar from '@/components/Navbar'
import Overview from '@/components/Overview';
import Sidebar from '@/components/Sidebar';
import UserList from '@/components/UserList';
import { useParams } from 'next/navigation';
import React, { useState } from 'react'
>>>>>>> e643804e5c0b88c93164af61552be386712ec400

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
<<<<<<< HEAD
    
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
=======
    const [idx, setIdx] = useState(0);    
>>>>>>> e643804e5c0b88c93164af61552be386712ec400

    return (
        <div className=" min-h-screen">
            <Navbar 
                onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            />
<<<<<<< HEAD
            <div className='w-full flex'>
=======
            <div className=' w-full flex'>
>>>>>>> e643804e5c0b88c93164af61552be386712ec400
                <Sidebar 
                    isOpen={isSidebarOpen} 
                    onClose={() => setIsSidebarOpen(false)}
                    onViewChange={handleViewChange}
                    activeIdx={idx}
                />
                <main className="w-full lg:ml-64 pt-24">
<<<<<<< HEAD
                    {idx === 0 && <Overview orgId={orgId} orgName={orgName} />}
                    {idx === 1 && <UserList orgId={orgId}/>}
                    {idx === 2 && <AssetList orgId={orgId}/>}
                    {idx === 3 && <ResourceList orgId={orgId} />}
                    {idx === 4 && <MaintenanceDashboard orgId={orgId} />}
=======
                    {idx===0 && <Overview orgId={orgId} orgName={orgName} />}
                    {idx===1 && <UserList orgId={orgId}/>}
                    {idx===2 && <AssetList orgId={orgId}/>}
>>>>>>> e643804e5c0b88c93164af61552be386712ec400
                </main>
            </div>
        </div>
    );
};

export default Page;