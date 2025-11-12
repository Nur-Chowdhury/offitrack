import React from 'react';
import { X, Check } from 'lucide-react';
import { toast } from 'react-toastify';

const ViewAssetRequests = ({ isOpen, onClose, onSuccess, orgId, asset, requests }) => {

    const handleApprove = async (assignmentId) => {
        try {
            const response = await fetch(`/api/org/${orgId}/assignments/${assignmentId}/manage`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newStatus: 'APPROVED' }),
            });
            if (!response.ok) {
                const err = await response.json(); throw new Error(err.error);
            }
            toast.success("Request approved!");
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
            <div className="relative w-full max-w-2xl p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold">Pending Requests for: {asset.name}</h3>
                    <button type="button" className="text-gray-400 p-1.5" onClick={onClose}><X size={20} /></button>
                </div>
                <div className="mt-4 max-h-[60vh] overflow-y-auto">
                    {requests.length === 0 ? (
                        <p className="text-gray-500">No pending requests for this asset.</p>
                    ) : (
                        <ul className="space-y-3">
                            {requests.map(req => (
                                <li key={req.id} className="p-4 border rounded-lg dark:border-gray-700 flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">{req.user.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{req.notes || "No notes provided."}</p>
                                        <p className="text-xs text-gray-400 mt-1">Requested on: {new Date(req.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <button onClick={() => handleApprove(req.id)} className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-1.5">
                                        <Check size={16} /> Approve
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewAssetRequests;