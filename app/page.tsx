'use client'

import StandupInput from "../components/StandupInput"
import ChatInterface from "../components/ChatInterface"
import Footer from "../components/Footer"
import { SignedIn, SignedOut } from "@clerk/nextjs"

export default function Home() {
  return (
    <main className="relative min-h-screen w-full flex flex-col matcha-gradient">
      <h1 className="absolute top-6 left-6 text-3xl font-bold z-20 matcha-text">gmatcha</h1>

      <SignedOut>
        <div className="flex-grow flex flex-col items-center justify-center pt-20 pb-10">
          <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md flex flex-col items-center space-y-4 matcha-border">
            <h2 className="text-xl font-bold matcha-text">Sign in to use gmatcha</h2>
            <p className="text-matcha-700 text-center">You need to sign in or create an account to access the standup updates feature.</p>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="flex-grow flex flex-col items-center pt-20 pb-10">
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