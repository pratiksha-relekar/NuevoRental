import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase/firestore'
import { COLLECTIONS } from './collections'

export function getCollectionRef(name) {
  return collection(db, name)
}

export function getDocRef(collectionName, id) {
  return doc(db, collectionName, id)
}

export function getSubcollectionRef(parentCollection, parentId, subcollection) {
  return collection(db, parentCollection, parentId, subcollection)
}

export function getSubDocRef(parentCollection, parentId, subcollection, docId) {
  return doc(db, parentCollection, parentId, subcollection, docId)
}

export async function fetchSubDocument(parentCollection, parentId, subcollection, docId) {
  const snapshot = await getDoc(getSubDocRef(parentCollection, parentId, subcollection, docId))
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() }
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

export async function fetchCollectionGroup(groupName, constraints = []) {
  const groupQuery =
    constraints.length > 0
      ? query(collectionGroup(db, groupName), ...constraints)
      : collectionGroup(db, groupName)

  const snapshot = await getDocs(groupQuery)
  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
    _refPath: item.ref.path,
  }))
}

export async function fetchSubcollection(parentCollection, parentId, subcollection, constraints = []) {
  const subRef = getSubcollectionRef(parentCollection, parentId, subcollection)
  const collectionQuery =
    constraints.length > 0 ? query(subRef, ...constraints) : subRef

  const snapshot = await getDocs(collectionQuery)
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}

export async function saveDocument(collectionName, id, data, merge = true) {
  await setDoc(getDocRef(collectionName, id), data, { merge })
  return { id, ...data }
}

export async function saveSubDocument(parentCollection, parentId, subcollection, docId, data, merge = true) {
  const payload = JSON.parse(JSON.stringify(data))
  await setDoc(getSubDocRef(parentCollection, parentId, subcollection, docId), payload, { merge })
  return { id: docId, ...payload }
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

export async function patchSubDocument(parentCollection, parentId, subcollection, docId, data) {
  await updateDoc(getSubDocRef(parentCollection, parentId, subcollection, docId), {
    ...data,
    updatedAt: new Date().toISOString(),
  })
  return { id: docId, ...data }
}

export async function removeDocument(collectionName, id) {
  await deleteDoc(getDocRef(collectionName, id))
}

export async function removeSubDocument(parentCollection, parentId, subcollection, docId) {
  await deleteDoc(getSubDocRef(parentCollection, parentId, subcollection, docId))
}

export async function removeSubcollection(parentCollection, parentId, subcollection) {
  const items = await fetchSubcollection(parentCollection, parentId, subcollection)
  if (items.length === 0) return

  const batch = writeBatch(db)
  items.forEach((item) => {
    batch.delete(getSubDocRef(parentCollection, parentId, subcollection, item.id))
  })
  await batch.commit()
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

export function subscribeToSubDocument(parentCollection, parentId, subcollection, docId, onData, onError) {
  return onSnapshot(
    getSubDocRef(parentCollection, parentId, subcollection, docId),
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

export function subscribeToSubcollection(parentCollection, parentId, subcollection, constraints, onData, onError) {
  const subRef = getSubcollectionRef(parentCollection, parentId, subcollection)
  const collectionQuery =
    constraints.length > 0 ? query(subRef, ...constraints) : subRef

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

export { COLLECTIONS, orderBy, where }
