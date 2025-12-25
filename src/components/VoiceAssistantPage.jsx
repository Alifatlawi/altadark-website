import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    ActivityHandling,
    GoogleGenAI,
    LiveServerMessage,
    MediaResolution,
    Modality,
} from '@google/genai';
import { Mic, MicOff, ChevronLeft, Volume2, Loader2, Sparkles, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VoiceAssistantPage = () => {
    const navigate = useNavigate();
    const [isConnected, setIsConnected] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    // Animation Refs
    const volumeRef = useRef(0);
    const ringRefs = useRef([]);
    const mainOrbRef = useRef(null);

    // ... (Keep existing refs) ...

    // Animation Loop
    useEffect(() => {
        let animationFrameId;

        const animate = () => {
            // Smooth decay/attack for volume
            // We can add some lerp here if we want smoother transitions
            const vol = volumeRef.current;

            // Animate Main Orb
            if (mainOrbRef.current) {
                const scale = 1 + vol * 0.2;
                mainOrbRef.current.style.transform = `scale(${scale})`;
            }

            // Animate Rings
            ringRefs.current.forEach((ring, i) => {
                if (ring) {
                    const delay = i * 0.2; // Simulating wave delay based on phase or just distinct scales
                    // A simple effect: Outer rings react slightly more or differently
                    const distinctScale = 1 + (vol * (1 + i * 0.5));
                    // Check if we should only show them when active
                    const isActive = isListeningRef.current && (activeSourcesRef.current.length > 0 || vol > 0.01);

                    ring.style.transform = `scale(${isActive ? distinctScale : 1})`;
                    ring.style.opacity = isActive ? Math.max(0, 0.5 - (i * 0.15)) : 0;
                }
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // ... (Audio Logic Updates) ...
    // Update playSingleAudioChunk to set volumeRef.current
    // Update onaudioprocess to set volumeRef.current

    // We need to do a broader replacement because the logic is scattered. 
    // I will replace the component body to stitch this together safely.    


    // Refs
    const sessionRef = useRef(null);
    const audioPartsRef = useRef([]);
    const playbackAudioContextRef = useRef(null);
    const captureAudioContextRef = useRef(null);
    const currentPlaybackSourceRef = useRef(null);
    const nextChunkTimeRef = useRef(0);
    const activeSourcesRef = useRef([]);
    const processingQueueRef = useRef(Promise.resolve());
    const isPlayingRef = useRef(false);
    const mediaStreamRef = useRef(null);
    const captureProcessorRef = useRef(null);
    const captureSourceRef = useRef(null);
    const captureSilentGainRef = useRef(null);
    const isListeningRef = useRef(false);
    const isConnectedRef = useRef(false);

    // Animation loop
    const animationFrameRef = useRef(null);

    // --- Audio Logic (Copied and Adapted) ---

    const playSingleAudioChunk = useCallback(async (base64Data, mimeType) => {
        try {
            if (!playbackAudioContextRef.current || playbackAudioContextRef.current.state === 'closed') {
                playbackAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            }
            const audioContext = playbackAudioContextRef.current;

            const byteCharacters = atob(base64Data);
            const byteArray = new Uint8Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteArray[i] = byteCharacters.charCodeAt(i);
            }
            const int16Array = new Int16Array(byteArray.buffer);
            const sampleRate = 24000;
            const audioBuffer = audioContext.createBuffer(1, int16Array.length, sampleRate);

            const channelData = audioBuffer.getChannelData(0);
            for (let i = 0; i < int16Array.length; i++) {
                channelData[i] = int16Array[i] / 32768.0;
            }

            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);

            const currentTime = audioContext.currentTime;
            if (nextChunkTimeRef.current < currentTime) {
                nextChunkTimeRef.current = currentTime;
            }

            source.start(nextChunkTimeRef.current);
            nextChunkTimeRef.current += audioBuffer.duration;

            activeSourcesRef.current.push(source);

            // Visualization hook (optimized with ref)
            const rms = Math.sqrt(channelData.reduce((s, v) => s + v * v, 0) / channelData.length);
            volumeRef.current = rms * 10;

            source.onended = () => {
                activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
                if (activeSourcesRef.current.length === 0) volumeRef.current = 0;
            };

        } catch (error) {
            console.error('Error playing audio chunk:', error);
        }
    }, []);

    const stopPlaybackImmediately = useCallback(() => {
        try {
            processingQueueRef.current = Promise.resolve();
            activeSourcesRef.current.forEach(source => {
                try { source.stop(); } catch (e) { }
            });
            activeSourcesRef.current = [];
            nextChunkTimeRef.current = 0;
            volumeRef.current = 0;
        } catch (e) {
            console.error('Error stopping playback:', e);
        }
    }, []);

    const handleModelTurn = useCallback((message) => {
        if (message?.serverContent?.interrupted) {
            stopPlaybackImmediately();
        }
        const parts = message?.serverContent?.modelTurn?.parts ?? [];
        for (const part of parts) {
            if (part?.inlineData?.data && part?.inlineData?.mimeType) {
                const chunkData = part.inlineData.data;
                const chunkMime = part.inlineData.mimeType;
                processingQueueRef.current = processingQueueRef.current
                    .then(() => playSingleAudioChunk(chunkData, chunkMime))
                    .catch(e => console.error(e));
            }
        }
    }, [playSingleAudioChunk, stopPlaybackImmediately]);

    const connectSession = useCallback(async () => {
        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) throw new Error('VITE_GEMINI_API_KEY is not set');

            const ai = new GoogleGenAI({ apiKey: apiKey });
            const model = 'models/gemini-2.5-flash-native-audio-preview-12-2025';

            const config = {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } }
                },
                systemInstruction: {
                    parts: [{
                        text: `أنت المساعد الصوتي الذكي والمحترف لـ "مركز التدارك" (Altadark Center).

**القواعد الصارمة (System Rules):**
1. **اللغة واللهجة:** يجب أن تتحدث **باللهجة الليبية (Libyan Dialect)** الودودة والواضحة. استخدم عبارات ليبية شائعة (مثل: "يا مرحبتين"، "شن جوك"، "باهي"، "تفضل يا غالي") لتعطي طابعاً محلياً قريباً من القلب.
2. **الهوية:** إذا سألك أحد "من صممك؟"، إجابتك هي: "طورتني شركة التدارك للبرمجة".

**معلوماتك وقاعدة المعرفة:**

**1. نبذة عن المركز:**
- مركز التدارك هو مؤسسة عريقة لها تاريخ يمتد لـ **26 عاماً** في مجال التعليم والاستشارات.
- نغطي المراحل التعليمية (المتوسط والثانوي) ونقدم دعماً تخصصياً للمجال الطبي (الهندسة الطبية والطب البشري).

**2. الكلية الخاصة:**
- يتبع للمركز كلية تقنية متخصصة تضم:
  - قسم الذكاء الاصطناعي (AI).
  - قسم التخدير.
  - قسم الصيدلة.

**3. الخدمات البرمجية وحلول الأعمال (محور تركيزك الأساسي):**
- نحنا مش مجرد شركة برمجة، نحنا بيت خبرة للحلول الرقمية.
- **أنظمة SaaS:** نبنوا ونطوروا منصات "البرمجيات كخدمة" القابلة للتوسع.
- **حلول الشركات الكبرى:** نطوروا أنظمة محلية (Local Systems) وأنظمة إدارة الموارد (ERP) للشركات الكبيرة والدولة، ونضمنوا أعلى أمان وكفاءة.
- **تطبيقات ومواقع:** نصمموا تطبيقات جوال ومواقع ويب بأحدث التقنيات.

**4. العنوان:**
- ليبيا، بنغازي، منطقة بلعون. أول شارع يقابل جامعة العرب الطبية، بجوار مسجد أم حبيبة.
- رقم الهاتف: 0946192629

**أسلوب الحديث والشخصية:**
- خليك خبير تقني بس "ابن بلد" وودود.
- لما تدوي على البرمجة، خلي نبرتك واثقة تبين إننا قدها ونستلموا في مشاريع كبيرة.
- إجاباتك مختصرة ومفيدة، زي ما يبي الليبي "من الأخير".`,
                    }]
                },
            };

            let connectionResolve, connectionReject;
            let isResolved = false;
            const connectionPromise = new Promise((resolve, reject) => {
                connectionResolve = () => { if (!isResolved) { isResolved = true; resolve(); } };
                connectionReject = (error) => { if (!isResolved) { isResolved = true; reject(error); } };
            });

            const timeout = setTimeout(() => {
                connectionReject(new Error('Connection timeout. Check connection.'));
            }, 10000);

            const session = await ai.live.connect({
                model,
                callbacks: {
                    onopen: () => {
                        clearTimeout(timeout);
                        setIsConnected(true);
                        isConnectedRef.current = true;
                        setError(null);
                        connectionResolve();
                    },
                    onmessage: (message) => {
                        handleModelTurn(message);
                        if (message?.serverContent?.turnComplete) setIsProcessing(false);
                    },
                    onerror: (e) => {
                        clearTimeout(timeout);
                        setError(e.message || 'Connection Error');
                        setIsConnected(false);
                        isConnectedRef.current = false;
                        setIsProcessing(false);
                        if (!isResolved) connectionReject(new Error(e.message));
                    },
                    onclose: (e) => {
                        clearTimeout(timeout);
                        setIsConnected(false);
                        isConnectedRef.current = false;
                        setIsProcessing(false);
                        if (e.code !== 1000 && !isResolved) connectionReject(new Error('Connection closed'));
                    },
                },
                config
            });

            sessionRef.current = session;
            await connectionPromise;
            return session;
        } catch (error) {
            console.error(error);
            setIsConnected(false);
            isConnectedRef.current = false;
            throw error;
        }
    }, [handleModelTurn]);

    const base64FromBytes = useCallback((bytes) => {
        let binary = '';
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, i + chunkSize);
            binary += String.fromCharCode(...chunk);
        }
        return btoa(binary);
    }, []);

    const startMicrophone = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { channelCount: 1, sampleRate: 24000, echoCancellation: true, noiseSuppression: true }
            });
            mediaStreamRef.current = stream;

            if (!captureAudioContextRef.current || captureAudioContextRef.current.state === 'closed') {
                captureAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            }

            const audioContext = captureAudioContextRef.current;
            const actualSampleRate = audioContext.sampleRate;

            const source = audioContext.createMediaStreamSource(stream);
            // Reduced buffer size from 2048 to 512 for ~21ms latency at 24kHz
            const processor = audioContext.createScriptProcessor(512, 1, 1);
            const silentGain = audioContext.createGain();
            silentGain.gain.value = 0;

            captureSourceRef.current = source;
            captureProcessorRef.current = processor;
            captureSilentGainRef.current = silentGain;

            processor.onaudioprocess = (e) => {
                if (!isListeningRef.current || !sessionRef.current || !isConnectedRef.current) return;

                const inputData = e.inputBuffer.getChannelData(0);

                // Simple visualizer for mic input
                const rms = Math.sqrt(inputData.reduce((s, v) => s + v * v, 0) / inputData.length);
                if (activeSourcesRef.current.length === 0) {
                    volumeRef.current = rms * 5;
                }

                const pcm16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                // Send IMMEDIATELY - no buffering
                try {
                    const chunk = new Uint8Array(pcm16.buffer);
                    if (sessionRef.current && isListeningRef.current && isConnectedRef.current) {
                        const rate = captureAudioContextRef.current?.sampleRate || 24000;
                        sessionRef.current.sendRealtimeInput({
                            audio: { mimeType: `audio/pcm;rate=${rate}`, data: base64FromBytes(chunk) },
                        });
                    }
                } catch (e) { console.error(e); }
            };

            source.connect(processor);
            processor.connect(silentGain);
            silentGain.connect(audioContext.destination);
        } catch (e) {
            setError('لا يمكن الوصول إلى الميكروفون');
            throw e;
        }
    }, [base64FromBytes]);

    const stopMicrophone = useCallback(() => {
        try {
            if (sessionRef.current) sessionRef.current.sendRealtimeInput({ audioStreamEnd: true });
        } catch (e) { }

        if (captureProcessorRef.current) {
            captureProcessorRef.current.disconnect();
            captureProcessorRef.current.onaudioprocess = null;
            captureProcessorRef.current = null;
        }
        if (captureSourceRef.current) { captureSourceRef.current.disconnect(); captureSourceRef.current = null; }
        if (captureSilentGainRef.current) { captureSilentGainRef.current.disconnect(); captureSilentGainRef.current = null; }
        if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach(t => t.stop()); mediaStreamRef.current = null; }
    }, []);


    const toggleListening = async () => {
        if (isListening) {
            // STOP
            setIsListening(false);
            isListeningRef.current = false;
            stopMicrophone();
            volumeRef.current = 0;
        } else {
            // START
            try {
                setError(null);
                setIsProcessing(true);

                // Warmup Audio Context
                if (!playbackAudioContextRef.current) {
                    playbackAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
                }
                if (playbackAudioContextRef.current.state === 'suspended') {
                    await playbackAudioContextRef.current.resume();
                }

                if (!isConnected) await connectSession();

                setIsListening(true);
                isListeningRef.current = true;
                await startMicrophone();
                setIsProcessing(false);
            } catch (e) {
                setError(e.message);
                setIsListening(false);
                isListeningRef.current = false;
                setIsProcessing(false);
            }
        }
    };

    // Cleanup
    useEffect(() => {
        return () => {
            stopMicrophone();
            stopPlaybackImmediately();
            if (sessionRef.current) sessionRef.current.close();
            if (playbackAudioContextRef.current) playbackAudioContextRef.current.close();
            if (captureAudioContextRef.current) captureAudioContextRef.current.close();
        };
    }, []);

    // --- UI RENDER ---

    const isSpeaking = activeSourcesRef.current.length > 0;

    // Animation Loop
    useEffect(() => {
        let animationFrameId;
        const animate = () => {
            const vol = volumeRef.current;
            if (mainOrbRef.current) {
                const scale = 1 + vol * 0.2;
                mainOrbRef.current.style.transform = `scale(${scale})`;
            }
            ringRefs.current.forEach((ring, i) => {
                if (ring) {
                    const distinctScale = 1 + (vol * (1 + i * 0.5));
                    const isActive = isListeningRef.current && (activeSourcesRef.current.length > 0 || vol > 0.01);
                    ring.style.transform = `scale(${isActive ? distinctScale : 1})`;
                    ring.style.opacity = isActive ? Math.max(0, 0.5 - (i * 0.15)) : 0;
                }
            });
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();
        return () => { if (animationFrameId) cancelAnimationFrame(animationFrameId); };
    }, []);

    const rings = Array.from({ length: 3 });

    return (
        <div className="fixed inset-0 z-50 flex flex-col font-sans overflow-hidden bg-black" dir="rtl">

            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black opacity-80" />
            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150 mix-blend-overlay" />

            {/* Animated Glow Spots */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen transition-all duration-1000 ${isListening ? 'opacity-100 scale-100' : 'opacity-20 scale-50'}`} />
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] mix-blend-screen transition-all duration-1000 delay-150 ${isSpeaking ? 'opacity-100 scale-125' : 'opacity-20 scale-50'}`} />

            {/* Header */}
            <div className="relative z-50 flex items-center justify-between p-6 md:p-10">
                <button
                    onClick={() => navigate('/')}
                    className="p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md transition-all group"
                >
                    <ChevronLeft className="w-6 h-6 text-neutral-400 group-hover:text-white transition-colors" />
                </button>
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                    <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${isConnected ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-neutral-600'}`} />
                    <span className="text-xs font-medium tracking-widest text-neutral-400 uppercase">
                        Altadark AI Live
                    </span>
                </div>
            </div>

            {/* Main Visualizer Area */}
            <div className="flex-1 relative flex flex-col items-center justify-center p-6">

                {/* The ORB Structure */}
                <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">

                    {/* Reactive Rings */}
                    {isListening && !error && rings.map((_, i) => (
                        <div
                            key={i}
                            ref={el => ringRefs.current[i] = el}
                            className="absolute inset-0 rounded-full border border-white/10"
                            style={{
                                transition: 'transform 0.1s ease-out',
                            }}
                        />
                    ))}

                    {/* Core Glow */}
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 blur-3xl transition-all duration-500 ${isListening ? 'opacity-100' : 'opacity-0'}`} />

                    {/* Main Circle */}
                    <div
                        ref={mainOrbRef}
                        className={`
                    relative z-10 w-32 h-32 md:w-40 md:h-40 rounded-full
                    bg-gradient-to-b from-neutral-800 to-black border border-white/10
                    shadow-[0_0_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]
                    flex items-center justify-center
                    transition-all duration-300
                `}
                    >
                        {/* Inner Icon Container */}
                        <div className="relative z-20">
                            {isProcessing ? (
                                <div className="relative">
                                    <Loader2 className="w-12 h-12 text-white/80 animate-spin" />
                                    <div className="absolute inset-0 blur-md bg-white/20 animate-pulse" />
                                </div>
                            ) : error ? (
                                <Terminal className="w-12 h-12 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                            ) : isSpeaking ? (
                                <div className="flex gap-1.5 items-end justify-center h-10 w-12">
                                    {[0, 1, 2, 3].map(i => (
                                        <div
                                            key={i}
                                            className="w-1.5 bg-white rounded-full animate-[music-bar_0.5s_ease-in-out_infinite]"
                                            style={{ animationDelay: `${i * 0.1}s`, height: '40%' }}
                                        />
                                    ))}
                                    <style>{`
                                @keyframes music-bar {
                                    0%, 100% { height: 30%; opacity: 0.5; }
                                    50% { height: 100%; opacity: 1; box-shadow: 0 0 10px white; }
                                }
                            `}</style>
                                </div>
                            ) : (
                                <div className={`transition-all duration-700 ${isListening ? 'scale-110' : 'scale-100 opacity-50'}`}>
                                    <Sparkles className="w-12 h-12 text-white" fill={isListening ? "white" : "none"} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status Text with blur reveal */}
                <div className="mt-12 text-center space-y-3 h-20">
                    {error ? (
                        <p className="text-red-400 font-medium bg-red-950/30 px-6 py-2 rounded-full border border-red-500/20 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2">
                            {error}
                        </p>
                    ) : (
                        <div className="flex flex-col items-center">
                            <h2 className={`text-3xl md:text-4xl font-light tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400 transition-all duration-500 ${isListening ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-1'}`}>
                                {isListening ? (isSpeaking ? "استمع إليك..." : "تحدث الآن") : "مساعد التدارك"}
                            </h2>
                            <p className="text-neutral-500 text-sm mt-2 font-medium tracking-wide">
                                {isListening ? (isSpeaking ? "جاري المعالجة..." : "أنا جاهز للمساعدة") : "اضغط على الزر أدناه للبدء"}
                            </p>
                        </div>
                    )}
                </div>

            </div>

            {/* Bottom Controls */}
            <div className="p-10 pb-20 flex justify-center">
                <button
                    onClick={toggleListening}
                    className={`
               group relative flex items-center justify-center
               w-20 h-20 md:w-24 md:h-24 rounded-full
               transition-all duration-500 ease-out
               border border-white/10 backdrop-blur-sm
               ${isListening
                            ? 'bg-red-500/10 hover:bg-red-500/20 border-red-500/50'
                            : 'bg-white/5 hover:bg-white/10 hover:scale-105'}
            `}
                >
                    {/* Button Inner Glow */}
                    <div className={`absolute inset-0 rounded-full transition-opacity duration-500 ${isListening ? 'bg-red-500 blur-[40px] opacity-20' : 'bg-white blur-[40px] opacity-0 group-hover:opacity-10'}`} />

                    {isListening ? (
                        <div className="relative z-10 flex flex-col items-center gap-1">
                            <MicOff className="w-8 h-8 text-red-100 fill-current" />
                        </div>
                    ) : (
                        <Mic className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                    )}

                    {/* Ring ripple effect when NOT listening to invite click */}
                    {!isListening && (
                        <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-20" style={{ animationDuration: '3s' }} />
                    )}
                </button>
            </div>

        </div>
    );
};

export default VoiceAssistantPage;
