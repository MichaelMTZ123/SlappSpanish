/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { collection, query, addDoc, orderBy, onSnapshot, serverTimestamp, getDocs, writeBatch } from 'firebase/firestore';
import { db, appId } from '../lib/firebase';
import { generateContent } from '../lib/gemini';
import { useTranslation } from '../lib/i18n';
import { SlothMascot } from '../components/SlothMascot';
import { Mic, Send, Volume2, MicOff, Trash2 } from 'lucide-react';
import { Modal } from '../components/Modal';


export default function AiChatView({ userId, setNotification }) {
    const { t, language } = useTranslation();
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Start as true to wait for initial message
    const chatEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isVoiceChatMode, setIsVoiceChatMode] = useState(false);
    const lastSpokenMessageRef = useRef(null);
    const initialMessageSent = useRef(false);
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);

    const getSystemInstruction = () => {
        const langName = language === 'he' ? 'Hebrew' : 'English';
        return `You are a friendly, patient, and encouraging Spanish language tutor named Slappy. Your goal is to help the user practice their Spanish in a fun and engaging way. The user's current app language is '${langName}'.

        Here are your rules:
        1. Start the conversation: When the chat is new, you MUST introduce yourself and ask the user what they want to practice in Spanish (e.g., "greetings," "ordering food," "past tense verbs").
        2. Use the user's language for coaching: Use '${langName}' to explain concepts, give instructions, or correct mistakes.
        3. Encourage Spanish practice: Your main goal is to get the user to speak or write in Spanish. After explaining something, always prompt them with a question or task in Spanish.
        4. Gentle corrections: If the user makes a mistake in Spanish, gently correct them. For example, say "That's very close! A more natural way to say that is..." and then explain why.
        5. Keep it concise and fun: Use short, encouraging messages. You are a friendly sloth, so your personality should be relaxed and positive.`;
    }

    const initiateConversation = useCallback(async () => {
        setIsLoading(true);
        initialMessageSent.current = true;
        try {
            const response = await generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ role: 'user', parts: [{ text: "Please introduce yourself and ask me what I want to practice today." }] }],
                config: { systemInstruction: getSystemInstruction() },
            });
            const aiText = response.text || t('oopsError');
            const aiMessage = { role: 'ai', text: aiText, timestamp: serverTimestamp() };
            const chatCol = collection(db, `artifacts/${appId}/users/${userId}/chatHistory`);
            await addDoc(chatCol, aiMessage);
        } catch (error) {
            console.error("Error initiating conversation:", error);
            const errorMessage = { role: 'ai', text: t('oopsError'), timestamp: serverTimestamp() };
            const chatCol = collection(db, `artifacts/${appId}/users/${userId}/chatHistory`);
            await addDoc(chatCol, errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [userId, language, t]);
    
    // Initial fetch of chat history
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
        }, (error) => {
            console.error("Error fetching chat history:", error);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [userId, initiateConversation]);

    // Scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    const speak = useCallback((text, onEndCallback) => {
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const spanishVoice = voices.find(v => v.lang.startsWith('es'));
        const englishVoice = voices.find(v => v.lang.startsWith('en'));
        const hebrewVoice = voices.find(v => v.lang.startsWith('he'));

        // Basic language detection to select a voice
        if (/[áéíóúñ¿¡]/.test(text) && spanishVoice) {
            utterance.voice = spanishVoice;
            utterance.lang = spanishVoice.lang;
        } else if (/[א-ת]/.test(text) && hebrewVoice) {
            utterance.voice = hebrewVoice;
            utterance.lang = hebrewVoice.lang;
        } else if (englishVoice) {
            utterance.voice = englishVoice;
            utterance.lang = englishVoice.lang;
        } else {
             utterance.voice = voices.find(v => v.default);
        }
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            if (onEndCallback) onEndCallback();
        };
        utterance.onerror = () => {
            setIsSpeaking(false);
             if (onEndCallback) onEndCallback();
        };
        
        window.speechSynthesis.speak(utterance);
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
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            sendMessage(transcript);
        };
        
        recognition.start();
    }, [isListening]);
    
    // Voice chat mode logic
    useEffect(() => {
        const lastMessage = chatHistory[chatHistory.length - 1];
        if (isVoiceChatMode && !isLoading && !isSpeaking && !isListening && lastMessage?.role === 'ai' && lastMessage.id !== lastSpokenMessageRef.current) {
            lastSpokenMessageRef.current = lastMessage.id;
            speak(lastMessage.text, () => {
                if(isVoiceChatMode) startListening();
            });
        }
    }, [chatHistory, isVoiceChatMode, isLoading, isSpeaking, isListening, speak, startListening]);


    const sendMessage = async (textToSend) => {
        const currentMessage = textToSend.trim();
        if (!currentMessage || isLoading || !userId) return;

        const userMessage = { role: 'user', text: currentMessage, timestamp: serverTimestamp() };
        const chatCol = collection(db, `artifacts/${appId}/users/${userId}/chatHistory`);
        await addDoc(chatCol, userMessage);
        
        setMessage('');
        setIsLoading(true);

        const historyForContext = chatHistory
            .slice(-6) 
            .map(msg => ({
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
            console.error("Error calling Gemini API:", error);
            const errorMessage = { role: 'ai', text: t('oopsError'), timestamp: serverTimestamp() };
            await addDoc(chatCol, errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
    };
    
    const toggleVoiceChat = () => {
        const nextState = !isVoiceChatMode;
        setIsVoiceChatMode(nextState);
        if(nextState) {
             const lastMessage = chatHistory[chatHistory.length - 1];
            if (lastMessage?.role === 'user') {
                 // If user just spoke, wait for AI response
            } else if (lastMessage?.role === 'ai') {
                 speak(lastMessage.text, () => {
                    if(isVoiceChatMode) startListening();
                });
            }
        } else {
            stopListening();
            speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }

    const handleClearChat = async () => {
        setIsClearModalOpen(false);
        setIsLoading(true);
        const chatCol = collection(db, `artifacts/${appId}/users/${userId}/chatHistory`);
        try {
            const snapshot = await getDocs(chatCol);
            if (snapshot.empty) {
                setIsLoading(false);
                return;
            }
            const batch = writeBatch(db);
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            setNotification(t('chatCleared'));
            initialMessageSent.current = false; 
        } catch (error) {
            console.error("Error clearing chat history:", error);
            setNotification(t('oopsError'));
            setIsLoading(false);
        }
    };


    return (
        <div className="p-4 sm:p-8 h-full flex flex-col">
             <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">{t('aiPracticeChat')}</h1>
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsClearModalOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition" aria-label={t('clearChat')}>
                        <Trash2 className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </button>
                    <div className="flex items-center gap-2">
                        <label htmlFor="voice-chat-toggle" className="font-medium text-gray-700 dark:text-gray-300 select-none">Voice Chat</label>
                        <div className="relative inline-block w-10 align-middle select-none">
                            <input type="checkbox" id="voice-chat-toggle" checked={isVoiceChatMode} onChange={toggleVoiceChat} className="absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:right-0 checked:bg-green-400"/>
                            <label htmlFor="voice-chat-toggle" className="block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-gray-600 cursor-pointer"></label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-grow bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 flex flex-col overflow-y-auto">
                <div className="flex-grow space-y-4">
                    {chatHistory.map((chat) => (
                        <div key={chat.id || chat.timestamp.toString()} className={`flex items-end gap-2 ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {chat.role === 'ai' && <SlothMascot className="w-10 h-10 flex-shrink-0" />}
                            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl flex items-center gap-2 ${chat.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                                <p className="flex-1">{chat.text}</p>
                                {chat.role === 'ai' && <button onClick={() => speak(chat.text, null)} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"><Volume2 size={16}/></button>}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-end gap-2 justify-start">
                            <SlothMascot className="w-10 h-10 flex-shrink-0" />
                            <div className="p-3 rounded-2xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none">
                                <div className="flex items-center space-x-1">
                                    <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse"></span>
                                    <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse delay-75"></span>
                                    <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse delay-150"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <div className="mt-4 flex gap-2">
                    {isVoiceChatMode ? (
                        <div className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                           {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Voice Chat Active"}
                           {isListening && <Mic className="w-5 h-5 ms-2 text-red-500 animate-pulse" />}
                        </div>
                    ) : (
                        <input
                            type="text" value={message} onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage(message)}
                            placeholder={t('typeYourMessage')}
                            className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                            disabled={isLoading}
                        />
                    )}
                    <button onClick={() => sendMessage(message)} disabled={isLoading || isVoiceChatMode || !message.trim()} className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 disabled:bg-gray-400 transition">
                       <Send/>
                    </button>
                </div>
            </div>
            
            <Modal isOpen={isClearModalOpen} onClose={() => setIsClearModalOpen(false)} title={t('clearChat')}>
                <p className="dark:text-gray-300">{t('confirmClearChat')}</p>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={() => setIsClearModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">{t('cancel')}</button>
                    <button onClick={handleClearChat} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">{t('confirm')}</button>
                </div>
            </Modal>
        </div>
    );
}