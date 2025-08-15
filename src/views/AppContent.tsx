/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useCallback } from 'react';
import { doc, setDoc, onSnapshot, writeBatch, collection, query, where, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId, auth } from '../lib/firebase';
import { useTranslation } from '../lib/i18n';
import type { UserProfile, Lesson, Call } from '../types';
import { SlothMascot } from '../components/SlothMascot';
import { Tutorial } from '../components/Tutorial';
import { IncomingCallModal } from '../components/IncomingCallModal';

import { Layout } from '../components/Layout';
import HomeView from './HomeView';
import LearnHub from '../features/learn/LearnHub';
import LessonPage from './LessonPage';
import AiChatView from './AiChatView';
import LeaderboardView from './LeaderboardView';
import ProfileView from './ProfileView';
import MinigamesView from '../features/minigames/MinigamesView';
import FriendsView from '../features/friends/FriendsView';
import CommunityView from '../features/community/CommunityView';
import VideoCallView from '../features/learn/VideoCallView';
import TeachingRequestsView from '../features/learn/TeachingRequestsView';

export default function AppContent({ user, setNotification, showTutorial, setShowTutorial }) {
    const { t, setLanguage } = useTranslation();
    const [page, setPage] = useState('home');
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [activeCall, setActiveCall] = useState<Call | null>(null);
    const [incomingCall, setIncomingCall] = useState<Call | null>(null);
    
    const fetchUserProfile = useCallback(() => {
        if (!user) return;
        const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile`, 'data');
        const unsub = onSnapshot(userDocRef, (userDoc) => {
            if (userDoc.exists()) {
                const data = userDoc.data() as Omit<UserProfile, 'uid'>;
                const today = new Date().toISOString().split('T')[0];
                const lastLogin = data.lastLogin;
                let profileToSet: UserProfile = { ...data, uid: user.uid };

                if (lastLogin !== today) {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const newStreak = lastLogin === yesterday.toISOString().split('T')[0] ? (data.streak || 0) + 1 : 1;
                    profileToSet = { ...profileToSet, lastLogin: today, streak: newStreak };
                    setDoc(userDocRef, { lastLogin: today, streak: newStreak }, { merge: true });
                }
                
                if (!data.hasCompletedTutorial) {
                    setShowTutorial(true);
                }

                setUserProfile(profileToSet);
                setLanguage(profileToSet.language || 'en');
            } else {
                const today = new Date().toISOString().split('T')[0];
                const newProfile: UserProfile = { uid: user.uid, name: user.displayName || 'New Learner', pfp: user.photoURL || '', points: 0, streak: 1, completedLessons: [], lastLogin: today, language: 'en', hasCompletedTutorial: false, role: 'learner', isAvailableForCalls: false };
                setDoc(userDocRef, newProfile);
                setUserProfile(newProfile);
                setLanguage('en');
                setShowTutorial(true); // New user gets tutorial
            }
        }, (error) => {
             console.error("Error fetching user profile:", error);
             // Handle permission errors or other issues gracefully.
        });
        return unsub;
    }, [user, setLanguage, setShowTutorial]);

    useEffect(() => {
        const unsub = fetchUserProfile();
        return () => unsub && unsub();
    }, [fetchUserProfile]);

    // Listen for incoming calls for modal
    useEffect(() => {
        if (!userProfile || userProfile.role !== 'teacher') return;
        
        const callsRef = collection(db, `artifacts/${appId}/users/${userProfile.uid}/calls`);
        const q = query(callsRef, where('status', '==', 'ringing'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const callDoc = snapshot.docs[0];
                const callData = { id: callDoc.id, ...callDoc.data() } as Call;
                // Avoid showing modal for a call we are already in, or if we are on the requests page
                if (!activeCall && !incomingCall && page !== 'teaching-requests') {
                    setIncomingCall(callData);
                }
            } else {
                setIncomingCall(null);
            }
        });
        return unsubscribe;
    }, [userProfile, activeCall, incomingCall, page]);


    const updateProfileOnDb = async (newProfileData: UserProfile) => {
        if (!user) return;
        const { uid, ...profileData } = newProfileData;
        const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile`, 'data');
        await setDoc(userDocRef, profileData, { merge: true });
        
        const leaderboardDocRef = doc(db, `artifacts/${appId}/public/data/leaderboard`, user.uid);
        await setDoc(leaderboardDocRef, { name: newProfileData.name, pfp: newProfileData.pfp, points: newProfileData.points, role: newProfileData.role, isAvailableForCalls: newProfileData.isAvailableForCalls }, { merge: true });
        
        if (newProfileData.name !== userProfile?.name || newProfileData.pfp !== userProfile?.pfp || newProfileData.language !== userProfile?.language || newProfileData.role !== userProfile?.role || newProfileData.isAvailableForCalls !== userProfile?.isAvailableForCalls) {
            setNotification(t('profileUpdated'));
        }
    };

    const handleTutorialComplete = () => {
        if (!userProfile) return;
        const updatedProfile = { ...userProfile, hasCompletedTutorial: true };
        updateProfileOnDb(updatedProfile);
        setShowTutorial(false);
    }

    const handleLessonComplete = (points: number, lessonId: string) => {
        if (!userProfile) return;
        const updatedProfile: UserProfile = {
            ...userProfile,
            points: (userProfile.points || 0) + points,
            completedLessons: [...new Set([...(userProfile.completedLessons || []), lessonId])]
        };
        updateProfileOnDb(updatedProfile);
        setNotification(`${t('youEarnedPoints')} ${points} ${t('points')}!`);
        setCurrentLesson(null);
        setPage('lessons');
    };
    
    const handlePointsUpdate = (points: number) => {
        if (!userProfile) return;
         const updatedProfile: UserProfile = {
            ...userProfile,
            points: (userProfile.points || 0) + points,
        };
        updateProfileOnDb(updatedProfile);
        setNotification(`${t('youEarnedPoints')} ${points} ${t('points')}!`);
    }

    const handleDeleteAccount = async () => {
        if (!user || !auth.currentUser) return;
        try {
            const batch = writeBatch(db);
            const profileRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile`, 'data');
            const leaderboardRef = doc(db, `artifacts/${appId}/public/data/leaderboard`, user.uid);
            
            batch.delete(profileRef);
            batch.delete(leaderboardRef);

            await batch.commit();
            await auth.currentUser.delete();
            setNotification(t('accountDeleted'));
        } catch (error) {
            console.error("Error deleting account: ", error);
            setNotification(`${t('error')}: ${error.message}`);
        }
    }

    const handleInitiateCall = async (teacher: any) => {
        if (!userProfile) return;

        try {
            const callsRef = collection(db, `artifacts/${appId}/users/${teacher.uid}/calls`);
            const newCallDoc = doc(callsRef); // Auto-generate ID

            const callData: Call = {
                id: newCallDoc.id,
                callerId: userProfile.uid,
                callerName: userProfile.name,
                callerPfp: userProfile.pfp,
                calleeId: teacher.uid,
                calleeName: teacher.name,
                calleePfp: teacher.pfp,
                status: 'ringing',
                createdAt: serverTimestamp(),
            };

            await setDoc(newCallDoc, callData);
            // Now that the doc is created, set the active call to transition UI
            setActiveCall(callData);

        } catch (error) {
            console.error("Error creating call document:", error);
            setNotification(`${t('error')}: Failed to start call.`);
        }
    };
    
    const handleAcceptCall = (call: Call) => {
        setIncomingCall(null);
        setActiveCall(call);
    }
    
    const handleDeclineCall = async (call: Call) => {
        const callRef = doc(db, `artifacts/${appId}/users/${call.calleeId}/calls`, call.id);
        await updateDoc(callRef, { status: 'declined' });
        setIncomingCall(null);
    }
    
    const handleHangup = useCallback(() => {
        setActiveCall(null);
    }, []);

    const renderPage = () => {
        if (!userProfile) {
            return <div className="flex justify-center items-center h-full"><p>{t('loading')}</p></div>;
        }
        if (currentLesson) {
            return <LessonPage lesson={currentLesson} onComplete={handleLessonComplete} onBack={() => setCurrentLesson(null)} />;
        }
        switch (page) {
            case 'home': return <HomeView userProfile={userProfile} onSelectLesson={setCurrentLesson} setPage={setPage} />;
            case 'lessons': return <LearnHub currentUser={userProfile} completedLessons={userProfile.completedLessons || []} onSelectLesson={setCurrentLesson} onInitiateCall={handleInitiateCall}/>;
            case 'chat': return <AiChatView userId={user.uid} setNotification={setNotification} />;
            case 'leaderboard': return <LeaderboardView />;
            case 'profile': return <ProfileView user={user} userProfile={userProfile} onUpdateProfile={updateProfileOnDb} onSignOut={() => auth.signOut()} onDeleteAccount={handleDeleteAccount} />;
            case 'minigames': return <MinigamesView onGameComplete={handlePointsUpdate} />;
            case 'friends': return <FriendsView currentUser={userProfile} />;
            case 'community': return <CommunityView currentUser={userProfile} onQuizComplete={handlePointsUpdate} />;
            case 'teaching-requests': return <TeachingRequestsView currentUser={userProfile} onAcceptCall={handleAcceptCall} />;
            default: return <HomeView userProfile={userProfile} onSelectLesson={setCurrentLesson} setPage={setPage} />;
        }
    };

    if (!userProfile) {
        return <div className="flex justify-center items-center h-screen bg-gray-100"><SlothMascot className="w-24 h-24 animate-pulse" /></div>
    }

    if (activeCall) {
        return <VideoCallView call={activeCall} currentUser={userProfile} onHangup={handleHangup} />;
    }

    return (
        <React.Fragment>
            <IncomingCallModal call={incomingCall} onAccept={handleAcceptCall} onDecline={handleDeclineCall} />
            {showTutorial && <Tutorial onComplete={handleTutorialComplete} />}
            <Layout page={page} setPage={setPage} setCurrentLesson={setCurrentLesson} userProfile={userProfile}>
                {renderPage()}
            </Layout>
        </React.Fragment>
    );
}