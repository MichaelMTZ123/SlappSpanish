/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, collection, addDoc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../../lib/firebase';
import type { Call, UserProfile } from '../../types';
import { useTranslation } from '../../lib/i18n';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

// Stun servers for WebRTC
const servers = {
    iceServers: [
        { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
    ],
    iceCandidatePoolSize: 10,
};

export default function VideoCallView({ call, currentUser, onHangup }: { call: Call, currentUser: UserProfile, onHangup: () => void }) {
    const { t } = useTranslation();
    
    // Refs for WebRTC objects
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localStream = useRef<MediaStream | null>(null);
    
    // Refs for UI elements
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    // Refs for cleanup to avoid stale closures
    const unsubCallDoc = useRef<() => void>(() => {});
    const unsubCandidates = useRef<() => void>(() => {});

    // State for UI controls and connection status
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isRemoteConnected, setIsRemoteConnected] = useState(false);
    
    // Debugging states
    const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
    const [iceConnectionState, setIceConnectionState] = useState<RTCIceConnectionState>('new');

    const isCaller = call.callerId === currentUser.uid;

    useEffect(() => {
        // Initialize PeerConnection
        const pc = new RTCPeerConnection(servers);
        peerConnection.current = pc;
        const queuedCandidates: RTCIceCandidateInit[] = [];

        // --- Setup Peer Connection Handlers ---
        pc.onconnectionstatechange = () => setConnectionState(pc.connectionState);
        pc.oniceconnectionstatechange = () => setIceConnectionState(pc.iceConnectionState);

        // Handle remote stream
        pc.ontrack = (event) => {
            console.log('Received remote track:', event.track.kind);
            // Force the video element to play the new stream
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
                setIsRemoteConnected(true);
            }
        };

        // Firestore References
        const callDocRef = doc(db, `artifacts/${appId}/users/${call.calleeId}/calls`, call.id);
        const callerCandidatesCol = collection(callDocRef, 'callerCandidates');
        const calleeCandidatesCol = collection(callDocRef, 'calleeCandidates');

        // Send Local ICE Candidates
        pc.onicecandidate = event => {
            if (event.candidate) {
                const candidatesCollection = isCaller ? callerCandidatesCol : calleeCandidatesCol;
                addDoc(candidatesCollection, event.candidate.toJSON());
            }
        };

        const startCallFlow = async () => {
             try {
                // Get Local Stream
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                localStream.current = stream;
                
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                
                stream.getTracks().forEach(track => {
                    pc.addTrack(track, stream);
                });

                // Listen for Remote ICE Candidates
                const remoteCandidatesCol = isCaller ? calleeCandidatesCol : callerCandidatesCol;
                unsubCandidates.current = onSnapshot(remoteCandidatesCol, snapshot => {
                    snapshot.docChanges().forEach(async change => {
                        if (change.type === 'added') {
                            const candidateData = change.doc.data();
                            const candidate = new RTCIceCandidate(candidateData);
                             if (pc.remoteDescription && pc.remoteDescription.type) {
                                await pc.addIceCandidate(candidate).catch(e => console.error("Error adding candidate", e));
                            } else {
                                queuedCandidates.push(candidate);
                            }
                        }
                    });
                });

                // Signaling Logic
                if (isCaller) {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    await updateDoc(callDocRef, { offer: { sdp: offer.sdp, type: offer.type } });
                }

                // Listen for Call Document Changes (Offer/Answer)
                unsubCallDoc.current = onSnapshot(callDocRef, async snapshot => {
                    const data = snapshot.data();
                    if (!data || data.status === 'ended' || data.status === 'declined') {
                        onHangup();
                        return;
                    }

                    // Callee Logic: Receive Offer, Send Answer
                    if (!isCaller && data.offer && !pc.remoteDescription) {
                        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                        
                        // Process queued candidates
                        while(queuedCandidates.length > 0) {
                            const c = queuedCandidates.shift();
                            if(c) await pc.addIceCandidate(c);
                        }

                        const answer = await pc.createAnswer();
                        await pc.setLocalDescription(answer);
                        await updateDoc(callDocRef, { answer: { type: answer.type, sdp: answer.sdp }, status: 'active' });
                    }

                    // Caller Logic: Receive Answer
                    if (isCaller && data.answer && !pc.remoteDescription) {
                        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                        
                        // Process queued candidates
                         while(queuedCandidates.length > 0) {
                            const c = queuedCandidates.shift();
                            if(c) await pc.addIceCandidate(c);
                        }
                    }
                });

            } catch (error) {
                console.error("Error starting call (media permissions?):", error);
                alert("Could not access camera or microphone. Please check permissions.");
                onHangup();
            }
        };

        startCallFlow();

        // Cleanup function
        return () => {
            console.log("Cleaning up call view...");
            unsubCallDoc.current();
            unsubCandidates.current();

            // Stop all local tracks
            if (localStream.current) {
                localStream.current.getTracks().forEach(track => track.stop());
            }
            
            // Close PeerConnection
            if (peerConnection.current) {
                peerConnection.current.ontrack = null;
                peerConnection.current.onicecandidate = null;
                peerConnection.current.onconnectionstatechange = null;
                peerConnection.current.oniceconnectionstatechange = null;
                peerConnection.current.close();
                peerConnection.current = null;
            }
        };
    }, [call.id, call.calleeId, isCaller, onHangup]);

    const handleHangupClick = async () => {
        // Mark call as ended in DB. The listener will trigger onHangup locally.
        try {
            const callDocRef = doc(db, `artifacts/${appId}/users/${call.calleeId}/calls`, call.id);
            await updateDoc(callDocRef, { status: 'ended' });
        } catch (e) {
            console.error("Error ending call:", e);
            onHangup(); // Force local hangup if DB fails
        }
    };
    
    const toggleMute = () => {
        if (localStream.current) {
            localStream.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(prev => !prev);
        }
    };

    const toggleVideo = () => {
        if (localStream.current) {
            localStream.current.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(prev => !prev);
        }
    };

    const remoteUser = isCaller ? { name: call.calleeName, pfp: call.calleePfp } : { name: call.callerName, pfp: call.callerPfp };

    return (
        <div className="w-screen h-screen bg-gray-900 flex flex-col relative text-white">
            {/* Remote Video */}
            <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover" 
            />
            
            {/* Connecting Overlay */}
            {!isRemoteConnected && (
                 <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 z-10">
                    <div className="text-center">
                        <img src={remoteUser.pfp} alt={remoteUser.name} className="w-32 h-32 rounded-full mx-auto border-4 border-teal-400 mb-4 animate-pulse" />
                        <p className="text-2xl font-bold">{isCaller ? t('waitingForTeacher') : `Connecting to ${remoteUser.name}`}</p>
                        <p className="text-lg text-gray-300 mt-2">{t('loading')}...</p>
                    </div>
                </div>
            )}
            
            {/* Local Video (Picture in Picture) */}
            <div className={`absolute top-4 right-4 w-32 sm:w-48 aspect-[3/4] sm:aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 transition-all duration-300 ${isVideoOff ? 'opacity-50' : 'opacity-100'} z-20`}>
                 <video 
                    ref={localVideoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'}`} 
                />
                {isVideoOff && (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <VideoOff size={32} className="text-gray-400" />
                    </div>
                )}
            </div>

            {/* Debug Info (Hidden on mobile usually, but helpful) */}
            {connectionState !== 'connected' && connectionState !== 'new' && (
                 <div className="absolute top-20 left-4 bg-black/50 p-2 rounded text-xs pointer-events-none">
                    Status: {connectionState} / {iceConnectionState}
                </div>
            )}
            
            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-center z-20">
                <div className="flex items-center space-x-6 sm:space-x-8">
                    <button onClick={toggleMute} className={`p-4 rounded-full transition-all ${isMuted ? 'bg-white text-gray-900' : 'bg-white/20 hover:bg-white/30 text-white'}`}>
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>
                    <button onClick={handleHangupClick} className="p-5 bg-red-500 rounded-full hover:bg-red-600 transition-transform hover:scale-110 shadow-lg">
                        <PhoneOff size={32} />
                    </button>
                    <button onClick={toggleVideo} className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-white text-gray-900' : 'bg-white/20 hover:bg-white/30 text-white'}`}>
                        {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                    </button>
                </div>
            </div>
        </div>
    );
}