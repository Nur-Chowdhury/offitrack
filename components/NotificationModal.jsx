"use client";
import React from 'react';
import { X, Bell } from 'lucide-react';

const NotificationModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" 
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Bell className="text-blue-500"/>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Notifications
                        </h3>
                    </div>
                    <button
                        type="button"
                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="mt-6 pt-6 border-t dark:border-gray-600">
                    <p className="text-center text-gray-700 dark:text-gray-300">
                        Hi
                    </p>
                    {/* When you implement the full feature, you'll map over notifications here */}
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;