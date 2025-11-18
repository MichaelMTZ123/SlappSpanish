
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, doc, setDoc, onSnapshot, addDoc, serverTimestamp, orderBy, deleteDoc, getDoc, writeBatch } from 'firebase/firestore';
import { db, appId } from '../../lib/firebase';
import { useTranslation } from '../../lib/i18n';
import type { UserProfile } from '../../types';
import { Search, Send, Mic, UserPlus, Check, X } from 'lucide-react';
import { SlothMascot } from '../../components/SlothMascot';

const ChatWindow = ({ currentUser, friend, onBack }) => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const chatEndRef = useRef(null);

    const chatId = [currentUser.uid, friend.uid].sort().join('_');

    useEffect(() => {
        const messagesCol = collection(db, `artifacts/${appId}/chats/${chatId}/messages`);
        const q = query(messagesCol, orderBy('timestamp', 'asc'));
        const unsubscribe = onSnapshot(q, snapshot => {
            setMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return unsubscribe;
    }, [chatId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (newMessage.trim() === '') return;
        const messagesCol = collection(db, `artifacts/${appId}/chats/${chatId}/messages`);
        await addDoc(messagesCol, {
            text: newMessage,
            senderId: currentUser.uid,
            timestamp: serverTimestamp(),
            type: 'text'
        });
        setNewMessage('');
    };
    
    const handleVoiceMessage = () => {
        if (isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        } else {
            navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                const audioChunks = [];
                mediaRecorder.ondataavailable = event => audioChunks.push(event.data);
                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = async () => {
                        const base64data = reader.result;
                         const messagesCol = collection(db, `artifacts/${appId}/chats/${chatId}/messages`);
                        await addDoc(messagesCol, {
                            audioURL: base64data,
                            senderId: currentUser.uid,
                            timestamp: serverTimestamp(),
                            type: 'audio'
                        });
                    };
                };
                mediaRecorder.start();
                setIsRecording(true);
            });
        }
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800">
             <div className="p-4 border-b dark:border-gray-700 flex items-center gap-4">
                <button onClick={onBack} className="md:hidden dark:text-gray-200">&larr;</button>
                <div className="w-10 h-10 rounded-full bg-blue-100 overflow-hidden relative border border-gray-200">
                     {friend.equippedOutfit ? <SlothMascot className="w-full h-full scale-125 translate-y-1" outfit={friend.equippedOutfit}/> : <img src={friend.pfp} className="w-full h-full object-cover"/>}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100">{friend.name}</h3>
            </div>
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                 {messages.map(msg => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}>
                        {msg.senderId !== currentUser.uid && (
                            <div className="w-8 h-8 rounded-full bg-blue-100 overflow-hidden flex-shrink-0">
                                {friend.equippedOutfit ? <SlothMascot className="w-full h-full scale-125 translate-y-1" outfit={friend.equippedOutfit}/> : <img src={friend.pfp} className="w-full h-full object-cover"/>}
                            </div>
                        )}
                        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.senderId === currentUser.uid ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                            {msg.type === 'audio' ? <audio src={msg.audioURL} controls /> : <p>{msg.text}</p>}
                        </div>
                    </div>
                 ))}
                 <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t dark:border-gray-700 flex items-center gap-2">
                <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} placeholder={t('typeYourMessage')} className="flex-grow p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                <button onClick={handleSendMessage} className="bg-blue-500 text-white p-2 rounded-lg"><Send/></button>
                 <button onClick={handleVoiceMessage} className={`p-2 rounded-lg ${isRecording ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-600 dark:text-gray-200'}`}><Mic/></button>
            </div>
        </div>
    )
}

export default function FriendsView({ currentUser }: { currentUser: UserProfile }) {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [friends, setFriends] = useState([]);
    const [activeChatFriend, setActiveChatFriend] = useState(null);

    // New state for quick lookups
    const [friendUids, setFriendUids] = useState(new Set());
    const [outgoingRequestUids, setOutgoingRequestUids] = useState(new Set());
    const [incomingRequestUids, setIncomingRequestUids] = useState(new Set());

    // Fetch friends and populate UIDs set
    useEffect(() => {
        if (!currentUser.uid) return;
        const friendsRef = collection(db, `artifacts/${appId}/users/${currentUser.uid}/friends`);
        const unsubscribe = onSnapshot(friendsRef, async (snapshot) => {
            const uids = new Set(snapshot.docs.map(d => d.id));
            setFriendUids(uids);

            const friendList = await Promise.all(snapshot.docs.map(async (d) => {
                // Try to get public leaderboard data first for the outfit, fallback to profile
                let friendData;
                const publicRef = doc(db, `artifacts/${appId}/public/data/leaderboard`, d.id);
                const publicSnap = await getDoc(publicRef);
                
                if (publicSnap.exists()) {
                    friendData = publicSnap.data();
                } else {
                     const userDoc = await getDoc(doc(db, `artifacts/${appId}/users/${d.id}/profile`, 'data'));
                     friendData = userDoc.data();
                }
                return { id: d.id, uid: d.id, ...friendData };
            }));
            setFriends(friendList);
        });
        return unsubscribe;
    }, [currentUser.uid]);

    // Fetch outgoing friend requests
    useEffect(() => {
        if (!currentUser.uid) return;
        const outgoingRef = collection(db, `artifacts/${appId}/users/${currentUser.uid}/outgoingFriendRequests`);
        const unsubscribe = onSnapshot(outgoingRef, (snapshot) => {
            const uids = new Set(snapshot.docs.map(d => d.id));
            setOutgoingRequestUids(uids);
        });
        return unsubscribe;
    }, [currentUser.uid]);

    // Fetch incoming friend requests
    useEffect(() => {
        if (!currentUser.uid) return;
        const requestsRef = collection(db, `artifacts/${appId}/users/${currentUser.uid}/incomingFriendRequests`);
        const unsubscribe = onSnapshot(requestsRef, async (snapshot) => {
            const uids = new Set(snapshot.docs.map(d => d.id));
            setIncomingRequestUids(uids);
            
            const reqs = await Promise.all(snapshot.docs.map(async (d) => {
                const senderProfileRef = doc(db, `artifacts/${appId}/users/${d.id}/profile`, 'data');
                const userDoc = await getDoc(senderProfileRef);
                return { id: d.id, ...userDoc.data() };
            }));
            setIncomingRequests(reqs);
        });
        return unsubscribe;
    }, [currentUser.uid]);


    const handleSearch = async () => {
        if (search.trim() === '') return;
        const q = query(collection(db, `artifacts/${appId}/public/data/leaderboard`), where('name', '>=', search), where('name', '<=', search + '\uf8ff'));
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(d => ({uid: d.id, ...d.data()})).filter(u => u.uid !== currentUser.uid);
        setSearchResults(results);
    };

    const sendRequest = async (targetUser) => {
        // Add to target user's incoming requests
        const incomingRequestRef = doc(db, `artifacts/${appId}/users/${targetUser.uid}/incomingFriendRequests`, currentUser.uid);
        await setDoc(incomingRequestRef, { timestamp: serverTimestamp() });

        // Add to my outgoing requests
        const outgoingRequestRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/outgoingFriendRequests`, targetUser.uid);
        await setDoc(outgoingRequestRef, { timestamp: serverTimestamp() });
    };
    
    const handleRequest = async (sender, accept) => {
        const senderId = sender.id;

        // Use a batch to ensure all operations succeed or fail together.
        const batch = writeBatch(db);

        // 1. Reference to my incoming request from sender
        const incomingRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/incomingFriendRequests`, senderId);
        batch.delete(incomingRef);
        
        // 2. Reference to sender's outgoing request to me
        const outgoingRef = doc(db, `artifacts/${appId}/users/${senderId}/outgoingFriendRequests`, currentUser.uid);
        batch.delete(outgoingRef);

        if (accept) {
            const timestamp = serverTimestamp();
            // 3. Add sender to my friends list
            const myFriendRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/friends`, senderId);
            batch.set(myFriendRef, { since: timestamp });
            
            // 4. Add me to sender's friends list
            const theirFriendRef = doc(db, `artifacts/${appId}/users/${senderId}/friends`, currentUser.uid);
            batch.set(theirFriendRef, { since: timestamp });
        }

        // Commit the batch
        await batch.commit();
    };
    
    const getFriendStatus = (targetUid) => {
        if (friendUids.has(targetUid)) return 'FRIENDS';
        if (outgoingRequestUids.has(targetUid)) return 'REQUEST_SENT';
        if (incomingRequestUids.has(targetUid)) return 'REQUEST_RECEIVED';
        return 'CAN_ADD';
    };
    
    if (activeChatFriend) {
        return <ChatWindow currentUser={currentUser} friend={activeChatFriend} onBack={() => setActiveChatFriend(null)} />;
    }

    return (
        <div className="p-4 sm:p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-md mb-6">{t('friends')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div>
                    {/* Search */}
                    <div className="glass-panel p-6 rounded-3xl shadow-lg mb-8">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{t('findFriends')}</h2>
                        <div className="flex gap-2">
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch()} placeholder={t('searchUsers')} className="flex-grow p-3 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                            <button onClick={handleSearch} className="bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-600 transition shadow-md"><Search/></button>
                        </div>
                        <div className="mt-4 space-y-2">
                             {searchResults.map(user => {
                                const status = getFriendStatus(user.uid);
                                let button;
                                switch(status) {
                                    case 'FRIENDS':
                                        button = <button disabled className="bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 px-3 py-1 text-sm rounded-lg">{t('alreadyFriends')}</button>;
                                        break;
                                    case 'REQUEST_SENT':
                                        button = <button disabled className="bg-blue-200 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 py-1 text-sm rounded-lg">{t('requestSent')}</button>;
                                        break;
                                    case 'REQUEST_RECEIVED':
                                        button = <button disabled className="bg-yellow-200 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 px-3 py-1 text-sm rounded-lg">{t('requestReceived')}</button>;
                                        break;
                                    default:
                                        button = <button onClick={() => sendRequest(user)} className="bg-teal-500 text-white px-3 py-1 text-sm rounded-lg flex items-center gap-1 hover:bg-teal-600"><UserPlus size={16}/> {t('addFriend')}</button>;
                                }
                                return (
                                    <div key={user.uid} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-700/50 rounded-xl border border-white/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                                {user.equippedOutfit ? <SlothMascot className="w-full h-full scale-125 translate-y-1" outfit={user.equippedOutfit}/> : <img src={user.pfp || `https://placehold.co/40x40`} className="w-full h-full object-cover"/>}
                                            </div>
                                            <span className="text-gray-900 dark:text-gray-200 font-semibold">{user.name}</span>
                                        </div>
                                        {button}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {/* Friend Requests */}
                    <div className="glass-panel p-6 rounded-3xl shadow-lg">
                         <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{t('friendRequests')}</h2>
                         {incomingRequests.length === 0 ? <p className="text-gray-500 dark:text-gray-400">{t('noPendingRequests')}</p> : (
                            <div className="space-y-2">
                                {incomingRequests.map(req => (
                                    <div key={req.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-700/50 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <img src={req.pfp || `https://placehold.co/32x32`} alt={req.name} className="w-8 h-8 rounded-full" />
                                            <span className="font-semibold text-gray-900 dark:text-gray-200">{req.name}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleRequest(req, true)} className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600"><Check size={16}/></button>
                                            <button onClick={() => handleRequest(req, false)} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"><X size={16}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         )}
                    </div>
                </div>
                {/* Right Column: Friends List */}
                <div className="glass-panel p-6 rounded-3xl shadow-lg">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{t('myFriendsList')}</h2>
                    {friends.length === 0 ? <p className="text-gray-500 dark:text-gray-400">{t('noFriendsYet')}</p> : (
                        <ul className="space-y-3">
                            {friends.map(friend => (
                                <li key={friend.id} onClick={() => setActiveChatFriend(friend)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/60 dark:hover:bg-gray-700/60 cursor-pointer transition border border-transparent hover:border-teal-200">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 overflow-hidden border border-blue-200 flex-shrink-0 relative">
                                         {friend.equippedOutfit ? (
                                             <SlothMascot className="w-full h-full transform scale-125 translate-y-1" outfit={friend.equippedOutfit} />
                                         ) : (
                                             <img src={friend.pfp || `https://placehold.co/48x48`} alt={friend.name} className="w-full h-full object-cover" />
                                         )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-gray-100">{friend.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('startTyping')}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}