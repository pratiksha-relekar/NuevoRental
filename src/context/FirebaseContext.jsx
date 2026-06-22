import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  db,
  firebaseApp,
  firebaseConfig,
  initAnalytics,
} from '../backend/firebase'

const FirebaseContext = createContext(null)

export function FirebaseProvider({ children }) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    async function connect() {
      try {
        // Firestore `db` is initialized on import; analytics loads asynchronously.
        await initAnalytics()
        if (active) {
          setReady(true)
          setError(null)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to connect to Firebase.')
          setReady(true)
        }
      }
    }

    connect()

    return () => {
      active = false
    }
  }, [])

  const value = useMemo(
    () => ({
      app: firebaseApp,
      db,
      config: firebaseConfig,
      projectId: firebaseConfig.projectId,
      ready,
      error,
      isConnected: ready && !error,
    }),
    [ready, error],
  )

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
}

export function useFirebase() {
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error('useFirebase must be used within FirebaseProvider')
  }
  return context
}
