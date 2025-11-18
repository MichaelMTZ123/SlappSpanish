/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/*
## FIRESTORE SECURITY RULES (UPDATED) ##
========================================
You are seeing this here because there was an error creating the 'firestore.rules' file.
Please COPY the entire ruleset below and PASTE it into your Firebase project's
Firestore Rules editor to fix the permission errors.

How to update:
1. Go to the Firebase Console.
2. Select your project: spanish-learning-app-cd965
3. Go to Build -> Firestore Database -> Rules tab.
4. Delete all existing text.
5. Paste the rules below.
6. Click "Publish".
========================================


rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // --- USER DATA ---
    match /artifacts/{appId}/users/{userId}/profile/data {
      // ANY authenticated user can READ a profile.
      allow read: if request.auth != null;
      // ONLY the owner can WRITE to their own profile.
      allow write: if request.auth.uid == userId;
    }

    // --- FRIENDSHIP RULES ---

    // Reading lists: A user can only read their OWN friends/requests lists.
    match /artifacts/{appId}/users/{userId}/friends/{docId} {
      allow read: if request.auth.uid == userId;
    }
    match /artifacts/{appId}/users/{userId}/incomingFriendRequests/{docId} {
      allow read: if request.auth.uid == userId;
    }
    match /artifacts/{appId}/users/{userId}/outgoingFriendRequests/{docId} {
      allow read: if request.auth.uid == userId;
    }

    // Sending a request from a sender to a target:
    // Sender creates a doc in their own outgoing list.
    match /artifacts/{appId}/users/{senderId}/outgoingFriendRequests/{targetId} {
      allow create: if request.auth.uid == senderId;
    }
    // Sender creates a doc in the target's incoming list.
    match /artifacts/{appId}/users/{targetId}/incomingFriendRequests/{senderId} {
      allow create: if request.auth.uid == senderId;
    }

    // Responding to a request by an accepter from a sender:
    // Accepter deletes the doc from their incoming list.
    match /artifacts/{appId}/users/{accepterId}/incomingFriendRequests/{senderId} {
        allow delete: if request.auth.uid == accepterId;
    }
    // Accepter deletes the doc from sender's outgoing list.
    match /artifacts/{appId}/users/{senderId}/outgoingFriendRequests/{accepterId} {
        allow delete: if request.auth.uid == accepterId;
    }

    // (If Accepting) Accepter creates a doc in their own friends list.
    match /artifacts/{appId}/users/{accepterId}/friends/{senderId} {
        allow create: if request.auth.uid == accepterId;
    }
    // (If Accepting) Accepter creates a doc in sender's friends list.
    match /artifacts/{appId}/users/{senderId}/friends/{accepterId} {
        // This is the critical cross-write permission.
        // It's safe because it requires an incoming request to exist from the sender.
        allow create: if request.auth.uid == accepterId &&
                       exists(/databases/$(database)/documents/artifacts/$(appId)/users/$(request.auth.uid)/incomingFriendRequests/$(senderId));
    }
    
    // Unfriending: This rule allows a user to remove a friend from their own list.
    // A full unfriend feature would require another cross-write rule to remove from both lists.
     match /artifacts/{appId}/users/{userId}/friends/{friendId} {
        allow delete: if request.auth.uid == userId;
    }
    
    // --- AI Chat History ---
    match /artifacts/{appId}/users/{userId}/chatHistory/{messageId} {
        // A user can only access their own chat history.
        allow read, write, delete: if request.auth.uid == userId;
    }

    // --- PUBLIC DATA (Leaderboard and Quizzes) ---
    match /artifacts/{appId}/public/data/{collection}/{docId} {
        // Any authenticated user can read public data.
        allow read: if request.auth != null;
        // On the leaderboard, a user can only create/update their own entry.
        allow create, update: if collection == 'leaderboard' && request.auth.uid == docId;
        // For community quizzes, any authenticated user can create one.
        allow create: if collection == 'communityQuizzes';
        // Only the creator of a quiz can update or delete it.
        allow update, delete: if collection == 'communityQuizzes' && request.auth.uid == resource.data.createdBy;
    }

    // --- CHATS (Friend to Friend) ---
    match /artifacts/{appId}/chats/{chatId}/messages/{messageId} {
        // Users can read/write messages only in chats they are a part of.
        // The chatId is constructed as 'uid1_uid2'.
        allow read, write: if request.auth.uid in chatId.split('_');
    }

    // --- VIDEO CALL SIGNALING ---
    match /artifacts/{appId}/users/{calleeId}/calls/{callId} {
        // The CALLER (authenticated user) creates the call document in the CALLEE's subcollection.
        allow create: if request.auth.uid == request.resource.data.callerId;
        // The CALLER or CALLEE must be able to read, update, or delete the call document for signaling.
        allow read, update, delete: if request.auth.uid == resource.data.callerId || request.auth.uid == calleeId;
    }

    // ICE Candidates for a call
    match /artifacts/{appId}/users/{calleeId}/calls/{callId}/{candidatesCollection=**} {
      // Helper function to check if the user is part of the call.
      function isParticipant() {
        let callDoc = get(/databases/$(database)/documents/artifacts/$(appId)/users/$(calleeId)/calls/$(callId)).data;
        return request.auth.uid == callDoc.callerId || request.auth.uid == calleeId;
      }
      // Participants MUST be able to create and read ICE candidates.
      allow create, read: if isParticipant();
    }
  }
}

*/
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { getFirestore } from 'firebase/firestore';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyATX1-emeh13ByFtUmUpQLfQldNOaVZhdE",
  authDomain: "spanish-learning-app-cd965.firebaseapp.com",
  projectId: "spanish-learning-app-cd965",
  storageBucket: "spanish-learning-app-cd965.appspot.com",
  messagingSenderId: "1058181710770",
  appId: "1:1058181710770:web:ec6ac8c34b22872dbb5aab"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig); // Initializes compat layer and returns app for modular SDKs
export const auth = firebase.auth();
export const db = getFirestore(app);
export const appId = 'slapp-v0.3';