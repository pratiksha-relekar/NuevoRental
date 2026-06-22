// Backend entry — Firebase + Firestore for Nuevo Rental
export {
  db,
  firebaseApp,
  firebaseConfig,
  getFirebaseAnalytics,
  initAnalytics,
} from './firebase'

export {
  COLLECTIONS,
  addDocument,
  fetchCollection,
  fetchDocument,
  getCollectionRef,
  getDocRef,
  patchDocument,
  removeDocument,
  saveDocument,
  subscribeToCollection,
  subscribeToDocument,
  where,
} from './firestore'

export {
  buildUserRecord,
  fetchAllUsers,
  getUserByEmail,
  getUserDocumentId,
  loginEmailUser,
  normalizeUserEmail,
  registerEmailUser,
  saveUserRecord,
  toSessionUser,
  updateUserProfile,
  upsertGoogleUser,
  deleteUserByEmail,
} from './firestore/users'
