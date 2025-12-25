import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Process from './components/Process';
import Footer from './components/Footer';
import Background from './components/Background';
import VoiceAssistantPage from './components/VoiceAssistantPage';
import { Mic } from 'lucide-react';

/* ARABIC FONT & STYLE CONFIGURATION */
const LandingPage = () => {
  const [activeNav, setActiveNav] = useState('الرئيسية');
  const navigate = useNavigate();

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setActiveNav(id === 'home' ? 'الرئيسية' : id === 'services' ? 'خدماتنا' : 'آلية العمل');
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'services', 'process'];
      const scrollPosition = window.scrollY + 300;

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

      {/* Floating Bottom Nav */}
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

      {/* Voice Assistant Entry Button */}
      <div className="fixed bottom-8 right-6 md:right-10 z-50">
        <button
          onClick={() => navigate('/voice')}
          className="w-14 h-14 md:w-16 md:h-16 bg-neutral-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-neutral-800 transition-all hover:scale-110 active:scale-95 group relative"
        >
          <div className="absolute inset-0 rounded-full bg-white/10 animate-ping opacity-0 group-hover:opacity-100" />
          <Mic className="w-6 h-6 md:w-8 md:h-8" />
        </button>
      </div>
    </div>
  );
};

const MainApp = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/voice" element={<VoiceAssistantPage />} />
      </Routes>
    </Router>
  );
};

export default MainApp;