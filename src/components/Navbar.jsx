import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-6 flex justify-between items-center ${isScrolled ? 'bg-neutral-50/90 backdrop-blur-md border-b border-neutral-200' : 'bg-transparent'}`}>
                <div className="text-2xl font-bold tracking-tighter flex items-center gap-2 z-50 relative">
                    <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-lg text-lg font-bold">ت</div>
                    التدارك
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-6">
                    <button className="bg-neutral-900 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors cursor-pointer">
                        تواصل معنا
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button className="md:hidden z-50 relative text-neutral-900" onClick={toggleMobileMenu}>
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                {/* Mobile Menu Overlay */}
                <div className={`fixed inset-0 bg-neutral-50 z-40 flex flex-col items-center justify-center gap-8 transition-all duration-500 ease-in-out md:hidden ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                    <a href="#home" onClick={toggleMobileMenu} className="text-2xl font-bold text-neutral-900 hover:text-neutral-600">الرئيسية</a>
                    <a href="#services" onClick={toggleMobileMenu} className="text-2xl font-bold text-neutral-900 hover:text-neutral-600">خدماتنا</a>
                    <a href="#process" onClick={toggleMobileMenu} className="text-2xl font-bold text-neutral-900 hover:text-neutral-600">آلية العمل</a>
                    <div className="mt-8">
                        <button className="bg-neutral-900 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-neutral-800 transition-colors w-full">
                            تواصل معنا
                        </button>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
