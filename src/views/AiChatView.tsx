
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { collection, query, addDoc, orderBy, onSnapshot, serverTimestamp, getDocs, writeBatch } from 'firebase/firestore';
import { db, appId } from '../lib/firebase';
import { generateContent } from '../lib/gemini';
import { useTranslation } from '../lib/i18n';
import { aiRoleplayScenarios } from '../lib/data';
import { SlothMascot } from '../components/SlothMascot';
import { Mic, Send, Volume2, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { Modal } from '../components/Modal';

export default function AiChatView({ userId, setNotification, onMessageSent }) {
    const { t, language } = useTranslation();
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true); 
    const chatEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [isVoiceChatMode, setIsVoiceChatMode] = useState(false);
    const lastSpokenMessageRef = useRef(null);
    const initialMessageSent = useRef(false);
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);
    const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
    const [activeScenario, setActiveScenario] = useState(null);

    const getSystemInstruction = () => {
        const langName = language === 'he' ? 'Hebrew' : 'English';
        let baseInstruction = `You are Slothy, a friendly Spanish language tutor. The user's native language is ${langName}. 
        IMPORTANT: When explaining concepts, defining words, or giving feedback, USE ${langName}. 
        However, encourage the user to practice Spanish.
        If the user speaks in ${langName}, answer in ${langName} but suggest the Spanish translation.
        If the user speaks in Spanish, reply in simple Spanish, but provide difficult words' translations in ${langName} in parentheses.`;
        
        if (activeScenario) {
            baseInstruction += ` ROLEPLAY MODE: ${activeScenario.prompt}. Stay in character. Keep responses concise (under 2 sentences) to keep conversation flowing. Correct major mistakes gently at the end of your response (in ${langName}).`;
        } else {
            baseInstruction += ` Start by asking what they want to practice.`;
        }
        return baseInstruction;
    }

    const initiateConversation = useCallback(async (scenario = null) => {
        setIsLoading(true);
        initialMessageSent.current = true;
        try {
            let prompt = "Introduce yourself.";
            if (scenario) {
                prompt = `Start the roleplay: ${scenario.title}. Set the scene in Spanish, but explain the setting briefly in the user's language.`;
            }

            const response = await generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: { systemInstruction: getSystemInstruction() },
            });
            const aiText = response.text || t('oopsError');
            const aiMessage = { role: 'ai', text: aiText, timestamp: serverTimestamp() };
            const chatCol = collection(db, `artifacts/${appId}/users/${userId}/chatHistory`);
            await addDoc(chatCol, aiMessage);
        } catch (error) {
            console.error("Error initiating conversation:", error);
        } finally {
            setIsLoading(false);
        }
    }, [userId, language, t, activeScenario]);
    
    useEffect(() => {
        if (!userId) return;
        const chatCol = collection(db, `artifacts/${appId}/users/${userId}/chatHistory`);
        const q = query(chatCol, orderBy("timestamp", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const history = snapshot.docs.map(doc => ({id: doc.id, ...doc.data(), timestamp: doc.data().timestamp?.toDate() || new Date()}));
            setChatHistory(history);
            
            if (snapshot.empty && !initialMessageSent.current) {
                initiateConversation();
            } else {
                setIsLoading(false);
            }
        });
        return () => unsubscribe();
    }, [userId, initiateConversation]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    // Real AI TTS using Gemini
    const speak = useCallback(async (text, onEndCallback) => {
        if (!text) return;
        
        // Stop browser speech if any
        speechSynthesis.cancel();

        setIsGeneratingAudio(true);

        try {
            // Generate Speech using Gemini 2.5 Flash TTS
            const response = await generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: text }] }],
                config: {
                    responseModalities: ["AUDIO"],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
                    }
                }
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            
            if (base64Audio) {
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
                const binaryString = atob(base64Audio);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const floatArray = new Int16Array(bytes.buffer);
                
                // Simple PCM decoding
                const buffer = audioContext.createBuffer(1, floatArray.length, 24000);
                const channelData = buffer.getChannelData(0);
                for(let i=0; i<floatArray.length; i++){
                    channelData[i] = floatArray[i] / 32768.0;
                }

                const source = audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(audioContext.destination);
                
                source.onended = () => {
                    setIsSpeaking(false);
                    if (onEndCallback) onEndCallback();
                };
                
                setIsGeneratingAudio(false);
                setIsSpeaking(true);
                source.start(0);
            } else {
                throw new Error("No audio data received");
            }

        } catch (error) {
            console.error("Gemini TTS failed, falling back to browser TTS", error);
            setIsGeneratingAudio(false);
            
            // Fallback to Browser TTS
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES';
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => { setIsSpeaking(false); if(onEndCallback) onEndCallback(); };
            window.speechSynthesis.speak(utterance);
        }
    }, []);

    const startListening = useCallback(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition || isListening) return;
        if (recognitionRef.current) recognitionRef.current.stop();

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'es-ES';
        recognitionRef.current = recognition;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            sendMessage(transcript);
        };
        recognition.start();
    }, [isListening]);
    
    useEffect(() => {
        const lastMessage = chatHistory[chatHistory.length - 1];
        // Only auto-speak if we haven't spoken this exact message ID yet
        if (isVoiceChatMode && !isLoading && !isSpeaking && !isGeneratingAudio && !isListening && lastMessage?.role === 'ai' && lastMessage.id !== lastSpokenMessageRef.current) {
            lastSpokenMessageRef.current = lastMessage.id;
            speak(lastMessage.text, () => {
                if(isVoiceChatMode) startListening();
            });
        }
    }, [chatHistory, isVoiceChatMode, isLoading, isSpeaking, isGeneratingAudio, isListening, speak, startListening]);


    const sendMessage = async (textToSend) => {
        const currentMessage = textToSend.trim();
        if (!currentMessage || isLoading || !userId) return;

        const userMessage = { role: 'user', text: currentMessage, timestamp: serverTimestamp() };
        const chatCol = collection(db, `artifacts/${appId}/users/${userId}/chatHistory`);
        await addDoc(chatCol, userMessage);
        
        if(onMessageSent) onMessageSent();
        
        setMessage('');
        setIsLoading(true);

        const historyForContext = chatHistory.slice(-6).map(msg => ({
                role: msg.role === 'ai' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            }));
            
        try {
            const response = await generateContent({
                model: 'gemini-2.5-flash',
                contents: [ ...historyForContext, { role: 'user', parts: [{ text: currentMessage }] }],
                 config: { systemInstruction: getSystemInstruction() },
            });
            const aiText = response.text || t('oopsError');
            const aiMessage = { role: 'ai', text: aiText, timestamp: serverTimestamp() };
            await addDoc(chatCol, aiMessage);
        } catch (error) {
            console.error(error);
            const errorMessage = { role: 'ai', text: t('oopsError'), timestamp: serverTimestamp() };
            await addDoc(chatCol, errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearChat = async () => {
        setIsClearModalOpen(false);
        setActiveScenario(null);
        setIsLoading(true);
        const chatCol = collection(db, `artifacts/${appId}/users/${userId}/chatHistory`);
        try {
            const snapshot = await getDocs(chatCol);
            const batch = writeBatch(db);
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            setNotification(t('chatCleared'));
            initialMessageSent.current = false; 
            initiateConversation();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSelectScenario = async (scenario) => {
        await handleClearChat(); // Clear previous context
        setActiveScenario(scenario);
        setIsScenarioModalOpen(false);
        initiateConversation(scenario);
    }

    return (
        <div className="p-4 sm:p-8 h-full flex flex-col max-w-5xl mx-auto">
             <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white drop-shadow-sm flex items-center gap-2">
                     {t('aiPracticeChat')} {activeScenario && <span className="text-sm bg-teal-500 px-2 py-1 rounded-lg shadow-sm text-white">{activeScenario.title}</span>}
                </h1>
                <div className="flex items-center gap-2">
                     <button onClick={() => setIsScenarioModalOpen(true)} className="p-2 rounded-full bg-white/50 hover:bg-white/80 transition text-gray-800 dark:text-white" title={t('pickScenario')}>
                        <Sparkles className="w-6 h-6" />
                    </button>
                    <button onClick={() => setIsClearModalOpen(true)} className="p-2 rounded-full bg-white/50 hover:bg-white/80 transition text-gray-800 dark:text-white" title={t('clearChat')}>
                        <Trash2 className="w-6 h-6" />
                    </button>
                    <div className="relative inline-block w-10 align-middle select-none ml-2">
                        <input type="checkbox" id="voice-chat-toggle" checked={isVoiceChatMode} onChange={() => setIsVoiceChatMode(!isVoiceChatMode)} className="absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:right-0 checked:bg-green-400"/>
                        <label htmlFor="voice-chat-toggle" className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                    </div>
                </div>
            </div>

            <div className="flex-grow glass-panel p-4 rounded-3xl shadow-xl flex flex-col overflow-y-auto bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl">
                <div className="flex-grow space-y-4">
                    {chatHistory.map((chat) => (
                        <div key={chat.id || chat.timestamp.toString()} className={`flex items-end gap-3 ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {chat.role === 'ai' && <SlothMascot className="w-10 h-10 flex-shrink-0 drop-shadow-md" />}
                            <div className={`max-w-xs md:max-w-md p-4 rounded-2xl shadow-md ${chat.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'}`}>
                                <p className="text-sm sm:text-base">{chat.text}</p>
                                {chat.role === 'ai' && (
                                    <button onClick={() => speak(chat.text, null)} disabled={isGeneratingAudio} className="text-teal-600 dark:text-teal-400 hover:text-teal-800 mt-2 block">
                                        {isGeneratingAudio && chat.id === lastSpokenMessageRef.current ? <Loader2 className="animate-spin w-4 h-4"/> : <Volume2 size={16}/>}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-end gap-3 justify-start">
                            <SlothMascot className="w-10 h-10 flex-shrink-0" />
                            <div className="p-4 rounded-2xl bg-white dark:bg-gray-700 rounded-bl-none shadow-md">
                                <div className="flex items-center space-x-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <div id="chat-input-area" className="mt-4 flex gap-2">
                    {isVoiceChatMode ? (
                        <div className="flex-grow p-4 rounded-xl flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 border border-indigo-200">
                           {isListening ? "Listening..." : isSpeaking ? "Speaking..." : isGeneratingAudio ? "Thinking..." : "Auto-Voice Mode Active"}
                           {isListening && <Mic className="w-5 h-5 ms-2 text-red-500 animate-pulse" />}
                        </div>
                    ) : (
                        <input
                            type="text" value={message} onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage(message)}
                            placeholder={t('typeYourMessage')}
                            className="flex-grow p-4 rounded-xl focus:outline-none shadow-inner bg-white/80 dark:bg-gray-900/80 text-gray-900 dark:text-white border border-transparent focus:border-blue-400 transition"
                            disabled={isLoading}
                        />
                    )}
                    <button onClick={() => sendMessage(message)} disabled={isLoading || isVoiceChatMode || !message.trim()} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 rounded-xl shadow-lg hover:scale-105 transition disabled:opacity-50 disabled:scale-100">
                       <Send/>
                    </button>
                </div>
            </div>
            
            {/* Clear Chat Modal */}
            <Modal isOpen={isClearModalOpen} onClose={() => setIsClearModalOpen(false)} title={t('clearChat')}>
                <p className="dark:text-gray-300">{t('confirmClearChat')}</p>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={() => setIsClearModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">{t('cancel')}</button>
                    <button onClick={handleClearChat} className="px-4 py-2 bg-red-500 text-white rounded-lg">{t('confirm')}</button>
                </div>
            </Modal>
            
            {/* Scenario Modal */}
            <Modal isOpen={isScenarioModalOpen} onClose={() => setIsScenarioModalOpen(false)} title={t('pickScenario')}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {aiRoleplayScenarios.map(scenario => (
                        <button key={scenario.id} onClick={() => handleSelectScenario(scenario)} className="p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition flex flex-col items-center text-center">
                            <span className="text-4xl mb-2">{scenario.icon}</span>
                            <span className="font-bold text-gray-800 dark:text-gray-100">{scenario.title}</span>
                        </button>
                    ))}
                </div>
            </Modal>
        </div>
    );
}
