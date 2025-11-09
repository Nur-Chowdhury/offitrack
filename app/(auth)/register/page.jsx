'use client'

import React, { useState } from 'react'
import {Eye, EyeOff} from 'lucide-react'
import Link from 'next/link';

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    }

    return (
        <div className=' w-dvw h-dvh flex items-center justify-center bg-gradient-to-br from-blue-500 via-slate-400 to-slate-500'>
            <div className='  w-[500px] max-w-[90%] bg-blue-300 rounded-lg text-black p-4 flex flex-col items-center justify-center gap-4'>
                <span className=' text-3xl font-semibold '>
                    Register
                </span>
                <form className=' w-full space-y-4 m-4'>
                    <label>Name</label>
                    <input 
                        type="text" 
                        name="name"
                        placeholder="Your name" 
                        value={formData.name} 
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required 
                    />
                    <label>Username</label>
                    <input 
                        type="text" 
                        name="username"
                        placeholder="Your unique username" 
                        value={formData.username} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required 
                    />
                    <label>Email</label>
                    <input 
                        type="email" 
                        name="email"
                        placeholder="Your email address" 
                        value={formData.email} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="w-full px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required 
                        />
                        {showPass ? 
                            <Eye size={45}
                                className=' py-0.5 px-1.5 border border-l-0 rounded-r-md cursor-pointer text-gray-700' 
                                onClick={() => setShowPass(!showPass)}    
                            />
                            :
                            <EyeOff 
                                size={45}
                                className=' py-0.5 px-1.5 border border-l-0 rounded-r-md  cursor-pointer text-gray-700' 
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
                            className="w-full px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required 
                        />
                        {showConPass ? 
                            <Eye size={45}
                                className=' py-0.5 px-1.5 border border-l-0 rounded-r-md cursor-pointer text-gray-700' 
                                onClick={() => setShowConPass(!showConPass)}    
                            />
                            :
                            <EyeOff 
                                size={45}
                                className=' py-0.5 px-1.5 border border-l-0 rounded-r-md  cursor-pointer text-gray-700' 
                                onClick={() => setShowConPass(!showConPass)}
                            />
                        }
                    </div>
                    
                    <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded-xl hover:bg-blue-500 transition text-xl font-medium">
                        Register
                    </button>
                </form>
                <div className=' w-full flex flex-col items-center justify-center'>
                    <div className=' w-full flex gap-0 my-2'>
                        <hr className=' flex-grow border-t border-gray-400 mt-3'/>
                        <span className=' mx-2 text-gray-600'>OR</span>
                        <hr className=' flex-grow border-t border-gray-400 mt-3'/>
                    </div>
                    Already have an account? <Link href="/login" className=' text-blue-700 font-semibold'>Log In</Link>
                </div>
            </div>
        </div>
    )
}

export default page
