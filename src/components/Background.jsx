import React from 'react';

const Background = () => {
    return (
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
            {/* Gradient Mesh */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[100px] animate-float" style={{ animationDuration: '15s' }}></div>
            <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-blue-200/30 rounded-full blur-[100px] animate-float" style={{ animationDuration: '20s', animationDelay: '2s' }}></div>
            <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-indigo-100/30 rounded-full blur-[100px] animate-float" style={{ animationDuration: '25s', animationDelay: '5s' }}></div>

            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>
    );
};

export default Background;
