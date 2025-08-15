/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { auth } from './lib/firebase';
import AppContent from './views/AppContent';
import LoginPage from './views/LoginPage';
import { SlothMascot } from './components/SlothMascot';
import { Notification } from './components/Notification';
import { Tutorial } from './components/Tutorial';

export default function App() {
    const [user, setUser] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [notification, setNotification] = useState('');
    const [showTutorial, setShowTutorial] = useState(false);
    
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            setIsAuthReady(true);
        });
        return () => unsubscribe();
    }, []);
    
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(''), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    if (!isAuthReady) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
                <SlothMascot className="w-24 h-24 animate-pulse" />
            </div>
        );
    }

    const handleTutorialComplete = () => {
      // This will be passed down and called from AppContent to update the profile
      setShowTutorial(false);
    }

    return (
        <div className="relative h-full">
            <Notification message={notification} />
            
            {user ? <AppContent user={user} setNotification={setNotification} showTutorial={showTutorial} setShowTutorial={setShowTutorial} /> : <LoginPage setNotification={setNotification} />}

             <style>{`
              @keyframes fade-in-down {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .animate-fade-in-down {
                animation: fade-in-down 0.4s ease-out forwards;
              }
              @keyframes fade-in-up {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .animate-fade-in-up {
                animation: fade-in-up 0.4s ease-out forwards;
              }
            `}</style>
        </div>
    );
}