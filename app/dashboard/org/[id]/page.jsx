"use client";

import Navbar from '@/components/Navbar'
import Overview from '@/components/Overview';
import Sidebar from '@/components/Sidebar';
import StatCard from '@/components/StatCard';
import UserList from '@/components/UserList';
import { Database, BarChart, Shield, Cloud, Server, Rss } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useState } from 'react'

const page = () => {
    const params = useParams();
    const orgId = params.id;
    const orgName = "Image Storage";

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [idx, setIdx] = useState(0);

    console.log(idx);
    

    return (
        <div className=" ">
            <Navbar 
                onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <div className=' flex'>
                <Sidebar 
                    isOpen={isSidebarOpen} 
                    onClose={() => setIsSidebarOpen(false)}
                    changeIdx={(newIdx) => setIdx(newIdx)} 
                    idx={idx}
                />
                <main className="lg:ml-64 pt-24">
                    {idx===0 && <Overview orgId={orgId} orgName={orgName} />}
                    {idx===1 && <UserList orgId={orgId}/>}
                </main>
                
            </div>
        </div>
    )
}

export default page
