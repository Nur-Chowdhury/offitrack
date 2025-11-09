"use client";
import gsap from 'gsap';
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import Image from 'next/image';


export default function Home() {

  const heroRef = useRef(null);
  const navRef = useRef(null);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(navRef.current, { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' })
      gsap.fromTo(heroRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.2 })
    })
    return () => ctx.revert()
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-500 via-slate-400 to-slate-500 text-white">
      <nav ref={navRef} className="w-full flex justify-between items-center py-4 px-8 border-b border-slate-700 bg-slate-900/30 backdrop-blur-md fixed top-0 z-50">
        <Link href="/" className="">
          <Image 
            src="/logo.png"
            alt="OffiTrack Logo"
            width={100}
            height={40}
            priority
          />
        </Link>
        <div className=' flex items-center justify-center gap-2'>
          <Link
            href="/register"
            className="px-4 py-2 rounded-lg bg-blue-600 border-2 border-blue-600 hover:bg-white hover:text-blue-600
              hover:scale-110 transition-all duration-300 text-sm font-semibold shadow"
          >
            Sign Up
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg text-blue-600 bg-white border-2 border-blue-600 hover:bg-blue-500
             hover:text-white hover:scale-110 transition-all duration-300 text-sm font-semibold shadow"
          >
            Log In
          </Link>
        </div>
      </nav>

      <div ref={heroRef} className="flex flex-col items-center justify-center flex-grow text-center px-6 mt-28 text-black">
        <h1 className="text-5xl font-bold mb-4 ">
          Smart Office Asset & Resource Management System
        </h1>
        <p className="text-xl mb-8 max-w-3xl text-gray-800">
          OffiTrack helps organizations streamline asset management and resource booking — all in one seamless platform built for efficiency and transparency.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/register"
            className="px-6 py-3  rounded-xl bg-blue-600 hover:bg-blue-500 transition shadow-lg font-semibold"
          >
            Get Started
          </Link>
          <Link
            href="/about"
            className="px-6 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 hover:text-white transition-all 
            duration-300 font-semibold"
          >
            Learn More
          </Link>
        </div>
      </div>

      <footer className="text-center text-gray-800/90 text-md py-6 border-t border-slate-800">
        © {new Date().getFullYear()} OffiTrack. All rights reserved.
      </footer>
      
    </div>
  );
}
