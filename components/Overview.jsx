"use client";
import React, { useState, useEffect } from 'react';
import StatCard from "@/components/StatCard";
import { ListChecks, Wrench, Users, Bell } from "lucide-react";
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import NotificationModal from './NotificationModal';

const Overview = ({ orgId }) => {
    const [timeframe, setTimeframe] = useState('24h'); // Default to 24 hours
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    
    const [dashboardData, setDashboardData] = useState({
        orgName: "Loading...",
        totals: { members: 0, assets: 0, resources: 0 },
        recentActivity: {
            requests: { count: 0, history: [] },
            maintenance: { count: 0, history: [] },
            newMembers: { count: 0, history: [] },
        },
        loading: true,
        error: null,
    });

    useEffect(() => {
        if (!orgId) return;

        const fetchData = async () => {
            setDashboardData(prev => ({ ...prev, loading: true }));
            try {
                const response = await fetch(`/api/org/${orgId}/stats?timeframe=${timeframe}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch dashboard statistics.");
                }
                const data = await response.json();
                
                setDashboardData({
                    orgName: data.orgName,
                    totals: data.totals,
                    recentActivity: data.recentActivity,
                    loading: false,
                    error: null,
                });

            } catch (error) {
                console.error("Error fetching overview data:", error);
                toast.error(error.message);
                setDashboardData(prev => ({ ...prev, loading: false, error: error.message }));
            }
        };

        fetchData();
    }, [orgId, timeframe]);
    
    // --- UPDATED TIME LABELS ---
    const timeLabel = { '1h': 'last hour', '24h': 'last 24 hours', '7d': 'last 7 days' }[timeframe];
    const { totals, recentActivity, loading, orgName } = dashboardData;

    const chartData = [
        { name: 'New Members', "Count": recentActivity.newMembers.count },
        { name: 'Requests', "Count": recentActivity.requests.count },
        { name: 'Maintenance', "Count": recentActivity.maintenance.count },
    ];

    return (
        <div className="p-4 md:p-8 w-full text-white">
            <div className="flex flex-col md:flex-row items-start justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">{loading ? "Loading..." : orgName}</h1>
                    <p className="text-sm text-gray-500 mt-1">Organization ID: {orgId}</p>
                </div>
                <div className="flex items-center gap-8 mt-4 md:mt-0">
                    <div className="text-center"><p className="text-sm text-gray-500">Members</p><p className="text-2xl font-bold">{loading ? '-' : totals.members}</p></div>
                    <div className="text-center"><p className="text-sm text-gray-500">Assets</p><p className="text-2xl font-bold">{loading ? '-' : totals.assets}</p></div>
                    <div className="text-center"><p className="text-sm text-gray-500">Resources</p><p className="text-2xl font-bold">{loading ? '-' : totals.resources}</p></div>
                    <button onClick={() => setIsNotificationModalOpen(true)} className="relative p-2 rounded-full hover:bg-gray-800 transition-colors" title="Notifications">
                        <Bell size={20} />
                        <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <select 
                    value={timeframe} 
                    onChange={(e) => setTimeframe(e.target.value)} 
                    className="text-sm border border-gray-700 rounded-lg bg-gray-900 focus:ring-blue-500 focus:border-blue-500 p-2" 
                    disabled={loading}
                >
                    {/* --- UPDATED DROPDOWN OPTIONS --- */}
                    <option value="1h">Last Hour</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                </select>
                <p className="text-sm text-gray-500">Statistics for {timeLabel}</p>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <StatCard 
                    title="Bookings & Requests"
                    metricName="Total Requests"
                    value={loading ? '...' : recentActivity.requests.count}
                    icon={<ListChecks size={20} />}
                    color="#3b82f6"
                    chartData={recentActivity.requests.history}
                />
                <StatCard 
                    title="Maintenance"
                    metricName="Items Reported"
                    value={loading ? '...' : recentActivity.maintenance.count}
                    icon={<Wrench size={20} />}
                    color="#ef4444"
                    chartData={recentActivity.maintenance.history}
                />
                <StatCard 
                    title="New Members"
                    metricName="Users Joined"
                    value={loading ? '...' : recentActivity.newMembers.count}
                    icon={<Users size={20} />}
                    color="#8b5cf6"
                    chartData={recentActivity.newMembers.history}
                />
            </div>

            <NotificationModal isOpen={isNotificationModalOpen} onClose={() => setIsNotificationModalOpen(false)} />
        </div>
    );
};

export default Overview;