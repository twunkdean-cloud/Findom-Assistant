import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFindom } from '@/context/FindomContext';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Calendar, CheckSquare } from 'lucide-react';
import { CalendarEvent } from '@/types';

const ChecklistPage: React.FC = () => {
  const { appData, updateCalendar } = useFindom();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

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

    const updatedCalendar = [...appData.calendar, newEvent];
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
      ? appData.calendar.map(e => e.id === editingEvent.id ? updatedEvent : e)
      : [...appData.calendar, updatedEvent];
    
    await updateCalendar(updatedCalendar);
    
    resetForm();
    setIsEditDialogOpen(false);
    setEditingEvent(null);
    toast.success('Event updated successfully!');
  };

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const updatedCalendar = appData.calendar.filter(e => e.id !== id);
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

  const sortedEvents = [...appData.calendar].sort((a, b) => 
    new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
  );

  const upcomingEvents = sortedEvents.filter(event => 
    new Date(event.datetime) > new Date()
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-100">Calendar & Checklist</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Add Event</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Title</label>
              <Input
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Event title"
                className="bg-gray-900 border-gray-600 text-gray-200"
              />
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Date & Time</label>
              <Input
                type="datetime-local"
                value={eventDateTime}
                onChange={(e) => setEventDateTime(e.target.value)}
                className="bg-gray-900 border-gray-600 text-gray-200"
              />
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Platform</label>
              <Select value={eventPlatform} onValueChange={setEventPlatform}>
                <SelectTrigger className="bg-gray-900 border-gray-600">
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
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Content</label>
              <Textarea
                value={eventContent}
                onChange={(e) => setEventContent(e.target.value)}
                placeholder="Event content or description..."
                rows={3}
                className="w-full p-2 bg-gray-900 border-gray-600 text-gray-200"
              />
            </div>
            <Button onClick={handleAddEvent} className="w-full bg-indigo-600 hover:bg-indigo-700">
              Add Event
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No upcoming events</p>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{event.content.split('\n')[0]}</p>
                      <p className="text-gray-400 text-sm">{new Date(event.datetime).toLocaleString()}</p>
                      <p className="text-gray-500 text-sm">{event.platform}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(event)}
                        className="text-gray-400 hover:text-white"
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
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Title</label>
              <Input
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Event title"
                className="bg-gray-900 border-gray-600 text-gray-200"
              />
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Date & Time</label>
              <Input
                type="datetime-local"
                value={eventDateTime}
                onChange={(e) => setEventDateTime(e.target.value)}
                className="bg-gray-900 border-gray-600 text-gray-200"
              />
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Platform</label>
              <Select value={eventPlatform} onValueChange={setEventPlatform}>
                <SelectTrigger className="bg-gray-900 border-gray-600">
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
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Content</label>
              <Textarea
                value={eventContent}
                onChange={(e) => setEventContent(e.target.value)}
                placeholder="Event content or description..."
                rows={3}
                className="w-full p-2 bg-gray-900 border-gray-600 text-gray-200"
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