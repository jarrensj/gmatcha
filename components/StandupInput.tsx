'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Calendar from '@/components/Calendar'

export default function StandupInput() {
  const [isLoading, setIsLoading] = useState(true)
  const { isLoaded } = useUser()

  useEffect(() => {
    if (!isLoaded) return;
    setIsLoading(false);
  }, [isLoaded]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {isLoading ? (
        <div className="min-h-[200px] flex items-center justify-center text-muted-foreground">
          Loading...
        </div>
      ) : (
        <Calendar />
      )}
    </div>
  )
}
