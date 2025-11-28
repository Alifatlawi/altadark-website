import React from 'react';
import { ArrowLeft, Star } from 'lucide-react';

const StarIcon = () => (
    <div className="inline-flex items-center justify-center w-12 h-12 bg-neutral-300 rounded-full mx-2 animate-spin-slow">
        <Star className="w-6 h-6 text-neutral-800 fill-current" />
    </div>
);

const Footer = () => {
    return (
        <footer className="bg-neutral-900 text-white pt-16 md:pt-32 pb-12 px-4 md:px-12 rounded-t-[2rem] md:rounded-t-[3rem] mt-12 relative overflow-hidden mx-2 md:mx-0">
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 mb-16 md:mb-24">
                    <div>
                        <h2 className="text-5xl md:text-7xl font-bold leading-none mb-8">
                            دعنا نبدأ <br /> مشروعك القادم
                        </h2>
                        <div className="flex items-center gap-4 mb-8 md:mb-12">
                            <div className="w-16 md:w-24 h-12 border-t-2 border-white/30 rounded-full mt-8"></div>
                            <StarIcon />
                        </div>

                        <div className="space-y-2 text-neutral-400 max-w-sm mb-8 md:mb-12 text-base md:text-lg">
                            <p>نقدم استشارات تقنية مجانية. تواصل معنا لمناقشة فكرتك وتحويلها إلى واقع ملموس بأفضل التقنيات.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="text-xs font-bold text-neutral-500 uppercase">معلومات التواصل</div>
                            <div className="text-lg md:text-xl font-mono" dir="ltr">+218 94-4193734</div>
                            <div className="text-base md:text-lg text-neutral-300">ليبيا، طرابلس</div>
                        </div>
                    </div>

                    <div className="bg-neutral-800/50 p-6 md:p-8 rounded-3xl border border-white/10 relative">
                        <div className="absolute top-6 right-6 md:top-10 md:left-10 md:right-auto text-neutral-500 -rotate-90 md:rotate-0 hidden md:block">
                            <ArrowLeft size={48} className="animate-bounce" />
                        </div>

                        <form className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">الاسم الثلاثي</label>
                                <input type="text" className="w-full bg-transparent border-b border-white/20 py-2 focus:outline-none focus:border-white transition-colors text-right" placeholder="محمد علي..." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">البريد الإلكتروني</label>
                                <input type="email" className="w-full bg-transparent border-b border-white/20 py-2 focus:outline-none focus:border-white transition-colors text-right" placeholder="name@example.com" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">تفاصيل المشروع</label>
                                <textarea rows="4" className="w-full bg-transparent border-b border-white/20 py-2 focus:outline-none focus:border-white transition-colors text-right" placeholder="أريد بناء نظام لـ..."></textarea>
                            </div>
                            <button className="w-full bg-white text-black py-4 rounded-full font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 shine-effect">
                                إرسال الرسالة <ArrowLeft size={18} />
                            </button>
                        </form>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center border-t border-white/10 pt-8 text-sm text-neutral-500 gap-4 md:gap-0">
                    <div className="text-center md:text-right">© 2024 التدارك للحلول التقنية. جميع الحقوق محفوظة.</div>
                    <div className="flex gap-6 flex-wrap justify-center">
                        <a href="#" className="hover:text-white transition-colors">الرئيسية</a>
                        <a href="#" className="hover:text-white transition-colors">انستقرام</a>
                        <a href="#" className="hover:text-white transition-colors">لينكد إن</a>
                        <a href="#" className="hover:text-white transition-colors">فيسبوك</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
