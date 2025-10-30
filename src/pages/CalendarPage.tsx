import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFindom } from '@/context/FindomContext';
import { toast } from '@/utils/toast';
import { Plus, Edit, Trash2, Calendar, CheckSquare } from 'lucide-react';
import { CalendarEvent } from '@/types';
import { EmptyState } from '@/components/EmptyState';

const ChecklistPage = () => {
  const { appData, updateCalendar } = useFindom();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  
  // Form states
  const [eventTitle, setEventTitle] = useState('');
  const [eventDateTime, setEventDateTime] = useState('');
  const [eventPlatform, setEventPlatform] = useState('');
  const [eventContent, setEventContent] = useState('');

  const resetForm = () => {
    setEventTitle('');
    setEventDateTime('');
    setEventPlatform('');
    setEventContent('');
  };

  const handleAddEvent = async () => {
    if (!eventTitle || !eventDateTime || !eventPlatform) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      datetime: eventDateTime,
      platform: eventPlatform,
      content: eventContent,
    };

    const updatedCalendar = [...appData.calendarEvents, newEvent];
    await updateCalendar(updatedCalendar);
    
    resetForm();
    setIsDialogOpen(false);
    toast.success('Event added successfully!');
  };

  const handleEditEvent = async () => {
    if (!editingEvent || !eventTitle || !eventDateTime || !eventPlatform) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedEvent: CalendarEvent = {
      ...editingEvent,
      datetime: eventDateTime,
      platform: eventPlatform,
      content: eventContent,
    };

    const updatedCalendar = editingEvent
      ? appData.calendarEvents.map(e => e.id === editingEvent.id ? updatedEvent : e)
      : [...appData.calendarEvents, updatedEvent];
    
    await updateCalendar(updatedCalendar);
    
    resetForm();
    setIsEditDialogOpen(false);
    setEditingEvent(null);
    toast.success('Event updated successfully!');
  };

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const updatedCalendar = appData.calendarEvents.filter(e => e.id !== id);
      await updateCalendar(updatedCalendar);
      toast.success('Event deleted successfully!');
    }
  };

  const openEditDialog = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEventTitle(event.content.split('\n')[0]);
    setEventDateTime(event.datetime);
    setEventPlatform(event.platform);
    setEventContent(event.content);
    setIsEditDialogOpen(true);
  };

  const sortedEvents = [...appData.calendarEvents].sort((a, b) => 
    new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
  );

  const upcomingEvents = sortedEvents.filter(event => 
    new Date(event.datetime) > new Date()
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Calendar & Checklist</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-foreground">Add New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Event title"
                  className="bg-gray-900 border-gray-600 text-foreground"
                />
              </div>
              <div>
                <Label htmlFor="datetime">Date & Time</Label>
                <Input
                  id="datetime"
                  type="datetime-local"
                  value={eventDateTime}
                  onChange={(e) => setEventDateTime(e.target.value)}
                  className="bg-gray-900 border-gray-600 text-foreground"
                />
              </div>
              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select value={eventPlatform} onValueChange={setEventPlatform}>
                  <SelectTrigger className="bg-gray-900 border-gray-600 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="reddit">Reddit</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="onlyfans">OnlyFans</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={eventContent}
                  onChange={(e) => setEventContent(e.target.value)}
                  placeholder="Event content or description..."
                  rows={3}
                  className="bg-gray-900 border-gray-600 text-foreground"
                />
              </div>
              <Button onClick={handleAddEvent} className="w-full bg-indigo-600 hover:bg-indigo-700">
                Add Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{appData.calendarEvents.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Events</CardTitle>
            <CheckSquare className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{upcomingEvents.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-foreground">Calendar Events</CardTitle>
        </CardHeader>
        <CardContent>
          {appData.calendarEvents.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No events scheduled"
              description="Add your first event to start planning your content calendar"
              action={
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule First Event
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {sortedEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-foreground font-medium">{event.content.split('\n')[0]}</p>
                    <p className="text-muted-foreground text-sm">{new Date(event.datetime).toLocaleString()}</p>
                    <p className="text-muted-foreground text-sm">{event.platform}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(event)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Event title"
                className="bg-gray-900 border-gray-600 text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="edit-datetime">Date & Time</Label>
              <Input
                id="edit-datetime"
                type="datetime-local"
                value={eventDateTime}
                onChange={(e) => setEventDateTime(e.target.value)}
                className="bg-gray-900 border-gray-600 text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="edit-platform">Platform</Label>
              <Select value={eventPlatform} onValueChange={setEventPlatform}>
                <SelectTrigger className="bg-gray-900 border-gray-600 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="reddit">Reddit</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="onlyfans">OnlyFans</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={eventContent}
                onChange={(e) => setEventContent(e.target.value)}
                placeholder="Event content or description..."
                rows={3}
                className="bg-gray-900 border-gray-600 text-foreground"
              />
            </div>
            <Button onClick={handleEditEvent} className="w-full bg-indigo-600 hover:bg-indigo-700">
              Update Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChecklistPage;