"use client";
import React, { useState, useEffect } from 'react';
import { X, Bell, ListChecks, Package, Wrench, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';

function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

const NotificationModal = ({ isOpen, onClose, orgId }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && orgId) {
            const fetchAndMarkSeen = async () => {
                setLoading(true);
                try {
                    await fetch(`/api/org/${orgId}/notifications/mark-seen`, { method: 'PUT' });
                    const response = await fetch(`/api/org/${orgId}/notifications`);
                    if (!response.ok) throw new Error("Failed to fetch notifications.");
                    setNotifications(await response.json());
                } catch (error) {
                    toast.error(error.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchAndMarkSeen();
        }
    }, [isOpen, orgId]);

    if (!isOpen) return null;
    const getIcon = (message) => {
        if (message.toLowerCase().includes('approved')) return <ListChecks className="text-green-500"/>;
        if (message.toLowerCase().includes('rejected')) return <X className="text-red-500"/>;
        if (message.toLowerCase().includes('maintenance')) return <Wrench className="text-orange-500"/>;
        if (message.toLowerCase().includes('welcome')) return <UserPlus className="text-indigo-500"/>;
        if (message.toLowerCase().includes('requested')) return <Package className="text-blue-500"/>;
        return <Bell className="text-gray-400"/>;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
            <div className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between pb-4 border-b dark:border-gray-600">
                    <h3 className="text-xl font-semibold">Notifications</h3>
                    <button type="button" onClick={onClose}><X size={20} /></button>
                </div>
                <div className="mt-4 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <p className="text-center text-gray-500 py-4">Loading...</p>
                    ) : notifications.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">You have no new notifications.</p>
                    ) : (
                        <ul className="space-y-3">
                            {notifications.map(notif => (
                                <li key={notif.id} className="p-3 flex items-start gap-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <div className="flex-shrink-0 mt-1">{getIcon(notif.message)}</div>
                                    <div>
                                        <p className="text-sm">{notif.message}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatTimeAgo(notif.createdAt)}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;