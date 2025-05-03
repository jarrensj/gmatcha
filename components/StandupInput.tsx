'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import JSConfetti from 'js-confetti'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const jsConfettiRef = useRef<JSConfetti | null>(null)
  const [showEditNotification, setShowEditNotification] = useState(false);
  const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState<string>('');
  const [originalDate, setOriginalDate] = useState<{
    month: number;
    day: number;
    year: number;
  } | null>(null);
  const [date, setDate] = useState<Date>(new Date())
  const [currentWork, setCurrentWork] = useState('');
  const [yesterdayWork, setYesterdayWork] = useState('');
  const [blockers, setBlockers] = useState('');
  const [updateToDelete, setUpdateToDelete] = useState<string | null>(null);

  useEffect(() => {
    jsConfettiRef.current = new JSConfetti();
    return () => {
      jsConfettiRef.current = null;
    };
  }, []);

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

      if (!response.ok) throw new Error('Failed to save update');
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
    <div className="flex flex-col items-center justify-center w-full h-full bg-matcha-100">
      {showEditNotification && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white p-3 rounded-md shadow-lg z-50">
          You are now editing an existing update.
        </div>
      )}
      <Card className="border-2 shadow-lg mb-8 w-full max-w-4xl matcha-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold matcha-text">{isEditing ? 'Edit Update' : 'New Update'}</h2>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[240px] justify-start text-left font-normal matcha-text"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "EEEE, MMMM d, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    if (newDate) {
                      setDate(newDate);
                      setSelectedMonth(newDate.getMonth());
                      setSelectedDay(newDate.getDate());
                      setSelectedYear(newDate.getFullYear());
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="min-h-[200px] flex items-center justify-center text-matcha-700">
              Loading...
            </div>
          ) : (
            <Tabs defaultValue="today">
              <TabsList className="mb-6 grid grid-cols-3 w-full">
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="yesterday">Yesterday</TabsTrigger>
                <TabsTrigger value="blockers">Blockers</TabsTrigger>
              </TabsList>

              <TabsContent value="today">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-matcha-600">What are you working on?</h3>
                  <Textarea
                    placeholder="Describe what you're currently working on..."
                    value={currentWork}
                    onChange={(e) => setCurrentWork(e.target.value)}
                    className="min-h-[120px] text-lg leading-relaxed"
                  />
                </div>
              </TabsContent>

              <TabsContent value="yesterday">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-matcha-600">What did you work on yesterday?</h3>
                  <Textarea
                    placeholder="Describe what you worked on yesterday..."
                    value={yesterdayWork}
                    onChange={(e) => setYesterdayWork(e.target.value)}
                    className="min-h-[120px] text-lg leading-relaxed"
                  />
                </div>
              </TabsContent>

              <TabsContent value="blockers">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-matcha-600">Any blockers?</h3>
                  <Textarea
                    placeholder="Describe any blockers or challenges you're facing..."
                    value={blockers}
                    onChange={(e) => setBlockers(e.target.value)}
                    className="min-h-[120px] text-lg leading-relaxed"
                  />
                </div>
              </TabsContent>

              <div className="flex gap-3 mt-6">
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
                  className={`transition-colors ${
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
            </Tabs>
          )}
        </CardContent>
      </Card>

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-6 matcha-text">Recent Updates</h2>
        
        {savedUpdates.length === 0 ? (
          <div className="text-center py-8 bg-matcha-50 border matcha-border rounded-lg">
            <p className="text-matcha-500">No updates yet. Create your first update above!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedUpdates.slice(0, 5).map((update, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="bg-matcha-50 p-4 flex justify-between items-center border-b">
                  <h3 className="font-medium">
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
                      className="h-8 text-xs"
                      onClick={() => handleEdit(update)}
                    >
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setUpdateToDelete(update.id!);
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
                            onClick={() => {
                              if (updateToDelete) {
                                handleDelete(updateToDelete);
                                setUpdateToDelete(null);
                              }
                            }}
                          >
                            Confirm
                          </Button>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <CardContent className="p-4">
                  {formatUpdateContent(update.text)}
                </CardContent>
              </Card>
            ))}

            {savedUpdates.length > 5 && (
              <div className="text-center mt-4">
                <Button variant="outline" asChild>
                  <Link href="/updates">View All Updates</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function formatUpdateContent(text: string) {
  const sections = text.split('\n\n');
  return (
    <div className="space-y-3 mt-2">
      {sections.map((section, i) => {
        const [title, ...content] = section.split('\n');
        return (
          <div key={i}>
            <h4 className="font-medium text-gray-800">{title}</h4>
            <p className="text-gray-600 mt-1">{content.join('\n')}</p>
          </div>
        );
      })}
    </div>
  );
}
