'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { Menu, X, Palette, User, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, loading, signOut } = useAuth()
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/artists', label: 'Artists' },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex md:grid md:grid-cols-3 items-center justify-between h-16">
          {/* Logo (left) */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-xl font-bold hover:opacity-80 transition-opacity"
            >
              <Palette className="h-6 w-6 text-primary" />
              <span>Palette</span>
            </Link>
          </div>

          {/* Desktop Navigation (center) */}
          <div className="hidden md:flex items-center justify-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive(item.href) 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions (right) */}
          <div className="hidden md:flex items-center justify-end space-x-3">
            {loading ? (
              <div className="h-9 w-24 rounded-md bg-muted animate-pulse" />
            ) : user ? (
              <div className="flex items-center space-x-3">
                {user.isArtist ? (
                  <Button asChild variant="outline" size="sm" className="h-9">
                    <Link href="/dashboard" className="inline-flex items-center justify-center whitespace-nowrap">
                      <User className="h-4 w-4 mr-2 flex-shrink-0" />
                      Dashboard
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="sm" className="h-9">
                    <Link href="/wallet" className="inline-flex items-center justify-center whitespace-nowrap">
                      <User className="h-4 w-4 mr-2 flex-shrink-0" />
                      Wallet
                    </Link>
                  </Button>
                )}
                
                <Button asChild size="sm" className="h-9">
                  <Link href="/create" className="inline-flex items-center justify-center whitespace-nowrap">
                    <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
                    Create
                  </Link>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9"
                  onClick={signOut}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button asChild variant="ghost" size="sm" className="h-9">
                  <Link href="/auth/signin" className="inline-flex items-center justify-center whitespace-nowrap">Sign In</Link>
                </Button>
                <Button asChild size="sm" className="h-9">
                  <Link href="/auth/signup" className="inline-flex items-center justify-center whitespace-nowrap">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button (right) */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t bg-background/95"
            >
              <div className="py-4 space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "block px-4 py-2 text-sm font-medium transition-colors hover:text-primary hover:bg-accent rounded-md",
                      isActive(item.href) 
                        ? "text-primary bg-accent" 
                        : "text-muted-foreground"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                
                <div className="pt-4 border-t space-y-3 px-4">
                  {loading ? (
                    <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
                  ) : user ? (
                    <>
                      {user.isArtist ? (
                        <Button asChild variant="outline" className="w-full h-10">
                          <Link href="/dashboard" onClick={() => setIsOpen(false)} className="inline-flex items-center justify-center whitespace-nowrap">
                            <User className="h-4 w-4 mr-2 flex-shrink-0" />
                            Dashboard
                          </Link>
                        </Button>
                      ) : (
                        <Button asChild variant="outline" className="w-full h-10">
                          <Link href="/wallet" onClick={() => setIsOpen(false)} className="inline-flex items-center justify-center whitespace-nowrap">
                            <User className="h-4 w-4 mr-2 flex-shrink-0" />
                            Wallet
                          </Link>
                        </Button>
                      )}
                      
                      <Button asChild className="w-full h-10">
                        <Link href="/create" onClick={() => setIsOpen(false)} className="inline-flex items-center justify-center whitespace-nowrap">
                          <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
                          Create Campaign
                        </Link>
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        className="w-full h-10" 
                        onClick={() => {
                          signOut()
                          setIsOpen(false)
                        }}
                      >
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild variant="outline" className="w-full h-10">
                        <Link href="/auth/signin" onClick={() => setIsOpen(false)} className="inline-flex items-center justify-center whitespace-nowrap">
                          Sign In
                        </Link>
                      </Button>
                      <Button asChild className="w-full h-10">
                        <Link href="/auth/signup" onClick={() => setIsOpen(false)} className="inline-flex items-center justify-center whitespace-nowrap">
                          Sign Up
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}