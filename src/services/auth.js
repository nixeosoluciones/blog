import { auth, db } from './firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

let currentUser = null;
let currentUserIsAdmin = false;
let authListeners = [];

export function initAuth() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      currentUser = user;
      currentUserIsAdmin = false;

      if (user) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          currentUserIsAdmin = adminDoc.exists() && adminDoc.data().role === 'admin';
        } catch (e) {
          currentUserIsAdmin = false;
        }
      }

      authListeners.forEach(cb => cb(user, currentUserIsAdmin));
      resolve(user);
    });
  });
}

export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}

export function getUser() {
  return currentUser;
}

export function isAdmin() {
  return currentUser !== null && currentUserIsAdmin;
}

export async function refreshAdminStatus() {
  if (!currentUser) {
    currentUserIsAdmin = false;
    return false;
  }
  try {
    const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
    currentUserIsAdmin = adminDoc.exists() && adminDoc.data().role === 'admin';
  } catch (e) {
    currentUserIsAdmin = false;
  }
  return currentUserIsAdmin;
}

export async function setupAdmin(uid) {
  await setDoc(doc(db, 'admins', uid), {
    role: 'admin',
    createdAt: serverTimestamp(),
  });
  currentUserIsAdmin = true;
}

export function onAuthChange(callback) {
  authListeners.push(callback);
  return () => {
    authListeners = authListeners.filter(cb => cb !== callback);
  };
}
