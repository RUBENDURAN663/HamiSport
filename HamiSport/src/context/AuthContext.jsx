import { createContext, useState, useEffect, useContext } from 'react'
import AuthService from '../services/auth.service'
import { registerSessionExpiredHandler } from '../services/session'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]                     = useState(null)
  const [loading, setLoading]               = useState(true)
  const [sessionExpired, setSessionExpired] = useState(false)

  useEffect(() => {
    registerSessionExpiredHandler(() => setSessionExpired(true))
    return () => registerSessionExpiredHandler(null)
  }, [])

  useEffect(() => {
    const savedUser  = localStorage.getItem('hamisport_user')
    const savedToken = localStorage.getItem('hamisport_token')
    if (savedUser && savedToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password, remember = false) => {
    const data = await AuthService.login(email, password, remember)
    localStorage.setItem('hamisport_token', data.token)
    localStorage.setItem('hamisport_user', JSON.stringify(data.user))
    setUser(data.user)
    setSessionExpired(false)
    sessionStorage.removeItem('hamisport_session_expired')
    return data
  }

  const register = async (name, email, password) => {
    const data = await AuthService.register(name, email, password)
    localStorage.setItem('hamisport_token', data.token)
    localStorage.setItem('hamisport_user', JSON.stringify(data.user))
    setUser(data.user)
    setSessionExpired(false)
    sessionStorage.removeItem('hamisport_session_expired')
    return data
  }

  const logout = () => {
    AuthService.logout()
    setUser(null)
    setSessionExpired(false)
    sessionStorage.removeItem('hamisport_session_expired')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, sessionExpired }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}

export default AuthContext