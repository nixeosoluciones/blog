import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, serverTimestamp, increment
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION = 'chapters';

export async function getChaptersByStory(storyId) {
  try {
    const q = query(collection(db, COLLECTION), where('storyId', '==', storyId));
    const snapshot = await getDocs(q);
    let chapters = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    chapters.sort((a, b) => (a.order || 0) - (b.order || 0));
    return chapters;
  } catch (error) {
    console.error('Error getting chapters:', error);
    return [];
  }
}

export async function getChaptersByVolume(volumeId) {
  try {
    const q = query(collection(db, COLLECTION), where('volumeId', '==', volumeId));
    const snapshot = await getDocs(q);
    let chapters = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    chapters.sort((a, b) => (a.order || 0) - (b.order || 0));
    return chapters;
  } catch (error) {
    console.error('Error getting chapters by volume:', error);
    return [];
  }
}

export async function getChapterById(id) {
  try {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error('Error getting chapter:', error);
    return null;
  }
}

export async function getChapterBySlug(storyId, slug) {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('storyId', '==', storyId)
    );
    const snapshot = await getDocs(q);
    const found = snapshot.docs.find(d => d.data().slug === slug);
    if (!found) return null;
    return { id: found.id, ...found.data() };
  } catch (error) {
    console.error('Error getting chapter by slug:', error);
    return null;
  }
}

export async function createChapter(data) {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if (data.storyId) {
    try {
      const storyRef = doc(db, 'stories', data.storyId);
      await updateDoc(storyRef, { chapterCount: increment(1), updatedAt: serverTimestamp() });
    } catch (e) {
      console.error('Error updating story chapterCount:', e);
    }
  }

  return docRef.id;
}

export async function updateChapter(id, data) {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteChapter(id) {
  const chapter = await getChapterById(id);
  await deleteDoc(doc(db, COLLECTION, id));
  if (chapter && chapter.storyId) {
    try {
      const storyRef = doc(db, 'stories', chapter.storyId);
      await updateDoc(storyRef, { chapterCount: increment(-1), updatedAt: serverTimestamp() });
    } catch (e) {
      console.error('Error updating story chapterCount:', e);
    }
  }
}
