"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { Wrench, User, AlertTriangle, Package, ListChecks } from 'lucide-react';
import AssignStaff from './AssignStaff';
import CompleteMaintenance from './CompleteMaintenance';

const MaintenanceStatusTag = ({ status }) => {
    const colors = {
        REPORTED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        ASSIGNED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        IN_PROGRESS: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
        COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || 'bg-gray-200'}`}>{status.replace('_', ' ')}</span>;
};

const MaintenanceDashboard = ({ orgId }) => {
    const { data: session, status: sessionStatus } = useSession();
    const [logs, setLogs] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('REPORTED');
    
    const [logToAssign, setLogToAssign] = useState(null);
    const [logToComplete, setLogToComplete] = useState(null);

    const fetchData = async () => {
        try {
            const [logsRes, membersRes] = await Promise.all([
                fetch(`/api/org/${orgId}/maintenance/logs`),
                fetch(`/api/org/${orgId}/members`),
            ]);
            if (!logsRes.ok || !membersRes.ok) throw new Error("Failed to fetch maintenance data.");
            const logsData = await logsRes.json();
            const membersData = await membersRes.json();
            setLogs(logsData);
            setMembers(membersData);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orgId && sessionStatus === 'authenticated') {
            setLoading(true);
            fetchData();
        } else if (sessionStatus === 'unauthenticated') {
            setLoading(false);
            toast.error("You are not authorized to view this page.");
        }
    }, [orgId, sessionStatus]);

    const currentUserMembership = useMemo(() => {
        if (sessionStatus !== 'authenticated' || !members.length) {
            return null;
        }
        return members.find(m => m.user.id === session.user.id);
    }, [members, session, sessionStatus]);

    

    const maintenanceStaff = useMemo(() => members.filter(m => m.role === 'MAINTENANCE_STAFF'), [members]);
    
    const filteredLogs = useMemo(() => {
        if (loading || sessionStatus !== 'authenticated' || !currentUserMembership) {
            return [];
        }
        const isAdmin = currentUserMembership.role === 'ADMIN';
        const isStaff = currentUserMembership.role === 'MAINTENANCE_STAFF';
        if (isStaff && !isAdmin) {
            return logs.filter(log => log.maintainedById === session.user.id && log.status !== 'COMPLETED');
        }
        return logs.filter(log => log.status === activeTab);

    }, [logs, activeTab, session, sessionStatus, currentUserMembership, loading]);
    
    if (loading || sessionStatus === 'loading') {
        return <div className="p-8 w-full text-center">Loading Maintenance Dashboard...</div>;
    }    
    
    return (
        <div className="p-4 sm:p-6 md:p-8 w-full bg-white dark:bg-black">
            <h1 className="text-2xl font-semibold mb-6">Maintenance Dashboard</h1>
            
            {currentUserMembership?.role === 'ADMIN' && (
                 <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                    {['REPORTED', 'ASSIGNED', 'COMPLETED'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} 
                            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                            {tab}
                        </button>
                    ))}
                </div>
            )}
           
            <div className="overflow-x-auto relative shadow-md sm:rounded-lg bg-white dark:bg-gray-800">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="py-3 px-6">Item Name</th>
                            <th scope="col" className="py-3 px-6">Details</th>
                            <th scope="col" className="py-3 px-6">Reported By</th>
                            <th scope="col" className="py-3 px-6">Status</th>
                            <th scope="col" className="py-3 px-6">Assigned To</th>
                            <th scope="col" className="py-3 px-6">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map(log => (
                            <tr key={log.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="py-4 px-6 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                    {log.assetId ? <ListChecks size={16}/> : <Package size={16}/>}
                                    {log.asset?.name || log.resource?.name}
                                </td>
                                <td className="py-4 px-6 max-w-sm truncate" title={log.details}>{log.details}</td>
                                <td className="py-4 px-6">{log.reportedBy?.name || 'System'}</td>
                                <td className="py-4 px-6"><MaintenanceStatusTag status={log.status} /></td>
                                <td className="py-4 px-6">{log.maintainedBy?.name || 'Unassigned'}</td>
                                <td className="py-4 px-6">
                                    {currentUserMembership?.role === 'ADMIN' && log.status === 'REPORTED' && <button onClick={() => setLogToAssign(log)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Assign</button>}
                                    {log.status === 'ASSIGNED' && (currentUserMembership?.role === 'ADMIN' || log.maintainedById === session?.user?.id) && <button onClick={() => setLogToComplete(log)} className="font-medium text-green-600 dark:text-green-500 hover:underline">Complete</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredLogs.length === 0 && !loading && <p className="text-center text-gray-500 py-8">No tasks in this category.</p>}
            </div>

            {logToAssign && <AssignStaff isOpen={true} onClose={() => setLogToAssign(null)} onSuccess={fetchData} orgId={orgId} log={logToAssign} staffList={maintenanceStaff} />}
            {logToComplete && <CompleteMaintenance isOpen={true} onClose={() => setLogToComplete(null)} onSuccess={fetchData} orgId={orgId} log={logToComplete} />}
        </div>
    );
};
export default MaintenanceDashboard;