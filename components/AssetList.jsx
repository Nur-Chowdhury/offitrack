"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Tag, Calendar, Type, Trash2, Send, List, LogOut } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import AddAsset from './AddAsset';
import RequestAsset from './RequestAsset';
import ViewAssetRequests from './ViewAssetRequests';
import ReleaseAsset from './ReleaseAsset';

const ConditionTag = ({ condition }) => {
    const colors = {
        NEW: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        GOOD: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        USED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        DAMAGED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        IN_REPAIR: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[condition] || 'bg-gray-200'}`}>{condition.replace('_', ' ')}</span>
};

const AssetList = ({ orgId}) => {
    const { data: session } = useSession();
    const [assets, setAssets] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [assetToRequest, setAssetToRequest] = useState(null);
    const [assetToViewRequests, setAssetToViewRequests] = useState(null);
    const [assetToRelease, setAssetToRelease] = useState(null);

    const currentUserMembership = useMemo(() =>
        members.find(member => member.user.id === session?.user?.id),
        [members, session]
    );
    const isAdmin = currentUserMembership?.role === "ADMIN";

    const fetchData = async () => {
        setLoading(true);
        try {
            const [assetsRes, membersRes, assignmentsRes] = await Promise.all([
                fetch(`/api/org/${orgId}/assets`),
                fetch(`/api/org/${orgId}/members`),
                fetch(`/api/org/${orgId}/assignments`),
            ]);
            if (assetsRes.ok) setAssets(await assetsRes.json());
            if (membersRes.ok) setMembers(await membersRes.json());
            if (assignmentsRes.ok) setAssignments(await assignmentsRes.json());
        } catch (error) {
            toast.error("An error occurred while fetching data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orgId) {
            fetchData();
        }
    }, [orgId]);

    const handleAddSuccess = () => {
        fetchData();
    };

    const getAssetInfo = (assetId) => {
        const approvedAssignment = assignments.find(a => a.assetId === assetId && ['APPROVED', 'IN_USE'].includes(a.status));
        const pendingRequests = assignments.filter(a => a.assetId === assetId && a.status === 'PENDING');
        if (approvedAssignment) {
            return { 
                status: 'Assigned', 
                assignedTo: approvedAssignment.user.name, 
                assignedToId: approvedAssignment.userId,
                assignmentId: approvedAssignment.id,
                pendingRequestCount: 0,
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

    if (loading) {
        return <div className="p-8 w-full text-center">Loading assets...</div>;
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 w-full">
            <h1 className="text-2xl font-semibold mb-6">Asset Management</h1>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
                <input
                    type="text"
                    className="w-full sm:w-[300px] p-2 text-sm rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                    placeholder="Search by name or type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {isAdmin && (
                    <button
                        className="w-full sm:w-auto px-4 py-2 bg-blue-700 hover:bg-blue-600 text-sm rounded-lg flex items-center justify-center gap-2 
                        cursor-pointer text-white font-medium"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus size={16} />
                        New Asset
                    </button>
                )}
            </div>
            {filteredAssets.length === 0 ? (
                <p className="mt-8 text-gray-500 text-center">No assets found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredAssets.map((asset) => {
                        const info = getAssetInfo(asset.id);
                        const isCurrentUserAssigned = info?.assignedToId === session?.user?.id;
                        return(
                            <div key={asset.id} className="p-4 border rounded-lg shadow-sm flex flex-col justify-between dark:bg-gray-950 dark:border-gray-700">
                                <div>
                                    <div className="flex justify-between items-start">
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
                                    {info.status === 'Assigned' && (
                                        (isCurrentUserAssigned || isAdmin) ? (
                                            <button 
                                                onClick={() => handleReleaseAsset(info.assignmentId)} 
                                                className=" mt-2 w-full flex justify-center items-center text-lg  bg-red-600 border-2 border-red-600  
                                                rounded-md py-1 cursor-pointer font-semibold text-white gap-1.5 hover:bg-transparent hover:text-red-600 transition-all duration-300"
                                            >
                                                <LogOut size={14}/> 
                                                Release Asset
                                            </button>
                                        ) : (
                                            <p className="text-xs mt-2">
                                                Assigned To: 
                                                <span className="font-semibold">{info.assignedTo}</span>
                                            </p>
                                        )
                                    )}
                                    {info.status === 'Available' && (
                                        <button 
                                            onClick={() => setAssetToRequest(asset)} 
                                            className=" mt-2 w-full flex justify-center items-center text-lg  bg-blue-600 border-2 border-blue-600  
                                            rounded-md py-1 cursor-pointer font-semibold text-white gap-1.5 hover:bg-transparent hover:text-blue-600 transition-all duration-300"
                                        >
                                            <Send size={14}/> 
                                            Make a Request
                                        </button>
                                    )}
                                </div>
                                {isAdmin && (
                                    <div className="mt-4 flex justify-between border-t dark:border-gray-700 pt-3">
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
                                        <button onClick={() => handleDelete(asset.id)} className="p-2 text-gray-500 hover:text-red-500 cursor-pointer">
                                            <Trash2 size={21}/>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
            <AddAsset
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleAddSuccess}
                orgId={orgId}
            />
            {assetToRequest && 
                <RequestAsset 
                    isOpen={true} 
                    onClose={() => setAssetToRequest(null)} 
                    onSuccess={fetchData} 
                    orgId={orgId} 
                    asset={assetToRequest} 
                    isAdmin={isAdmin}
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
            {assetToRelease && (
                <ReleaseAsset
                    isOpen={true}
                    onClose={() => setAssetToRelease(null)}
                    onSuccess={() => {
                        fetchData();
                        setAssetToRelease(null);
                    }}
                    orgId={orgId}
                    assignment={assetToRelease}
                />
            )}
        </div>
    )
}

export default AssetList
