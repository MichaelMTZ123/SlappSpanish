
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

export default function App() {
    const [user, setUser] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [notification, setNotification] = useState('');
    const [showTutorial, setShowTutorial] = useState(false);
    const [theme, setTheme] = useState('light'); // 'light' or 'dark'
    
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

    // Handle Theme Change
    useEffect(() => {
        const html = document.documentElement;
        if (theme === 'dark') {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
    }, [theme]);

    if (!isAuthReady) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
                <SlothMascot className="w-24 h-24 animate-pulse" />
            </div>
        );
    }

    return (
        <div className="relative h-full w-full overflow-hidden">
             {/* Lively Background */}
             <ul className="circles">
                <li></li><li></li><li></li><li></li><li></li>
                <li></li><li></li><li></li><li></li><li></li>
            </ul>

            <Notification message={notification} />
            
            {user ? (
                <AppContent 
                    user={user} 
                    setNotification={setNotification} 
                    showTutorial={showTutorial} 
                    setShowTutorial={setShowTutorial}
                    setTheme={setTheme} 
                />
            ) : (
                <LoginPage setNotification={setNotification} />
            )}

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
