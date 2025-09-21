import Link from 'next/link'
import { Mail } from 'lucide-react'

function XIcon({ className = 'h-4 w-4' }: { className?: string }) {
  // Official X logo (from brand resources / simple-icons)
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="border-t bg-background/95">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-sm text-muted-foreground">
        <div className="grid grid-cols-[1fr_2fr_1fr] items-center gap-4">
          {/* Left: About on left margin */}
          <nav className="flex items-start">
            <Link href="/about" className="hover:text-primary">About</Link>
          </nav>

          {/* Center: copyright - wider area */}
          <div className="text-center text-xs px-4">
            <div>© {new Date().getFullYear()} Palette.</div>
            <div>All rights reserved.</div>
          </div>

          {/* Right: contact email and X link */}
          <div className="flex items-center justify-end gap-4">
            <a href="mailto:contact@palette-art.com" aria-label="Email" className="inline-flex items-center hover:text-primary">
              <Mail className="h-5 w-5" />
              <span className="sr-only">Email</span>
            </a>
            <a href="https://x.com/joinpalette" target="_blank" rel="noopener noreferrer" aria-label="X (formerly Twitter)" className="inline-flex items-center hover:text-primary">
              <XIcon className="h-5 w-5" />
              <span className="sr-only">X</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

