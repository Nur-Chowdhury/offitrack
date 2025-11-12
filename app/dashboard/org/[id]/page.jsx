"use client";

import AssetList from '@/components/AssetList';
import Navbar from '@/components/Navbar'
import Overview from '@/components/Overview';
import Sidebar from '@/components/Sidebar';
import UserList from '@/components/UserList';
import { useParams } from 'next/navigation';
import React, { useState } from 'react'

const page = () => {
    const params = useParams();
    const orgId = params.id;
    const orgName = "Image Storage";

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [idx, setIdx] = useState(0);    

    return (
        <div className=" ">
            <Navbar 
                onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <div className=' w-full flex'>
                <Sidebar 
                    isOpen={isSidebarOpen} 
                    onClose={() => setIsSidebarOpen(false)}
                    changeIdx={(newIdx) => setIdx(newIdx)} 
                    idx={idx}
                />
                <main className="w-full lg:ml-64 pt-24">
                    {idx===0 && <Overview orgId={orgId} orgName={orgName} />}
                    {idx===1 && <UserList orgId={orgId}/>}
                    {idx===2 && <AssetList orgId={orgId}/>}
                </main>
                
            </div>
        </div>
    )
}

export default page
