"use client";
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BarChart, Users, Wrench, ListChecks } from 'lucide-react';

const AboutPage = () => {
    const navRef = useRef(null);
    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const ctaRef = useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline();
        tl.fromTo(navRef.current, { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' })
          .fromTo(heroRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' }, "-=0.6")
          .fromTo(featuresRef.current.children, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'power2.out' }, "-=0.5")
          .fromTo(ctaRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' }, "-=0.4");
    }, []);

    const features = [
        {
            icon: <Users className="h-8 w-8 text-blue-400" />,
            title: 'Multi-Tenancy Architecture',
            description: 'Securely manage multiple independent organizations from a single platform, with complete data isolation for each tenant.'
        },
        {
            icon: <ListChecks className="h-8 w-8 text-green-400" />,
            title: 'Comprehensive Asset & Resource Management',
            description: 'Track physical assets, manage virtual resources, and handle booking requests with an intuitive, role-based system.'
        },
        {
            icon: <Wrench className="h-8 w-8 text-orange-400" />,
            title: 'Integrated Maintenance Workflow',
            description: 'From reporting a damaged item to assigning staff and resolving the issue, our end-to-end maintenance module keeps your operations running smoothly.'
        },
        {
            icon: <BarChart className="h-8 w-8 text-indigo-400" />,
            title: 'Powerful Analytics & Reports',
            description: 'Gain insights into asset usage, resource utilization, and maintenance costs with dynamic, time-filtered reports and visualizations.'
        }
    ];

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
                <div className='flex items-center justify-center gap-2'>
                    <Link href="/register" className="px-4 py-2 rounded-lg bg-blue-600 border-2 border-blue-600 hover:bg-white hover:text-blue-600 hover:scale-110 transition-all duration-300 text-sm font-semibold shadow">
                        Sign Up
                    </Link>
                    <Link href="/login" className="px-4 py-2 rounded-lg text-blue-600 bg-white border-2 border-blue-600 hover:bg-blue-500 hover:text-white hover:scale-110 transition-all duration-300 text-sm font-semibold shadow">
                        Log In
                    </Link>
                </div>
            </nav>

            <main className="flex flex-col items-center flex-grow px-6 mt-28 text-black">
                <section ref={heroRef} className="text-center mb-16">
                    <h1 className="text-5xl font-bold mb-4">
                        About OffiTrack
                    </h1>
                    <p className="text-xl mb-8 max-w-3xl text-gray-800">
                        We're dedicated to simplifying office management. OffiTrack was built to provide a powerful, unified, and user-friendly solution for organizations to gain full control over their assets and resources.
                    </p>
                </section>

                <section className="w-full max-w-5xl mb-16">
                    <h2 className="text-3xl font-bold text-center mb-10">Our Core Features</h2>
                    <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-slate-800/40 p-6 rounded-xl border border-slate-700 backdrop-blur-lg flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    {feature.icon}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                    <p className="text-gray-300 text-sm">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section ref={ctaRef} className="text-center mb-20">
                    <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                    <p className="text-lg text-gray-800 mb-8">
                        Streamline your office operations today.
                    </p>
                    <Link
                        href="/register"
                        className="px-8 py-4 text-lg rounded-xl bg-blue-600 hover:bg-blue-500 transition shadow-lg font-semibold text-white"
                    >
                        Sign Up for Free
                    </Link>
                </section>
            </main>

            <footer className="text-center text-gray-800/90 text-md py-6 border-t border-slate-800">
                © {new Date().getFullYear()} OffiTrack. All rights reserved.
            </footer>
        </div>
    );
};

export default AboutPage;