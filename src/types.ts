/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface UserProfile {
    uid: string;
    name: string;
    pfp: string;
    points: number;
    streak: number;
    completedLessons: string[];
    lastLogin: string | null;
    language?: 'en' | 'he';
    hasCompletedTutorial?: boolean;
    role?: 'learner' | 'teacher';
    isAvailableForCalls?: boolean;
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
    quiz: QuizQuestion[];
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