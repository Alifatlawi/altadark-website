import React from 'react';
import { ArrowLeft, Star } from 'lucide-react';

const SquiggleArrow = () => (
    <svg width="100" height="60" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block mx-2 md:mx-4 text-neutral-400 transform scale-x-[-1] w-16 md:w-24 h-auto">
        <path d="M10 50 C 30 50, 30 10, 50 10 C 70 10, 70 50, 90 50 L 95 45 M 90 50 L 95 55" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const StarIcon = () => (
    <div className="inline-flex items-center justify-center w-8 h-8 md:w-12 md:h-12 bg-neutral-300 rounded-full mx-2 animate-spin-slow">
        <Star className="w-4 h-4 md:w-6 md:h-6 text-neutral-800 fill-current" />
    </div>
);

const Hero = () => {
    return (
        <section id="home" className="pt-32 pb-12 md:pb-20 px-4 md:px-12 max-w-7xl mx-auto min-h-screen flex flex-col justify-center relative overflow-hidden">
            {/* Animated Background Gradient */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-neutral-50 via-white to-neutral-100 -z-10 animate-pulse-glow opacity-50"></div>

            <div className="flex flex-col md:flex-row justify-between items-start mb-12">
                <div className="max-w-4xl">
                    <h1 className="text-4xl md:text-7xl lg:text-8xl font-bold leading-[1.1] tracking-tight mb-8 animate-fade-in-up">
                        نبتكر حلولاً <br />
                        <span className="flex items-center flex-wrap gap-2 md:gap-4">
                            <SquiggleArrow /> برمجية متكاملة <StarIcon />
                        </span>
                    </h1>
                </div>
                <div className="md:w-72 text-sm font-medium text-neutral-500 mt-8 md:mt-4 leading-relaxed animate-fade-in-up delay-100">
                    التدارك هي شركة تقنية رائدة في ليبيا. نساعد الشركات والمؤسسات على النمو من خلال تصميم وتطوير مواقع، تطبيقات، وأنظمة برمجية ذكية.
                </div>
            </div>

            {/* Marquee */}
            <div className="w-full overflow-hidden border-y border-neutral-200 py-3 mb-12 bg-white/50">
                <div className="flex whitespace-nowrap animate-marquee">
                    {[...Array(10)].map((_, i) => (
                        <span key={i} className="text-xs font-bold text-neutral-400 mx-4 uppercase tracking-widest flex items-center gap-4">
                            تطوير <ArrowLeft className="w-3 h-3" /> ابتكار <ArrowLeft className="w-3 h-3" /> جودة <ArrowLeft className="w-3 h-3" /> تقنية <ArrowLeft className="w-3 h-3" />
                        </span>
                    ))}
                </div>
            </div>

            {/* Hero Image / Dashboard Mockup */}
            <div className="w-full h-[50vh] md:h-[60vh] bg-neutral-900 rounded-3xl overflow-hidden relative group animate-fade-in-up delay-200">
                <div className="absolute inset-0 opacity-40">
                    <div className="absolute top-1/4 right-1/4 w-96 h-96 border-[40px] border-neutral-700 rounded-full"></div>
                    <div className="absolute bottom-0 left-1/4 w-64 h-full bg-neutral-800 transform -skew-x-12"></div>
                    <div className="absolute top-10 left-10 w-32 h-32 bg-neutral-600 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 w-full h-full flex items-center justify-center">
                    {/* Abstract Arabic Interface Representation */}
                    <div className="bg-neutral-800 p-4 rounded-2xl border border-neutral-700 shadow-2xl max-w-2xl w-full mx-4 transform transition-transform duration-700 group-hover:scale-[1.02] animate-float">
                        <div className="flex items-center justify-between border-b border-neutral-700 pb-4 mb-4">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <div className="text-neutral-400 text-xs font-mono">Altadark System v2.0</div>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-1 bg-neutral-900 rounded h-24 md:h-32"></div>
                            <div className="col-span-3 space-y-3">
                                <div className="h-6 md:h-8 bg-neutral-700 rounded w-1/2"></div>
                                <div className="h-3 md:h-4 bg-neutral-700 rounded w-3/4"></div>
                                <div className="h-24 md:h-32 bg-neutral-900 rounded mt-4 flex items-center justify-center overflow-hidden">
                                    <div className="text-neutral-600 font-mono animate-typewriter" dir="ltr">{'<Code status="innovating" />'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
