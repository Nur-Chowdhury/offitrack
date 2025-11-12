"use client";

import { Home, ListChecks, Wrench, Users, Settings, BarChart, Package } from 'lucide-react';
import { Fragment } from 'react';
import Link from 'next/link';

// The props have been updated:
// - `onViewChange` is the function to call when a button is clicked.
// - `activeIdx` is the currently active index, read from the URL in the parent.
const Sidebar = ({ isOpen, onClose, onViewChange, activeIdx }) => {

    const navItems = [
        { label: 'Overview', icon: <Home size={18} />, idx: 0 },
        { label: 'Members', icon: <Users size={18} />, idx: 1 },
        { label: 'Asset Management', icon: <ListChecks size={18} />, idx: 2 },
        { label: 'Resource Booking', icon: <Package size={18} />, idx: 3 },
        { label: 'Maintenance', icon: <Wrench size={18} />, idx: 4 },
        { label: 'Reports', icon: <BarChart size={18} />, idx: 5 },
    ];
    
    return (
        <Fragment>
            <div 
                className={`fixed inset-0 bg-black bg-opacity-40 z-30 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            ></div>
            <aside className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 pt-24 z-40
                transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                <div className="p-4">
                    <nav className="flex flex-col gap-1">
                        {navItems.map((item) => (
                            // Changed from <Link> to <button> because this action changes state on the current page,
                            // rather than navigating to a new one. This is better for accessibility.
                            <button 
                                key={item.label}
                                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full text-left
                                    ${activeIdx === item.idx // Use the new `activeIdx` prop for styling
                                        ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white' 
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`
                                    }
                                onClick={() => {
                                    onViewChange(item.idx); // Call the new handler from the parent page
                                    onClose(); // This still closes the sidebar on mobile after a selection
                                }}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="absolute bottom-4 w-full pr-8">
                        {/* A true link to a different page (like a settings page) should remain a <Link> */}
                        <Link 
                            href="#" // You can change this to a real settings page later
                            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                        >
                            <Settings size={18} />
                            <span>Project Settings</span>
                        </Link>
                    </div>
                </div>
            </aside>
        </Fragment>
    );
}

export default Sidebar;