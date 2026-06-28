"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import Cookies from 'js-cookie';
import { useAccessToken } from "@workos-inc/authkit-nextjs/components";
import { useParams } from "next/navigation";

interface AuthUser {
  id: number
  username: string
  roles: string[]
  createdAt: number
  [key: string]: any
}

interface AuthContextType {
  user: AuthUser | null
  isLoggedIn: boolean
  token: string | null | undefined
  profile: any | null
  getProfile: () => Promise<void>
  login: (username: string, password: string) => Promise<void>
  signup: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  authLoaded: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [profile, setProfile] = useState<any | null>(null)
  const [token, setToken] = useState<string | null | undefined>(null)
  const [authLoaded, setAuthLoaded] = useState(false)

  const { getAccessToken, loading } = useAccessToken();
  const params = useParams();
  const username = params.user as string | undefined;

  useEffect(() => {
    if (!loading) {
      const loadToken = async () => {
        try {
          const t = await getAccessToken();
          setToken(t)
        } catch (error) {
          console.error("Failed to get access token:", error)
          setToken(null)
        }
      }

      void loadToken()
    }
  }, [loading, getAccessToken])

  useEffect(() => {
    void checkAuthStatus()
  }, [token, loading])

  const checkAuthStatus = async () => {
    try {
      if(!token) return;

      const response = await fetch("http://192.168.178.132:8080/api/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data)
        setIsLoggedIn(true)
      } else {
        setIsLoggedIn(false)
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check error:", error)
      setIsLoggedIn(false)
      setUser(null)
    } finally {
      setAuthLoaded(true)  
    }
  }

  const getProfile = async () => {
    if (!username) {
      return
    }

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      const accessToken = await getAccessToken();

      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`http://192.168.178.132:8080/api/user/${username}`, {
        method: "GET",
        headers
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  const login = async (username: string, password: string) => {
    const response = await fetch("http://192.168.178.132:8080/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      throw new Error("Login failed")
    }

    const data = await response.json()
    setUser(data)
    setIsLoggedIn(true)
    Cookies.set('rememberMeToken', data.rememberMeToken, { expires: 365 })
    window.location.reload()
  }

  const signup = async (username: string, password: string) => {
    const response = await fetch("http://192.168.178.132:8080/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      if (response.status === 409) {
        throw new Error("Username already exists")
      }
      throw new Error("Signup failed")
    }

    await login(username, password)
  }

  const logout = async () => {
    await fetch("http://192.168.178.132:8080/api/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `RememberMe ${Cookies.get('rememberMeToken')}`
      }
    })

    setUser(null)
    setIsLoggedIn(false)
    window.location.reload()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        token,
        profile,
        getProfile,
        login,
        signup,
        logout,
        authLoaded
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }

  return context
}
