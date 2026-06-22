import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase/firestore'
import { COLLECTIONS } from './collections'

export function getCollectionRef(name) {
  return collection(db, name)
}

export function getDocRef(collectionName, id) {
  return doc(db, collectionName, id)
}

export async function fetchDocument(collectionName, id) {
  const snapshot = await getDoc(getDocRef(collectionName, id))
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() }
}

export async function fetchCollection(collectionName, constraints = []) {
  const collectionQuery =
    constraints.length > 0
      ? query(getCollectionRef(collectionName), ...constraints)
      : getCollectionRef(collectionName)

  const snapshot = await getDocs(collectionQuery)
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}

export async function saveDocument(collectionName, id, data, merge = true) {
  await setDoc(getDocRef(collectionName, id), data, { merge })
  return { id, ...data }
}

export async function addDocument(collectionName, data) {
  const ref = await addDoc(getCollectionRef(collectionName), {
    ...data,
    createdAt: data.createdAt ?? new Date().toISOString(),
    updatedAt: data.updatedAt ?? new Date().toISOString(),
  })
  return { id: ref.id, ...data }
}

export async function patchDocument(collectionName, id, data) {
  await updateDoc(getDocRef(collectionName, id), {
    ...data,
    updatedAt: new Date().toISOString(),
  })
  return { id, ...data }
}

export async function removeDocument(collectionName, id) {
  await deleteDoc(getDocRef(collectionName, id))
}

export function subscribeToCollection(collectionName, constraints, onData, onError) {
  const collectionQuery =
    constraints.length > 0
      ? query(getCollectionRef(collectionName), ...constraints)
      : getCollectionRef(collectionName)

  return onSnapshot(
    collectionQuery,
    (snapshot) => {
      const items = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
      onData(items)
    },
    onError,
  )
}

export function subscribeToDocument(collectionName, id, onData, onError) {
  return onSnapshot(
    getDocRef(collectionName, id),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null)
        return
      }
      onData({ id: snapshot.id, ...snapshot.data() })
    },
    onError,
  )
}

export { COLLECTIONS, where }
