"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Send, List, LogOut, AlertTriangle, Type, Calendar } from 'lucide-react';
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
    const [searchTerm, setSearchTerm] = useState('');
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

    const filteredAssets = assets.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleReleaseAsset = (assignmentInfo) => {        
        setAssetToRelease(assignmentInfo);
    };

    if (loading) return <div className="p-8 w-full text-center">Loading assets...</div>;

    return (
        <div className="p-4 sm:p-6 md:p-8 w-full bg-white dark:bg-black">
            <h1 className="text-2xl font-semibold">Asset Inventory</h1>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <input
                    type="text"
                    className="w-full sm:w-[300px] p-2 text-sm rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                    placeholder="Search by name or type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {isAdmin && 
                    <button 
                        onClick={() => setIsAddModalOpen(true)} 
                        className="w-full sm:w-auto px-4 py-2 bg-blue-700 hover:bg-blue-600 text-sm rounded-lg flex items-center justify-center gap-2 
                        cursor-pointer text-white font-medium"
                    >
                        <Plus size={16}/> 
                        New Asset
                    </button>
                }
            </div>

            {filteredAssets.length === 0 ? (
                <p className="mt-8 text-gray-500 text-center">No assets found.</p>
            ):(
                <div className="flex flex-wrap gap-4">
                    {filteredAssets.map((asset) => {
                        const info = getAssetInfo(asset.id);
                        const isCurrentUserAssigned = info?.assignedToId === session?.user?.id;
                        const isAvailableForRequest = ['GOOD', 'NEW', 'USED'].includes(asset.condition);
                        return (
                            <div key={asset.id} className="min-w-[350px] p-4 border rounded-lg shadow-sm flex flex-col justify-between dark:bg-gray-950 dark:border-gray-700">
                                <div>
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-bold text-lg truncate pr-2">{asset.name}</h3>
                                        <ConditionTag condition={asset.condition} />
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-2">
                                        <Type size={14} />
                                        <span className="truncate">{asset.type}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        <Calendar size={14} />
                                        <span>Purchased: {new Date(asset.purchaseDate).toLocaleDateString()}</span>
                                    </div>
                                    {info.status === 'Assigned' && !isCurrentUserAssigned &&
                                        <p className="text-xs text-gray-400">Assigned to: {info.assignedTo}</p>
                                    }
                                    {info.status === 'Assigned' && (isCurrentUserAssigned || isAdmin) && (
                                            <button 
                                                onClick={() => handleReleaseAsset(info.assignmentId)} 
                                                className=" mt-2 w-full flex justify-center items-center text-lg  bg-red-600 border-2 border-red-600  
                                                rounded-md py-1 cursor-pointer font-semibold text-white gap-1.5 hover:bg-transparent hover:text-red-600 transition-all duration-300"
                                            >
                                                <LogOut size={14}/> 
                                                Release Asset
                                            </button>
                                        )
                                    }
                                    {info.status === 'Available' && isAvailableForRequest && (
                                        <button 
                                            onClick={() => setAssetToRequest(asset)} 
                                            className=" mt-2 w-full flex justify-center items-center text-lg  bg-blue-600 border-2 border-blue-600  
                                            rounded-md py-1 cursor-pointer font-semibold text-white gap-1.5 hover:bg-transparent hover:text-blue-600 transition-all duration-300"
                                        >
                                            <Send size={14}/> 
                                            {isAdmin ? "Assign to Self" : "Make a Request"}
                                        </button>
                                    )}
                                    {info.status === 'Available' && !isAvailableForRequest &&
                                        <span className="font-medium text-red-500 flex items-center gap-1.5"><AlertTriangle size={14}/> Under Maintenance</span>
                                    }
                                </div>
                                <div className="mt-2 pt-3 border-t dark:border-gray-700 flex justify-between items-center">
                                    {isAdmin && 
                                        <button 
                                            onClick={() => setAssetToViewRequests(asset)} 
                                            className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1.5 relative cursor-pointer"
                                        >
                                            <List size={14}/> View Requests
                                            {info.pendingRequestCount > 0 && 
                                                <span 
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                                                >
                                                    {info.pendingRequestCount}
                                                </span>
                                            }
                                        </button>
                                    }
                                    <div className="flex items-center">
                                        {isAdmin && (
                                            <div>
                                                <button 
                                                    onClick={() => handleDelete(asset.id)} 
                                                    className=" p-1 text-gray-500 hover:text-red-500 cursor-pointer" 
                                                    title="Delete Asset"
                                                >
                                                    <Trash2 size={21}/>
                                                </button>
                                            </div>
                                        )}
                                        <button 
                                            onClick={() => setItemToReport({ id: asset.id, name: asset.name, isAsset: true })} 
                                            className="p-1 text-gray-500 hover:text-orange-500 cursor-pointer" 
                                            title="Report Issue"
                                        >
                                            <AlertTriangle size={21}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            

            <AddAsset 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchData}
                orgId={orgId}
            />
            {assetToRequest && 
                <RequestAsset 
                    isAdmin={isAdmin} 
                    isOpen={true} 
                    onClose={() => setAssetToRequest(null)} 
                    onSuccess={() => {
                        fetchData();
                        setAssetToRequest(null);
                    }}
                    orgId={orgId} 
                    asset={assetToRequest} 
                />
            }
            {assetToViewRequests && 
                <ViewAssetRequests 
                    isOpen={true} 
                    onClose={() => setAssetToViewRequests(null)} 
                    onSuccess={fetchData} 
                    orgId={orgId} 
                    asset={assetToViewRequests} 
                    requests={assignments.filter(a => a.assetId === assetToViewRequests.id && a.status === 'PENDING')} 
                />
            }
            {assetToRelease && 
                <ReleaseAsset 
                    isOpen={true} 
                    onClose={() => setAssetToRelease(null)} 
                    onSuccess={() => { 
                        fetchData(); 
                        setAssetToRelease(null); 
                    }} 
                    orgId={orgId} 
                    assignment={assetToRelease} 
                />}
            {itemToReport && 
                <ReportIssue 
                    isOpen={true} 
                    onClose={() => setItemToReport(null)} 
                    onSuccess={fetchData} 
                    orgId={orgId} 
                    item={itemToReport} 
                />
            }
        </div>
    );
};
export default AssetList;