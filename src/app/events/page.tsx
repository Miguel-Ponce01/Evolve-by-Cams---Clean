'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Tag, Info } from 'lucide-react';
import { useBooking } from '@/context/BookingContext';
import { Footer } from '@/components/layout/Footer';
import type { StudioEvent } from '@/types';

export default function EventsPage() {
  const { events } = useBooking();
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 7, 1)); // Start on Aug 2026
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedEvent, setSelectedEvent] = useState<StudioEvent | null>(null);

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
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
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

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F3] overflow-x-hidden font-sans">
      <div className="max-w-[1240px] mx-auto px-6 py-16 md:py-24 space-y-12">
        
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-zinc-900 pb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-[#C9A961] hover:text-black transition-colors" aria-label="Go back to Home">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9A961] font-bold">Client Booking Calendar</span>
              <h1 className="text-4xl sm:text-5xl font-serif font-semibold tracking-wide uppercase text-white">Events Calendar</h1>
            </div>
          </div>

          {/* View Toggles */}
          <div className="flex bg-zinc-900 border border-zinc-800 p-1.5 rounded-full text-xs font-black uppercase tracking-widest">
            {(['month', 'week', 'day'] as const).map(v => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`py-1.5 px-5 rounded-full transition-all cursor-pointer ${
                  viewMode === v 
                    ? 'bg-[#C9A961] text-black font-extrabold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Main Interface Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          
          {/* Left Column: Filter Sidebar */}
          <div className="lg:col-span-3 space-y-6 bg-[#121212] border border-zinc-800 p-6 rounded-xl h-fit">
            <div className="space-y-1.5">
              <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-zinc-400">Filter Event Types</h3>
              <p className="text-[11px] text-zinc-500 leading-normal font-medium">Narrow down showcases, masterclasses, or open workshops.</p>
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
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-serif font-semibold text-white">
                  {viewMode === 'month' && `${monthNames[month]} ${year}`}
                  {viewMode === 'week' && `Week of ${monthNames[weekDays[0].getMonth()]} ${weekDays[0].getDate()}, ${weekDays[0].getFullYear()}`}
                  {viewMode === 'day' && `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`}
                </h2>
              </div>
              
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
                {/* Days of week row */}
                <div className="grid grid-cols-7 text-center border-b border-zinc-900 pb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <span key={d} className="text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-500">
                      {d}
                    </span>
                  ))}
                </div>

                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-1.5 pt-2">
                  {/* Prev month days padding */}
                  {[...Array(firstDayIndex)].map((_, idx) => {
                    const dayVal = prevMonthDays - firstDayIndex + idx + 1;
                    return (
                      <div 
                        key={`prev-${idx}`} 
                        className="aspect-[4/3] p-2 bg-zinc-950/20 border border-zinc-900/30 rounded-lg text-zinc-700 text-xs font-mono font-bold select-none"
                      >
                        {dayVal}
                      </div>
                    );
                  })}

                  {/* Active month days */}
                  {[...Array(daysInMonth)].map((_, idx) => {
                    const dayNum = idx + 1;
                    const dateEvents = getEventsForDate(dayNum, currentDate);
                    const isToday = 
                      new Date().getDate() === dayNum && 
                      new Date().getMonth() === month && 
                      new Date().getFullYear() === year;

                    return (
                      <div 
                        key={dayNum}
                        onClick={() => {
                          const dateObj = new Date(year, month, dayNum);
                          setCurrentDate(dateObj);
                          if (dateEvents.length > 0) {
                            setSelectedEvent(dateEvents[0]);
                          }
                        }}
                        className={`aspect-[4/3] p-2 border rounded-lg transition-all cursor-pointer flex flex-col justify-between ${
                          isToday 
                            ? 'bg-[#C9A961]/5 border-[#C9A961]/30 text-white' 
                            : 'bg-zinc-950 border-zinc-900 hover:border-zinc-800 text-zinc-300'
                        }`}
                      >
                        <span className={`text-xs font-mono font-black ${isToday ? 'text-[#C9A961]' : ''}`}>
                          {dayNum}
                        </span>
                        
                        <div className="space-y-1 overflow-hidden mt-1">
                          {dateEvents.slice(0, 2).map(evt => (
                            <div 
                              key={evt.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(evt);
                              }}
                              className="text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider truncate bg-[#C9A961] text-black"
                              title={evt.title}
                            >
                              {evt.title}
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
                      className={`p-4 rounded-xl border flex flex-col justify-between min-h-[220px] ${
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
                            onClick={() => setSelectedEvent(evt)}
                            className="p-2 rounded bg-zinc-900 border border-zinc-800 hover:border-[#C9A961]/35 cursor-pointer text-left space-y-1 transition-all"
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
                    <Info size={24} className="mx-auto text-zinc-700" />
                    <p className="text-xs uppercase tracking-widest font-mono font-bold">No events scheduled on this day</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dayEvents.map(evt => (
                      <div 
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className="p-5 bg-zinc-950 border border-zinc-900 hover:border-[#C9A961]/40 rounded-xl cursor-pointer flex justify-between items-center transition-all"
                      >
                        <div className="space-y-2">
                          <span className="px-2.5 py-0.5 rounded bg-[#C9A961]/10 text-[#C9A961] text-[9px] font-black uppercase tracking-wider">
                            {evt.tag}
                          </span>
                          <h3 className="text-lg font-serif font-bold uppercase text-white">{evt.title}</h3>
                          <p className="text-xs text-zinc-500 font-medium max-w-lg leading-relaxed">{evt.description}</p>
                        </div>
                        <div className="text-right space-y-2 shrink-0">
                          <span className="text-sm font-mono text-[#C9A961] font-bold block">{evt.price}</span>
                          <span className="text-[10px] font-mono font-bold uppercase block text-zinc-400">
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

      {/* EVENT DETAIL READ-ONLY MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-[500px] rounded-xl overflow-hidden shadow-2xl p-8 space-y-6 text-left relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-1 rounded bg-[#C9A961]/10 text-[#C9A961] text-[9px] font-black uppercase tracking-wider">
                  {selectedEvent.tag}
                </span>
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="text-zinc-500 hover:text-white font-mono font-bold text-lg select-none cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <h3 className="text-2xl font-serif font-semibold uppercase text-white leading-tight">
                {selectedEvent.title}
              </h3>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium">
              {selectedEvent.description}
            </p>

            {/* Information Grid */}
            <div className="grid grid-cols-2 gap-4 border-y border-zinc-900 py-4 text-xs font-semibold text-zinc-300">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#C9A961] shrink-0" />
                <span>
                  {new Date(selectedEvent.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#C9A961] shrink-0" />
                <span className="truncate">{selectedEvent.location}</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <Tag size={14} className="text-[#C9A961] shrink-0" />
                <span>Instructor: {selectedEvent.instructorName || 'TBA'}</span>
              </div>
            </div>

            {/* Price & Book Row */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold block">Admittance</span>
                <span className="text-lg font-black text-[#C9A961] font-mono">{selectedEvent.price}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="py-2.5 px-5 rounded-full border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white text-xs font-black uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Close
                </button>
                <Link 
                  href="/book" 
                  className="py-2.5 px-6 rounded-full bg-[#C9A961] hover:bg-[#b09352] text-black font-black text-xs uppercase tracking-widest transition-all shadow-md active:scale-95"
                >
                  Book Session
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
