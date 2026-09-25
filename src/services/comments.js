import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION = 'comments';

export async function getCommentsByChapter(chapterId) {
  // Sin orderBy ni doble where: evita requerir índice compuesto en Firestore.
  // Se filtra por estado y se ordena en cliente.
  const q = query(
    collection(db, COLLECTION),
    where('chapterId', '==', chapterId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(c => c.status === 'approved')
    .sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() ?? 0;
      const tb = b.createdAt?.toMillis?.() ?? 0;
      return ta - tb;
    });
}

export async function getCommentsByStory(storyId) {
  const q = query(
    collection(db, COLLECTION),
    where('storyId', '==', storyId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(c => c.status === 'approved')
    .sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() ?? 0;
      const tb = b.createdAt?.toMillis?.() ?? 0;
      return ta - tb;
    });
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
