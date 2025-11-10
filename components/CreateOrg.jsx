import React, { useState } from 'react'
import { X } from 'lucide-react';

const CreateOrg = ( { isOpen, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        setError(null);

        if (name.trim().length < 3) {
            setError('Organization name must be at least 3 characters long.');
            setIsCreating(false);
            return;
        }
        try {
            const response = await fetch('/api/org/create', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create organization');
            }

            onSuccess();
            handleClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsCreating(false);
        }
    };

    const handleClose = () => {
        setName('');
        setError(null);
        setIsCreating(false);
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" 
            onClick={handleClose}
        >
            <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Create New Organization
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
                    <div>
                        <label htmlFor="org-name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Organization Name
                        </label>
                        <input
                            type="text"
                            id="org-name"
                            className="w-full p-2.5 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Your Company Inc."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoFocus
                        />
                        {error && (
                            <div className="p-3 text-sm text-red-800 bg-red-100 border border-red-400 rounded-lg dark:bg-red-900 dark:text-red-200">
                                {error}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 focus:outline-none dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:outline-none disabled:bg-blue-400 dark:bg-blue-600 dark:hover:bg-blue-700"
                        >
                            {isCreating ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateOrg
