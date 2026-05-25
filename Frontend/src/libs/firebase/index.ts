"use client";

// Import the functions you need from the SDKs you need
import { type FirebaseOptions, initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: 'AIzaSyAvyBnOqMKu5C3gQbK82KI_f87g3ME3Tow',
  authDomain: 'taxiappz-new.firebaseapp.com',
  projectId: 'taxiappz-new',
  storageBucket: 'taxiappz-new.firebasestorage.app',
  messagingSenderId: '996273313700',
  appId: '1:996273313700:web:322c26c8fc88c092349331',
};

// Initialize Firebase
const firebaseapp = initializeApp(firebaseConfig);

export const messaging = () => getMessaging(firebaseapp);

export default firebaseapp;
