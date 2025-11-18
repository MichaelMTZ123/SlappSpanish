
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface UserProfile {
    uid: string;
    name: string;
    pfp: string;
    points: number;
    coins: number; // New currency
    streak: number;
    completedLessons: string[];
    lastLogin: string | null;
    language?: 'en' | 'he';
    hasCompletedTutorial?: boolean;
    role?: 'learner' | 'teacher';
    isAvailableForCalls?: boolean;
    currentCourseId?: string;
    inventory?: string[]; // IDs of items owned
    equippedOutfit?: string;
    dailyQuests?: DailyQuest[];
    questDate?: string;
}

export interface DailyQuest {
    id: string;
    description: string;
    target: number;
    current: number;
    completed: boolean;
    reward: number;
    type: 'lesson' | 'chat' | 'minigame';
}

export interface Call {
    id: string;
    callerId: string;
    callerName: string;
    callerPfp: string;
    calleeId: string;
    calleeName: string;
    calleePfp: string;
    status: 'ringing' | 'active' | 'ended' | 'declined' | 'unanswered';
    offer?: any;
    answer?: any;
    createdAt?: any;
}

export interface Lesson {
    id: string;
    title: string;
    content: string;
    vocab: string[];
    quiz?: QuizQuestion[];
}

export interface QuizQuestion {
    q: string;
    q_he?: string;
    o: string[];
    a: string;
}

export interface Friend {
    uid: string;
    name: string;
    pfp: string;
    rankName: string;
}

export interface CommunityQuiz {
    id: string;
    title: string;
    questions: {
        question: string;
        options: string[];
        correctAnswer: string;
    }[];
    createdBy: string;
    creatorName: string;
    creatorPfp: string;
}

export interface ShopItem {
    id: string;
    name: string;
    price: number;
    type: 'outfit' | 'powerup';
    icon: string;
}
