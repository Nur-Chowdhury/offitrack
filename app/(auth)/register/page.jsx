'use client'

import React, { useEffect, useState } from 'react'
import {Eye, EyeOff} from 'lucide-react'
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const page = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    });

    const [showPass, setShowPass] = useState(false);
    const [showConPass, setShowConPass] = useState(false);

    const [usernameStatus, setUsernameStatus] = useState({
        loading: false,
        message: ''
    });

    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'authenticated') {
            router.replace('/dashboard');
        }
    }, [status, router]);

    useEffect(() => {
        if (!formData.username) {
            setUsernameStatus({ loading: false, message: '' });
            return;
        }

        setUsernameStatus({ loading: true, message: '' });

        const timer = setTimeout(() => {
            const checkUsername = async () => {
                try {
                    const response = await fetch(`/api/register?username=${formData.username}`);
                    const data = await response.json();
                    if (response.ok) {
                        if (data.available) {
                            setUsernameStatus({ loading: false, message: 'Username is available!', isAvailable: true });
                        } else {
                            setUsernameStatus({ loading: false, message: 'Username is taken.', isAvailable: false });
                        }
                    } else {
                        setUsernameStatus({ loading: false, message: 'Could not check username.', isAvailable: false });
                    }
                } catch (error) {
                    console.log(error);
                    setUsernameStatus({ loading: false, message: 'Error checking username.', isAvailable: false });
                }
            };
            checkUsername();
        }, 500);

        return () => clearTimeout(timer);
    }, [formData.username]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password.length < 8) {
            toast.error("Password must be atleast 8 characters long!");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }
        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                toast.success("Registration successful! Please Login.");
            } else {
                toast.error(data.error || "Registration failed!");
            }
        } catch (error) {
            toast.error("Something went wrong!");       
        }
    }

    return (
        <div className=' min-h-dvh flex items-center justify-center bg-gradient-to-br from-blue-500 via-slate-400 to-slate-500'>
            <div className='  w-[90%] max-w-[500px] bg-blue-300 rounded-lg text-black p-4 flex flex-col items-center justify-center gap-4'>
                <span className=' text-3xl font-semibold '>
                    Register
                </span>
                <form onSubmit={handleSubmit} className=' w-full space-y-4 mx-4 mt-4 mb-2'>
                    <label>Name</label>
                    <input 
                        type="text" 
                        name="name"
                        placeholder="Your name" 
                        value={formData.name} 
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        required 
                    />
                    <div>
                        <label>Username</label>
                        <input 
                            type="text" 
                            name="username"
                            placeholder="Your unique username" 
                            value={formData.username} 
                            onChange={handleChange} 
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            required 
                        />
                        {usernameStatus.message && (
                            <p className={usernameStatus.isAvailable ? 'text-green-700 text-sm' : 'text-red-600 text-sm'}>
                                {usernameStatus.message}
                            </p>
                        )}
                    </div>
                    <label>Email</label>
                    <input 
                        type="email" 
                        name="email"
                        placeholder="Your email address" 
                        value={formData.email} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        required 
                    />
                    <label>Password</label>
                    <div className=' w-full flex gap-0'>
                        <input 
                            type= {showPass ? "text":"password"} 
                            name="password"
                            placeholder="Your password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            className="w-full px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            required 
                        />
                        {showPass ? 
                            <Eye size={45}
                                className=' py-0.5 px-1.5 border border-l-0 rounded-r-md cursor-pointer text-gray-700 bg-white' 
                                onClick={() => setShowPass(!showPass)}    
                            />
                            :
                            <EyeOff 
                                size={45}
                                className=' py-0.5 px-1.5 border border-l-0 rounded-r-md  cursor-pointer text-gray-700 bg-white' 
                                onClick={() => setShowPass(!showPass)}
                            />
                        }
                    </div>
                    
                    <label>Confirm Password</label>
                    <div className=' w-full flex gap-0'>
                        <input 
                            type= {showConPass ? "text":"password"} 
                            name="confirmPassword"
                            placeholder="Retype your password" 
                            value={formData.confirmPassword} 
                            onChange={handleChange} 
                            className="w-full px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            required 
                        />
                        {showConPass ? 
                            <Eye size={45}
                                className=' py-0.5 px-1.5 border border-l-0 rounded-r-md cursor-pointer text-gray-700 bg-white' 
                                onClick={() => setShowConPass(!showConPass)}    
                            />
                            :
                            <EyeOff 
                                size={45}
                                className=' py-0.5 px-1.5 border border-l-0 rounded-r-md  cursor-pointer text-gray-700 bg-white' 
                                onClick={() => setShowConPass(!showConPass)}
                            />
                        }
                    </div>
                    
                    <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded-xl hover:bg-blue-500 transition text-xl font-medium cursor-pointer">
                        Register
                    </button>
                </form>
                <div className=' w-full flex flex-col items-center justify-center'>
                    <div className=' w-full flex gap-0 my-2'>
                        <hr className=' flex-grow border-t border-gray-400 mt-3'/>
                        <span className=' mx-2 text-gray-600'>OR</span>
                        <hr className=' flex-grow border-t border-gray-400 mt-3'/>
                    </div>

                    <span>Already have an account? <Link href="/login" className=' text-blue-700 font-semibold'>Log In</Link></span>
                </div>
            </div>
        </div>
    );
}
export default page;