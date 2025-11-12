"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';

const AddAsset = ({ isOpen, onClose, onSuccess, orgId }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');
    const [condition, setCondition] = useState('GOOD');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        setError(null);
        try {
            const response = await fetch(`/api/org/${orgId}/assets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, type, purchaseDate, condition }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create asset');
            }
            toast.success("Asset created successfully!");
            onSuccess();
            handleClose();
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setIsCreating(false);
        }
    };

    const handleClose = () => {
        setName('');
        setType('');
        setPurchaseDate('');
        setCondition('GOOD');
        setError(null);
        setIsCreating(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={handleClose}>
            <div className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold">Create New Asset</h3>
                    <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 rounded-lg p-1.5" onClick={handleClose}>
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {error && <div className="p-3 text-sm text-red-800 bg-red-100 rounded-lg">{error}</div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="asset-name" className="block mb-2 text-sm font-medium">Asset Name</label>
                            <input 
                                type="text" 
                                id="asset-name" 
                                value={name} onChange={(e) => setName(e.target.value)} 
                                required 
                                autoFocus 
                                className="w-full p-2.5 text-sm rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                            />
                        </div>
                        <div>
                            <label htmlFor="asset-type" className="block mb-2 text-sm font-medium">Asset Type / Category</label>
                            <input 
                                type="text" 
                                id="asset-type" 
                                value={type} 
                                onChange={(e) => setType(e.target.value)} 
                                required
                                placeholder="e.g., Laptop, Monitor, Chair"
                                className="w-full p-2.5 text-sm rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                            />
                        </div>
                        <div>
                            <label htmlFor="purchase-date" className="block mb-2 text-sm font-medium">Purchase Date</label>
                            <input 
                                type="date" 
                                id="purchase-date" 
                                value={purchaseDate} 
                                onChange={(e) => setPurchaseDate(e.target.value)} 
                                required 
                                className="w-full p-2.5 text-sm rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                            />
                        </div>
                        <div>
                            <label htmlFor="asset-condition" className="block mb-2 text-sm font-medium">Condition</label>
                            <select 
                                id="asset-condition" 
                                value={condition} 
                                onChange={(e) => setCondition(e.target.value)}
                                className="w-full p-2.5 text-sm rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                            >
                                <option value="NEW">New</option>
                                <option value="GOOD">Good</option>
                                <option value="USED">Used</option>
                                <option value="DAMAGED">Damaged</option>
                                <option value="IN_REPAIR">In Repair</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center justify-end space-x-2 pt-2">
                        <button 
                            type="button" 
                            onClick={handleClose} 
                            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isCreating} 
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-50"
                        >
                            {isCreating ? 'Creating...' : 'Create Asset'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddAsset;
