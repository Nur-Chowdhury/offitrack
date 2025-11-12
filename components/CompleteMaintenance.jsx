"use client";
import React, { useState } from 'react';
import { X, Wrench } from 'lucide-react';
import { toast } from 'react-toastify';

const CompleteMaintenance = ({ isOpen, onClose, onSuccess, orgId, log }) => {
    const [cost, setCost] = useState('');
    const [details, setDetails] = useState(log?.details || '');
    const [isCompleting, setIsCompleting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsCompleting(true);
        try {
            const response = await fetch(`/api/org/${orgId}/maintenance/logs/${log.id}/complete`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cost, details }),
            });
            if (!response.ok) { const err = await response.json(); throw new Error(err.error); }
            toast.success("Maintenance task completed!");
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsCompleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
            <div className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold">Complete Maintenance Task</h3>
                    <button type="button" className="text-gray-400 p-1.5" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label htmlFor="maint-details" className="block mb-2 text-sm font-medium">Resolution Details</label>
                        <textarea 
                            id="maint-details" 
                            rows="4" 
                            value={details} 
                            onChange={(e) => setDetails(e.target.value)} 
                            required
                            className="w-full p-2.5 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700" 
                            placeholder="e.g., Replaced the bulb, updated software..."
                        ></textarea>
                    </div>
                    <div>
                        <label htmlFor="maint-cost" className="block mb-2 text-sm font-medium">Cost ($)</label>
                        <input 
                            type="number" 
                            step="0.01" 
                            id="maint-cost" 
                            value={cost} 
                            onChange={(e) => setCost(e.target.value)}
                            className="w-full p-2.5 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700" 
                            placeholder="0.00"
                        />
                    </div>
                    <div className="flex items-center justify-end space-x-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 focus:outline-none dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCompleting}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Wrench size={16} /> {isCompleting ? 'Saving...' : 'Mark as Completed'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default CompleteMaintenance;