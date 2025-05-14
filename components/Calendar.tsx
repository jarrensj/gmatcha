"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, Pencil, X } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import JSConfetti from 'js-confetti'

interface UpdateDate {
  id?: string;
  text: string;
  created_at: string;
  updated_at?: string;
  user_id?: string;
  date: string;
}

interface CalendarProps {
  onDateSelect?: (date: Date, update: UpdateDate | null) => void;
}

export default function Calendar({ onDateSelect }: CalendarProps) {
  const { user } = useUser()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [datesWithUpdates, setDatesWithUpdates] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedDayUpdate, setSelectedDayUpdate] = useState<UpdateDate | null>(null)
  const [updatesData, setUpdatesData] = useState<Record<string, UpdateDate>>({})
  const [isEditing, setIsEditing] = useState(false)
  const [currentWork, setCurrentWork] = useState('')
  const [yesterdayWork, setYesterdayWork] = useState('')
  const [blockers, setBlockers] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const jsConfettiRef = useRef<JSConfetti | null>(null)

  useEffect(() => {
    jsConfettiRef.current = new JSConfetti();
    return () => {
      jsConfettiRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const goToPreviousMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() - 1)
      return newDate
    })
  }

  const goToNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + 1)
      return newDate
    })
  }

  useEffect(() => {
    if (!user) return

    const fetchDatesWithUpdates = async () => {
      setIsLoading(true)
      try {
        const startDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const endDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        const response = await fetch(
          `/api/updates?user_id=${encodeURIComponent(user.id)}&start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`
        )

        if (!response.ok) throw new Error("Failed to fetch update dates")

        const data = await response.json()
        const datesSet = new Set<string>()
        const updatesMap: Record<string, UpdateDate> = {}

        data.forEach((item: UpdateDate) => {
          if (item.date) {
            const formatted = item.date.split("T")[0]
            datesSet.add(formatted)
            updatesMap[formatted] = item
          }
        })
        setDatesWithUpdates(datesSet)
        setUpdatesData(updatesMap)
      } catch (error) {
        console.error("Error fetching dates with updates:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDatesWithUpdates()
  }, [currentDate, user])

  useEffect(() => {
    setSelectedDay(null)
    setSelectedDayUpdate(null)
  }, [currentDate])

  const monthName = currentDate.toLocaleString("default", { month: "long" })
  const year = currentDate.getFullYear()

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyCells = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const hasUpdate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return datesWithUpdates.has(formatLocalDate(date))
  }

  const handleDayClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const formattedDate = formatLocalDate(date)
    
    if (!datesWithUpdates.has(formattedDate)) {
      setSelectedDay(formattedDate)
      setSelectedDayUpdate(null)
      setIsEditing(true)
      setCurrentWork('')
      setYesterdayWork('')
      setBlockers('')
      onDateSelect?.(date, null)
      return
    }
    
    if (selectedDay === formattedDate) {
      setSelectedDay(null)
      setSelectedDayUpdate(null)
      setIsEditing(false)
      onDateSelect?.(date, null)
    } else {
      setSelectedDay(formattedDate)
      const update = updatesData[formattedDate] || null
      setSelectedDayUpdate(update)
      if (update) {
        const [current, yesterday, blockers] = update.text.split('\n\n')
        setCurrentWork(current.replace('What are you working on?\n', ''))
        setYesterdayWork(yesterday.replace('What did you work on yesterday?\n', ''))
        setBlockers(blockers.replace('What are your blockers?\n', ''))
      }
      setIsEditing(false)
      onDateSelect?.(date, update)
    }
  }

  const handleSave = async () => {
    if (!user || !selectedDay) return;
    
    const combinedUpdate = `What are you working on?\n${currentWork}\n\nWhat did you work on yesterday?\n${yesterdayWork}\n\nWhat are your blockers?\n${blockers}`;

    try {
      const response = await fetch('/api/updates', {
        method: selectedDayUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: combinedUpdate,
          user_id: user.id,
          date: selectedDay,
          ...(selectedDayUpdate && { id: selectedDayUpdate.id }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save update');
      }

      // Update local state immediately
      const newUpdate: UpdateDate = {
        id: data.id || selectedDayUpdate?.id,
        text: combinedUpdate,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user.id,
        date: selectedDay
      };

      setDatesWithUpdates(prev => new Set([...prev, selectedDay]));
      setUpdatesData(prev => ({
        ...prev,
        [selectedDay]: newUpdate
      }));
      setSelectedDayUpdate(newUpdate);
      setIsEditing(false);

      if (jsConfettiRef.current) {
        jsConfettiRef.current.addConfetti({
          emojis: ['🚀'],
          emojiSize: 100,
          confettiNumber: 24,
        });
      }
    } catch (error) {
      console.error('Error saving update:', error);
      setErrorMessage('Failed to save update. Please try again.');
    }
  };

  const handleDelete = async (updateId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/updates?id=${updateId}&user_id=${user.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete update');
      
      setSelectedDay(null);
      setSelectedDayUpdate(null);
      setIsEditing(false);
      
      // Refresh the updates
      const startDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
      const endDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const updatesResponse = await fetch(
        `/api/updates?user_id=${encodeURIComponent(user.id)}&start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`
      );

      if (!updatesResponse.ok) throw new Error("Failed to fetch update dates");

      const updatesData = await updatesResponse.json();
      const datesSet = new Set<string>();
      const updatesMap: Record<string, UpdateDate> = {};

      updatesData.forEach((item: UpdateDate) => {
        if (item.date) {
          const formatted = item.date.split("T")[0];
          datesSet.add(formatted);
          updatesMap[formatted] = item;
        }
      });
      setDatesWithUpdates(datesSet);
      setUpdatesData(updatesMap);
    } catch (error) {
      console.error('Error deleting update:', error);
      setErrorMessage('Failed to delete update. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-lg shadow-md overflow-hidden border border-[#2C5530] relative">
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-3 rounded-md shadow-lg z-50">
          {errorMessage}
        </div>
      )}
      <div className="bg-[#4A7856] p-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={goToPreviousMonth} aria-label="Previous month" className="text-white hover:bg-[#2C5530] hover:text-white">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold text-white">
          {monthName} {year}
        </h2>
        <Button variant="ghost" size="icon" onClick={goToNextMonth} aria-label="Next month" className="text-white hover:bg-[#2C5530] hover:text-white">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="bg-[#F5F5F0] p-4">
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-[#2C5530]">
              {day}
            </div>
          ))}
        </div>

        {isLoading && (
          <div className="text-center text-sm text-[#2C5530] mb-2">Loading...</div>
        )}

        <div className="grid grid-cols-7 gap-0">
          {emptyCells.map((_, index) => (
            <div key={`empty-${index}`} className="h-10 p-0" />
          ))}

          {days.map((day) => {
            const dayHasUpdate = hasUpdate(day)
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            const formattedDate = formatLocalDate(date)
            const isSelected = selectedDay === formattedDate

            return (
              <div 
                key={`day-${day}`} 
                className="h-10 flex items-center justify-center p-1"
                onClick={() => handleDayClick(day)}
              >
                <div
                  className={cn(
                    "h-8 w-8 flex items-center justify-center text-sm rounded-full",
                    dayHasUpdate && "bg-[#4A7856] text-white cursor-pointer",
                    isSelected && "bg-[#A4C095] text-[#2C5530]",
                    isSelected && dayHasUpdate && "outline outline-2 outline-[#4A7856]",
                    !dayHasUpdate && "hover:bg-[#E8E8E0]",
                    isSelected && "hover:text-[#2C5530]"
                  )}
                >
                  {day}
                </div>
              </div>
            )
          })}
        </div>
        
        {selectedDay && (
          <Card className="mt-4 border-[#2C5530] rounded-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <CardHeader className="pb-2 bg-[#F5F5F0]">
              <div className="flex justify-between items-center">
                <CardDescription>
                  <div className="font-semibold text-[#2C5530]">
                    {(() => {
                      const [year, month, day] = selectedDay.split('-').map(Number);
                      const date = new Date(year, month - 1, day);
                      return date.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      });
                    })()}
                  </div>
                </CardDescription>
                <div className="flex gap-1">
                  {selectedDayUpdate && !isEditing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditing(true)}
                      className="h-8 w-8 text-[#2C5530] hover:bg-[#A4C095] hover:text-[#2C5530] transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedDay(null);
                      setSelectedDayUpdate(null);
                      setIsEditing(false);
                    }}
                    className="h-8 w-8 text-[#2C5530] hover:bg-[#A4C095] hover:text-[#2C5530] transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="bg-white">
              {isEditing ? (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <Textarea
                    placeholder="What are you working on?"
                    value={currentWork}
                    onChange={(e) => setCurrentWork(e.target.value)}
                    className="min-h-[100px] text-lg leading-relaxed border-[#2C5530] focus:border-[#4A7856] focus:ring-[#4A7856]"
                  />
                  <Textarea
                    placeholder="What did you work on yesterday?"
                    value={yesterdayWork}
                    onChange={(e) => setYesterdayWork(e.target.value)}
                    className="min-h-[100px] text-lg leading-relaxed border-[#2C5530] focus:border-[#4A7856] focus:ring-[#4A7856]"
                  />
                  <Textarea
                    placeholder="What are your blockers?"
                    value={blockers}
                    onChange={(e) => setBlockers(e.target.value)}
                    className="min-h-[100px] text-lg leading-relaxed border-[#2C5530] focus:border-[#4A7856] focus:ring-[#4A7856]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        if (selectedDayUpdate) {
                          const [current, yesterday, blockers] = selectedDayUpdate.text.split('\n\n');
                          setCurrentWork(current.replace('What are you working on?\n', ''));
                          setYesterdayWork(yesterday.replace('What did you work on yesterday?\n', ''));
                          setBlockers(blockers.replace('What are your blockers?\n', ''));
                        } else {
                          setCurrentWork('');
                          setYesterdayWork('');
                          setBlockers('');
                        }
                      }}
                      className="border-[#2C5530] text-[#2C5530] hover:bg-[#A4C095] hover:text-[#2C5530]"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={!(currentWork.trim() || yesterdayWork.trim() || blockers.trim())}
                      className="bg-[#4A7856] text-white hover:bg-[#2C5530]"
                    >
                      {selectedDayUpdate ? 'Save Edit' : 'Save Update'}
                    </Button>
                  </div>
                </div>
              ) : selectedDayUpdate ? (
                <div className="space-y-4">
                  <p className="whitespace-pre-wrap text-[#2C5530]">{selectedDayUpdate.text}</p>
                  <div className="flex justify-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(selectedDayUpdate.id!)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-[#2C5530]">
                  No update found for {new Date(selectedDay + "T00:00:00").toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}