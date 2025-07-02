"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, Pencil, X } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import JSConfetti from 'js-confetti'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  const [dateAnimation, setDateAnimation] = useState<{ text: string; visible: boolean }>({ text: '', visible: false })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showStandupReminder, setShowStandupReminder] = useState(true)
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

  useEffect(() => {
    // Check if user has recorded standup today
    const today = formatLocalDate(new Date());
    const hasRecordedToday = datesWithUpdates.has(today);
    setShowStandupReminder(!hasRecordedToday);
  }, [datesWithUpdates]);

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
    
    // Show date animation
    const dateText = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    setDateAnimation({ text: dateText, visible: true })
    setTimeout(() => setDateAnimation(prev => ({ ...prev, visible: false })), 1200)
    
    // If clicking the same day, close it
    if (selectedDay === formattedDate) {
      setSelectedDay(null)
      setSelectedDayUpdate(null)
      setIsEditing(false)
      onDateSelect?.(date, null)
      return
    }
    
    // Set the selected day and show read-only view (just like edit button works)
    const update = updatesData[formattedDate] || null
    
    setSelectedDay(formattedDate)
    setSelectedDayUpdate(update)
    setIsEditing(false) // Ensure we're in read-only mode
    
    // Pre-populate form data for potential editing
    if (update) {
      const [current, yesterday, blockers] = update.text.split('\n\n')
      setCurrentWork(current.replace('What are you working on?\n', ''))
      setYesterdayWork(yesterday.replace('What did you work on yesterday?\n', ''))
      setBlockers(blockers.replace('What are your blockers?\n', ''))
    } else {
      setCurrentWork('')
      setYesterdayWork('')
      setBlockers('')
    }
    
    onDateSelect?.(date, update)
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
    <>
      <div className="w-full max-w-md mx-auto sketch-border bg-[hsl(var(--card))] shadow-soft overflow-hidden relative">
        {showStandupReminder && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-300">
            <div className="sketch-border bg-[hsl(var(--card))] shadow-soft overflow-hidden">
              <div className="bg-[hsl(var(--charcoal))] text-[hsl(var(--cream))] px-6 py-3 text-center font-light tracking-wide">
                Standup Reminder
              </div>
              <div className="p-6 flex items-center gap-6">
                <div className="flex-1">
                  <p className="text-[hsl(var(--charcoal))] font-light tracking-wide">You haven&apos;t recorded your standup for today yet!</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowStandupReminder(false)}
                    className="sketch-border border-[hsl(var(--border))] text-[hsl(var(--charcoal))] hover:bg-[hsl(var(--matcha-subtle))] font-light tracking-wide"
                  >
                    Dismiss
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      const todayFormatted = formatLocalDate(today);
                      
                      // Check if we need to navigate to today's month
                      const needsNavigation = today.getMonth() !== currentDate.getMonth() || today.getFullYear() !== currentDate.getFullYear();
                      
                      if (needsNavigation) {
                        // First navigate to today's month
                        setCurrentDate(today);
                        // Delay the selection until after the month change is processed
                        setTimeout(() => {
                          const update = updatesData[todayFormatted] || null;
                          setSelectedDay(todayFormatted);
                          setSelectedDayUpdate(update);
                          setIsEditing(true);
                          
                          // Pre-populate form data
                          if (update) {
                            const [current, yesterday, blockers] = update.text.split('\n\n');
                            setCurrentWork(current.replace('What are you working on?\n', ''));
                            setYesterdayWork(yesterday.replace('What did you work on yesterday?\n', ''));
                            setBlockers(blockers.replace('What are your blockers?\n', ''));
                          } else {
                            setCurrentWork('');
                            setYesterdayWork('');
                            setBlockers('');
                          }
                        }, 0);
                      } else {
                        // We're already on the right month, select immediately
                        const update = updatesData[todayFormatted] || null;
                        setSelectedDay(todayFormatted);
                        setSelectedDayUpdate(update);
                        setIsEditing(true);
                        
                        // Pre-populate form data
                        if (update) {
                          const [current, yesterday, blockers] = update.text.split('\n\n');
                          setCurrentWork(current.replace('What are you working on?\n', ''));
                          setYesterdayWork(yesterday.replace('What did you work on yesterday?\n', ''));
                          setBlockers(blockers.replace('What are your blockers?\n', ''));
                        } else {
                          setCurrentWork('');
                          setYesterdayWork('');
                          setBlockers('');
                        }
                      }
                      
                      setShowStandupReminder(false);
                    }}
                    className="bg-[hsl(var(--charcoal))] text-[hsl(var(--cream))] hover:bg-[hsl(var(--charcoal-light))] font-light tracking-wide"
                  >
                    Record Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        {errorMessage && (
          <div className="fixed top-4 right-4 sketch-border bg-red-50 border-red-200 text-red-700 p-4 shadow-soft z-50">
            {errorMessage}
          </div>
        )}
        {dateAnimation.visible && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
            <div className="animate-in slide-in-from-top-4 duration-300 animate-out slide-out-to-top-4 duration-300 sketch-border bg-[hsl(var(--card))] shadow-soft overflow-hidden">
              <div className="bg-[hsl(var(--charcoal))] text-[hsl(var(--cream))] px-6 py-3 text-center font-light tracking-wide">
                {dateAnimation.text.split(',')[0]}
              </div>
              <div className="p-6 text-center">
                <div className="text-4xl font-light text-[hsl(var(--charcoal))] tracking-wide">
                  {new Date(dateAnimation.text).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Calendar Header */}
        <div className="bg-[hsl(var(--charcoal))] p-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={goToPreviousMonth} aria-label="Previous month" className="text-[hsl(var(--cream))] hover:bg-[hsl(var(--charcoal-light))] hover:text-[hsl(var(--cream))] h-8 w-8">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-light text-[hsl(var(--cream))] tracking-wide">
            {monthName} {year}
          </h2>
          <Button variant="ghost" size="icon" onClick={goToNextMonth} aria-label="Next month" className="text-[hsl(var(--cream))] hover:bg-[hsl(var(--charcoal-light))] hover:text-[hsl(var(--cream))] h-8 w-8">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Calendar Body */}
        <div className="bg-[hsl(var(--cream))] p-4">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-xs font-light text-[hsl(var(--charcoal))] tracking-wide py-2">
                {day}
              </div>
            ))}
          </div>

          {isLoading && (
            <div className="text-center text-sm text-[hsl(var(--charcoal))] mb-2 font-light tracking-wide">Loading...</div>
          )}

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
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
                      "h-8 w-8 flex items-center justify-center text-xs font-light tracking-wide transition-colors cursor-pointer",
                      dayHasUpdate && "sketch-border bg-[hsl(var(--charcoal))] text-[hsl(var(--cream))]",
                      isSelected && "sketch-border bg-[hsl(var(--matcha-subtle))] text-[hsl(var(--charcoal))]",
                      isSelected && dayHasUpdate && "outline outline-2 outline-[hsl(var(--charcoal))]",
                      !dayHasUpdate && !isSelected && "hover:bg-[hsl(var(--cream-dark))] hover:sketch-border",
                      isSelected && "hover:text-[hsl(var(--charcoal))]"
                    )}
                  >
                    {day}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Floating Sticky Note - Read Only View */}
      {selectedDay && !isEditing && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2 pointer-events-auto">
            <div 
              className="w-80 sketch-border bg-[hsl(var(--cream-dark))] shadow-soft transform -rotate-1 animate-in slide-in-from-right-5 duration-300"
              style={{
                backgroundImage: `
                  linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px),
                  linear-gradient(rgba(0,0,0,0.015) 1px, transparent 1px)
                `,
                backgroundSize: '24px 24px',
              }}
            >
              {/* Sticky Note Header */}
              <div className="bg-[hsl(var(--charcoal))] text-[hsl(var(--cream))] p-4 relative">
                <div className="flex justify-between items-center">
                  <div className="font-light tracking-wide">
                    {(() => {
                      const [year, month, day] = selectedDay.split('-').map(Number);
                      const date = new Date(year, month - 1, day);
                      return (
                        <>
                          <div className="text-sm opacity-90">
                            {date.toLocaleDateString('en-US', { weekday: 'long' })}
                          </div>
                          <div className="text-lg">
                            {date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditing(true)}
                      className="h-8 w-8 text-[hsl(var(--cream))] hover:bg-[hsl(var(--charcoal-light))] hover:text-[hsl(var(--cream))]"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedDay(null);
                        setSelectedDayUpdate(null);
                        setIsEditing(false);
                      }}
                      className="h-8 w-8 text-[hsl(var(--cream))] hover:bg-[hsl(var(--charcoal-light))] hover:text-[hsl(var(--cream))]"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sticky Note Content - Read Only */}
              <div className="p-6 space-y-6">
                {selectedDayUpdate ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 sketch-border bg-[hsl(var(--charcoal))] flex items-center justify-center">
                          <span className="text-[hsl(var(--cream))] text-xs">✨</span>
                        </div>
                        <h3 className="text-sm font-light text-[hsl(var(--charcoal))] tracking-wide">What are you working on?</h3>
                      </div>
                      <div className="bg-[hsl(var(--matcha-subtle))] p-4 sketch-border">
                        <p className="text-[hsl(var(--charcoal))] leading-relaxed font-light tracking-wide text-sm">
                          {selectedDayUpdate.text.split('\n\n')[0].replace('What are you working on?\n', '')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 sketch-border bg-[hsl(var(--charcoal-light))] flex items-center justify-center">
                          <span className="text-[hsl(var(--cream))] text-xs">📝</span>
                        </div>
                        <h3 className="text-sm font-light text-[hsl(var(--charcoal))] tracking-wide">What did you work on yesterday?</h3>
                      </div>
                      <div className="bg-[hsl(var(--brown-subtle))] p-4 sketch-border">
                        <p className="text-[hsl(var(--charcoal))] leading-relaxed font-light tracking-wide text-sm">
                          {selectedDayUpdate.text.split('\n\n')[1].replace('What did you work on yesterday?\n', '')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 sketch-border bg-[hsl(var(--charcoal-lighter))] flex items-center justify-center">
                          <span className="text-[hsl(var(--charcoal))] text-xs">🚧</span>
                        </div>
                        <h3 className="text-sm font-light text-[hsl(var(--charcoal))] tracking-wide">What are your blockers?</h3>
                      </div>
                      <div className="bg-[hsl(var(--cream))] p-4 sketch-border">
                        <p className="text-[hsl(var(--charcoal))] leading-relaxed font-light tracking-wide text-sm">
                          {selectedDayUpdate.text.split('\n\n')[2].replace('What are your blockers?\n', '')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="sketch-border border-[hsl(var(--charcoal-lighter))] text-[hsl(var(--charcoal))] hover:bg-[hsl(var(--matcha-subtle))] font-light tracking-wide"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-500 hover:bg-red-600 font-light tracking-wide text-xs h-7"
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Empty State */}
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 sketch-border bg-[hsl(var(--cream))] flex items-center justify-center">
                        <span className="text-2xl">📝</span>
                      </div>
                      <h3 className="text-lg font-light text-[hsl(var(--charcoal))] tracking-wide mb-2">
                        No Update Yet
                      </h3>
                      <p className="text-sm text-[hsl(var(--charcoal-light))] leading-relaxed font-light tracking-wide mb-6">
                        {(() => {
                          const [year, month, day] = selectedDay.split('-').map(Number);
                          const date = new Date(year, month - 1, day);
                          return `No update recorded for ${date.toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric'
                          })} yet.`;
                        })()}
                      </p>
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-[hsl(var(--charcoal))] text-[hsl(var(--cream))] hover:bg-[hsl(var(--charcoal-light))] font-light tracking-wide"
                      >
                        Add Update
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Sticky Note - Edit Form */}
      {selectedDay && isEditing && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2 pointer-events-auto">
            <div 
              className="w-80 sketch-border bg-[hsl(var(--cream))] shadow-soft transform rotate-1 animate-in slide-in-from-right-5 duration-300"
              style={{
                backgroundImage: `
                  linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px),
                  linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
              }}
            >
              {/* Sticky Note Header */}
              <div className="bg-[hsl(var(--charcoal))] text-[hsl(var(--cream))] p-4 relative">
                <div className="flex justify-between items-center">
                  <div className="font-light tracking-wide">
                    {(() => {
                      const [year, month, day] = selectedDay.split('-').map(Number);
                      const date = new Date(year, month - 1, day);
                      return (
                        <>
                          <div className="text-sm opacity-90">
                            {date.toLocaleDateString('en-US', { weekday: 'long' })}
                          </div>
                          <div className="text-lg">
                            {date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsEditing(false);
                      if (!selectedDayUpdate) {
                        setSelectedDay(null);
                      }
                    }}
                    className="h-8 w-8 text-[hsl(var(--cream))] hover:bg-[hsl(var(--charcoal-light))] hover:text-[hsl(var(--cream))]"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Sticky Note Content */}
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-light text-[hsl(var(--charcoal))] tracking-wide">
                    What are you working on?
                  </label>
                  <Textarea
                    placeholder="What are you working on?"
                    value={currentWork}
                    onChange={(e) => setCurrentWork(e.target.value)}
                    className="min-h-[100px] text-sm leading-relaxed border-[hsl(var(--charcoal-lighter))] bg-transparent text-[hsl(var(--charcoal))] placeholder:text-[hsl(var(--charcoal-lighter))] font-light tracking-wide focus-zen resize-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-light text-[hsl(var(--charcoal))] tracking-wide">
                    What did you work on yesterday?
                  </label>
                  <Textarea
                    placeholder="What did you work on yesterday?"
                    value={yesterdayWork}
                    onChange={(e) => setYesterdayWork(e.target.value)}
                    className="min-h-[100px] text-sm leading-relaxed border-[hsl(var(--charcoal-lighter))] bg-transparent text-[hsl(var(--charcoal))] placeholder:text-[hsl(var(--charcoal-lighter))] font-light tracking-wide focus-zen resize-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-light text-[hsl(var(--charcoal))] tracking-wide">
                    What are your blockers?
                  </label>
                  <Textarea
                    placeholder="What are your blockers?"
                    value={blockers}
                    onChange={(e) => setBlockers(e.target.value)}
                    className="min-h-[100px] text-sm leading-relaxed border-[hsl(var(--charcoal-lighter))] bg-transparent text-[hsl(var(--charcoal))] placeholder:text-[hsl(var(--charcoal-lighter))] font-light tracking-wide focus-zen resize-none"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
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
                        setSelectedDay(null);
                        setCurrentWork('');
                        setYesterdayWork('');
                        setBlockers('');
                      }
                    }}
                    className="sketch-border border-[hsl(var(--charcoal-lighter))] text-[hsl(var(--charcoal))] hover:bg-[hsl(var(--matcha-subtle))] font-light tracking-wide"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!(currentWork.trim() || yesterdayWork.trim() || blockers.trim())}
                    className="bg-[hsl(var(--charcoal))] text-[hsl(var(--cream))] hover:bg-[hsl(var(--charcoal-light))] font-light tracking-wide"
                  >
                    {selectedDayUpdate ? 'Save Edit' : 'Save Update'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="sketch-border bg-[hsl(var(--card))]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[hsl(var(--charcoal))] font-light tracking-wide">Delete Update</AlertDialogTitle>
            <AlertDialogDescription className="text-[hsl(var(--charcoal-light))] font-light tracking-wide">
              Are you sure you want to delete this update? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="sketch-border font-light tracking-wide">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedDayUpdate?.id) {
                  handleDelete(selectedDayUpdate.id);
                  setShowDeleteConfirm(false);
                }
              }}
              className="bg-red-500 hover:bg-red-600 font-light tracking-wide"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}