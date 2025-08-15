/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { useTranslation } from '../lib/i18n';
import { Home, BookOpen, MessageSquare, Gamepad2, Users, Library, Trophy, User } from 'lucide-react';
import { SlothMascot } from './SlothMascot';

const tutorialSteps = [
    {
        icon: SlothMascot,
        title: 'welcomeTo',
        text: 'This is Slapp, your personal Spanish learning assistant! Let\'s take a quick tour.',
    },
    {
        icon: Home,
        title: 'home',
        text: 'This is your dashboard. Here you can see your progress, daily streak, and find your next lesson.',
    },
    {
        icon: BookOpen,
        title: 'lessons',
        text: 'Browse lessons, complete quizzes to earn points, or connect with live teachers for 1-on-1 practice!',
    },
    {
        icon: MessageSquare,
        title: 'aiPractice',
        text: 'Chat with our AI tutor, Slappy! You can practice your conversation skills with text or voice.',
    },
    {
        icon: Gamepad2,
        title: 'minigames',
        text: 'Test your skills with fun minigames! Race against the clock or unscramble sentences to earn bonus points.',
    },
    {
        icon: Users,
        title: 'friends',
        text: 'Add friends, compete with them, and practice together in private chats.',
    },
    {
        icon: Library,
        title: 'community',
        text: 'Create your own quizzes for others to play, or try quizzes made by the community!',
    },
    {
        icon: Trophy,
        title: 'leaderboard',
        text: 'See how you stack up against other learners. Climb the ranks to become a Leyenda!',
    },
    {
        icon: User,
        title: 'profile',
        text: 'Customize your profile, check your rank, and change the app language here. You\'re all set. ¡Buena suerte (Good luck)!',
    },
];

export const Tutorial = ({ onComplete }) => {
    const { t } = useTranslation();
    const [stepIndex, setStepIndex] = useState(0);
    const isLastStep = stepIndex === tutorialSteps.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            onComplete();
        } else {
            setStepIndex(stepIndex + 1);
        }
    };

    const currentStep = tutorialSteps[stepIndex];
    const Icon = currentStep.icon;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm text-center p-8 animate-fade-in-up">
                <Icon className="w-20 h-20 mx-auto text-teal-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2 dark:text-gray-100">{t(currentStep.title)}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{currentStep.text}</p>
                
                <div className="flex justify-center space-x-2 mb-6">
                    {tutorialSteps.map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${i === stepIndex ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    ))}
                </div>

                <button
                    onClick={handleNext}
                    className="w-full bg-teal-500 text-white font-bold py-3 rounded-lg hover:bg-teal-600 transition"
                >
                    {isLastStep ? t('gotIt') : 'Next'}
                </button>
            </div>
        </div>
    );
};