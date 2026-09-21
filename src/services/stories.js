import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit as firestoreLimit,
  increment, serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION = 'stories';

export async function getStories(filters = {}) {
  try {
    let q;

    if (filters.authorId) {
      q = query(collection(db, COLLECTION), where('authorId', '==', filters.authorId));
    } else if (filters.categoryId) {
      q = query(collection(db, COLLECTION), where('categoryId', '==', filters.categoryId));
    } else if (filters.tag) {
      q = query(collection(db, COLLECTION), where('tags', 'array-contains', filters.tag));
    } else if (filters.status) {
      q = query(collection(db, COLLECTION), where('status', '==', filters.status));
    } else {
      q = query(collection(db, COLLECTION));
    }

    const snapshot = await getDocs(q);
    let stories = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    if (filters.onlyPublished) {
      stories = stories.filter(s => s.status === 'published');
    }

    stories.sort((a, b) => {
      const dateA = a.updatedAt?.toDate?.() || new Date(0);
      const dateB = b.updatedAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });

    if (filters.limit) {
      stories = stories.slice(0, filters.limit);
    }

    return stories;
  } catch (error) {
    console.error('Error getting stories:', error);
    return [];
  }
}

export async function getStoryBySlug(slug) {
  try {
    const q = query(collection(db, COLLECTION), where('slug', '==', slug));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const d = snapshot.docs[0];
    return { id: d.id, ...d.data() };
  } catch (error) {
    console.error('Error getting story by slug:', error);
    return null;
  }
}

export async function getStoryById(id) {
  try {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error('Error getting story by id:', error);
    return null;
  }
}

export async function createStory(data) {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    averageRating: 0,
    ratingCount: 0,
    chapterCount: 0,
  });
  return docRef.id;
}

export async function updateStory(id, data) {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteStory(id) {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getAllStoriesAdmin() {
  try {
    const q = query(collection(db, COLLECTION));
    const snapshot = await getDocs(q);
    let stories = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    stories.sort((a, b) => {
      const dateA = a.updatedAt?.toDate?.() || new Date(0);
      const dateB = b.updatedAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
    return stories;
  } catch (error) {
    console.error('Error getting admin stories:', error);
    return [];
  }
}
