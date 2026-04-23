"use client"

import { useState, useEffect, createContext } from "react"
import Cookies from 'js-cookie';

interface AuthContextType {
  user: string | null
  isLoggedIn: boolean
  login: (username: string, password: string) => Promise<void>
  signup: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const [user, setUser] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // console.log()
      const response = await fetch("https://api.spectaer.com/watchlist/api/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `RememberMe ${Cookies.get('rememberMeToken')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.username)
        setIsLoggedIn(true)
      } else {
        setIsLoggedIn(false)
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check error:", error)
      setIsLoggedIn(false)
      setUser(null)
    }
  }

  const login = async (username: string, password: string) => {
    const response = await fetch("https://api.spectaer.com/watchlist/api/login", {
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
    setUser(data.username)
    setIsLoggedIn(true)
    Cookies.set('rememberMeToken', data.rememberMeToken, { expires: 365 })
    window.location.reload()
  }

  const signup = async (username: string, password: string) => {
    const response = await fetch("https://api.spectaer.com/watchlist/api/signup", {
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

    // Auto-login after signup
    await login(username, password)
  }

  const logout = async () => {
    await fetch("https://api.spectaer.com/watchlist/api/logout", {
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

  return {
    user,
    isLoggedIn,
    login,
    signup,
    logout,
  }
}
