"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListChecks, Wrench, Users, Settings, BarChart, Package } from 'lucide-react';
import { Fragment } from 'react';

const Sidebar = ({ isOpen, onClose, changeIdx, idx }) => {
    const pathname = usePathname();

    const navItems = [
        { href: `${pathname}`, label: 'Project Overview', icon: <Home size={18} />, idx: 0 },
        { href: '#', label: 'Users & Roles', icon: <Users size={18} />, idx: 1 },
        { href: '#', label: 'Asset Management', icon: <ListChecks size={18} />, idx: 2 },
        { href: '#', label: 'Resource Management', icon: <Package size={18} />, idx: 3 },
        { href: '#', label: 'Maintenance', icon: <Wrench size={18} />, idx: 4 },
        { href: '#', label: 'Reports', icon: <BarChart size={18} />, idx: 5 },
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
                            <Link 
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                                    ${idx === item.idx
                                        ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white' 
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`
                                    }
                                onClick={() => {
                                    changeIdx(item.idx);
                                    onClose();
                                }}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="absolute bottom-4 w-full pr-8">
                        <Link 
                            href="#"
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