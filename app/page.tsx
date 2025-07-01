'use client'

import StandupInput from "../components/StandupInput"
import ChatInterface from "../components/ChatInterface"
import Footer from "../components/Footer"
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/nextjs"

export default function Home() {
  const { isLoaded } = useAuth()

  return (
    <main className="relative min-h-screen w-full flex flex-col bg-[hsl(var(--cream))]">
      {!isLoaded && (
        <div className="fixed inset-0 bg-[hsl(var(--cream))]/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 border-2 border-[hsl(var(--charcoal))] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[hsl(var(--charcoal))] font-medium tracking-wide">Loading gmatcha...</p>
          </div>
        </div>
      )}
      
      {/* Header with Japanese minimalist styling */}
      <div className="w-full bg-[hsl(var(--cream-dark))] border-b border-[hsl(var(--border))]">
        <div className="container-zen py-4">
          <div className="flex items-center justify-between">
            <h1 
              onClick={() => window.location.reload()} 
              className="text-3xl font-light text-[hsl(var(--charcoal))] cursor-pointer hover:text-[hsl(var(--charcoal-light))] transition-colors tracking-wide"
            >
              gmatcha
            </h1>
            <div className="flex items-center">
              <SignedIn>
                <div className="p-1">
                  <UserButton />
                </div>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-[hsl(var(--charcoal-light))] text-sm hover:text-[hsl(var(--charcoal))] transition-colors font-light tracking-wide">
                    Log in / Sign in
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>
      </div>

      <SignedOut>
        <div className="flex-grow flex flex-col items-center justify-center py-16">
          <div className="container-zen max-w-lg">
            <div className="sketch-border p-12 bg-[hsl(var(--card))] shadow-soft">
              <div className="text-center space-zen">
                <h2 className="text-4xl font-light text-[hsl(var(--charcoal))] mb-4 tracking-wide">
                  gmatcha
                </h2>
                <p className="text-[hsl(var(--charcoal-light))] leading-relaxed font-light tracking-wide">
                  Track your daily standup updates and get AI-powered insights about your progress.
                </p>
                <div className="pt-6">
                  <SignInButton mode="modal">
                    <button className="text-[hsl(var(--charcoal-light))] text-sm hover:text-[hsl(var(--charcoal))] transition-colors font-light tracking-wide border-b border-[hsl(var(--border))] pb-1">
                      Log in / Sign in to get started
                    </button>
                  </SignInButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="flex-grow">
          {/* Main content area with generous spacing */}
          <div className="container-zen py-12">
            <StandupInput />
          </div>
        </div>
      </SignedIn>

      {/* Footer with minimalist styling */}
      <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--cream-dark))]">
        <Footer />
      </div>
      
      {/* Floating Chat Interface */}
      <SignedIn>
        <ChatInterface />
      </SignedIn>
    </main>
  )
}