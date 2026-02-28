import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Card, CardContent,CardHeader, CardTitle } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import { Input } from '../common/Input.jsx';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const mockEvents = [
  { id: '1', date: new Date().toDateString(), title: 'Team Meeting', time: '10:00' },
  { id: '2', date: new Date().toDateString(), title: 'Project Review', time: '14:00' },
];

export const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState(mockEvents);
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());
  const [newEvent, setNewEvent] = useState({ title: '', time: '' });

  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const addEvent = () => {
    if (newEvent.title.trim()) {
      setEvents([...events, { id: Date.now().toString(), date: selectedDate, ...newEvent }]);
      setNewEvent({ title: '', time: '' });
    }
  };

  const selectedDateEvents = events.filter(e => e.date === selectedDate);
  const calendarDays = getCalendarDays();
  const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>{monthName}</CardTitle>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="p-2 hover:bg-muted rounded transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-2 text-sm font-medium hover:bg-muted rounded transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="p-2 hover:bg-muted rounded transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

          
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, idx) => (
                <motion.button
                  key={idx}
                  whileHover={day ? { scale: 1.05 } : {}}
                  onClick={() => day && setSelectedDate(day.toDateString())}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                    !day
                      ? 'opacity-0'
                      : day.toDateString() === selectedDate
                      ? 'bg-primary text-primary-foreground'
                      : day.toDateString() === new Date().toDateString()
                      ? 'bg-muted text-foreground ring-2 ring-primary/30'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  {day && day.getDate()}
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events Sidebar */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Add Event</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
            <Input
              placeholder="Event title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            />
            <Input
              type="time"
              value={newEvent.time}
              onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
            />
            <Button onClick={addEvent} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </CardContent>
        </Card>

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {selectedDateEvents.length > 0 ? (
              selectedDateEvents.map(event => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 bg-muted rounded-lg"
                >
                  <p className="font-medium text-sm">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.time}</p>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No events</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
