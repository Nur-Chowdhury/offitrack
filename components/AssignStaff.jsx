"use client";
import React, { useState } from 'react';
import { X, UserCheck } from 'lucide-react';
import { toast } from 'react-toastify';

const AssignStaff = ({ isOpen, onClose, onSuccess, orgId, log, staffList }) => {
    const [staffId, setStaffId] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!staffId) { toast.error("Please select a staff member."); return; }
        setIsAssigning(true);
        try {
            const response = await fetch(`/api/org/${orgId}/maintenance/logs/${log.id}/assign`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ staffId }),
            });
            if (!response.ok) { const err = await response.json(); throw new Error(err.error); }
            toast.success("Staff assigned successfully!");
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsAssigning(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
            <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold">Assign Staff</h3>
                    <button type="button" className="text-gray-400 p-1.5" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label htmlFor="staff-select" className="block mb-2 text-sm font-medium">Select Maintenance Staff</label>
                        <select id="staff-select" value={staffId} onChange={(e) => setStaffId(e.target.value)}
                            className="w-full p-2.5 text-sm rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                            <option value="" disabled>-- Select a staff member --</option>
                            {staffList.map(staff => (
                                <option key={staff.user.id} value={staff.user.id}>{staff.user.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center justify-end space-x-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border rounded-lg">Cancel</button>
                        <button type="submit" disabled={isAssigning} className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2">
                            <UserCheck size={16} /> {isAssigning ? 'Assigning...' : 'Assign Staff'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default AssignStaff;