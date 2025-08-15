/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
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