"use client";
import React from 'react';
import { X, Check } from 'lucide-react';
import { toast } from 'react-toastify';

const BookingManager = ({ isOpen, onClose, onSuccess, orgId, bookings }) => {
    const handleManageRequest = async (bookingId, newStatus) => {
        try {
            const response = await fetch(`/api/org/${orgId}/bookings/${bookingId}/manage`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newStatus }),
            });
            if (!response.ok) { const err = await response.json(); throw new Error(err.error); }
            toast.success(`Request has been ${newStatus.toLowerCase()}!`);
            onSuccess();
        } catch (error) { toast.error(error.message); }
    };

    if (!isOpen) return null;
    const pendingBookings = bookings.filter(b => b.status === 'PENDING');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
            <div className="relative w-full max-w-4xl p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between pb-4 border-b dark:border-gray-600">
                    <h3 className="text-xl font-semibold">Manage Booking Requests</h3>
                    <button type="button" className="text-gray-400 p-1.5" onClick={onClose}><X size={20} /></button>
                </div>
                <div className="mt-4 max-h-[70vh] overflow-y-auto">
                    {pendingBookings.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No pending booking requests.</p>
                    ) : (
                        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="py-3 px-6">Resource</th>
                                        <th scope="col" className="py-3 px-6">Requested By</th>
                                        <th scope="col" className="py-3 px-6">Time Slot</th>
                                        <th scope="col" className="py-3 px-6">Notes</th>
                                        <th scope="col" className="py-3 px-6">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingBookings.map(req => (
                                        <tr key={req.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">{req.resource.name}</td>
                                            <td className="py-4 px-6">{req.user.name}</td>
                                            <td className="py-4 px-6">{new Date(req.startTime).toLocaleString()} to <br/> {new Date(req.endTime).toLocaleString()}</td>
                                            <td className="py-4 px-6">{req.notes || "-"}</td>
                                            <td className="py-4 px-6 flex items-center gap-2">
                                                <button onClick={() => handleManageRequest(req.id, 'APPROVED')} title="Approve" className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"><Check size={16} /></button>
                                                <button onClick={() => handleManageRequest(req.id, 'REJECTED')} title="Reject" className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"><X size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default BookingManager;