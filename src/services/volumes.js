import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION = 'volumes';

export async function getVolumesByStory(storyId) {
  try {
    const q = query(collection(db, COLLECTION), where('storyId', '==', storyId));
    const snapshot = await getDocs(q);
    let volumes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    volumes.sort((a, b) => (a.order || 0) - (b.order || 0));
    return volumes;
  } catch (error) {
    console.error('Error getting volumes:', error);
    return [];
  }
}

export async function getVolumeById(id) {
  try {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error('Error getting volume:', error);
    return null;
  }
}

export async function createVolume(data) {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateVolume(id, data) {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteVolume(id) {
  await deleteDoc(doc(db, COLLECTION, id));
}
