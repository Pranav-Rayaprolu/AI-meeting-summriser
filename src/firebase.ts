import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// TODO: Replace with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCECh38GWjfHv7I7yV8rMVj4o6F1c2xpcs",
  authDomain: "meeting-summariser-ai.firebaseapp.com",
  projectId: "meeting-summariser-ai",
  storageBucket: "meeting-summariser-ai.firebasestorage.app",
  messagingSenderId: "590532757352",
  appId: "1:590532757352:web:e30c6df1ca9b2dce7738dd",
  measurementId: "G-073YPNM9HM"
};

if (firebaseConfig.apiKey === "YOUR_API_KEY") {
  console.warn("Firebase config is not set. Please update src/firebase.ts");
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth }; 