import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDJztJD3y2j9J_pYd2MW3bWH7DGpTsLCXk",
  authDomain: "blogdr.firebaseapp.com",
  projectId: "blogdr",
  storageBucket: "blogdr.firebasestorage.app",
  messagingSenderId: "813526749916",
  appId: "1:813526749916:web:82deb853adae3ebdc5da19",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
