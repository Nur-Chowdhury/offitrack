import React from 'react'
import StatCard from "@/components/StatCard";
import { Database, Cloud, Rss } from "lucide-react";

const Overview = ({ orgId, orgName }) => {
    return (
        <main className="flex-1 lg:pt-28 pb-8 px-4 md:px-8 transition-all duration-300 bg-white dark:bg-black">                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    {orgName}
                </h1>
                <p className="text-sm text-gray-500 mt-1">Organization ID: {orgId}</p>
            </div>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
                <div className="text-center">
                    <p className="text-sm text-gray-500">Members</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                </div>
                <div className="text-center">
                    <p className="text-sm text-gray-500">Assets</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                </div>
                <div className="text-center">
                    <p className="text-sm text-gray-500">Resources</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    {/* <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Project Status</span> */}
                </div>
            </div>
            </div>
            <div className="flex items-center gap-4 mb-6">
                <select className="text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500 p-2">
                    <option>Last 60 minutes</option>
                    <option>Last 24 hours</option>
                    <option>Last 7 days</option>
                </select>
                <p className="text-sm text-gray-500">Statistics for last 60 minutes</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Asset Bookings"
                    metricName="Booking Requests"
                    value="3"
                    icon={<Database size={20} />}
                />
                <StatCard 
                    title="Resource Availability"
                    metricName="Storage Requests"
                    value="0"
                    icon={<Cloud size={20} />}
                />
                <StatCard 
                    title="Maintenance"
                    metricName="Realtime Requests"
                    value="0"
                    icon={<Rss size={20} />}
                />
            </div>
        </main>
    )
}

export default Overview
