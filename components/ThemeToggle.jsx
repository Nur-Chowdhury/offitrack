"use client"

import React, { useEffect, useState } from 'react'
import {Sun, Moon} from 'lucide-react'
import { useTheme } from 'next-themes'

const ThemeToggle = () => {

    const {theme, setTheme} = useTheme();
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    return (
        <div>
            <button 
                aria-label="Toggle Theme" 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
                className='cursor-pointer' 
            >
                {theme === 'light' ? <Sun size={32} strokeWidth={2} /> : <Moon size={32} strokeWidth={2} />}
            </button>
        </div>
    )
}

export default ThemeToggle
