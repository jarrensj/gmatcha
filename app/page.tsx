'use client'

import StandupInput from "../components/StandupInput"
import ChatInterface from "../components/ChatInterface"
import Footer from "../components/Footer"
import { SignedIn } from "@clerk/nextjs"

export default function Home() {
  return (
    <main className="relative min-h-screen w-full flex flex-col">
      <h1 className="absolute top-6 left-6 text-3xl font-bold z-20">gmatcha</h1>

      <div className="flex-grow flex flex-col items-center pt-20 pb-10">
        <div className="relative z-10 w-full max-w-4xl px-4">
          <StandupInput />
        </div>
      </div>
      
      <SignedIn>
        <div className="w-full flex justify-center pb-16">
          <div className="relative z-10 w-full max-w-4xl px-4">
            <ChatInterface />
          </div>
        </div>
      </SignedIn>

      <div className="relative z-20 w-full py-4">
        <Footer />
      </div>
    </main>
  )
}