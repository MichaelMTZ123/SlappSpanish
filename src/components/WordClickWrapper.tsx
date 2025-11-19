
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { generateContent } from '../lib/gemini';
import { Modal } from './Modal';
import { useTranslation } from '../lib/i18n';
import { Volume2, Bookmark } from 'lucide-react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, appId, auth } from '../lib/firebase';

interface WordClickWrapperProps {
    text: string;
    className?: string;
}

export const WordClickWrapper: React.FC<WordClickWrapperProps> = ({ text, className = '' }) => {
    const { t, language } = useTranslation();
    const [selectedWord, setSelectedWord] = useState<string | null>(null);
    const [definition, setDefinition] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleWordClick = async (word: string) => {
        // Strip punctuation
        const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
        if (!cleanWord) return;
        
        setSelectedWord(cleanWord);
        setIsModalOpen(true);
        setLoading(true);
        setDefinition(null);

        try {
            const prompt = `Define the word "${cleanWord}". 
            Target Language for definition: ${language === 'he' ? 'Hebrew' : 'English'}.
            Format: JSON with keys: translation, pronunciation (phonetic), definition, exampleSentence.`;
            
            const response = await generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: { responseMimeType: 'application/json' }
            });
            
            const data = JSON.parse(response.text);
            setDefinition(data);
        } catch (error) {
            console.error(error);
            setDefinition({ translation: 'Error', definition: 'Could not fetch definition.' });
        } finally {
            setLoading(false);
        }
    };

    const playAudio = (word: string) => {
        const u = new SpeechSynthesisUtterance(word);
        // Simple guessing of lang based on context, assuming Spanish app mostly
        // Ideally passed as prop, but defaulting to Spanish/English mix
        u.lang = 'es-ES'; 
        window.speechSynthesis.speak(u);
    };

    const saveToDictionary = async () => {
        if (!auth.currentUser || !selectedWord || !definition) return;
        const userRef = doc(db, `artifacts/${appId}/users/${auth.currentUser.uid}/profile`, 'data');
        try {
            await updateDoc(userRef, {
                savedWords: arrayUnion({
                    word: selectedWord,
                    translation: definition.translation,
                    timestamp: new Date().toISOString()
                })
            });
            // Close modal after saving
            setIsModalOpen(false); 
        } catch (e) {
            console.error(e);
        }
    };

    const words = text.split(' ');

    return (
        <>
            <span className={`${className} cursor-pointer`}>
                {words.map((word, i) => (
                    <span key={i} onClick={(e) => { e.stopPropagation(); handleWordClick(word); }} className="hover:bg-yellow-200 dark:hover:text-black rounded px-0.5 transition-colors">
                        {word}{' '}
                    </span>
                ))}
            </span>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('dictionary')}>
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-teal-600 mb-2">{selectedWord}</h2>
                    
                    {loading ? (
                        <div className="animate-pulse flex flex-col items-center gap-2">
                            <div className="h-4 w-32 bg-gray-200 rounded"></div>
                            <div className="h-4 w-48 bg-gray-200 rounded"></div>
                        </div>
                    ) : definition ? (
                        <div className="space-y-4 text-gray-800 dark:text-gray-200">
                             <div className="flex items-center justify-center gap-2">
                                <span className="text-gray-500 italic">/{definition.pronunciation}/</span>
                                <button onClick={() => playAudio(selectedWord || '')} className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200">
                                    <Volume2 size={20} />
                                </button>
                             </div>
                             
                             <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl">
                                 <p className="text-xl font-bold mb-1">{definition.translation}</p>
                                 <p className="text-sm text-gray-600 dark:text-gray-400">{definition.definition}</p>
                             </div>

                             <div className="text-left text-sm italic text-gray-500 dark:text-gray-400">
                                 "{definition.exampleSentence}"
                             </div>

                             <button onClick={saveToDictionary} className="w-full bg-teal-500 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-teal-600 transition">
                                 <Bookmark size={18} /> {t('saveWord')}
                             </button>
                        </div>
                    ) : (
                        <p>{t('error')}</p>
                    )}
                </div>
            </Modal>
        </>
    );
};
