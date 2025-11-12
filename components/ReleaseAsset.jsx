import React, { useState } from 'react';
import { X, LogOut } from 'lucide-react';
import { toast } from 'react-toastify';

const ReleaseAsset = ({ isOpen, onClose, onSuccess, orgId, assignment }) => {
    const [condition, setCondition] = useState('GOOD');
    const [isReleasing, setIsReleasing] = useState(false);
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsReleasing(true);
        try {
            const response = await fetch(`/api/org/${orgId}/assignments/${assignment}/release`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ returnCondition: condition }),
            });
            if (!response.ok) {
                const err = await response.json(); throw new Error(err.error);
            }
            toast.success("Asset released successfully!");
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsReleasing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
            <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold">Release Asset: {assignment.assetName}</h3>
                    <button type="button" className="text-gray-400 p-1.5" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label htmlFor="return-condition" className="block mb-2 text-sm font-medium">Confirm Asset Condition</label>
                        <select id="return-condition" value={condition} onChange={(e) => setCondition(e.target.value)}
                            className="w-full p-2.5 text-sm rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                            <option value="GOOD">Good</option>
                            <option value="USED">Used</option>
                            <option value="DAMAGED">Damaged (Needs Repair)</option>
                        </select>
                         <p className="text-xs text-gray-500 mt-1">Select the current condition of the asset you are returning.</p>
                    </div>
                    <div className="flex items-center justify-end space-x-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border rounded-lg">Cancel</button>
                        <button type="submit" disabled={isReleasing} className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2">
                            <LogOut size={16} /> {isReleasing ? 'Releasing...' : 'Confirm Release'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReleaseAsset;