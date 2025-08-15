/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef } from 'react';
import firebase from 'firebase/compat/app';
import { auth, db, appId } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useTranslation } from '../lib/i18n';
import { SlothMascot } from '../components/SlothMascot';
import { Camera } from 'lucide-react';

export default function LoginPage({ setNotification }) {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [pfp, setPfp] = useState(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPfp(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setError('');
        if (isSignUp && !displayName) {
            setError('Please enter a display name.');
            return;
        }
        try {
            if (isSignUp) {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;

                await user.updateProfile({
                    displayName: displayName,
                    photoURL: pfp
                });
                
                const today = new Date().toISOString().split('T')[0];
                const newProfile = {
                    uid: user.uid, name: displayName, pfp: pfp || '', points: 0, streak: 1, completedLessons: [], lastLogin: today, language: 'en', hasCompletedTutorial: false, role: 'learner', isAvailableForCalls: false
                };

                const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile`, 'data');
                await setDoc(userDocRef, newProfile);
                
                const leaderboardDocRef = doc(db, `artifacts/${appId}/public/data/leaderboard`, user.uid);
                await setDoc(leaderboardDocRef, { name: newProfile.name, pfp: newProfile.pfp, points: newProfile.points, role: newProfile.role, isAvailableForCalls: newProfile.isAvailableForCalls });

                setNotification(t('accountCreated'));
            } else {
                await auth.signInWithEmailAndPassword(email, password);
                setNotification(t('welcomeBack'));
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            await auth.signInWithPopup(provider);
            setNotification(t('googleSignInSuccess'));
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
            <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <SlothMascot className="w-24 h-24" />
                </div>
                <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">{t('welcomeTo')} {t('appName')}</h2>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-8">{t('tagline')}</p>
                
                {error && <p className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 p-3 rounded-lg mb-4">{error}</p>}

                <form onSubmit={handleAuthAction} className="space-y-4">
                    {isSignUp && (
                        <>
                            <div className="flex flex-col items-center">
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden"/>
                                <div className="relative cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                    <img src={pfp || `https://placehold.co/96x96/F5DEB3/4A2E2C?text=${displayName?.[0] || '?'}`} alt="Profile Preview" className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600" />
                                     <div className="absolute bottom-0 right-0 bg-teal-500 p-2 rounded-full text-white">
                                        <Camera size={16} />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 mb-1">{t('displayName')}</label>
                                <input 
                                    type="text" 
                                    value={displayName} 
                                    onChange={(e) => setDisplayName(e.target.value)} 
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                    required={isSignUp}
                                />
                            </div>
                        </>
                    )}
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-1">{t('email')}</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-1">{t('password')}</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                            required
                            minLength={6}
                        />
                    </div>
                    <button type="submit" className="w-full bg-teal-500 text-white py-3 rounded-lg font-bold hover:bg-teal-600 transition">
                        {isSignUp ? t('signUp') : t('signIn')}
                    </button>
                </form>

                <div className="my-6 flex items-center">
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                    <span className="flex-shrink mx-4 text-gray-400 dark:text-gray-500">{t('or')}</span>
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                </div>

                <button onClick={handleGoogleSignIn} className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 transition flex items-center justify-center dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                    <svg className="w-6 h-6 me-2" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v8.51h13.04c-.57 3.03-2.26 5.63-4.84 7.39l7.42 5.72C44.97 38.91 46.98 32.27 46.98 24.55z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.42-5.72c-2.15 1.45-4.92 2.3-8.47 2.3-6.28 0-11.59-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
                    {t('signInWithGoogle')}
                </button>

                <p className="text-center mt-6">
                    {isSignUp ? t('alreadyHaveAccount') : t('dontHaveAccount')}
                    <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="text-teal-500 dark:text-teal-400 font-bold ms-1 hover:underline">
                        {isSignUp ? t('signIn') : t('signUp')}
                    </button>
                </p>
            </div>
        </div>
    );
}