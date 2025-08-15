/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    const remoteStream = useRef<MediaStream>(new MediaStream()); // Use a stable MediaStream object
    
    // Refs for UI elements
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    // Refs for cleanup
    const unsubCallDoc = useRef<() => void>(() => {});
    const unsubCandidates = useRef<() => void>(() => {});

    // State for UI controls and connection status
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isRemoteConnected, setIsRemoteConnected] = useState(false);
    
    // Debugging states
    const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
    const [iceConnectionState, setIceConnectionState] = useState<RTCIceConnectionState>('new');
    const [signalingState, setSignalingState] = useState<RTCSignalingState>('stable');

    const isCaller = call.callerId === currentUser.uid;

    useEffect(() => {
        // Assign streams to video elements on mount
        if (localVideoRef.current) localVideoRef.current.srcObject = localStream.current;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream.current;
        
        const pc = new RTCPeerConnection(servers);
        peerConnection.current = pc;
        const queuedCandidates: RTCIceCandidateInit[] = [];

        // --- Setup Peer Connection Handlers ---
        pc.onconnectionstatechange = () => setConnectionState(pc.connectionState);
        pc.oniceconnectionstatechange = () => setIceConnectionState(pc.iceConnectionState);
        pc.onsignalingstatechange = () => setSignalingState(pc.signalingState);

        pc.ontrack = (event) => {
            console.log('Received remote track:', event.track.kind);
            setIsRemoteConnected(true);
            event.streams[0].getTracks().forEach(track => {
                remoteStream.current.addTrack(track);
            });
        };

        const callDocRef = doc(db, `artifacts/${appId}/users/${call.calleeId}/calls`, call.id);
        const callerCandidatesCol = collection(callDocRef, 'callerCandidates');
        const calleeCandidatesCol = collection(callDocRef, 'calleeCandidates');

        pc.onicecandidate = event => {
            if (event.candidate) {
                const candidatesCollection = isCaller ? callerCandidatesCol : calleeCandidatesCol;
                addDoc(candidatesCollection, event.candidate.toJSON());
            }
        };

        const startCallFlow = async () => {
             try {
                localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (localVideoRef.current) localVideoRef.current.srcObject = localStream.current;
                
                localStream.current.getTracks().forEach(track => {
                    pc.addTrack(track, localStream.current!);
                });

                const remoteCandidatesCol = isCaller ? calleeCandidatesCol : callerCandidatesCol;
                unsubCandidates.current = onSnapshot(remoteCandidatesCol, snapshot => {
                    snapshot.docChanges().forEach(async change => {
                        if (change.type === 'added') {
                            const candidate = new RTCIceCandidate(change.doc.data());
                             if (pc.remoteDescription) {
                                await pc.addIceCandidate(candidate);
                            } else {
                                queuedCandidates.push(candidate);
                            }
                        }
                    });
                });

                if (isCaller) {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    await updateDoc(callDocRef, { offer: { sdp: offer.sdp, type: offer.type } });
                }

                unsubCallDoc.current = onSnapshot(callDocRef, async snapshot => {
                    const data = snapshot.data();
                    if (!data || data.status === 'ended' || data.status === 'declined') {
                        onHangup();
                        return;
                    }

                    if (!isCaller && data.offer && !pc.remoteDescription) {
                        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                        for(const candidate of queuedCandidates) await pc.addIceCandidate(candidate);
                        queuedCandidates.length = 0;

                        const answer = await pc.createAnswer();
                        await pc.setLocalDescription(answer);
                        await updateDoc(callDocRef, { answer: { type: answer.type, sdp: answer.sdp }, status: 'active' });
                    }

                    if (isCaller && data.answer && !pc.remoteDescription) {
                        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                         for(const candidate of queuedCandidates) await pc.addIceCandidate(candidate);
                         queuedCandidates.length = 0;
                    }
                });

            } catch (error) {
                console.error("Error starting call (media permissions?):", error);
                onHangup(); // Abort on error
            }
        };

        startCallFlow();

        return () => {
            console.log("Cleaning up call view...");
            unsubCallDoc.current();
            unsubCandidates.current();

            localStream.current?.getTracks().forEach(track => track.stop());
            remoteStream.current?.getTracks().forEach(track => track.stop());
            
            if (pc) {
                pc.ontrack = null;
                pc.onicecandidate = null;
                pc.onconnectionstatechange = null;
                pc.oniceconnectionstatechange = null;
                pc.onsignalingstatechange = null;
                pc.getTransceivers().forEach(transceiver => transceiver.stop());
                pc.close();
            }
            peerConnection.current = null;
        };
    }, [call.id, call.calleeId, isCaller, onHangup]);

    const handleHangupClick = async () => {
        const callDocRef = doc(db, `artifacts/${appId}/users/${call.calleeId}/calls`, call.id);
        await updateDoc(callDocRef, { status: 'ended' });
        // The onSnapshot listener will trigger the onHangup callback
    };
    
    const toggleMute = () => {
        localStream.current?.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled;
        });
        setIsMuted(prev => !prev);
    };

    const toggleVideo = () => {
        localStream.current?.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled;
        });
        setIsVideoOff(prev => !prev);
    };

    const remoteUser = isCaller ? { name: call.calleeName, pfp: call.calleePfp } : { name: call.callerName, pfp: call.callerPfp };

    return (
        <div className="w-screen h-screen bg-gray-900 flex flex-col relative text-white">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
                {!isRemoteConnected && (
                    <div className="text-center">
                        <img src={remoteUser.pfp} alt={remoteUser.name} className="w-32 h-32 rounded-full mx-auto border-4 border-teal-400 mb-4 animate-pulse" />
                        <p className="text-2xl font-bold">{isCaller ? t('waitingForTeacher') : `Connecting to ${remoteUser.name}`}</p>
                        <p className="text-lg text-gray-200">{remoteUser.name}</p>
                    </div>
                )}
            </div>
            
            <video ref={localVideoRef} autoPlay playsInline muted className={`absolute top-4 right-4 w-40 h-auto rounded-lg shadow-2xl border-2 border-white transition-opacity ${isVideoOff ? 'opacity-0' : 'opacity-100'}`} />
            
            {/* Debug Info */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black bg-opacity-60 p-2 rounded-lg text-xs flex gap-4 pointer-events-none">
                <p>Connection: <span className="font-bold uppercase">{connectionState}</span></p>
                <p>ICE: <span className="font-bold uppercase">{iceConnectionState}</span></p>
                <p>Signaling: <span className="font-bold uppercase">{signalingState}</span></p>
            </div>
            
            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent flex justify-center items-center">
                <div className="flex items-center space-x-6">
                    <button onClick={toggleMute} className="p-3 bg-white bg-opacity-20 rounded-full hover:bg-opacity-40 transition">
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>
                    <button onClick={handleHangupClick} className="p-4 bg-red-500 rounded-full hover:bg-red-600 transition-transform hover:scale-110">
                        <PhoneOff size={28} />
                    </button>
                    <button onClick={toggleVideo} className="p-3 bg-white bg-opacity-20 rounded-full hover:bg-opacity-40 transition">
                        {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
