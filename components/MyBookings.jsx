"use client";
import React from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';

const BookingStatusTag = ({ status }) => {
    const colors = { PENDING: 'bg-blue-100 text-blue-800', APPROVED: 'bg-green-100 text-green-800', REJECTED: 'bg-red-100 text-red-800', CANCELLED: 'bg-gray-100 text-gray-800', COMPLETED: 'bg-purple-100 text-purple-800', IN_USE: 'bg-yellow-100 text-yellow-800'};
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || 'bg-gray-200'}`}>{status}</span>;
};

const MyBookings = ({ isOpen, onClose, onSuccess, orgId, myBookings }) => {
    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        try {
            const response = await fetch(`/api/org/${orgId}/bookings/${bookingId}/manage`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ newStatus: 'CANCELLED' })});
            if (!response.ok) { const err = await response.json(); throw new Error(err.error); }
            toast.success("Booking cancelled.");
            onSuccess();
        } catch (error) { toast.error(error.message); }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
            <div className="relative w-full max-w-4xl p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between pb-4 border-b dark:border-gray-600">
                    <h3 className="text-xl font-semibold">My Bookings</h3>
                    <button type="button" className="text-gray-400 p-1.5" onClick={onClose}><X size={20} /></button>
                </div>
                <div className="mt-4 max-h-[70vh] overflow-y-auto">
                    {myBookings.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">You have no bookings.</p>
                    ) : (
                         <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="py-3 px-6">Resource</th>
                                        <th scope="col" className="py-3 px-6">Time Slot</th>
                                        <th scope="col" className="py-3 px-6">Status</th>
                                        <th scope="col" className="py-3 px-6">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myBookings.map(booking => (
                                        <tr key={booking.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                            <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">{booking.resource.name}</td>
                                            <td className="py-4 px-6">{new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}</td>
                                            <td className="py-4 px-6"><BookingStatusTag status={booking.status} /></td>
                                            <td className="py-4 px-6">
                                                {['PENDING', 'APPROVED'].includes(booking.status) && (
                                                    <button onClick={() => handleCancelBooking(booking.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Cancel</button>
                                                )}
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

export default MyBookings;