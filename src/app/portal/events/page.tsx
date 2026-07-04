'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Tag, Plus, Edit2, Trash2 } from 'lucide-react';
import { useBooking } from '@/context/BookingContext';
import { Footer } from '@/components/layout/Footer';
import type { StudioEvent } from '@/types';

export default function AdminEventsPage() {
  const { events, addEvent, updateEvent, deleteEvent } = useBooking();
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 7, 1)); // Start on Aug 2026
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  // Modal Control States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<StudioEvent | null>(null);

  // Form Field States
  const [newTitle, setNewTitle] = useState('');
  const [newTag, setNewTag] = useState('Workshop');
  const [newDesc, setNewDesc] = useState('');
  const [newLocation, setNewLocation] = useState('Davao Studio (Main Hall)');
  const [newPrice, setNewPrice] = useState('₱1,500 / Entry');
  const [newInstructor, setNewInstructor] = useState('Tweety Bullecer');
  const [newSpots, setNewSpots] = useState(15);
  const [newDateStr, setNewDateStr] = useState('2026-08-15');
  const [newStartTimeStr, setNewStartTimeStr] = useState('14:00');
  const [newEndTimeStr, setNewEndTimeStr] = useState('17:00');

  // List of tags for filter sidebar
  const tagsList = useMemo(() => {
    const tags = new Set<string>();
    events.forEach(e => tags.add(e.tag));
    return ['All', ...Array.from(tags)];
  }, [events]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchTag = selectedTag === 'All' || e.tag === selectedTag;
      return matchTag;
    });
  }, [events, selectedTag]);

  // Calendar Helpers for Month View
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
  const firstDayIndex = useMemo(() => new Date(year, month, 1).getDay(), [year, month]);
  const prevMonthDays = useMemo(() => new Date(year, month, 0).getDate(), [year, month]);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Check if an event falls on a specific date
  const getEventsForDate = (dayNum: number, currentMonth: Date) => {
    return filteredEvents.filter(e => {
      const eDate = new Date(e.startTime);
      return eDate.getDate() === dayNum && 
             eDate.getMonth() === currentMonth.getMonth() && 
             eDate.getFullYear() === currentMonth.getFullYear();
    });
  };

  // Week View Calculations
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const tempDate = new Date(startOfWeek);
      tempDate.setDate(startOfWeek.getDate() + i);
      days.push(tempDate);
    }
    return days;
  }, [currentDate]);

  // Day view event selection
  const dayEvents = useMemo(() => {
    return filteredEvents.filter(e => {
      const eDate = new Date(e.startTime);
      return eDate.getDate() === currentDate.getDate() && 
             eDate.getMonth() === currentDate.getMonth() && 
             eDate.getFullYear() === currentDate.getFullYear();
    });
  }, [currentDate, filteredEvents]);

  // Formatter for calendar header
  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  // Open "Add Event" pre-seeded with date
  const handleOpenAdd = (dayNum: number) => {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(dayNum).padStart(2, '0');
    setNewDateStr(`${year}-${monthStr}-${dayStr}`);
    setNewTitle('');
    setNewDesc('');
    setIsAddOpen(true);
  };

  // Submit new event
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const startISO = new Date(`${newDateStr}T${newStartTimeStr}:00`).toISOString();
    const endISO = new Date(`${newDateStr}T${newEndTimeStr}:00`).toISOString();

    addEvent({
      title: newTitle,
      tag: newTag,
      description: newDesc,
      startTime: startISO,
      endTime: endISO,
      location: newLocation,
      price: newPrice,
      instructorName: newInstructor,
      spotsLeft: newSpots
    });

    setIsAddOpen(false);
  };

  // Open edit modal
  const handleOpenEdit = (evt: StudioEvent) => {
    setSelectedEvent(evt);
    setNewTitle(evt.title);
    setNewTag(evt.tag);
    setNewDesc(evt.description || '');
    setNewLocation(evt.location);
    setNewPrice(evt.price);
    setNewInstructor(evt.instructorName || '');
    setNewSpots(evt.spotsLeft);

    const sDate = new Date(evt.startTime);
    const mStr = String(sDate.getMonth() + 1).padStart(2, '0');
    const dStr = String(sDate.getDate()).padStart(2, '0');
    setNewDateStr(`${sDate.getFullYear()}-${mStr}-${dStr}`);

    const shStr = String(sDate.getHours()).padStart(2, '0');
    const smStr = String(sDate.getMinutes()).padStart(2, '0');
    setNewStartTimeStr(`${shStr}:${smStr}`);

    const eDate = new Date(evt.endTime);
    const ehStr = String(eDate.getHours()).padStart(2, '0');
    const emStr = String(eDate.getMinutes()).padStart(2, '0');
    setNewEndTimeStr(`${ehStr}:${emStr}`);

    setIsEditOpen(true);
  };

  // Update existing event
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    const startISO = new Date(`${newDateStr}T${newStartTimeStr}:00`).toISOString();
    const endISO = new Date(`${newDateStr}T${newEndTimeStr}:00`).toISOString();

    updateEvent(selectedEvent.id, {
      title: newTitle,
      tag: newTag,
      description: newDesc,
      startTime: startISO,
      endTime: endISO,
      location: newLocation,
      price: newPrice,
      instructorName: newInstructor,
      spotsLeft: newSpots
    });

    setIsEditOpen(false);
  };

  // Delete event
  const handleDelete = () => {
    if (!selectedEvent) return;
    deleteEvent(selectedEvent.id);
    setIsEditOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F3] overflow-x-hidden font-sans">
      
      <div className="max-w-[1240px] mx-auto px-6 py-16 md:py-24 space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-zinc-900 pb-8">
          <div className="flex items-center gap-4">
            <Link href="/portal" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-[#C9A961] hover:text-black transition-colors" aria-label="Go back to Console">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9A961] font-bold">Staff Control Console</span>
              <h1 className="text-4xl sm:text-5xl font-serif font-semibold tracking-wide uppercase text-white">Events Builder</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setNewTitle('');
                setNewDesc('');
                setNewDateStr('2026-08-15');
                setIsAddOpen(true);
              }}
              className="py-2.5 px-6 rounded-full bg-[#C9A961] hover:bg-[#b09352] text-black font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus size={14} /> Add Event
            </button>

            {/* View Toggles */}
            <div className="flex bg-zinc-900 border border-zinc-800 p-1.5 rounded-full text-xs font-black uppercase tracking-widest">
              {(['month', 'week', 'day'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setViewMode(v)}
                  className={`py-1.5 px-5 rounded-full transition-all cursor-pointer ${
                    viewMode === v 
                      ? 'bg-zinc-850 text-white font-extrabold border border-zinc-800'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Interface Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          
          {/* Left Column: Filter Sidebar */}
          <div className="lg:col-span-3 space-y-6 bg-[#121212] border border-zinc-800 p-6 rounded-xl h-fit">
            <div className="space-y-1.5">
              <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-zinc-400">Events Management</h3>
              <p className="text-[11px] text-zinc-500 leading-normal font-medium">Click empty slots to quickly draft workshops or modify schedules.</p>
            </div>
            
            <div className="flex flex-col gap-2">
              {tagsList.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`w-full text-left py-2.5 px-4 rounded-lg text-xs font-semibold uppercase tracking-widest border transition-all cursor-pointer flex justify-between items-center ${
                    selectedTag === tag 
                      ? 'bg-[#C9A961]/10 border-[#C9A961]/30 text-[#C9A961]' 
                      : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-800'
                  }`}
                >
                  <span>{tag}</span>
                  {tag !== 'All' && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-850 font-bold font-mono">
                      {events.filter(e => e.tag === tag).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Calendar Grid container */}
          <div className="lg:col-span-9 bg-[#121212] border border-zinc-800 p-6 rounded-xl space-y-6">
            
            {/* Calendar Control Row */}
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-xl sm:text-2xl font-serif font-semibold text-white">
                {viewMode === 'month' && `${monthNames[month]} ${year}`}
                {viewMode === 'week' && `Week of ${monthNames[weekDays[0].getMonth()]} ${weekDays[0].getDate()}, ${weekDays[0].getFullYear()}`}
                {viewMode === 'day' && `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`}
              </h2>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={prevMonth}
                  className="w-9 h-9 rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center hover:border-zinc-700 text-zinc-400 hover:text-white cursor-pointer transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-1.5 rounded-full bg-zinc-950 border border-zinc-900 text-[10px] font-bold uppercase tracking-wider hover:border-zinc-700 text-zinc-400 hover:text-white cursor-pointer transition-colors"
                >
                  Today
                </button>
                <button 
                  onClick={nextMonth}
                  className="w-9 h-9 rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center hover:border-zinc-700 text-zinc-400 hover:text-white cursor-pointer transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* MONTH VIEW */}
            {viewMode === 'month' && (
              <div className="space-y-1">
                <div className="grid grid-cols-7 text-center border-b border-zinc-900 pb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <span key={d} className="text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-500">
                      {d}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1.5 pt-2">
                  {[...Array(firstDayIndex)].map((_, idx) => {
                    const dayVal = prevMonthDays - firstDayIndex + idx + 1;
                    return (
                      <div key={`prev-${idx}`} className="aspect-[4/3] p-2 bg-zinc-950/20 border border-zinc-900/30 rounded-lg text-zinc-700 text-xs font-mono font-bold select-none">
                        {dayVal}
                      </div>
                    );
                  })}

                  {[...Array(daysInMonth)].map((_, idx) => {
                    const dayNum = idx + 1;
                    const dateEvents = getEventsForDate(dayNum, currentDate);
                    const isToday = new Date().getDate() === dayNum && new Date().getMonth() === month && new Date().getFullYear() === year;

                    return (
                      <div 
                        key={dayNum}
                        onClick={() => handleOpenAdd(dayNum)}
                        className={`aspect-[4/3] p-2 border rounded-lg transition-all cursor-pointer flex flex-col justify-between group ${
                          isToday 
                            ? 'bg-[#C9A961]/5 border-[#C9A961]/35 text-white' 
                            : 'bg-zinc-950 border-zinc-900 hover:border-zinc-800 text-zinc-350'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`text-xs font-mono font-black ${isToday ? 'text-[#C9A961]' : ''}`}>
                            {dayNum}
                          </span>
                          <span className="text-[9px] text-[#C9A961] opacity-0 group-hover:opacity-100 transition-opacity font-bold font-mono">
                            + Add
                          </span>
                        </div>
                        
                        <div className="space-y-1 overflow-hidden mt-1">
                          {dateEvents.slice(0, 2).map(evt => (
                            <div 
                              key={evt.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit(evt);
                              }}
                              className="text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider truncate bg-[#C9A961] text-black flex items-center justify-between"
                            >
                              <span>{evt.title}</span>
                            </div>
                          ))}
                          {dateEvents.length > 2 && (
                            <div className="text-[8px] text-[#C9A961] font-bold font-mono pl-1">
                              +{dateEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* WEEK VIEW */}
            {viewMode === 'week' && (
              <div className="grid grid-cols-7 gap-3 text-center">
                {weekDays.map((d, index) => {
                  const dayNum = d.getDate();
                  const dateEvents = getEventsForDate(dayNum, d);
                  const isToday = d.toDateString() === new Date().toDateString();

                  return (
                    <div 
                      key={index}
                      onClick={() => handleOpenAdd(dayNum)}
                      className={`p-4 rounded-xl border flex flex-col justify-between min-h-[220px] cursor-pointer group hover:border-zinc-800 ${
                        isToday 
                          ? 'bg-[#C9A961]/5 border-[#C9A961]/30' 
                          : 'bg-zinc-950 border-zinc-900'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 font-bold block">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]}
                        </span>
                        <span className={`text-lg font-mono font-black ${isToday ? 'text-[#C9A961]' : 'text-white'}`}>
                          {dayNum}
                        </span>
                      </div>

                      <div className="space-y-2 flex-1 flex flex-col justify-end mt-4">
                        {dateEvents.map(evt => (
                          <div 
                            key={evt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(evt);
                            }}
                            className="p-2 rounded bg-zinc-900 border border-zinc-850 hover:border-[#C9A961]/40 cursor-pointer text-left space-y-1 transition-all"
                          >
                            <h4 className="text-[10px] font-black uppercase tracking-wider text-white line-clamp-1">{evt.title}</h4>
                            <span className="text-[9px] text-[#C9A961] font-bold block">{evt.tag}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* DAY VIEW */}
            {viewMode === 'day' && (
              <div className="space-y-4">
                {dayEvents.length === 0 ? (
                  <div className="py-12 border border-zinc-900 rounded-xl text-center space-y-2 text-zinc-500">
                    <p className="text-xs uppercase tracking-widest font-mono font-bold">No events scheduled on this day</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dayEvents.map(evt => (
                      <div 
                        key={evt.id}
                        onClick={() => handleOpenEdit(evt)}
                        className="p-5 bg-zinc-950 border border-zinc-900 hover:border-[#C9A961]/40 rounded-xl cursor-pointer flex justify-between items-center transition-all"
                      >
                        <div className="space-y-2">
                          <span className="px-2.5 py-0.5 rounded bg-[#C9A961]/10 text-[#C9A961] text-[9px] font-black uppercase tracking-wider">
                            {evt.tag}
                          </span>
                          <h3 className="text-lg font-serif font-bold uppercase text-white">{evt.title}</h3>
                          <p className="text-xs text-zinc-500 font-medium max-w-lg leading-relaxed">{evt.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-mono text-[#C9A961] font-bold block">{evt.price}</span>
                          <span className="text-[10px] font-mono font-bold uppercase block text-zinc-400 mt-1">
                            {new Date(evt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>

      {/* ADD MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-[#121212] border border-zinc-800 w-full max-w-[500px] rounded-xl shadow-2xl p-8 space-y-4 text-left relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-serif font-semibold text-white uppercase tracking-wider mb-2">Create New Event</h3>
            
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Event Title</label>
              <input required type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Masterclass with Guest Coach" className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-sm text-zinc-300 font-semibold" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Event Tag</label>
                <select value={newTag} onChange={e => setNewTag(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-sm text-zinc-350 font-semibold cursor-pointer">
                  <option value="Workshop">Workshop</option>
                  <option value="Showcase">Showcase</option>
                  <option value="Masterclass">Masterclass</option>
                  <option value="Private Event">Private Event</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Price / Fee</label>
                <input required type="text" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="₱1,500 / Entry" className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-sm text-zinc-350 font-semibold" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Date</label>
                <input required type="date" value={newDateStr} onChange={e => setNewDateStr(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-xs text-zinc-350 font-mono" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Start Time</label>
                <input required type="time" value={newStartTimeStr} onChange={e => setNewStartTimeStr(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-xs text-zinc-350 font-mono" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">End Time</label>
                <input required type="time" value={newEndTimeStr} onChange={e => setNewEndTimeStr(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-xs text-zinc-350 font-mono" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Location / Venue</label>
                <input required type="text" value={newLocation} onChange={e => setNewLocation(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-sm text-zinc-350 font-semibold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Instructor Name</label>
                <input required type="text" value={newInstructor} onChange={e => setNewInstructor(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-sm text-zinc-350 font-semibold" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Description</label>
              <textarea rows={3} value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-sm text-zinc-350 font-semibold" />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <button type="button" onClick={() => setIsAddOpen(false)} className="py-2.5 px-5 rounded-full border border-zinc-800 text-zinc-400 hover:text-white text-xs font-black uppercase tracking-widest transition-colors cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="py-2.5 px-6 rounded-full bg-[#C9A961] hover:bg-[#b09352] text-black font-black text-xs uppercase tracking-widest transition-all cursor-pointer">
                Save Event
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT/DELETE MODAL */}
      {isEditOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleUpdate} className="bg-[#121212] border border-zinc-800 w-full max-w-[500px] rounded-xl shadow-2xl p-8 space-y-4 text-left relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-serif font-semibold text-white uppercase tracking-wider">Modify Event</h3>
              <button type="button" onClick={handleDelete} className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-full cursor-pointer transition-colors" title="Delete Event">
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Event Title</label>
              <input required type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-sm text-zinc-300 font-semibold" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Event Tag</label>
                <select value={newTag} onChange={e => setNewTag(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-sm text-zinc-350 font-semibold cursor-pointer">
                  <option value="Workshop">Workshop</option>
                  <option value="Showcase">Showcase</option>
                  <option value="Masterclass">Masterclass</option>
                  <option value="Private Event">Private Event</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 tracking-wider uppercase font-bold">Price / Fee</label>
                <input required type="text" value={newPrice} onChange={e => setNewPrice(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-sm text-zinc-350 font-semibold" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Date</label>
                <input required type="date" value={newDateStr} onChange={e => setNewDateStr(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-xs text-zinc-350 font-mono" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Start Time</label>
                <input required type="time" value={newStartTimeStr} onChange={e => setNewStartTimeStr(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-xs text-zinc-350 font-mono" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">End Time</label>
                <input required type="time" value={newEndTimeStr} onChange={e => setNewEndTimeStr(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-xs text-zinc-350 font-mono" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Location / Venue</label>
                <input required type="text" value={newLocation} onChange={e => setNewLocation(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-sm text-zinc-350 font-semibold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Instructor Name</label>
                <input required type="text" value={newInstructor} onChange={e => setNewInstructor(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-sm text-zinc-350 font-semibold" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Description</label>
              <textarea rows={3} value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-sm text-zinc-350 font-semibold" />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <button type="button" onClick={() => setIsEditOpen(false)} className="py-2.5 px-5 rounded-full border border-zinc-800 text-zinc-400 hover:text-white text-xs font-black uppercase tracking-widest transition-colors cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="py-2.5 px-6 rounded-full bg-[#C9A961] hover:bg-[#b09352] text-black font-black text-xs uppercase tracking-widest transition-all cursor-pointer">
                Update Event
              </button>
            </div>
          </form>
        </div>
      )}

      <Footer />
    </div>
  );
}
