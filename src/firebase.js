// src/firebase.js
import { initializeApp }   from "firebase/app";
import { getAuth }         from "firebase/auth";
import { getFirestore }    from "firebase/firestore";
import { getFunctions }    from "firebase/functions";

// —————————————————————————————————————————————  
// 1) Your Firebase project credentials, hard-coded  
// —————————————————————————————————————————————  
const firebaseConfig = {
  apiKey: "AIzaSyAlXvKit1sAAf7guM5fL9iX1qrmbDPbjNQ",
  authDomain: "saunastay-3f68a.firebaseapp.com",
  projectId: "saunastay-3f68a",
  storageBucket: "saunastay-3f68a.firebasestorage.app",
  messagingSenderId: "618245601504",
  appId: "1:618245601504:web:3ce0005c9e5cca60987885"
};

const app = initializeApp(firebaseConfig);

// —————————————————————————————————————————————  
// 2) Firestore & Auth  
// —————————————————————————————————————————————  
export const auth = getAuth(app);
export const db   = getFirestore(app);

// —————————————————————————————————————————————  
// 3) Functions client in europe-west1  
// —————————————————————————————————————————————  
export const functions = getFunctions(app, "europe-west1");
