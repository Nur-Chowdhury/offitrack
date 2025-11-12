"use client";
import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';

const ReportIssue = ({ isOpen, onClose, onSuccess, orgId, item }) => {
    const [details, setDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                assetId: item.isAsset ? item.id : null,
                resourceId: !item.isAsset ? item.id : null,
                details
            };
            const response = await fetch(`/api/org/${orgId}/maintenance/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            
            if (!response.ok) { const err = await response.json(); throw new Error(err.error); }
            toast.success("Issue reported successfully! An admin will review it shortly.");
            onSuccess();
            handleClose();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => { setDetails(''); setIsSubmitting(false); onClose(); };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={handleClose}>
            <div className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold">Report Issue with: {item.name}</h3>
                    <button type="button" className="text-gray-400 p-1.5" onClick={handleClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label htmlFor="report-details" className="block mb-2 text-sm font-medium">Issue Details</label>
                        <textarea id="report-details" rows="4" value={details} onChange={(e) => setDetails(e.target.value)} required
                            className="w-full p-2.5 text-sm rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                            placeholder="e.g., The screen is flickering, projector bulb is out..."></textarea>
                    </div>
                    <div className="flex items-center justify-end space-x-2 pt-2">
                        <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border rounded-lg">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
                            <AlertTriangle size={16} /> {isSubmitting ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default ReportIssue;