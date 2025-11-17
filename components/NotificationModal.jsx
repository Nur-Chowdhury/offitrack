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
            const fetchNotifications = async () => {
                setLoading(true);
                try {
                    const response = await fetch(`/api/org/${orgId}/notifications`);
                    if (!response.ok) throw new Error("Failed to fetch notifications.");
                    setNotifications(await response.json());
                } catch (error) {
                    toast.error(error.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchNotifications();
        }
    }, [isOpen, orgId]);

    if (!isOpen) return null;

    const getIcon = (message) => {
        if (message.toLowerCase().includes('approved')) return <ListChecks className="text-green-500"/>;
        if (message.toLowerCase().includes('rejected') || message.toLowerCase().includes('cancelled')) return <X className="text-red-500"/>;
        if (message.toLowerCase().includes('maintenance') || message.toLowerCase().includes('damaged')) return <Wrench className="text-orange-500"/>;
        if (message.toLowerCase().includes('welcome')) return <UserPlus className="text-indigo-500"/>;
        if (message.toLowerCase().includes('requested') || message.toLowerCase().includes('assigned')) return <Package className="text-blue-500"/>;
        return <Bell className="text-gray-400"/>;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
            <div className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between pb-4 border-b dark:border-gray-600">
                    <h3 className="text-xl font-semibold">Notifications</h3>
                    <button type="button" onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-800 dark:hover:text-white"><X size={20} /></button>
                </div>
                <div className="mt-4 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="text-center text-gray-500 py-4">
                            <p>Loading notifications...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            <Bell size={32} className="mx-auto mb-2"/>
                            <p>You have no notifications.</p>
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {notifications.map(notif => (
                                <li key={notif.id} className="p-3 flex items-start gap-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <div className="flex-shrink-0 mt-1">{getIcon(notif.message)}</div>
                                    <div>
                                        <p className="text-sm text-gray-800 dark:text-gray-200">{notif.message}</p>
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