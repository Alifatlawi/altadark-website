import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Process from './components/Process';
import Footer from './components/Footer';
import Background from './components/Background';

/* ARABIC FONT & STYLE CONFIGURATION 
  - Using 'IBM Plex Sans Arabic' for that modern, industrial tech feel.
  - Setting dir="rtl" for correct Arabic layout.
*/

const MainApp = () => {
  const [activeNav, setActiveNav] = useState('الرئيسية');

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setActiveNav(id === 'home' ? 'الرئيسية' : id === 'services' ? 'خدماتنا' : 'آلية العمل');
  };

  // Update active nav on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'services', 'process'];
      const scrollPosition = window.scrollY + 300; // Offset

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
          setActiveNav(section === 'home' ? 'الرئيسية' : section === 'services' ? 'خدماتنا' : 'آلية العمل');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div dir="rtl" className="bg-neutral-50 text-neutral-900 min-h-screen font-sans selection:bg-neutral-900 selection:text-white" style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;700&display=swap');
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>

      <Background />
      <Navbar />

      {/* Floating Bottom Nav - Hidden on mobile, visible on desktop/tablet */}
      <div className="fixed bottom-8 left-1/2 translate-x-1/2 z-40 bg-neutral-900 text-white/70 px-1 py-1 rounded-full hidden md:flex gap-1 shadow-2xl backdrop-blur-sm bg-opacity-95">
        {['الرئيسية', 'خدماتنا', 'آلية العمل'].map((item, idx) => {
          const ids = ['home', 'services', 'process'];
          return (
            <button
              key={item}
              onClick={() => scrollTo(ids[idx])}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeNav === item ? 'bg-white text-black shadow-sm' : 'hover:text-white'}`}
            >
              {item}
            </button>
          )
        })}
      </div>

      <main>
        <Hero />
        <Services />
        <Process />
      </main>

      <Footer />
    </div>
  );
};

export default MainApp;