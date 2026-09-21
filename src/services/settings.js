import {
  doc, getDoc, setDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

const DOC_REF = doc(db, 'settings', 'editorial');

export async function getEditorial() {
  const docSnap = await getDoc(DOC_REF);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}

export async function updateEditorial(data) {
  await setDoc(DOC_REF, {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
