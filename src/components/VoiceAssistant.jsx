import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ActivityHandling,
  GoogleGenAI,
  LiveServerMessage,
  MediaResolution,
  Modality,
  Session,
} from '@google/genai';
import { Mic, MicOff, Loader2 } from 'lucide-react';

const VoiceAssistant = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);

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

  const playAudioBuffer = useCallback(async (arrayBuffer) => {
    try {
      if (!playbackAudioContextRef.current || playbackAudioContextRef.current.state === 'closed') {
        playbackAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const audioContext = playbackAudioContextRef.current;
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));

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

      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
      };
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }, []);

  const playSingleAudioChunk = useCallback(async (base64Data, mimeType) => {
    try {
      if (!playbackAudioContextRef.current || playbackAudioContextRef.current.state === 'closed') {
        playbackAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      }
      const audioContext = playbackAudioContextRef.current;

      // Convert base64 to byte array
      const byteCharacters = atob(base64Data);
      const byteArray = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }

      // Create Int16Array from the byte array (assuming 16-bit PCM, Little Endian)
      const int16Array = new Int16Array(byteArray.buffer);

      // Create AudioBuffer
      // Gemini usually sends 24kHz.
      // We can try to parse sample rate from mimeType if available, or default to 24000
      const sampleRate = 24000;
      const audioBuffer = audioContext.createBuffer(1, int16Array.length, sampleRate);

      // Convert Int16 to Float32
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < int16Array.length; i++) {
        channelData[i] = int16Array[i] / 32768.0;
      }

      // Schedule playback
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);

      const currentTime = audioContext.currentTime;
      // Buffer a little bit if we are falling behind to ensure smoothness, 
      // but "tight" scheduling (resetting to currentTime) is better for latency.
      if (nextChunkTimeRef.current < currentTime) {
        nextChunkTimeRef.current = currentTime;
      }

      source.start(nextChunkTimeRef.current);
      nextChunkTimeRef.current += audioBuffer.duration;

      activeSourcesRef.current.push(source);
      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
      };

    } catch (error) {
      console.error('Error playing audio chunk:', error);
    }
  }, []);

  const stopPlaybackImmediately = useCallback(() => {
    try {
      processingQueueRef.current = Promise.resolve(); // Reset queue
      activeSourcesRef.current.forEach(source => {
        try {
          source.stop();
        } catch (e) {
          // Ignore errors if source already stopped
        }
      });
      activeSourcesRef.current = [];
      nextChunkTimeRef.current = 0;
    } catch (e) {
      console.error('Error stopping playback:', e);
    }
  }, []);

  const handleModelTurn = useCallback((message) => {
    if (message?.serverContent?.interrupted) {
      stopPlaybackImmediately();
    }

    if (message?.serverContent?.inputTranscription?.text) {
      setTranscript(prev => `${prev}${prev ? '\n' : ''}أنت: ${message.serverContent.inputTranscription.text}`);
    }

    if (message?.serverContent?.outputTranscription?.text) {
      setTranscript(prev => `${prev}${prev ? '\n' : ''}المساعد: ${message.serverContent.outputTranscription.text}`);
    }

    const parts = message?.serverContent?.modelTurn?.parts ?? [];
    for (const part of parts) {
      if (part?.inlineData?.data && part?.inlineData?.mimeType) {
        audioPartsRef.current.push(part.inlineData.data);
        const chunkData = part.inlineData.data;
        const chunkMime = part.inlineData.mimeType;
        processingQueueRef.current = processingQueueRef.current
          .then(() => playSingleAudioChunk(chunkData, chunkMime))
          .catch(e => console.error(e));
      }
      if (part?.text) {
        setTranscript(prev => `${prev}${prev ? '\n' : ''}${part.text}`);
      }
    }
  }, [playSingleAudioChunk, stopPlaybackImmediately]);

  const convertToWav = (rawData, mimeType) => {
    const options = parseMimeType(mimeType);
    const dataLength = rawData.reduce((a, b) => a + b.length, 0);
    const wavHeader = createWavHeader(dataLength, options);

    const audioData = new Uint8Array(
      rawData.reduce((acc, data) => {
        const decoded = Uint8Array.from(atob(data), c => c.charCodeAt(0));
        return [...acc, ...Array.from(decoded)];
      }, [])
    );

    const headerArray = new Uint8Array(wavHeader);
    const combined = new Uint8Array(headerArray.length + audioData.length);
    combined.set(headerArray, 0);
    combined.set(audioData, headerArray.length);

    return combined.buffer;
  };

  const parseMimeType = (mimeType) => {
    const [fileType, ...params] = mimeType.split(';').map(s => s.trim());
    const [_, format] = fileType.split('/');

    const options = {
      numChannels: 1,
      bitsPerSample: 16,
      sampleRate: 24000,
    };

    if (format && format.startsWith('L')) {
      const bits = parseInt(format.slice(1), 10);
      if (!isNaN(bits)) {
        options.bitsPerSample = bits;
      }
    }

    for (const param of params) {
      const [key, value] = param.split('=').map(s => s.trim());
      if (key === 'rate') {
        options.sampleRate = parseInt(value, 10);
      }
    }

    return options;
  };

  const createWavHeader = (dataLength, options) => {
    const {
      numChannels,
      sampleRate,
      bitsPerSample,
    } = options;

    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);

    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    return buffer;
  };

  const connectSession = useCallback(async () => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('VITE_GEMINI_API_KEY is not set in environment variables. Please check your .env file.');
      }

      console.log('🔑 API Key found, initializing GoogleGenAI...');
      const ai = new GoogleGenAI({
        apiKey: apiKey,
      });

      const model = 'models/gemini-2.5-flash-native-audio-preview-12-2025';
      console.log('📡 Connecting to model:', model);

      const config = {
        responseModalities: [
          Modality.AUDIO,
        ],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'Charon',
            }
          }
        },
        systemInstruction: {
          parts: [{
            text: `أنت المساعد الصوتي الذكي والمحترف لـ "مركز التدارك" (Altadark Center).

**القواعد الصارمة (System Rules):**
1. **اللغة:** يجب أن تتحدث وتجيب باللغة العربية **فقط**. مهما كانت لغة المستخدم، رد عليه بالعربية الفصحى البسيطة والمهنية.
2. **الهوية:** إذا سألك أحد "من صممك؟" أو "من قام ببرمجتك؟"، إجابتك الحصرية هي: "تم تطويري بواسطة شركة التدارك للبرمجة".

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
- نحن لسنا مجرد شركة برمجة، بل بيت خبرة للحلول الرقمية المتقدمة.
- **أنظمة SaaS:** نقوم ببناء وتطوير منصات "البرمجيات كخدمة" (SaaS) القابلة للتوسع.
- **حلول الشركات الكبرى (Enterprise Solutions):** نطور أنظمة محلية (Local Systems) وأنظمة إدارة الموارد (ERP) مخصصة للشركات الضخمة والمؤسسات الحكومية، مع ضمان أعلى معايير الأمان والكفاءة.
- **تطوير التطبيقات والمواقع:** إنشاء تطبيقات جوال (Mobile Apps) ومواقع ويب ديناميكية بأحدث التقنيات.

**4. العنوان وبيانات الاتصال:**
- **العنوان:** ليبيا، بنغازي، منطقة بلعون. أول شارع يقابل جامعة العرب الطبية، بجوار مسجد أم حبيبة.
- **رقم الهاتف:** 0946192629

**أسلوب الحديث والشخصية:**
- أنت خبير تقني وودود في آن واحد.
- عند الحديث عن البرمجة، استخدم نبرة واثقة جداً تعكس قدرتنا على استلام مشاريع ضخمة ومعقدة.
- إجاباتك موجزة ومفيدة، مناسبة للمحادثة الصوتية السريعة.`,
          }]
        },
      };

      let connectionResolve;
      let connectionReject;
      let isResolved = false;

      const connectionPromise = new Promise((resolve, reject) => {
        connectionResolve = () => {
          if (!isResolved) {
            isResolved = true;
            resolve();
          }
        };
        connectionReject = (error) => {
          if (!isResolved) {
            isResolved = true;
            reject(error);
          }
        };
      });

      const timeout = setTimeout(() => {
        connectionReject(new Error('Connection timeout - WebSocket did not open within 10 seconds. Please check your API key and internet connection.'));
      }, 10000);

      try {
        const session = await ai.live.connect({
          model,
          callbacks: {
            onopen: function () {
              console.log('✅ WebSocket connection opened');
              clearTimeout(timeout);
              setIsConnected(true);
              isConnectedRef.current = true;
              setError(null);
              connectionResolve();
            },
            onmessage: function (message) {
              console.log('📨 Message received:', message);
              handleModelTurn(message);
              if (message?.serverContent?.turnComplete) {
                setIsProcessing(false);
              }
            },
            onerror: function (e) {
              console.error('❌ WebSocket error:', e);
              clearTimeout(timeout);
              let errorMsg = e.message || 'Connection error occurred.';

              if (e.message && e.message.includes('invalid argument')) {
                errorMsg = 'Invalid request format. Please check audio configuration.';
              } else if (e.message && e.message.includes('API key')) {
                errorMsg = 'Invalid API key. Please check your VITE_GEMINI_API_KEY.';
              }

              setError(errorMsg);
              setIsConnected(false);
              isConnectedRef.current = false;
              setIsProcessing(false);
              if (!isResolved) {
                connectionReject(new Error(errorMsg));
              }
            },
            onclose: function (e) {
              console.log('🔌 WebSocket closed:', e.reason);
              clearTimeout(timeout);
              setIsConnected(false);
              isConnectedRef.current = false;
              setIsProcessing(false);
              if (e.code !== 1000 && !isResolved) {
                connectionReject(new Error(`Connection closed: ${e.reason || 'Unknown reason'}`));
              }
            },
          },
          config
        });

        sessionRef.current = session;
        console.log('Session created, waiting for WebSocket to open...');

        await connectionPromise;
        console.log('Connection established successfully!');

        return session;
      } catch (error) {
        clearTimeout(timeout);
        throw error;
      }

      sessionRef.current = session;
      return session;
    } catch (error) {
      console.error('Connection error:', error);
      setError(error.message);
      setIsConnected(false);
      isConnectedRef.current = false;
      throw error;
    }
  }, [handleModelTurn]);

  const sendMessage = useCallback(async (text) => {
    if (!sessionRef.current || !isConnected) {
      await connectSession();
    }

    if (sessionRef.current) {
      setIsProcessing(true);
      audioPartsRef.current = [];

      sessionRef.current.sendClientContent({
        turns: [text],
        turnComplete: true,
      });
    }
  }, [isConnected, connectSession]);

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
        audio: {
          channelCount: 1,
          sampleRate: 24000,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      mediaStreamRef.current = stream;

      if (!captureAudioContextRef.current || captureAudioContextRef.current.state === 'closed') {
        captureAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: 24000
        });
      }

      const audioContext = captureAudioContextRef.current;
      const actualSampleRate = audioContext.sampleRate;
      console.log(`🎤 Microphone initialized - Sample rate: ${actualSampleRate} Hz`);

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(2048, 1, 1);
      const silentGain = audioContext.createGain();
      silentGain.gain.value = 0;

      captureSourceRef.current = source;
      captureProcessorRef.current = processor;
      captureSilentGainRef.current = silentGain;

      const mimeType = `audio/pcm;rate=${actualSampleRate}`;
      console.log(`📤 Using mimeType: ${mimeType}`);

      let lastSendTime = 0;
      const sendInterval = 250;
      const audioChunks = [];
      let isFirstChunk = true;

      processor.onaudioprocess = (e) => {
        if (!isListeningRef.current || !sessionRef.current || !isConnectedRef.current) {
          return;
        }

        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inputData.length);

        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        const uint8Array = new Uint8Array(pcm16.buffer);
        audioChunks.push(uint8Array);

        const now = Date.now();
        if (now - lastSendTime >= sendInterval && audioChunks.length > 0) {
          if (isFirstChunk) {
            console.log('🎤 Sending first audio chunk...');
            isFirstChunk = false;
          }

          const chunksToSend = audioChunks.splice(0);
          lastSendTime = now;

          try {
            const combinedLength = chunksToSend.reduce((sum, chunk) => sum + chunk.length, 0);
            const combined = new Uint8Array(combinedLength);
            let offset = 0;
            for (const chunk of chunksToSend) {
              combined.set(chunk, offset);
              offset += chunk.length;
            }

            const base64 = base64FromBytes(combined);

            if (sessionRef.current && isListeningRef.current && isConnectedRef.current) {
              const actualSampleRate = captureAudioContextRef.current?.sampleRate || 24000;
              sessionRef.current.sendRealtimeInput({
                audio: {
                  mimeType: `audio/pcm;rate=${actualSampleRate}`,
                  data: base64,
                },
              });
            }
          } catch (error) {
            console.error('❌ Error sending realtime audio:', error);
            if (error.message && (error.message.includes('invalid') || error.message.includes('Invalid'))) {
              console.error('Invalid audio format detected - stopping microphone');
              setIsListening(false);
              isListeningRef.current = false;
              setError('خطأ في تنسيق الصوت. يرجى المحاولة مرة أخرى.');
              stopMicrophone();
            }
          }
        }
      };

      source.connect(processor);
      processor.connect(silentGain);
      silentGain.connect(audioContext.destination);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('لا يمكن الوصول إلى الميكروفون. يرجى التحقق من الصلاحيات.');
      throw error;
    }
  }, [base64FromBytes]);

  const stopMicrophone = useCallback(() => {
    try {
      if (sessionRef.current) {
        sessionRef.current.sendRealtimeInput({ audioStreamEnd: true });
      }
    } catch (e) {
      console.error('Error signaling audio stream end:', e);
    }

    if (captureProcessorRef.current) {
      captureProcessorRef.current.onaudioprocess = null;
      try {
        captureProcessorRef.current.disconnect();
      } catch (e) {
        console.error('Error disconnecting processor:', e);
      }
      captureProcessorRef.current = null;
    }

    if (captureSourceRef.current) {
      try {
        captureSourceRef.current.disconnect();
      } catch (e) {
        console.error('Error disconnecting source:', e);
      }
      captureSourceRef.current = null;
    }

    if (captureSilentGainRef.current) {
      try {
        captureSilentGainRef.current.disconnect();
      } catch (e) {
        console.error('Error disconnecting gain:', e);
      }
      captureSilentGainRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  const handleStart = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      if (!isConnected) {
        console.log('Connecting to session...');
        await Promise.race([
          connectSession(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Connection timeout - please check your API key and internet connection')), 10000)
          )
        ]);
      }

      if (!sessionRef.current) {
        throw new Error('Session not established');
      }

      console.log('Starting microphone...');
      setIsListening(true);
      isListeningRef.current = true;

      await Promise.race([
        startMicrophone(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Microphone access timeout - please check permissions')), 5000)
        )
      ]);

      console.log('Ready to listen!');
      setIsProcessing(false);
    } catch (error) {
      console.error('Error starting:', error);
      setError(error.message || 'حدث خطأ في بدء المحادثة');
      setIsListening(false);
      isListeningRef.current = false;
      setIsProcessing(false);

      if (sessionRef.current) {
        try {
          sessionRef.current.close();
        } catch (e) {
          console.error('Error closing session:', e);
        }
        sessionRef.current = null;
      }
      setIsConnected(false);
      isConnectedRef.current = false;
      stopMicrophone();
    }
  };

  const handleStop = () => {
    setIsListening(false);
    isListeningRef.current = false;
    stopMicrophone();
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsConnected(false);
    isConnectedRef.current = false;
  };

  useEffect(() => {
    return () => {
      stopMicrophone();
      if (sessionRef.current) {
        sessionRef.current.close();
      }
      if (captureAudioContextRef.current && captureAudioContextRef.current.state !== 'closed') {
        captureAudioContextRef.current.close();
      }
      if (playbackAudioContextRef.current && playbackAudioContextRef.current.state !== 'closed') {
        playbackAudioContextRef.current.close();
      }
    };
  }, [stopMicrophone]);

  return (
    <div className="fixed bottom-24 right-4 md:right-8 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 p-4 md:p-6 max-w-sm w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-neutral-900">المساعد الصوتي</h3>
          {isProcessing && (
            <Loader2 className="w-5 h-5 text-neutral-600 animate-spin" />
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {transcript && (
          <div className="mb-4 p-3 bg-neutral-50 rounded-lg text-sm text-neutral-700 max-h-32 overflow-y-auto">
            {transcript}
          </div>
        )}

        <div className="flex gap-3">
          {!isListening ? (
            <button
              onClick={handleStart}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 bg-neutral-900 text-white px-4 py-3 rounded-lg font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mic className="w-5 h-5" />
              ابدأ المحادثة
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              <MicOff className="w-5 h-5" />
              إيقاف
            </button>
          )}
        </div>

        <div className="mt-3 text-xs text-neutral-500 text-center">
          {isConnected ? (
            <span className="flex items-center justify-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              متصل
            </span>
          ) : (
            <span>غير متصل</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
