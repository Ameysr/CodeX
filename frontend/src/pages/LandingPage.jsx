import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { motion, useScroll, useTransform } from 'framer-motion';

const CodeXLanding = () => {
    const navigate = useNavigate();
    const { scrollY } = useScroll();
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);
    const scale = useTransform(scrollY, [0, 300], [1, 0.95]);

    // Mouse move effect for background
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: e.clientX,
                y: e.clientY
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-x-hidden">

            {/* Dynamic Background Glow */}
            <div
                className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
                style={{
                    background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(29, 78, 216, 0.07), transparent 40%)`
                }}
            />

            <nav className="fixed w-full z-50 transition-all duration-300 backdrop-blur-md bg-black/50 border-b border-white/5">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="font-bold text-xl">C</span>
                        </div>
                        <span className="text-2xl font-bold tracking-tight">CodeX</span>
                    </div>

                    <div className="flex items-center space-x-6">
                        <NavLink
                            to="/login"
                            className="text-gray-300 hover:text-white font-medium transition-colors"
                        >
                            Log In
                        </NavLink>
                        <NavLink
                            to="/signup"
                            className="px-6 py-2.5 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                        >
                            Sign Up
                        </NavLink>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 container mx-auto px-6 z-10 flex flex-col items-center text-center">

                {/* Background Elements */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>

                <motion.div
                    style={{ opacity, scale }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="inline-flex items-center px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 mb-8 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse mr-2"></span>
                        <span className="text-sm font-medium text-blue-300">The New Standard for Devs</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-tight">
                        Master the Art of <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white to-blue-400 bg-[size:200%] animate-gradient">
                            Algorithms
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Join the elite community of developers. Solve premium problems,
                        compete in real-time contests, and accelerate your career growth with CodeX.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
                        <button
                            onClick={() => navigate('/signup')}
                            className="w-full md:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_50px_rgba(37,99,235,0.6)] transform hover:-translate-y-1"
                        >
                            Start Coding Now
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full md:w-auto px-8 py-4 rounded-xl border border-gray-700 hover:border-white/20 bg-black/50 backdrop-blur-md text-white font-semibold text-lg transition-all hover:bg-white/5"
                        >
                            Existing User?
                        </button>
                    </div>
                </motion.div>

                {/* Floating preview cards */}
                <div className="mt-32 relative w-full max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        {[
                            { title: "Premium Problems", desc: "Curated challenges from top tech companies." },
                            { title: "Real-time Contests", desc: "Compete globally and analyze your performance." },
                            { title: "Interview Prep", desc: "Mock interviews with detailed feedback loops." }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="p-8 rounded-3xl bg-[#0c0e14] border border-white/5 hover:border-blue-500/30 transition-all duration-300 group hover:bg-[#11131a]"
                            >
                                <div className="w-12 h-12 bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Snapshot */}
            <footer className="border-t border-gray-800/50 bg-black pt-20 pb-10 mt-20">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-gray-500 text-sm">© 2026 CodeX. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default CodeXLanding;
