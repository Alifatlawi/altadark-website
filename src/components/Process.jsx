import React, { useState } from 'react';

const processData = [
    {
        step: '٠١',
        title: 'تحليل وتخطيط الفكرة',
        content: 'نبدأ بفهم عميق لاحتياجات عملك في السوق الليبي. نحول الفكرة المجردة إلى خطة عمل تقنية واضحة.',
        subpoints: ['دراسة الجدوى التقنية', 'تحديد المتطلبات والخصائص', 'رسم هيكلية النظام (Architecture)'],
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800'
    },
    {
        step: '٠٢',
        title: 'التصميم والتطوير',
        content: 'مرحلة التنفيذ الفعلي حيث يقوم فريقنا ببناء الواجهات وكتابة الأكواد البرمجية وفق أحدث المعايير العالمية.',
        subpoints: ['تصميم واجهة المستخدم (UI/UX)', 'تطوير البرمجيات (Coding)', 'اختبار الجودة والأداء'],
        image: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&q=80&w=800'
    },
    {
        step: '٠٣',
        title: 'الإطلاق والدعم المستمر',
        content: 'لا تنتهي علاقتنا عند التسليم. نضمن تشغيل النظام بكفاءة ونقدم الدعم الفني والتحديثات اللازمة.',
        subpoints: ['نشر التطبيق/الموقع', 'تدريب الموظفين على النظام', 'عقود صيانة ودعم فني'],
        image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80&w=800'
    }
];

const Process = () => {
    const [activeStep, setActiveStep] = useState(0);

    return (
        <section id="process" className="py-16 md:py-32 px-4 md:px-12 bg-neutral-50/80 backdrop-blur-sm min-h-screen rounded-3xl my-8 mx-4 md:mx-0">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-20">
                    <div className="max-w-2xl">
                        <div className="text-sm font-bold text-neutral-500 mb-4 tracking-wider">/ كيف نعمل /</div>
                        <h2 className="text-4xl md:text-6xl font-bold leading-tight">
                            رحلة التحول الرقمي <br /> مع التدارك
                        </h2>
                    </div>
                    <div className="mt-8 md:mt-0 max-w-xs text-neutral-500 text-sm leading-relaxed">
                        ارتقِ بأعمالك مع التدارك. نصمم، نطور، وندعم. حلول مفصلة من الفكرة إلى التنفيذ لضمان نجاح مشروعك.
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
                    <div className="space-y-8 md:space-y-12 order-2 md:order-1">
                        <h3 className="text-2xl md:text-3xl font-bold">{processData[activeStep].title}</h3>

                        <div className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm transition-all duration-300" key={activeStep}>
                            <p className="text-base md:text-lg mb-8 text-neutral-700 leading-relaxed animate-fade-in-stagger">{processData[activeStep].content}</p>
                            <div className="space-y-4">
                                <p className="font-bold text-xs uppercase text-neutral-400">ماذا تتضمن هذه المرحلة:</p>
                                {processData[activeStep].subpoints.map((point, idx) => (
                                    <div key={idx} className="flex items-center gap-3 text-neutral-600 animate-fade-in-stagger" style={{ animationDelay: `${idx * 100}ms` }}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-900"></div>
                                        {point}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Custom Range Slider Controls */}
                        <div className="flex items-center gap-4" dir="ltr">
                            <span className="font-mono text-sm mr-2">{Math.round(((activeStep + 1) / processData.length) * 100)}%</span>
                            {processData.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveStep(idx)}
                                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${activeStep >= idx ? 'bg-neutral-900' : 'bg-neutral-200'}`}
                                    aria-label={`Go to step ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="relative aspect-square md:aspect-[4/3] bg-neutral-200 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 order-1 md:order-2 animate-float">
                        <img
                            src={processData[activeStep].image}
                            alt="Process Step"
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                        <div className="absolute top-6 right-6 bg-white/90 backdrop-blur px-4 py-2 rounded-full font-bold text-sm border border-white/20">
                            مرحلة /{processData[activeStep].step}/
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Process;
