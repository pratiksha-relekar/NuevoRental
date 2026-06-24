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
  USER_SUBCOLLECTIONS,
  addDocument,
  fetchCollection,
  fetchDocument,
  fetchSubcollection,
  getCollectionRef,
  getDocRef,
  getSubDocRef,
  getSubcollectionRef,
  orderBy,
  patchDocument,
  patchSubDocument,
  removeDocument,
  removeSubDocument,
  removeSubcollection,
  saveDocument,
  saveSubDocument,
  subscribeToCollection,
  subscribeToDocument,
  subscribeToSubcollection,
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

export {
  addToUserWishlist,
  buildWishlistProductSnapshot,
  clearUserWishlist,
  deleteUserWishlist,
  fetchUserWishlist,
  mergeGuestWishlist,
  refreshWishlistAddresses,
  removeFromUserWishlist,
  subscribeToUserWishlist,
  toWishlistContextItem,
} from './firestore/wishlist'

export {
  addToUserCart,
  clearUserCart,
  deleteUserCart,
  fetchUserCart,
  mergeGuestCart,
  refreshCartAddresses,
  removeFromUserCart,
  subscribeToUserCart,
  updateUserCartItem,
} from './firestore/cart'

export {
  confirmUserOrdersAfterKyc,
  deleteUserOrder,
  deleteUserOrders,
  fetchUserOrders,
  placeUserOrder,
  subscribeToUserOrders,
  updateUserOrder,
} from './firestore/orders'

export {
  buildCartItemSnapshot,
  buildOrderItemSnapshot,
  buildProductSnapshot,
  buildUserAddress,
} from './firestore/productSnapshots'

export {
  ADMIN_PRIVILEGES,
  deleteAdminCatalog,
  deleteAdminCategory,
  deleteAdminProduct,
  ensureAdminCatalogUser,
  fetchAdminCatalog,
  getAdminCatalogUserId,
  getAdminCatalogEmail,
  hasCatalogPrivilege,
  mirrorCatalogToLocalStorage,
  seedAdminCatalogIfEmpty,
  subscribeToAdminCatalog,
  upsertAdminCategory,
  upsertAdminProduct,
} from './firestore/adminCatalog'
