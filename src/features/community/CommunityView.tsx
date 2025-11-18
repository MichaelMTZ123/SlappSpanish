/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db, appId } from '../../lib/firebase';
import { generateContent } from '../../lib/gemini';
import { useTranslation } from '../../lib/i18n';
import type { UserProfile, CommunityQuiz } from '../../types';
import { Modal } from '../../components/Modal';
import { PlusCircle, Heart, XCircle, CheckCircle } from 'lucide-react';


const PlayQuizView = ({ quiz, onBack, onQuizComplete }: { quiz: CommunityQuiz, onBack: () => void, onQuizComplete: (points: number) => void }) => {
    const { t } = useTranslation();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [lives, setLives] = useState(3);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        if (isFinished && score > 0) {
            onQuizComplete(score);
        }
    }, [isFinished, score, onQuizComplete]);
    
    const handleAnswerSelect = (option) => {
        if (isAnswered) return;
        setIsAnswered(true);
        setSelectedAnswer(option);

        if (option === quiz.questions[currentQuestionIndex].correctAnswer) {
            setScore(score + 10);
        } else {
            setLives(lives - 1);
        }
    };
    
    const handleNextQuestion = () => {
        if (lives <= 0) {
            setIsFinished(true);
            return;
        };

        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setIsAnswered(false);
            setSelectedAnswer(null);
        } else {
            setIsFinished(true);
        }
    };

    if (lives <= 0 && isFinished) {
        return (
            <div className="p-4 sm:p-8 flex items-center justify-center h-full">
                <div className="text-center bg-red-50 dark:bg-red-900/20 p-8 rounded-2xl shadow-lg">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-red-700 dark:text-red-300">Out of Lives!</h2>
                    <p className="text-red-600 dark:text-red-400 mt-2 mb-6">Tough quiz! Go back to the community hub to try another.</p>
                    <button onClick={onBack} className="w-full bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition">
                        Back to Community
                    </button>
                </div>
            </div>
        );
    }

    if (isFinished) {
         return (
             <div className="p-4 sm:p-8 flex items-center justify-center h-full">
                <div className="text-center bg-green-50 dark:bg-green-900/20 p-8 rounded-2xl shadow-lg">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-green-700 dark:text-green-300">Quiz Complete!</h2>
                    <p className="text-green-600 dark:text-green-400 mt-2 mb-6">You earned {score} points!</p>
                    <button onClick={onBack} className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition">
                        Back to Community
                    </button>
                </div>
            </div>
        );
    }
    
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / quiz.questions.length) * 100;
    
    return (
        <div className="p-4 sm:p-8">
            <div className="flex justify-between items-center mb-4">
                 <button onClick={onBack} className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm">
                    &larr; Back to Community
                </button>
                <div className="flex items-center gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Heart key={i} className={`w-6 h-6 ${i < lives ? 'text-red-500 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                    ))}
                </div>
            </div>
            
            <h1 className="text-xl font-bold mb-1 dark:text-gray-100">{quiz.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">by {quiz.creatorName}</p>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-center dark:text-gray-100">{currentQuestion.question}</h2>
                <div className="flex flex-col space-y-3 mt-4">
                    {currentQuestion.options.map(option => {
                        let bgColor = 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600';
                        if (isAnswered) {
                            if (option === currentQuestion.correctAnswer) bgColor = 'bg-green-200 dark:bg-green-500/50';
                            else if (option === selectedAnswer) bgColor = 'bg-red-200 dark:bg-red-500/50';
                        }
                        return (
                            <button key={option} onClick={() => handleAnswerSelect(option)}
                                disabled={isAnswered}
                                className={`p-4 rounded-lg text-left text-lg font-semibold transition ${bgColor} dark:text-gray-100 ${!isAnswered ? 'cursor-pointer' : 'cursor-default'}`}>
                                {option}
                            </button>
                        );
                    })}
                </div>
                
                {isAnswered && (
                     <div className="mt-6 text-center">
                        <div className={`p-4 rounded-lg ${selectedAnswer === currentQuestion.correctAnswer ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                           <h3 className="text-xl font-bold">{selectedAnswer === currentQuestion.correctAnswer ? "Correct!" : "Incorrect"}</h3>
                           {selectedAnswer !== currentQuestion.correctAnswer && <p>The correct answer is: <strong>{currentQuestion.correctAnswer}</strong></p>}
                        </div>
                        <button onClick={handleNextQuestion} className="w-full mt-4 bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition">
                            Continue
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};


const CreateQuiz = ({ currentUser, onClose, setNotification }) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([{ question: '', options: [], correctAnswer: '' }]);
    const [isLoading, setIsLoading] = useState(false);

    const handleQuestionChange = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index].question = value;
        setQuestions(newQuestions);
    };

    const addQuestionField = () => {
        setQuestions([...questions, { question: '', options: [], correctAnswer: '' }]);
    };

    const generateAnswers = async (index) => {
        const questionText = questions[index].question;
        if (!questionText) return;
        setIsLoading(true);
        setNotification(t('generatingAnswers'));
        try {
            const prompt = `For the Spanish learning question "${questionText}", provide one correct answer and three incorrect but plausible distractors.`;
            const response = await generateContent({
                model: "gemini-2.5-flash",
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: 'OBJECT',
                        properties: {
                            correctAnswer: { type: 'STRING' },
                            distractors: { type: 'ARRAY', items: { type: 'STRING' } }
                        }
                    }
                }
            });

            const result = JSON.parse(response.text);
            const newQuestions = [...questions];
            newQuestions[index].correctAnswer = result.correctAnswer;
            newQuestions[index].options = [...result.distractors, result.correctAnswer].sort(() => Math.random() - 0.5);
            setQuestions(newQuestions);

        } catch (e) {
            console.error(e);
            setNotification(t('oopsError'));
        } finally {
            setIsLoading(false);
        }
    };

    const handlePublish = async () => {
        if (questions.length < 3 || !title) {
            setNotification(t('atLeast3Questions'));
            return;
        }
        setIsLoading(true);
        setNotification(t('checkingContent'));

        try {
            // AI Moderation
            const contentToCheck = `Title: ${title}. Questions: ${JSON.stringify(questions.map(q => q.question))}`;
            const moderationPrompt = `Is the following content appropriate for a language learning app (no offensive, adult, or hateful content)? Answer with only 'APPROPRIATE' or 'INAPPROPRIATE'. Content: ${contentToCheck}`;
            const moderationResponse = await generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ role: 'user', parts: [{ text: moderationPrompt }] }]
            });
            
            if (!moderationResponse.text?.includes('APPROPRIATE')) {
                setNotification(t('quizRejected'));
                setIsLoading(false);
                return;
            }

            // Publish to Firestore
            const quizData = {
                title,
                questions,
                createdBy: currentUser.uid,
                creatorName: currentUser.name,
                creatorPfp: currentUser.pfp,
                createdAt: new Date(),
            };
            await addDoc(collection(db, `artifacts/${appId}/public/data/communityQuizzes`), quizData);
            setNotification(t('quizPublished'));
            onClose();

        } catch (e) {
            console.error(e);
            setNotification(t('oopsError'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="dark:text-gray-200">
            <div className="mb-4">
                <label className="block font-bold mb-1">{t('quizTitle')}</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
            </div>
            {questions.map((q, index) => (
                <div key={index} className="mb-4 p-4 border dark:border-gray-600 rounded-lg">
                    <label className="block font-bold mb-1">{t('question')} {index + 1}</label>
                    <textarea value={q.question} onChange={(e) => handleQuestionChange(index, e.target.value)} className="w-full p-2 border rounded-lg mb-2 dark:bg-gray-700 dark:border-gray-600" rows={2}></textarea>
                    {q.options.length === 0 ? (
                        <button onClick={() => generateAnswers(index)} disabled={!q.question || isLoading} className="text-sm bg-blue-500 text-white px-3 py-1 rounded-lg disabled:bg-gray-400">
                            {isLoading ? t('loading') : "Generate Answers with AI"}
                        </button>
                    ) : (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                           {q.options.map(opt => (
                               <div key={opt} className={`p-2 rounded-lg text-sm ${opt === q.correctAnswer ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-100' : 'bg-gray-200 dark:bg-gray-600'}`}>{opt}</div>
                           ))}
                        </div>
                    )}
                </div>
            ))}
            <button onClick={addQuestionField} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold mb-4">
                <PlusCircle size={20} /> {t('addQuestion')}
            </button>
            <button onClick={handlePublish} disabled={isLoading} className="w-full bg-teal-500 text-white font-bold py-3 rounded-lg hover:bg-teal-600 transition disabled:bg-gray-400">
                {isLoading ? t('loading') : t('publishQuiz')}
            </button>
        </div>
    );
};


export default function CommunityView({ currentUser, onQuizComplete }: { currentUser: UserProfile, onQuizComplete: (points: number) => void }) {
    const { t } = useTranslation();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [quizzes, setQuizzes] = useState<CommunityQuiz[]>([]);
    const [selectedQuiz, setSelectedQuiz] = useState<CommunityQuiz | null>(null);
    const [notification, setNotification] = useState('');

     useEffect(() => {
        const q = query(collection(db, `artifacts/${appId}/public/data/communityQuizzes`), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const quizList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityQuiz));
            setQuizzes(quizList);
        });
        return unsubscribe;
    }, []);
    
     useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(''), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    if(selectedQuiz) {
        return <PlayQuizView quiz={selectedQuiz} onBack={() => setSelectedQuiz(null)} onQuizComplete={onQuizComplete} />
    }

    return (
        <div className="p-4 sm:p-8">
             {notification && <div className="mb-4 p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">{notification}</div>}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">{t('communityQuizzes')}</h1>
                <button onClick={() => setCreateModalOpen(true)} className="bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition flex items-center gap-2">
                    <PlusCircle size={20} /> {t('createQuiz')}
                </button>
            </div>

            {quizzes.length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                    <p className="text-gray-500 dark:text-gray-400">{t('noQuizzesYet')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map(quiz => (
                        <div key={quiz.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col">
                            <h3 className="text-xl font-bold dark:text-gray-100">{quiz.title}</h3>
                            <div className="flex items-center gap-2 my-2 text-sm text-gray-500 dark:text-gray-400">
                                <img src={quiz.creatorPfp || `https://placehold.co/24x24`} alt={quiz.creatorName} className="w-6 h-6 rounded-full"/>
                                <span>{t('createdBy')} {quiz.creatorName}</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 flex-grow">{quiz.questions.length} Questions</p>
                            <button onClick={() => setSelectedQuiz(quiz)} className="mt-4 w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition">{t('playQuiz')}</button>
                        </div>
                    ))}
                </div>
            )}
            
            <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title={t('createQuiz')}>
                <CreateQuiz currentUser={currentUser} onClose={() => setCreateModalOpen(false)} setNotification={setNotification} />
            </Modal>
        </div>
    );
}