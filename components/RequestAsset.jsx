import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { toast } from 'react-toastify';

const RequestAsset = ({ isOpen, onClose, onSuccess, orgId, asset, isAdmin }) => {
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/org/${orgId}/assets/${asset.id}/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes }),
            }); 
            if (!response.ok) {
                const err = await response.json(); throw new Error(err.error);
            }
            if (isAdmin) {
                toast.success("Asset Assigned Successfully!");
            }
            else{
                toast.success("Asset request submitted successfully!");
            }
            onSuccess();
            handleClose();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setNotes('');
        setIsSubmitting(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={handleClose}>
            <div className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold">Request Asset: {asset.name}</h3>
                    <button type="button" className="text-gray-400 p-1.5" onClick={handleClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label htmlFor="request-notes" className="block mb-2 text-sm font-medium">Reason / Notes (Optional)</label>
                        <textarea id="request-notes" rows="4" value={notes} onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-2.5 text-sm rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                            placeholder="e.g., For the upcoming client presentation..."></textarea>
                    </div>
                    <div className="flex items-center justify-end space-x-2 pt-2">
                        <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border rounded-lg">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-50 flex items-center gap-2">
                            <Send size={16} /> {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequestAsset;