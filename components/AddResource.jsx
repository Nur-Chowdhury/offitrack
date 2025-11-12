"use client"

import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const AddResource = ({ isOpen, onClose, onSuccess, orgId }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [type, setType] = useState('PHYSICAL');
    const [location, setLocation] = useState('');
    const [url, setUrl] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        setError(null);
        try {
            const response = await fetch(`/api/org/${orgId}/resources`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, category, type, location, url, quantity: 1 }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to create resource');
            }
            toast.success("Resource created successfully!");
            onSuccess();
            handleClose();
        } catch (error) {
            setError(error.message);
            toast.error(error.message);
        } finally{
            setIsCreating(false);
        }
    }
    const handleClose = () => {
        setName('');
        setCategory('');
        setType('PHYSICAL');
        setLocation('');
        setUrl('');
        setError(null);
        setIsCreating(false);
        onClose();
    };

    const handleTypeChange = (newType) => {
        setType(newType);
        if (newType === 'PHYSICAL') {
            setUrl('');
        } else {
            setLocation('');
        }
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
                        Create New Resource
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
                    {error && 
                        <div className="p-3 text-sm text-red-800 bg-red-100 rounded-lg">
                            {error}
                        </div>
                    }
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label 
                                htmlFor="res-name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                                Resource Name
                            </label>
                            <input 
                                type="text" 
                                id="res-name" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                required 
                                autoFocus 
                                className="w-full p-2.5 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 
                                rounded-lg bg-gray-50 dark:bg-gray-700"
                            />
                        </div>
                        <div>
                            <label htmlFor="res-category" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Category
                            </label>
                            <input 
                                type="text" 
                                id="res-category" 
                                value={category} 
                                onChange={(e) => setCategory(e.target.value)} 
                                required
                                placeholder="e.g., Meeting Room, Vehicle"
                                className="w-full p-2.5 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 
                                rounded-lg bg-gray-50 dark:bg-gray-700"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="res-type" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Resource Type
                        </label>
                        <select 
                            id="res-type" 
                            value={type} 
                            onChange={(e) => handleTypeChange(e.target.value)} 
                            className="w-full p-2.5 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 
                            rounded-lg bg-gray-50 dark:bg-gray-700"
                        >
                            <option value="PHYSICAL">Physical</option>
                            <option value="VIRTUAL">Virtual</option>
                        </select>
                    </div>

                    {type === 'PHYSICAL' && (
                        <div>
                            <label htmlFor="res-location" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Location
                            </label>
                            <input 
                                type="text" 
                                id="res-location" 
                                value={location} 
                                onChange={(e) => setLocation(e.target.value)} 
                                required={type === 'PHYSICAL'}
                                placeholder="e.g., Building A, Room 101" 
                                className="w-full p-2.5 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 
                                rounded-lg bg-gray-50 dark:bg-gray-700"
                            />
                        </div>
                    )}
                    {type === 'VIRTUAL' && (
                        <div>
                            <label htmlFor="res-url" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                URL / Access Info
                            </label>
                            <input 
                                type="text" 
                                id="res-url" 
                                value={url} 
                                onChange={(e) => setUrl(e.target.value)} 
                                required={type === 'VIRTUAL'}
                                placeholder="e.g., https://zoom.us/j/123456" 
                                className="w-full p-2.5 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 
                                rounded-lg bg-gray-50 dark:bg-gray-700"
                            />
                        </div>
                    )}
                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 
                            focus:outline-none dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <PlusCircle size={16} />
                            {isCreating ? 'Creating...' : 'Create Resource'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddResource;