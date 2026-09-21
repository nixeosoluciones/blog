import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION = 'comments';

export async function getCommentsByChapter(chapterId) {
  const q = query(
    collection(db, COLLECTION),
    where('chapterId', '==', chapterId),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getCommentsByStory(storyId) {
  const q = query(
    collection(db, COLLECTION),
    where('storyId', '==', storyId),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getAllCommentsAdmin() {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function createComment(data) {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    status: 'approved',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateComment(id, data) {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, data);
}

export async function deleteComment(id) {
  await deleteDoc(doc(db, COLLECTION, id));
}
