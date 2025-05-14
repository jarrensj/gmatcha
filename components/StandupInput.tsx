'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import JSConfetti from 'js-confetti'
import { useUser } from '@clerk/nextjs'
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { ChevronDown, ChevronRight } from 'lucide-react'
import Calendar from '@/components/Calendar'

interface StandupUpdate {
  id?: string;
  text: string;
  created_at: string;
  updated_at?: string;
  user_id?: string;
  date: string;
}

export default function StandupInput() {
  const { user, isLoaded } = useUser()
  const [savedUpdates, setSavedUpdates] = useState<StandupUpdate[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [showLatestUpdate, setShowLatestUpdate] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const jsConfettiRef = useRef<JSConfetti | null>(null)
  const [showEditNotification, setShowEditNotification] = useState(false);
  const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [updateToDelete, setUpdateToDelete] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState<string>('');
  const [originalDate, setOriginalDate] = useState<{
    month: number;
    day: number;
    year: number;
  } | null>(null);
  const [date, setDate] = useState<Date>(new Date())
  const [isVoiceDialogOpen, setIsVoiceDialogOpen] = useState(false);
  const [currentWork, setCurrentWork] = useState('');
  const [yesterdayWork, setYesterdayWork] = useState('');
  const [blockers, setBlockers] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const fetchUserUpdates = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!user?.id) return;
      const response = await fetch(`/api/updates?user_id=${user.id}`);
      const data = await response.json();
      if (data.length > 0) {
        data.sort((a: StandupUpdate, b: StandupUpdate) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setSavedUpdates(data.slice(0, 7));
        setIsEditing(false);
      } else {
        setSavedUpdates([]);
      }
    } catch (error) {
      console.error('Error fetching updates:', error);
      setSavedUpdates([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isLoaded) return;
    
    if (user) {
      fetchUserUpdates();
    } else {
      setIsLoading(false);
      setSavedUpdates([]);
    }
  }, [user, isLoaded, fetchUserUpdates]);

  useEffect(() => {
    setSelectedMonth(date.getMonth());
    setSelectedDay(date.getDate());
    setSelectedYear(date.getFullYear());
  }, [date]);

  const handleDateSelect = (selectedDate: Date, existingUpdate: StandupUpdate | null) => {
    setDate(selectedDate);
    
    if (existingUpdate) {
      const [current, yesterday, blockers] = existingUpdate.text.split('\n\n');
      setCurrentWork(current.replace('What are you working on?\n', ''));
      setYesterdayWork(yesterday.replace('What did you work on yesterday?\n', ''));
      setBlockers(blockers.replace('What are your blockers?\n', ''));
      
      setOriginalText(existingUpdate.text);
      setOriginalDate({
        month: selectedDate.getMonth(),
        day: selectedDate.getDate(),
        year: selectedDate.getFullYear()
      });
      setIsEditing(true);
      setEditingUpdateId(existingUpdate.id || null);
      
      setShowEditNotification(true);
      setTimeout(() => setShowEditNotification(false), 3000);
    } else {
      setCurrentWork('');
      setYesterdayWork('');
      setBlockers('');
      setIsEditing(false);
      setEditingUpdateId(null);
      setOriginalText('');
      setOriginalDate(null);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const combinedUpdate = `What are you working on?\n${currentWork}\n\nWhat did you work on yesterday?\n${yesterdayWork}\n\nWhat are your blockers?\n${blockers}`;

    try {
      const response = await fetch('/api/updates', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: combinedUpdate,
          user_id: user.id,
          date: dateStr,
          ...(isEditing && editingUpdateId && { id: editingUpdateId }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save update');
      }

      await fetchUserUpdates();
      setEditingUpdateId(null);

      setCurrentWork('');
      setYesterdayWork('');
      setBlockers('');
      setIsEditing(false);
      if (jsConfettiRef.current) {
        jsConfettiRef.current.addConfetti({
          emojis: ['🚀'],
          emojiSize: 100,
          confettiNumber: 24,
        })
      }
    } catch (error) {
      console.error('Error saving update:', error);
      setErrorMessage('Failed to save update. Please try again.');
    }
  }

  const handleEdit = (updateToEdit: StandupUpdate) => {
    const [year, month, day] = updateToEdit.date.split('-').map(Number);
    const updateDate = new Date(year, month - 1, day);
    setDate(updateDate);
    setSelectedMonth(month - 1);
    setSelectedDay(day);
    setSelectedYear(year);
    
    const [current, yesterday, blockers] = updateToEdit.text.split('\n\n');
    setCurrentWork(current.replace('What are you working on?\n', ''));
    setYesterdayWork(yesterday.replace('What did you work on yesterday?\n', ''));
    setBlockers(blockers.replace('What are your blockers?\n', ''));
    
    setOriginalText(updateToEdit.text);
    setOriginalDate({
      month: month - 1,
      day: day,
      year: year
    });
    setIsEditing(true);
    setEditingUpdateId(updateToEdit.id || null);
    
    setShowEditNotification(true);
    setTimeout(() => setShowEditNotification(false), 3000);
  };

  const handleDelete = async (updateId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/updates?id=${updateId}&user_id=${user.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete update');
      
      setSavedUpdates(prev => prev.filter(update => update.id !== updateId));
      
      if (editingUpdateId === updateId) {
        setIsEditing(false);
        setEditingUpdateId(null);
      }
    } catch (error) {
      console.error('Error deleting update:', error);
    }
  };

  return (
    <div className="w-full max-w-4xl space-y-4">
      {showEditNotification && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white p-3 rounded-md shadow-lg">
          You are now editing an existing update.
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-3 rounded-md shadow-lg">
          {errorMessage}
        </div>
      )}
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
            <>
              <div className="mb-6">
                <Calendar onDateSelect={handleDateSelect} />
              </div>
              <div className="relative mb-6">
                <Textarea
                  placeholder="What are you working on?"
                  value={currentWork}
                  onChange={(e) => setCurrentWork(e.target.value)}
                  className="min-h-[100px] mb-3 text-lg leading-relaxed"
                />
                <Textarea
                  placeholder="What did you work on yesterday?"
                  value={yesterdayWork}
                  onChange={(e) => setYesterdayWork(e.target.value)}
                  className="min-h-[100px] mb-3 text-lg leading-relaxed"
                />
                <Textarea
                  placeholder="What are your blockers?"
                  value={blockers}
                  onChange={(e) => setBlockers(e.target.value)}
                  className="min-h-[100px] mb-6 text-lg leading-relaxed"
                />
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex-1 flex flex-wrap justify-end gap-3 w-full sm:w-auto mt-3 sm:mt-0">
                  <Button 
                    size="lg" 
                    onClick={handleSave} 
                    disabled={!(currentWork.trim() || yesterdayWork.trim() || blockers.trim()) || (
                      isEditing && 
                      currentWork === originalText && 
                      selectedMonth === originalDate?.month &&
                      selectedDay === originalDate?.day &&
                      selectedYear === originalDate?.year
                    )} 
                    className={`w-full sm:w-32 transition-colors ${
                      !(currentWork.trim() || yesterdayWork.trim() || blockers.trim()) || (
                        isEditing &&
                        currentWork === originalText &&
                        selectedMonth === originalDate?.month &&
                        selectedDay === originalDate?.day &&
                        selectedYear === originalDate?.year
                      )
                        ? 'bg-green-100 hover:bg-green-100 text-green-700 cursor-not-allowed'
                        : 'bg-green-700 hover:bg-green-900 text-white'
                    }`}
                  >
                    {isEditing ? 'Save Edit' : 'Save Update'}
                  </Button>
                  {isEditing && (
                    <Button
                      size="lg"
                      variant="outline"
                      className="hover:bg-secondary w-full sm:w-32"
                      onClick={() => {
                        setIsEditing(false);
                        setCurrentWork('');
                        setYesterdayWork('');
                        setBlockers('');
                        setEditingUpdateId(null);
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
              
              {savedUpdates.length > 0 && (
                <div className="mt-6 border-t pt-4">
                  <button
                    onClick={() => setShowLatestUpdate(!showLatestUpdate)}
                    className="w-full flex items-center justify-between py-2 px-1 text-muted-foreground hover:text-foreground transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      {showLatestUpdate ? 
                        <ChevronDown className="h-4 w-4 transition-transform" /> : 
                        <ChevronRight className="h-4 w-4 transition-transform" />
                      }
                      <span className="font-medium">Previous Updates</span>
                    </div>
                    <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      {showLatestUpdate ? "Click to hide" : "Click to view"}
                    </span>
                  </button>
                  
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      showLatestUpdate ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="max-h-[300px] overflow-y-auto">
                      {savedUpdates.map((update, index) => (
                        <div key={index} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md border border-slate-100 dark:border-slate-800 mb-3">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-muted-foreground">
                              {(() => {
                                const [year, month, day] = update.date.split('-').map(Number);
                                const date = new Date(year, month - 1, day);
                                return date.toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric'
                                });
                              })()}
                            </h3>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(update);
                                }}
                              >
                                Edit
                              </Button>
                              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setUpdateToDelete(update.id!);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                  >
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete update?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this update? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <Button 
                                      variant="destructive"
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        if (updateToDelete) {
                                          await handleDelete(updateToDelete);
                                          setUpdateToDelete(null);
                                        }
                                        setIsDeleteDialogOpen(false);
                                      }}
                                    >
                                      Confirm
                                    </Button>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          <div className="text-sm whitespace-pre-wrap">
                            {update.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      <AlertDialog open={isVoiceDialogOpen} onOpenChange={setIsVoiceDialogOpen}>
        <AlertDialogTrigger asChild>
          <div />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <div className="flex justify-between items-start">
            <AlertDialogHeader>
              <AlertDialogTitle>Voice Recording Options</AlertDialogTitle>
              <AlertDialogDescription>
                How would you like to add your voice recording as there is already text in the input field?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 rounded-full"
              onClick={() => setIsVoiceDialogOpen(false)}
            >
              ✕
            </Button>
          </div>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="hidden" />
            <Button
              onClick={() => {
                setIsVoiceDialogOpen(false);
              }}
              variant="destructive"
            >
              Overwrite
            </Button>
            <Button
              onClick={() => {
                setIsVoiceDialogOpen(false);
              }}
              variant="default"
            >
              Append
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
