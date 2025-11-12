"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Send, List, LogOut, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import AddAsset from './AddAsset';
import RequestAsset from './RequestAsset';
import ViewAssetRequests from './ViewAssetRequests';
import ReleaseAsset from './ReleaseAsset';
import ReportIssue from './ReportIssue';

const ConditionTag = ({ condition }) => {
    const colors = {
        NEW: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        GOOD: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        USED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        DAMAGED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        IN_REPAIR: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[condition] || 'bg-gray-200'}`}>{condition.replace('_', ' ')}</span>;
};

const AssetList = ({ orgId }) => {
    const { data: session } = useSession();
    const [assets, setAssets] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [assetToRequest, setAssetToRequest] = useState(null);
    const [assetToViewRequests, setAssetToViewRequests] = useState(null);
    const [assetToRelease, setAssetToRelease] = useState(null);
    const [itemToReport, setItemToReport] = useState(null);

    const currentUserMembership = useMemo(() => members.find(m => m.user.id === session?.user?.id), [members, session]);
    const isAdmin = currentUserMembership?.role === "ADMIN";

    const fetchData = async () => {
        try {
            const [assetsRes, assignmentsRes, membersRes] = await Promise.all([
                fetch(`/api/org/${orgId}/assets`),
                fetch(`/api/org/${orgId}/assignments`),
                fetch(`/api/org/${orgId}/members`),
            ]);

            if (!assetsRes.ok || !assignmentsRes.ok || !membersRes.ok) {
                throw new Error("Failed to fetch all required asset data.");
            }

            const assetsData = await assetsRes.json();
            const assignmentsData = await assignmentsRes.json();
            const membersData = await membersRes.json();

            setAssets(assetsData);
            setAssignments(assignmentsData);
            setMembers(membersData);
        } catch (error) {
            console.error("Error fetching asset data:", error);
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

    const getAssetInfo = (assetId) => {
        const approvedAssignment = assignments.find(a => a.assetId === assetId && ['APPROVED', 'IN_USE'].includes(a.status));
        const pendingRequests = assignments.filter(a => a.assetId === assetId && a.status === 'PENDING');
        
        if (approvedAssignment) {
            return {
                status: 'Assigned',
                assignedTo: approvedAssignment.user.name,
                assignedToId: approvedAssignment.userId,
                assignmentId: approvedAssignment.id,
                pendingRequestCount: pendingRequests.length
            };
        }
        return { status: 'Available', pendingRequestCount: pendingRequests.length };
    };
    
    const handleDelete = async (assetId) => {
        if (!window.confirm("Are you sure you want to delete this asset? This action cannot be undone.")) return;
        try {
            const response = await fetch(`/api/org/${orgId}/assets/${assetId}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete asset");
            }
            toast.success("Asset deleted successfully!");
            fetchData();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleRequestAsset = async (asset, notes) => {
        try {
            const response = await fetch(`/api/org/${orgId}/assets/${asset.id}/request`, {
                method: 'POST',
                body: JSON.stringify({ notes }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to submit request.");
            }
            const successMessage = isAdmin ? "Asset assigned to you directly!" : "Asset request submitted successfully!";
            toast.success(successMessage);
            fetchData();
        } catch (error) {
            toast.error(error.message);
        }
    };

    if (loading) return <div className="p-8 w-full text-center">Loading assets...</div>;

    return (
        <div className="p-4 sm:p-6 md:p-8 w-full bg-white dark:bg-black">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-semibold">Asset Inventory</h1>
                {isAdmin && <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-sm rounded-lg flex items-center gap-2 text-white"><Plus size={16}/> New Asset</button>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {assets.map((asset) => {
                    const info = getAssetInfo(asset.id);
                    const isCurrentUserAssigned = info.assignedToId === session?.user?.id;
                    const isAvailableForRequest = ['GOOD', 'NEW', 'USED'].includes(asset.condition);

                    return (
                        <div key={asset.id} className="p-4 border rounded-lg shadow-sm flex flex-col justify-between dark:bg-gray-950 dark:border-gray-700">
                           <div>
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className="font-bold text-lg truncate pr-2">{asset.name}</h3>
                                    <ConditionTag condition={asset.condition} />
                                </div>
                                <p className="text-sm text-gray-500">{asset.type}</p>
                           </div>
                           <div className="mt-4 pt-3 border-t dark:border-gray-700 flex justify-between items-center">
                                <div className="flex-grow">
                                    {info.status === 'Available' && isAvailableForRequest &&
                                        <button onClick={() => setAssetToRequest(asset)} className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1.5"><Send size={14}/> {isAdmin ? "Assign to Self" : "Make a Request"}</button>
                                    }
                                    {info.status === 'Available' && !isAvailableForRequest &&
                                        <span className="text-xs font-bold text-red-500 flex items-center gap-1.5"><AlertTriangle size={14}/> Under Maintenance</span>
                                    }
                                    {info.status === 'Assigned' && (isCurrentUserAssigned || isAdmin) &&
                                        <button onClick={() => setAssetToRelease({ assignmentId: info.assignmentId, assetName: asset.name })} className="text-sm font-semibold text-orange-600 hover:underline flex items-center gap-1.5"><LogOut size={14}/> Release Asset</button>
                                    }
                                    {info.status === 'Assigned' && !isCurrentUserAssigned && !isAdmin &&
                                        <p className="text-xs text-gray-400">Assigned to: {info.assignedTo}</p>
                                    }
                                </div>
                               
                               <div className="flex items-center flex-shrink-0">
                                   {isAdmin && (
                                       <>
                                       <button onClick={() => setAssetToViewRequests(asset)} className="p-2 text-gray-500 hover:text-blue-500 relative" title="View Requests">
                                           <List size={16}/>
                                           {info.pendingRequestCount > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{info.pendingRequestCount}</span>}
                                       </button>
                                       <button onClick={() => handleDelete(asset.id)} className="p-2 text-gray-500 hover:text-red-500" title="Delete Asset"><Trash2 size={16}/></button>
                                       </>
                                   )}
                                   <button onClick={() => setItemToReport({ id: asset.id, name: asset.name, isAsset: true })} className="p-2 text-gray-500 hover:text-orange-500" title="Report Issue">
                                       <AlertTriangle size={16}/>
                                   </button>
                               </div>
                           </div>
                        </div>
                    );
                })}
            </div>

            <AddAsset isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={fetchData} orgId={orgId} />
            {assetToRequest && <RequestAsset isAdmin={isAdmin} isOpen={true} onClose={() => setAssetToRequest(null)} onSuccess={(notes) => { handleRequestAsset(assetToRequest, notes); setAssetToRequest(null); }} orgId={orgId} asset={assetToRequest} isAdmin={isAdmin} />}
            {assetToViewRequests && <ViewAssetRequests isOpen={true} onClose={() => setAssetToViewRequests(null)} onSuccess={fetchData} orgId={orgId} asset={assetToViewRequests} requests={assignments.filter(a => a.assetId === assetToViewRequests.id && a.status === 'PENDING')} />}
            {assetToRelease && <ReleaseAsset isOpen={true} onClose={() => setAssetToRelease(null)} onSuccess={() => { fetchData(); setAssetToRelease(null); }} orgId={orgId} assignment={assetToRelease} />}
            {itemToReport && <ReportIssue isOpen={true} onClose={() => setItemToReport(null)} onSuccess={fetchData} orgId={orgId} item={itemToReport} />}
        </div>
    );
};
export default AssetList;