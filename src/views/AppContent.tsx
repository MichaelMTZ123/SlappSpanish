
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useCallback } from 'react';
import { doc, setDoc, onSnapshot, writeBatch, collection, query, where, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId, auth } from '../lib/firebase';
import { useTranslation } from '../lib/i18n';
import type { UserProfile, Lesson, Call, DailyQuest } from '../types';
import { generateDailyQuests } from '../lib/data';
import { SlothMascot } from '../components/SlothMascot';
import { Onboarding } from '../components/Onboarding';
import { IncomingCallModal } from '../components/IncomingCallModal';
import { AppPresentation } from '../components/AppPresentation';

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
import ShopView from './ShopView';

export default function AppContent({ user, setNotification, showTutorial, setShowTutorial, setTheme }) {
    const { t, setLanguage } = useTranslation();
    const [page, setPage] = useState('home');
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [activeCall, setActiveCall] = useState<Call | null>(null);
    const [incomingCall, setIncomingCall] = useState<Call | null>(null);
    const [currentCourseId, setCurrentCourseId] = useState('spanish');
    const [showPresentation, setShowPresentation] = useState(false); // Tour state lifted up
    
    const fetchUserProfile = useCallback(() => {
        if (!user) return;
        const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile`, 'data');
        const unsub = onSnapshot(userDocRef, (userDoc) => {
            if (userDoc.exists()) {
                const data = userDoc.data() as Omit<UserProfile, 'uid'>;
                const today = new Date().toISOString().split('T')[0];
                const lastLogin = data.lastLogin;
                let profileToSet: UserProfile = { ...data, uid: user.uid };
                let updates: any = {};

                // Streak Logic
                if (lastLogin !== today) {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().split('T')[0];
                    const newStreak = lastLogin === yesterdayStr ? (data.streak || 0) + 1 : 1;
                    updates.lastLogin = today;
                    updates.streak = newStreak;
                    profileToSet.streak = newStreak;
                    profileToSet.lastLogin = today;
                }
                
                // Quest Refresh Logic
                if (data.questDate !== today) {
                    const newQuests = generateDailyQuests();
                    updates.questDate = today;
                    updates.dailyQuests = newQuests;
                    profileToSet.dailyQuests = newQuests;
                }

                if (Object.keys(updates).length > 0) {
                    setDoc(userDocRef, updates, { merge: true });
                }
                
                if (data.currentCourseId) {
                    setCurrentCourseId(data.currentCourseId);
                }

                if (data.hasCompletedTutorial === false || data.hasCompletedTutorial === undefined) {
                    setShowTutorial(true);
                } else {
                    setShowTutorial(false);
                }

                setUserProfile(profileToSet);
                setLanguage(profileToSet.language || 'he'); // Default to stored language or Hebrew
            } else {
                const today = new Date().toISOString().split('T')[0];
                const newProfile: UserProfile = { 
                    uid: user.uid, 
                    name: user.displayName || 'New Learner', 
                    pfp: user.photoURL || '', 
                    points: 0, 
                    coins: 50,
                    streak: 1, 
                    completedLessons: [], 
                    lastLogin: today, 
                    language: 'he', // Default new users to Hebrew
                    hasCompletedTutorial: false, 
                    role: 'learner', 
                    isAvailableForCalls: false,
                    currentCourseId: 'spanish',
                    inventory: [],
                    dailyQuests: generateDailyQuests(),
                    questDate: today
                };
                setDoc(userDocRef, newProfile);
                setUserProfile(newProfile);
                setLanguage('he');
                setShowTutorial(true); 
            }
        }, (error) => {
             console.error("Error fetching user profile:", error);
        });
        return unsub;
    }, [user, setLanguage, setShowTutorial]);

    useEffect(() => {
        const unsub = fetchUserProfile();
        return () => unsub && unsub();
    }, [fetchUserProfile]);

    useEffect(() => {
        if (!userProfile || userProfile.role !== 'teacher') return;
        const callsRef = collection(db, `artifacts/${appId}/users/${userProfile.uid}/calls`);
        const q = query(callsRef, where('status', '==', 'ringing'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const callDoc = snapshot.docs[0];
                const callData = { id: callDoc.id, ...callDoc.data() } as Call;
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
        
        // Sync vital public info to leaderboard doc for easier access by other users
        const leaderboardDocRef = doc(db, `artifacts/${appId}/public/data/leaderboard`, user.uid);
        await setDoc(leaderboardDocRef, { 
            name: newProfileData.name, 
            pfp: newProfileData.pfp, 
            points: newProfileData.points, 
            role: newProfileData.role, 
            isAvailableForCalls: newProfileData.isAvailableForCalls,
            equippedOutfit: newProfileData.equippedOutfit || null
        }, { merge: true });
        
        if (newProfileData.name !== userProfile?.name) {
            setNotification(t('profileUpdated'));
        }
    };

    const handleOnboardingComplete = () => {
        if (!userProfile) return;
        const updatedProfile = { ...userProfile, hasCompletedTutorial: true, currentCourseId: currentCourseId };
        updateProfileOnDb(updatedProfile);
        setShowTutorial(false);
    }
    
    const handleCourseSelection = (courseId: string) => {
        setCurrentCourseId(courseId);
        if(userProfile) {
            updateProfileOnDb({ ...userProfile, currentCourseId: courseId });
        }
    }

    const updateQuests = (type: 'lesson' | 'chat' | 'minigame', amount: number = 1) => {
        if (!userProfile || !userProfile.dailyQuests) return { updatedQuests: [] as DailyQuest[], coinsEarned: 0 };
        
        let coinsEarned = 0;
        const updatedQuests = userProfile.dailyQuests.map(q => {
            if (q.type === type && !q.completed) {
                const newCurrent = Math.min(q.current + amount, q.target);
                if (newCurrent >= q.target) {
                    coinsEarned += q.reward;
                    setNotification(`${t('questCompleted')}: ${q.description} (+${q.reward} Coins)`);
                    return { ...q, current: newCurrent, completed: true };
                }
                return { ...q, current: newCurrent };
            }
            return q;
        });
        
        return { updatedQuests, coinsEarned };
    }

    const handleLessonComplete = (points: number, lessonId: string) => {
        if (!userProfile) return;
        
        const { updatedQuests, coinsEarned } = updateQuests('lesson');
        
        const updatedProfile: UserProfile = {
            ...userProfile,
            points: (userProfile.points || 0) + points,
            coins: (userProfile.coins || 0) + 10 + coinsEarned, // 10 coins per lesson + quest reward
            completedLessons: [...new Set([...(userProfile.completedLessons || []), lessonId])],
            dailyQuests: updatedQuests
        };
        updateProfileOnDb(updatedProfile);
        setNotification(`${t('youEarnedPoints')} ${points} ${t('points')} & 10 Coins!`);
        setCurrentLesson(null);
        setPage('lessons');
    };
    
    const handlePointsUpdate = (points: number, source: 'minigame' | 'chat' = 'minigame') => {
        if (!userProfile) return;
        const { updatedQuests, coinsEarned } = updateQuests(source);
        
        const coinReward = Math.floor(points / 5); // 1 coin per 5 points
        
         const updatedProfile: UserProfile = {
            ...userProfile,
            points: (userProfile.points || 0) + points,
            coins: (userProfile.coins || 0) + coinReward + coinsEarned,
            dailyQuests: updatedQuests
        };
        updateProfileOnDb(updatedProfile);
        setNotification(`${t('youEarnedPoints')} ${points} ${t('points')} & ${coinReward} Coins!`);
    }

    const handleBuyItem = (cost: number, itemId: string) => {
        if (!userProfile) return;
        if (userProfile.coins < cost) {
            setNotification("Not enough coins!");
            return;
        }
        const updatedProfile = {
            ...userProfile,
            coins: userProfile.coins - cost,
            inventory: [...(userProfile.inventory || []), itemId]
        };
        updateProfileOnDb(updatedProfile);
        setNotification("Item purchased!");
    }
    
    const handleEquipItem = (itemId: string) => {
         if (!userProfile) return;
         const newOutfit = userProfile.equippedOutfit === itemId ? undefined : itemId;
         updateProfileOnDb({ ...userProfile, equippedOutfit: newOutfit });
         setNotification(newOutfit ? "Item equipped!" : "Item unequipped!");
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
            const newCallDoc = doc(callsRef);
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
        if (!userProfile) return <div className="flex justify-center items-center h-full"><SlothMascot className="w-24 h-24 animate-pulse"/></div>;
        
        if (currentLesson) {
            return <LessonPage lesson={currentLesson} onComplete={handleLessonComplete} onBack={() => setCurrentLesson(null)} targetLanguage={currentCourseId === 'english' ? 'English' : currentCourseId === 'arabic' ? 'Arabic' : 'Spanish'} />;
        }
        
        switch (page) {
            case 'home': return <HomeView userProfile={userProfile} onSelectLesson={setCurrentLesson} setPage={setPage} onStartTour={() => setShowPresentation(true)} />;
            case 'lessons': return <LearnHub currentUser={userProfile} completedLessons={userProfile.completedLessons || []} onSelectLesson={setCurrentLesson} onInitiateCall={handleInitiateCall} currentCourseId={currentCourseId} onCourseChange={handleCourseSelection} />;
            case 'chat': return <AiChatView userId={user.uid} setNotification={setNotification} onMessageSent={() => handlePointsUpdate(10, 'chat')} />;
            case 'leaderboard': return <LeaderboardView />;
            case 'profile': return <ProfileView user={user} userProfile={userProfile} onUpdateProfile={updateProfileOnDb} onSignOut={() => auth.signOut()} onDeleteAccount={handleDeleteAccount} />;
            case 'minigames': return <MinigamesView onGameComplete={(score) => handlePointsUpdate(score, 'minigame')} />;
            case 'friends': return <FriendsView currentUser={userProfile} />;
            case 'community': return <CommunityView currentUser={userProfile} onQuizComplete={(score) => handlePointsUpdate(score, 'minigame')} />;
            case 'shop': return <ShopView userProfile={userProfile} onBuy={handleBuyItem} onEquip={handleEquipItem} />;
            case 'teaching-requests': return <TeachingRequestsView currentUser={userProfile} onAcceptCall={handleAcceptCall} />;
            default: return <HomeView userProfile={userProfile} onSelectLesson={setCurrentLesson} setPage={setPage} onStartTour={() => setShowPresentation(true)} />;
        }
    };

    if (!userProfile) {
        return <div className="flex justify-center items-center h-screen"><SlothMascot className="w-24 h-24 animate-pulse" /></div>
    }

    if (activeCall) {
        return <VideoCallView call={activeCall} currentUser={userProfile} onHangup={handleHangup} />;
    }

    return (
        <React.Fragment>
            {/* Global Overlay Components */}
            <IncomingCallModal call={incomingCall} onAccept={handleAcceptCall} onDecline={handleDeclineCall} />
            {showTutorial && <Onboarding onComplete={handleOnboardingComplete} setTargetCourse={setCurrentCourseId} setTheme={setTheme} />}
            {showPresentation && <AppPresentation onClose={() => setShowPresentation(false)} setPage={setPage} />}
            
            {/* Main Layout */}
            <Layout page={page} setPage={setPage} setCurrentLesson={setCurrentLesson} userProfile={userProfile}>
                {renderPage()}
            </Layout>
        </React.Fragment>
    );
}
