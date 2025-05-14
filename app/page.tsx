'use client'

import StandupInput from "../components/StandupInput"
import ChatInterface from "../components/ChatInterface"
import Footer from "../components/Footer"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"

export default function Home() {
  return (
    <main className="relative min-h-screen w-full flex flex-col matcha-gradient pt-6">
      <div className="w-full bg-[#2C5530]/10 backdrop-blur-sm">
        <div className="w-full max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold matcha-text">gmatcha</h1>
          <div className="flex items-center">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-[#2C5530]/70 text-sm hover:text-[#2C5530] transition-colors cursor-pointer">
                  Log in / Sign in
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>

      <SignedOut>
        <div className="flex-grow flex flex-col items-center justify-center pt-2 pb-10">
          <div className="p-8 max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg flex flex-col items-center space-y-3 border border-[#2C5530]/10">
            <h2 className="text-3xl font-bold text-[#2C5530]">gmatcha</h2>
            <p className="text-[#4A7856]/90 text-center text-sm leading-relaxed">
              Track your daily standup updates and get AI-powered insights about your standup updates.
            </p>
            <SignInButton mode="modal">
              <button className="text-[#2C5530]/70 text-xs mt-1 hover:text-[#2C5530] transition-colors cursor-pointer">
                Log in / Sign in to get started
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="flex-grow flex flex-col items-center pt-4 pb-10">
          <div className="relative z-10 w-full max-w-4xl px-4">
            <StandupInput />
          </div>
        </div>
        
        <div className="w-full flex justify-center pb-16">
          <div className="relative z-30 w-full max-w-4xl px-4">
            <ChatInterface />
          </div>
        </div>
      </SignedIn>

      <div className="relative z-10 w-full py-4">
        <Footer />
      </div>
    </main>
  )
}