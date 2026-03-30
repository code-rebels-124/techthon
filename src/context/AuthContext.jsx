/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, hasFirebaseConfig } from '../services/firebase'

const AuthContext = createContext(null)

const DEMO_USERS_KEY = 'lifeflow-demo-users'
const DEMO_SESSION_KEY = 'lifeflow-demo-session'

const defaultDemoUsers = [
  {
    uid: 'demo-hospital-1',
    name: 'Metro Hospital Admin',
    email: 'hospital@test.com',
    password: '123456',
    role: 'hospital',
  },
  {
    uid: 'demo-consumer-1',
    name: 'Demo Consumer',
    email: 'user@test.com',
    password: '123456',
    role: 'consumer',
  },
]

const getStoredDemoUsers = () => {
  const stored = localStorage.getItem(DEMO_USERS_KEY)
  if (!stored) {
    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(defaultDemoUsers))
    return defaultDemoUsers
  }

  try {
    const parsed = JSON.parse(stored)
    return [...defaultDemoUsers, ...parsed.filter((user) => !defaultDemoUsers.some((demo) => demo.email === user.email))]
  } catch {
    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(defaultDemoUsers))
    return defaultDemoUsers
  }
}

const saveDemoUsers = (users) => {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users))
}

const sanitizeUser = (user) => ({
  uid: user.uid,
  name: user.name,
  email: user.email,
  role: user.role,
})

const getInitialDemoSession = () => {
  if (hasFirebaseConfig) return null

  const session = localStorage.getItem(DEMO_SESSION_KEY)
  if (!session) return null

  try {
    return JSON.parse(session)
  } catch {
    localStorage.removeItem(DEMO_SESSION_KEY)
    return null
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => getInitialDemoSession())
  const [role, setRole] = useState(() => getInitialDemoSession()?.role || '')
  const [loading, setLoading] = useState(hasFirebaseConfig)

  useEffect(() => {
    if (!hasFirebaseConfig) {
      return undefined
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCurrentUser(null)
        setRole('')
        setLoading(false)
        return
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid))
      const nextRole = userDoc.exists() ? userDoc.data().role : ''
      const nextName = userDoc.exists() ? userDoc.data().name : user.displayName || user.email

      setCurrentUser({
        uid: user.uid,
        email: user.email,
        name: nextName,
      })
      setRole(nextRole)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (email, password) => {
    if (!hasFirebaseConfig) {
      const users = getStoredDemoUsers()
      const user = users.find((entry) => entry.email === email && entry.password === password)

      if (!user) throw new Error('Invalid email or password.')

      const sanitized = sanitizeUser(user)
      setCurrentUser(sanitized)
      setRole(sanitized.role)
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(sanitized))
      return sanitized
    }

    const credential = await signInWithEmailAndPassword(auth, email, password)
    const userDoc = await getDoc(doc(db, 'users', credential.user.uid))
    const userData = userDoc.data()

    const nextUser = {
      uid: credential.user.uid,
      email: credential.user.email,
      name: userData?.name || credential.user.displayName || credential.user.email,
      role: userData?.role || '',
    }

    setCurrentUser(nextUser)
    setRole(userData?.role || '')
    return nextUser
  }

  const register = async ({ name, email, password, role: selectedRole }) => {
    if (!hasFirebaseConfig) {
      const users = getStoredDemoUsers()

      if (users.some((user) => user.email === email)) {
        throw new Error('An account with this email already exists.')
      }

      const newUser = {
        uid: crypto.randomUUID(),
        name,
        email,
        password,
        role: selectedRole,
      }

      const nextUsers = [...users, newUser]
      saveDemoUsers(nextUsers)

      const sanitized = sanitizeUser(newUser)
      setCurrentUser(sanitized)
      setRole(selectedRole)
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(sanitized))
      return sanitized
    }

    const credential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(credential.user, { displayName: name })
    await setDoc(doc(db, 'users', credential.user.uid), {
      uid: credential.user.uid,
      name,
      email,
      role: selectedRole,
    })

    const nextUser = {
      uid: credential.user.uid,
      email: credential.user.email,
      name,
      role: selectedRole,
    }

    setCurrentUser(nextUser)
    setRole(selectedRole)
    return nextUser
  }

  const logout = async () => {
    if (!hasFirebaseConfig) {
      localStorage.removeItem(DEMO_SESSION_KEY)
      setCurrentUser(null)
      setRole('')
      return
    }

    await signOut(auth)
    setCurrentUser(null)
    setRole('')
  }

  const value = useMemo(
    () => ({
      currentUser,
      role,
      loading,
      login,
      register,
      logout,
      hasFirebaseConfig,
      demoCredentials: defaultDemoUsers.map(({ email, password, role: userRole }) => ({
        email,
        password,
        role: userRole,
      })),
    }),
    [currentUser, loading, role],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
