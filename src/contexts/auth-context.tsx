'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

interface User {
  id: string
  email: string
  isArtist: boolean
  name?: string
  avatar_url?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, isArtist: boolean) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured() || !supabase) {
      console.error('Supabase is not configured. Please set up your environment variables.')
      setLoading(false)
      return
    }

    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        }
      } catch (err) {
        console.error('Error getting session:', err)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    if (!supabase) return
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!error && data) {
        setUser({
          id: userId,
          email: data.email || '',
          isArtist: data.is_artist || false,
          name: data.name,
          avatar_url: data.avatar_url
        })
        return
      }

      // If no profile exists, fall back to auth user and create a default profile
      const { data: authData } = await supabase.auth.getUser()
      const authUser = authData?.user

      const email = authUser?.email || ''

      // Create a minimal profile
      await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email,
            is_artist: false,
            created_at: new Date().toISOString()
          }
        ])

      setUser({
        id: userId,
        email,
        isArtist: false,
        name: undefined,
        avatar_url: undefined
      })
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase is not configured' } }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (!error && data?.user?.id) {
        await fetchUserProfile(data.user.id)
      }
      return { error }
    } catch (err: any) {
      console.error('Sign-in failed:', err)
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const signUp = async (email: string, password: string, isArtist: boolean) => {
    if (!supabase) {
      return { error: { message: 'Supabase is not configured' } }
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      return { error }
    }

    if (data.user) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            email: email,
            is_artist: isArtist,
            created_at: new Date().toISOString()
          }
        ])

      if (profileError) {
        console.error('Error creating profile:', profileError)
        return { error: profileError }
      }
    }

    return { error: null }
  }

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}