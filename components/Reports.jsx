"use client";
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ListChecks, Package, Wrench } from 'lucide-react';

const ReportView = ({ title, icon, data, columns, chartDataKey, chartValueKey }) => {
    const chartData = data.slice(0, 10);

    return (
        <div className="mt-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                {icon} {title}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Top Items by {chartValueKey}</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis 
                                    type="category" 
                                    dataKey={chartDataKey} 
                                    tick={{ 
                                        fill: 'rgb(107, 114, 128)', 
                                        fontSize: 12 
                                    }}
                                    tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
                                    interval={0}
                                />
                                <YAxis 
                                    type="number"
                                    width={120} 
                                    tick={{ 
                                        fill: 'rgb(107, 114, 128)', 
                                        fontSize: 12
                                    }}
                                    allowDecimals={false}
                                />
                                <Tooltip cursor={{fill: 'rgba(128, 128, 128, 0.1)'}} contentStyle={{ background: 'rgba(31, 41, 55, 0.9)', borderColor: 'rgba(55, 65, 81, 1)', color: '#fff', borderRadius: '0.5rem' }}/>
                                <Bar dataKey={chartValueKey} fill="#3b82f6" barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="lg:col-span-3 overflow-x-auto relative shadow-md sm:rounded-lg bg-white dark:bg-gray-800">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                {columns.map(col => <th key={col.key} scope="col" className="py-3 px-6">{col.label}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, index) => (
                                <tr key={row.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    {columns.map(col => (
                                        <td key={col.key} className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                                            {col.formatter ? col.formatter(row[col.key]) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const Reports = ({ orgId }) => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('asset_usage');
    const [reportData, setReportData] = useState([]);
    console.log("hi");
    

    const reportTypes = [
        { id: 'asset_usage', label: 'Asset Usage', icon: <ListChecks size={16}/> },
        { id: 'resource_utilization', label: 'Resource Utilization', icon: <Package size={16}/> },
        { id: 'maintenance_analysis', label: 'Maintenance Analysis', icon: <Wrench size={16}/> },
    ];

    useEffect(() => {
        if (!orgId) return;

        const fetchReportData = async () => {
            setLoading(true);
            setReportData([]);
            try {
                const response = await fetch(`/api/org/${orgId}/reports?type=${activeTab}`);
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || "Failed to fetch report data.");
                }
                setReportData(await response.json());
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchReportData();
    }, [orgId, activeTab]);

    const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

    const reportColumns = {
        asset_usage: [
            { key: 'name', label: 'Asset Name' },
            { key: 'type', label: 'Type' },
            { key: 'usageCount', label: 'Times Assigned' },
        ],
        resource_utilization: [
            { key: 'name', label: 'Resource Name' },
            { key: 'category', label: 'Category' },
            { key: 'bookingCount', label: 'Times Booked' },
        ],
        maintenance_analysis: [
            { key: 'name', label: 'Item Name' },
            { key: 'type', label: 'Type' },
            { key: 'totalCost', label: 'Total Repair Cost', formatter: (val) => currencyFormatter.format(val || 0) },
            { key: 'repairCount', label: '# of Repairs' },
        ]
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 w-full">
            <h1 className="text-2xl font-semibold mb-6">Reports & Analytics</h1>
            
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                {reportTypes.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.id ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-16">Loading report...</div>
            ) : reportData.length === 0 ? (
                <div className="text-center text-gray-500 py-16">No data available for this report.</div>
            ) : (
                <>
                    {activeTab === 'asset_usage' && <ReportView title="Asset Usage Report" icon={<ListChecks size={20}/>} data={reportData} columns={reportColumns.asset_usage} chartDataKey="name" chartValueKey="usageCount" />}
                    {activeTab === 'resource_utilization' && <ReportView title="Resource Utilization Report" icon={<Package size={20}/>} data={reportData} columns={reportColumns.resource_utilization} chartDataKey="name" chartValueKey="bookingCount" />}
                    {activeTab === 'maintenance_analysis' && <ReportView title="Maintenance Analysis Report" icon={<Wrench size={20}/>} data={reportData} columns={reportColumns.maintenance_analysis} chartDataKey="name" chartValueKey="totalCost" />}
                </>
            )}
        </div>
    );
};

export default Reports;