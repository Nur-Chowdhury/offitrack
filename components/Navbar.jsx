"use client"

import { useSession } from 'next-auth/react'
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { signOut } from 'next-auth/react';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {

    const { data: session, status } = useSession();
    const router = useRouter();

    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        if (status === "unauthenticated") {
            toast.error("Please log in.");
            router.replace("/login"); 
        }
    }, [status, router]);

    return (
        <nav className="w-full bg-white dark:bg-black flex justify-between items-center py-4 px-8 border-b border-slate-700 backdrop-blur-md fixed top-0 z-50">
            <Link href="/" className="">
            <Image 
                src="/logo2.png"
                alt="OffiTrack Logo"
                width={80}
                height={30}
                priority
                className=' text-blue-500'
            />
            </Link>
            <div className=' flex items-center gap-4'>
                <ThemeToggle />
                <div className=' relative text-left'>
                    <div onClick={toggleDropdown} className="cursor-pointer flex items-center">
                        <Image 
                            src={session?.user?.image || '/userprofile.png'} 
                            alt="User Avatar"
                            width={40}
                            height={40}
                            className="rounded-full"
                        />
                    </div>
                    {isOpen && (
                        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-100 dark:bg-gray-950 ring-[0.1px] ring-black dark:ring-white ring-opacity-5 text-center font-semibold">
                            <div className=' w-full py-1'>
                                <div className="px-4 py-2">
                                    <span className="block text-md">{session?.user?.name}</span>
                                    <span className="block text-sm text-gray-400">@{session?.user?.username}</span>
                                </div>
                                <div className="border-t border-gray-700 dark:border-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-900 px-4 py-1">
                                    <span className=' block text-md font-light'>Profile</span>
                                </div>
                                <div 
                                    className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-900 px-4 py-1"
                                    onClick={() => signOut({ callbackUrl: '/login' })}
                                >
                                    <span className=' block text-md font-light'>Signout</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
            </div>
        </nav>
    )
}

export default Navbar
