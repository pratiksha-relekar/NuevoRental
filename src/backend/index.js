// Backend entry — Firebase + Firestore for Nuevo Rental
export {
  db,
  firebaseApp,
  firebaseConfig,
  getFirebaseAnalytics,
  initAnalytics,
  storage,
} from './firebase'

export {
  COLLECTIONS,
  USER_SUBCOLLECTIONS,
  addDocument,
  fetchCollection,
  fetchCollectionGroup,
  fetchDocument,
  fetchSubcollection,
  fetchSubDocument,
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
  subscribeToSubDocument,
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
  hasSupportPrivilege,
  mirrorCatalogToLocalStorage,
  seedAdminCatalogIfEmpty,
  subscribeToAdminCatalog,
  upsertAdminCategory,
  upsertAdminProduct,
} from './firestore/adminCatalog'

export {
  approveUserKycRecord,
  deleteUserKyc,
  fetchAdminKycUsersFromFirestore,
  fetchAllKycVerificationDocs,
  fetchAdminKycReviewRecords,
  fetchKycRecordsByEmail,
  getAdminKycReviewRecord,
  getUserKycRecord,
  loadKycMirrorForUser,
  KYC_DOC_ID,
  KYC_MIRROR_KEY,
  markKycNoticeRead,
  normalizeKycRecord,
  rejectUserKycRecord,
  saveUserKycRecord,
  submitUserKycForReview,
  subscribeToUserKyc,
} from './firestore/kyc'

export {
  buildSupportRequestRecord,
  fetchAdminSupportRequestsFromFirestore,
  fetchOpenSupportCountFromFirestore,
  generateSupportRequestId,
  getOpenSupportCountFromMirror,
  submitSupportRequestToFirestore,
  subscribeToAdminSupportRequests,
  SUPPORT_MIRROR_KEY,
  updateSupportRequestInFirestore,
} from './firestore/support'

export {
  compressDataUrl,
  compressDataUrlToKycDataUrl,
  compressFileToKycDataUrl,
  compressImageToBlob,
  deleteStoragePath,
  ensureRemoteImageUrl,
  isDataUrl,
  isRemoteImageUrl,
  resolveKycDocumentsForSave,
  resolveProductImagesForSave,
  uploadBlobToStorage,
  uploadImageSource,
  uploadKycDocumentImage,
  uploadProductCatalogImage,
  uploadProductDraftImage,
} from './storage/imageStorage'
