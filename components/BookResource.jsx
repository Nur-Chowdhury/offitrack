import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';

const BookResource = ({ isOpen, onClose, onSuccess, orgId, resource, isAdmin }) => {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [notes, setNotes] = useState('');
    const [isBooking, setIsBooking] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Client-side validation
        if (new Date(startTime) >= new Date(endTime)) {
            const validationError = "End time must be after the start time.";
            setError(validationError);
            toast.error(validationError);
            return;
        }

        setIsBooking(true);
        try {
            const response = await fetch(`/api/org/${orgId}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resourceId: resource.id, startTime, endTime, notes }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to submit booking request.");
            }
            if(isAdmin){
                toast.success("Resource Booked!");
            }
            else {
                toast.success("Booking request submitted successfully!");
            }
            onSuccess();
            handleClose();
        } catch (error) {
            setError(error.message);
            toast.error(error.message);
        } finally {
            setIsBooking(false);
        }
    };
    
    const handleClose = () => {
        setStartTime('');
        setEndTime('');
        setNotes('');
        setError(null);
        setIsBooking(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" 
            onClick={handleClose}
        >
            <div 
                className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Book Resource: {resource.name}
                    </h3>
                    <button
                        type="button"
                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                        onClick={handleClose}
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {error && <div className="p-3 text-sm text-red-800 bg-red-100 rounded-lg">{error}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="start-time" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Start Time</label>
                            <input 
                                type="datetime-local" 
                                id="start-time" 
                                value={startTime} 
                                onChange={(e) => setStartTime(e.target.value)} 
                                required 
                                className="w-full p-2.5 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                            />
                        </div>
                        <div>
                            <label htmlFor="end-time" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">End Time</label>
                            <input 
                                type="datetime-local" 
                                id="end-time" 
                                value={endTime} 
                                onChange={(e) => setEndTime(e.target.value)} 
                                required 
                                className="w-full p-2.5 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="booking-notes" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Notes (Optional)</label>
                        <textarea 
                            id="booking-notes" 
                            rows="3" 
                            value={notes} 
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g., Team meeting, Client presentation..."
                            className="w-full p-2.5 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                        ></textarea>
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 focus:outline-none dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isBooking}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Calendar size={16} />
                            {isBooking ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookResource;