import {
  collection, doc, getDocs, addDoc, deleteDoc,
  query, where, updateDoc, getDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION = 'ratings';

function getVisitorId() {
  let id = localStorage.getItem('visitor_id');
  if (!id) {
    id = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('visitor_id', id);
  }
  return id;
}

export async function getRatingByStory(storyId) {
  const visitorId = getVisitorId();
  const q = query(
    collection(db, COLLECTION),
    where('storyId', '==', storyId),
    where('visitorIdentifier', '==', visitorId)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

export async function submitRating(storyId, rating) {
  const visitorId = getVisitorId();
  const existing = await getRatingByStory(storyId);

  if (existing) {
    const oldRating = existing.rating;
    await updateDoc(doc(db, COLLECTION, existing.id), { rating, updatedAt: serverTimestamp() });
    return { action: 'updated', oldRating, newRating: rating };
  } else {
    await addDoc(collection(db, COLLECTION), {
      storyId,
      rating,
      visitorIdentifier: visitorId,
      createdAt: serverTimestamp(),
    });
    return { action: 'created', newRating: rating };
  }
}

export async function getAllRatingsAdmin() {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function deleteRating(id) {
  await deleteDoc(doc(db, COLLECTION, id));
}
