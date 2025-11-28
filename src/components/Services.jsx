import React, { useState } from 'react';
import { Globe, Smartphone, Database, Cloud, Star, Plus, Minus } from 'lucide-react';

const servicesData = [
    { id: '٠١', title: 'تطوير المواقع الإلكترونية', desc: 'نصمم ونطور مواقع إلكترونية سريعة، متجاوبة، وتعمل بكفاءة عالية لتمثيل هويتك الرقمية بأفضل صورة.', icon: Globe },
    { id: '٠٢', title: 'تطبيقات الهاتف المحمول', desc: 'بناء تطبيقات أصلية (Native) وعبر المنصات (Cross-platform) لنظامي iOS و Android مع تجربة مستخدم سلسة.', icon: Smartphone },
    { id: '٠٣', title: 'أنظمة إدارة الشركات', desc: 'حلول ERP و CRM مخصصة لأتمتة العمليات الداخلية وربط أقسام شركتك بنظام مركزي موحد.', icon: Database },
    { id: '٠٤', title: 'الحلول السحابية والاستضافة', desc: 'خدمات سحابية آمنة لضمان استقرار أعمالك وحماية بياناتك مع دعم فني متواصل.', icon: Cloud },
    { id: '٠٥', 'title': 'استشارات التحول الرقمي', desc: 'نساعد الشركات الليبية على الانتقال للعصر الرقمي من خلال استراتيجيات مدروسة وتقنيات حديثة.', icon: Star },
];

const Services = () => {
    const [activeService, setActiveService] = useState('٠١');

    return (
        <section id="services" className="py-16 md:py-32 px-4 md:px-12 bg-white/80 backdrop-blur-sm rounded-3xl my-8 mx-4 md:mx-0">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    <div className="md:col-span-4">
                        <h2 className="text-4xl font-bold mb-6">خدماتنا</h2>
                        <p className="text-neutral-500 max-w-xs leading-relaxed">نقدم حلولاً تقنية شاملة مصممة خصيصاً لتلبية احتياجات السوق الليبي والعالمي، بدءاً من التصميم وحتى التشغيل الكامل.</p>
                    </div>

                    <div className="md:col-span-8">
                        <div className="border-t border-neutral-200">
                            {servicesData.map((service, index) => (
                                <div
                                    key={service.id}
                                    className="border-b border-neutral-200 transition-all duration-300 cursor-pointer group hover:bg-neutral-50/50 animate-fade-in-stagger"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                    onClick={() => setActiveService(activeService === service.id ? null : service.id)}
                                >
                                    <div className="flex items-center justify-between py-6 md:py-8 px-4 group-hover:px-6 transition-all duration-300">
                                        <div className="flex items-center gap-4 md:gap-8">
                                            <span className="font-mono text-neutral-400 text-sm md:text-base">/{service.id}/</span>
                                            <h3 className={`text-xl md:text-2xl font-bold transition-colors ${activeService === service.id ? 'text-black' : 'text-neutral-400 group-hover:text-black'}`}>
                                                {service.title}
                                            </h3>
                                        </div>
                                        <div className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 group-hover:border-black group-hover:text-black transition-all shrink-0">
                                            {activeService === service.id ? <Minus size={14} /> : <Plus size={14} />}
                                        </div>
                                    </div>

                                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeService === service.id ? 'max-h-80 opacity-100 pb-8' : 'max-h-0 opacity-0'}`}>
                                        <div className="pr-12 md:pr-20 pl-4 flex gap-8 items-start">
                                            <div className="hidden md:block p-4 bg-neutral-100 rounded-xl text-neutral-600 animate-pulse-glow">
                                                <service.icon size={24} />
                                            </div>
                                            <p className="text-base md:text-lg text-neutral-600 leading-relaxed max-w-xl">
                                                {service.desc}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Services;
