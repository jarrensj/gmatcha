'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
    <div className="w-full max-w-4xl space-y-4">
      <Card className="border-2 shadow-lg">
        <CardHeader className="pb-3 space-y-4">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {isLoading ? (
            <div className="min-h-[200px] flex items-center justify-center text-muted-foreground">
              Loading...
            </div>
          ) : (
            <div className="mb-6">
              <Calendar />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
