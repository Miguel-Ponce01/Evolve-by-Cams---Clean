'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Tag, Info, 
  Users, ArrowRight, Lock, MessageCircle, HelpCircle, Sparkles, List, LayoutGrid
} from 'lucide-react';
import { useBooking } from '@/context/BookingContext';
import { getManilaDate } from '@/lib/business-hours';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/layout/Footer';
import { cn, formatDate } from '@/lib/utils';
import type { StudioEvent } from '@/types';
import BookingFlow from '@/app/book/[classId]/BookingTerminal';

export default function EventsPage() {
  // --- EVENTS CALENDAR STATE & LOGIC ---
  const { events, classes } = useBooking();
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 7, 1)); // Start on Aug 2026
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedEvent, setSelectedEvent] = useState<StudioEvent | null>(null);
  
  const [bookingWidgetMode, setBookingWidgetMode] = useState<'button' | 'frame'>('button');
  const [activeEmbeddedClassId, setActiveEmbeddedClassId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mode = localStorage.getItem('evolve_settings_booking_mode') as any || 'button';
      setBookingWidgetMode(mode);
    }
  }, []);

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


  // --- CLASS BOOKING STATE & LOGIC ---
  const scheduleSectionRef = useRef<HTMLDivElement>(null);

  // Generate the next 7 days, skipping Tuesdays in selector
  const calendarDays = useMemo(() => {
    const list = [];
    const daysName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const mDate = getManilaDate(d);
      
      list.push({
        date: d,
        dateStr: d.toISOString().split('T')[0],
        dayName: daysName[mDate.dayOfWeek],
        isTuesday: mDate.dayOfWeek === 2,
        formattedDate: `${mDate.month}/${mDate.day}`,
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : daysName[mDate.dayOfWeek].substring(0, 3),
      });
    }
    return list;
  }, []);

  const initialDateStr = useMemo(() => {
    const activeDay = calendarDays.find(d => !d.isTuesday);
    return activeDay ? activeDay.dateStr : calendarDays[0].dateStr;
  }, [calendarDays]);

  const [selectedDate, setSelectedDate] = useState<string>(initialDateStr);
  const [selectedCategory, setSelectedCategory] = useState<string>('All'); // 'All', 'Strength', 'Conditioning', 'Community'
  const [showPersonalTrainingModal, setShowPersonalTrainingModal] = useState(false);
  const [bookingViewMode, setBookingViewMode] = useState<'grid' | 'list'>('list');

  const selectedDayInfo = useMemo(() => {
    return calendarDays.find(d => d.dateStr === selectedDate);
  }, [calendarDays, selectedDate]);

  // Retrieve classes filtered by selected date and category type
  const filteredClasses = useMemo(() => {
    if (selectedDayInfo?.isTuesday) return [];
    
    return classes.filter(cls => {
      const dateMatch = cls.date === selectedDate;
      
      let categoryMatch = true;
      if (selectedCategory === 'Pole Fitness') {
        categoryMatch = cls.type === 'Pole Fitness' || cls.type === 'Exole' || cls.type === 'Sexy Chair' || (cls.type as string) === 'Acro Chair';
      } else if (selectedCategory === 'Personal Training') {
        categoryMatch = cls.title.toLowerCase().includes('private') || cls.title.toLowerCase().includes('personal');
      } else if (selectedCategory === 'Master Class') {
        categoryMatch = cls.title.toLowerCase().includes('master') || (cls as any).class_type === 'special';
      } else if (selectedCategory === 'Community Class') {
        categoryMatch = cls.title.toLowerCase().includes('group') || cls.title.toLowerCase().includes('community') || cls.type === 'Aerial Sling';
      } else if (selectedCategory === 'SOLE') {
        categoryMatch = cls.type === 'Yoga' || cls.title.toLowerCase().includes('sole') || cls.type === 'Aerial Sling Kids';
      }
      
      return dateMatch && categoryMatch;
    }).sort((a, b) => a.time.localeCompare(b.time));
  }, [classes, selectedDate, selectedCategory, selectedDayInfo]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    // Smooth scroll down to schedule calendar section
    setTimeout(() => {
      scheduleSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Scroll to booking section if url contains #book-class
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#book-class') {
      setTimeout(() => {
        const el = document.getElementById('book-class');
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F3] overflow-x-hidden font-sans">
      <div className="max-w-[1240px] mx-auto px-6 py-12 md:py-16 space-y-16">
        
        {/* --- SECTION 1: EVENTS CALENDAR --- */}
        <section className="space-y-12">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-zinc-900 pb-8">
            <div className="flex items-center gap-4">
              <Link href="/" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-[#C9A961] hover:text-black transition-colors active:scale-[0.96]" aria-label="Go back to Home">
                <ArrowLeft size={16} />
              </Link>
              <div className="text-left">
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
                  className={`py-1.5 px-5 rounded-full transition-all cursor-pointer active:scale-[0.96] ${
                    viewMode === v 
                      ? 'bg-[#C9A961] text-black font-extrabold shadow-sm'
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
            <div className="lg:col-span-3 space-y-6 bg-[#121212] border border-zinc-800 p-6 rounded-2xl h-fit">
              <div className="space-y-1.5">
                <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-zinc-400">Filter Event Types</h3>
                <p className="text-[11px] text-zinc-500 leading-normal font-medium text-wrap-pretty">Narrow down showcases, masterclasses, or open workshops.</p>
              </div>
              
              <div className="flex flex-col gap-2">
                {tagsList.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all cursor-pointer flex justify-between items-center active:scale-[0.98] ${
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
            <div className="lg:col-span-9 bg-[#121212] border border-zinc-800 p-6 rounded-2xl space-y-6">
              
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
                    className="w-9 h-9 rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center hover:border-zinc-700 text-zinc-400 hover:text-white cursor-pointer transition-colors active:scale-[0.96]"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={() => setCurrentDate(new Date())}
                    className="px-4 py-1.5 rounded-full bg-zinc-950 border border-zinc-900 text-[10px] font-bold uppercase tracking-wider hover:border-zinc-700 text-zinc-400 hover:text-white cursor-pointer transition-colors active:scale-[0.96]"
                  >
                    Today
                  </button>
                  <button 
                    onClick={nextMonth}
                    className="w-9 h-9 rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center hover:border-zinc-700 text-zinc-400 hover:text-white cursor-pointer transition-colors active:scale-[0.96]"
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

                  {/* Calendar Matrix */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Padding cells from previous month */}
                    {Array.from({ length: firstDayIndex }).map((_, idx) => {
                      const dayNum = prevMonthDays - firstDayIndex + idx + 1;
                      return (
                        <div key={`prev-${idx}`} className="min-h-[85px] p-2 bg-zinc-950/20 border border-zinc-900/40 rounded-lg text-zinc-700 text-xs">
                          {dayNum}
                        </div>
                      );
                    })}

                    {/* Current Month Active Days */}
                    {Array.from({ length: daysInMonth }).map((_, idx) => {
                      const dayNum = idx + 1;
                      const dayEvents = getEventsForDate(dayNum, currentDate);
                      const isToday = new Date().getDate() === dayNum && 
                                      new Date().getMonth() === month && 
                                      new Date().getFullYear() === year;

                      return (
                        <div 
                          key={`curr-${idx}`} 
                          className={cn(
                            "min-h-[85px] p-2 border rounded-lg flex flex-col justify-between transition-colors relative group",
                            isToday ? "border-[#C9A961] bg-[#C9A961]/5" : "border-zinc-900 bg-zinc-950 hover:border-zinc-800"
                          )}
                        >
                          <span className={cn(
                            "text-xs font-black",
                            isToday ? "text-[#C9A961]" : "text-zinc-400 group-hover:text-white"
                          )}>
                            {dayNum}
                          </span>

                          <div className="space-y-1 mt-1">
                            {dayEvents.map(e => (
                              <button
                                key={e.id}
                                onClick={() => setSelectedEvent(e)}
                                className="w-full text-left truncate text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-[#C9A961] text-black border border-transparent hover:scale-105 active:scale-95 transition-all cursor-pointer leading-tight"
                              >
                                {e.title}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* WEEK VIEW */}
              {viewMode === 'week' && (
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((wDay, idx) => {
                    const wDayEvents = filteredEvents.filter(e => {
                      const eDate = new Date(e.startTime);
                      return eDate.getDate() === wDay.getDate() && 
                             eDate.getMonth() === wDay.getMonth() && 
                             eDate.getFullYear() === wDay.getFullYear();
                    });

                    return (
                      <div key={idx} className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 min-h-[220px] flex flex-col gap-3">
                        <div className="border-b border-zinc-900 pb-1.5 text-left">
                          <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-[#C9A961]">
                            {wDay.toLocaleDateString([], { weekday: 'short' })}
                          </span>
                          <h4 className="text-base font-black text-white">{wDay.getDate()}</h4>
                        </div>
                        <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto">
                          {wDayEvents.map(e => (
                            <button
                              key={e.id}
                              onClick={() => setSelectedEvent(e)}
                              className="text-left p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-[9px] font-bold uppercase tracking-wider text-zinc-300 hover:text-white hover:border-[#C9A961] cursor-pointer transition-all active:scale-[0.98]"
                            >
                              <div className="truncate font-serif text-white">{e.title}</div>
                              <div className="text-[7px] text-[#C9A961] mt-0.5">
                                {new Date(e.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* DAY VIEW */}
              {viewMode === 'day' && (
                <div className="space-y-3">
                  {dayEvents.length === 0 ? (
                    <div className="p-12 text-center bg-zinc-950 border border-zinc-900 rounded-xl text-zinc-500 text-xs font-semibold">
                      No events scheduled for this day.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dayEvents.map(e => (
                        <div 
                          key={e.id} 
                          className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 flex flex-col justify-between hover:border-[#C9A961] transition-all text-left"
                        >
                          <div className="space-y-2">
                            <span className="text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#C9A961]/10 text-[#C9A961] border border-[#C9A961]/25">
                              {e.tag}
                            </span>
                            <h3 className="text-lg font-bold text-white font-serif uppercase tracking-tight">{e.title}</h3>
                            <p className="text-[11px] text-zinc-450 leading-relaxed font-semibold">{e.description}</p>
                          </div>
                          <div className="pt-4 flex items-center justify-between border-t border-zinc-900 mt-4">
                            <span className="text-xs font-black text-[#C9A961] font-mono">{e.price}</span>
                            <button
                              onClick={() => setSelectedEvent(e)}
                              className="py-1.5 px-4 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-white hover:border-[#C9A961] cursor-pointer transition-all active:scale-95"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </section>

        {/* --- SECTION 2: CLASS BOOKING INTERFACE --- */}
        <section id="book-class" className="scroll-mt-24 space-y-12 pt-8 border-t border-zinc-900">
          
          {/* Header */}
          <div className="text-center max-w-xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#C9A961]/10 border border-[#C9A961]/20 flex items-center justify-center text-[#C9A961] mx-auto animate-pulse">
              <Sparkles size={20} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-semibold tracking-[0.05em] uppercase text-white leading-tight">
              Book a <span className="text-[#C9A961]">Regular Class</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-zinc-550 uppercase tracking-widest font-black leading-relaxed">
              Choose your discipline below and check our live scheduling slots
            </p>
          </div>

          {/* Category Grid Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-0 border border-zinc-900 rounded-3xl overflow-hidden">
            {[
              { 
                cat: 'Pole Fitness', 
                desc: 'Spinning, static, & floor flow', 
                body: 'Empowering spins, fluid transitions, and functional core strength. Suitable for beginners to advanced athletes.', 
                btnText: 'Select Pole' 
              },
              { 
                cat: 'Personal Training', 
                desc: '1-on-1 custom conditioning', 
                body: 'Accelerate your progress with certified coaches. Receive direct form corrections and custom fitness choreography.', 
                btnText: 'Select PT' 
              },
              { 
                cat: 'Master Class', 
                desc: 'Advanced choreo & splits', 
                body: 'Challenging workshops led by expert trainers to polish complex wraps, drops, dynamic poses, and advanced execution.', 
                btnText: 'Select Master' 
              },
              { 
                cat: 'Community Class', 
                desc: 'High-vibe group classes', 
                body: 'Experience the power of collective movement. High-intensity group wraps and silks with peer support.', 
                btnText: 'Select Group' 
              },
              { 
                cat: 'SOLE', 
                desc: 'Yoga flow & stretching', 
                body: 'Deep alignment, stretching, splits work, and active yoga flow to relieve muscles and protect joint health.', 
                btnText: 'Select SOLE' 
              }
            ].map((item, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "p-5 flex flex-col justify-between min-h-[360px] bg-black transition-colors border-r border-zinc-900 last:border-r-0 hover:bg-zinc-900/20",
                  selectedCategory === item.cat && "bg-zinc-900/10"
                )}
              >
                <div className="space-y-4 text-left">
                  <h2 className="text-lg font-bold font-serif text-white uppercase tracking-tight">{item.cat}</h2>
                  <div className="font-semibold text-[9px] border-y border-zinc-900 py-3 text-[#C9A961] uppercase tracking-wider">
                    {item.desc}
                  </div>
                  <p className="text-[10px] sm:text-[11px] leading-relaxed text-zinc-450 font-medium text-wrap-pretty">
                    {item.body}
                  </p>
                </div>
                <button 
                  onClick={() => handleCategorySelect(item.cat)}
                  className={cn(
                    "w-full py-2.5 rounded-full font-black text-[9px] uppercase tracking-widest transition-all cursor-pointer active:scale-95",
                    selectedCategory === item.cat
                      ? "bg-white text-black"
                      : "bg-[#C9A961] text-black hover:bg-[#b09352]"
                  )}
                >
                  {selectedCategory === item.cat ? `Viewing ${item.cat.split(' ')[0]}` : item.btnText}
                </button>
              </div>
            ))}
          </div>

          {/* Active Schedule & Calendar Section */}
          <div ref={scheduleSectionRef} className="space-y-6 scroll-mt-24">
            
            {/* Section Title & Filter Summary */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 pb-4">
              <div className="space-y-1 text-left">
                <h3 className="text-lg font-semibold font-serif uppercase tracking-wide text-white flex items-center gap-2">
                  <Calendar className="text-[#C9A961]" size={18} />
                  {selectedDayInfo ? `${selectedDayInfo.dayName}, ${formatDate(selectedDate)}` : 'Select Date'}
                </h3>
                <p className="text-[10px] text-zinc-450 font-semibold uppercase tracking-wider">
                  Selected Category: <span className="text-[#C9A961]">{selectedCategory === 'All' ? 'All Classes' : selectedCategory}</span>
                </p>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                {selectedCategory !== 'All' && (
                  <button 
                    onClick={() => setSelectedCategory('All')}
                    className="text-[10px] font-black uppercase tracking-wider text-[#C9A961] hover:text-[#b09352] hover:underline cursor-pointer active:scale-95 transition-all"
                  >
                    Clear Filter
                  </button>
                )}

                {/* View Toggle (List/Grid) */}
                <div className="flex bg-zinc-950 border border-zinc-900 p-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                  <button
                    onClick={() => setBookingViewMode('list')}
                    className={cn(
                      "py-1.5 px-3 rounded-full transition-all cursor-pointer flex items-center gap-1 active:scale-95",
                      bookingViewMode === 'list'
                        ? "bg-[#C9A961] text-black font-extrabold"
                        : "text-zinc-400 hover:text-white"
                    )}
                  >
                    <List size={10} />
                    <span>List</span>
                  </button>
                  <button
                    onClick={() => setBookingViewMode('grid')}
                    className={cn(
                      "py-1.5 px-3 rounded-full transition-all cursor-pointer flex items-center gap-1 active:scale-95",
                      bookingViewMode === 'grid'
                        ? "bg-[#C9A961] text-black font-extrabold"
                        : "text-zinc-400 hover:text-white"
                    )}
                  >
                    <LayoutGrid size={10} />
                    <span>Grid</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Date Selector Carousel */}
            <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-2xl">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {calendarDays.map(day => (
                  <button
                    key={day.dateStr}
                    onClick={() => setSelectedDate(day.dateStr)}
                    className={cn(
                      "flex-1 min-w-[85px] py-3.5 px-2 rounded-xl border transition-all duration-300 flex flex-col items-center gap-1 bg-black cursor-pointer active:scale-95",
                      day.isTuesday
                        ? "border-dashed border-zinc-900 opacity-20 cursor-not-allowed text-zinc-550"
                        : selectedDate === day.dateStr
                        ? "border-[#C9A961] bg-[#C9A961]/10 text-[#C9A961] shadow-sm"
                        : "border-zinc-900 hover:border-zinc-800 text-zinc-450"
                    )}
                    disabled={day.isTuesday}
                  >
                    <span className="text-[9px] uppercase font-bold tracking-wider">{day.label}</span>
                    <span className="text-base font-black tracking-tight">{day.formattedDate}</span>
                    {day.isTuesday ? (
                      <span className="text-[8px] uppercase tracking-widest font-black text-red-500 flex items-center gap-0.5 mt-0.5">
                        <Lock size={8} /> Closed
                      </span>
                    ) : (
                      <span className="text-[8px] font-semibold text-zinc-500">Bookable</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Locked Tuesdays Message */}
            {selectedDayInfo?.isTuesday ? (
              <div className="bg-red-950/10 border border-red-900/30 rounded-2xl p-8 text-center space-y-3 max-w-md mx-auto">
                <Lock className="text-red-500 mx-auto" size={32} />
                <h4 className="text-base font-bold text-red-400 uppercase tracking-wide">Tuesday Lockout Active</h4>
                <p className="text-[11px] text-zinc-450 leading-relaxed font-semibold">
                  Evolve Studio is closed every Tuesday. Please select another date from the calendar to view and book classes.
                </p>
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-10 text-center text-zinc-500">
                <Clock size={32} className="mx-auto mb-3 text-zinc-650" />
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">No classes scheduled matching your criteria.</p>
                <p className="text-[10px] text-zinc-550 mt-1 font-semibold">Please select a different date or clear your category filter.</p>
              </div>
            ) : bookingViewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3 overflow-x-auto pb-4 scrollbar-thin">
                {calendarDays.map(day => {
                  // Get classes scheduled for this specific day
                  const dayClasses = classes.filter(cls => {
                    const dateMatch = cls.date === day.dateStr;
                    
                    let categoryMatch = true;
                    if (selectedCategory === 'Pole Fitness') {
                      categoryMatch = cls.type === 'Pole Fitness' || cls.type === 'Exole' || cls.type === 'Sexy Chair' || (cls.type as string) === 'Acro Chair';
                    } else if (selectedCategory === 'Personal Training') {
                      categoryMatch = cls.title.toLowerCase().includes('private') || cls.title.toLowerCase().includes('personal');
                    } else if (selectedCategory === 'Master Class') {
                      categoryMatch = cls.title.toLowerCase().includes('master') || (cls as any).class_type === 'special';
                    } else if (selectedCategory === 'Community Class') {
                      categoryMatch = cls.title.toLowerCase().includes('group') || cls.title.toLowerCase().includes('community') || cls.type === 'Aerial Sling';
                    } else if (selectedCategory === 'SOLE') {
                      categoryMatch = cls.type === 'Yoga' || cls.title.toLowerCase().includes('sole') || cls.type === 'Aerial Sling Kids';
                    }
                    
                    return dateMatch && categoryMatch;
                  }).sort((a, b) => a.time.localeCompare(b.time));

                  return (
                    <div key={day.dateStr} className="min-w-[150px] bg-zinc-950 border border-zinc-900 rounded-2xl p-3 flex flex-col gap-3">
                      {/* Column Date Header */}
                      <div className="border-b border-zinc-900 pb-2 text-center">
                        <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-[#C9A961]">
                          {day.label}
                        </span>
                        <h4 className="text-lg font-black text-white">{day.formattedDate.split('/')[1]}</h4>
                      </div>

                      {/* Column Classes list */}
                      <div className="flex-1 flex flex-col gap-2 overflow-y-auto min-h-[250px]">
                        {day.isTuesday ? (
                          <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-zinc-900 bg-zinc-950/20 text-zinc-600 flex-1 min-h-[120px]">
                            <Lock size={12} className="text-red-500/40 mb-1" />
                            <span className="text-[8px] uppercase tracking-widest font-black">Closed</span>
                          </div>
                        ) : dayClasses.length === 0 ? (
                          <div className="text-center p-4 text-[9px] text-zinc-650 font-bold border border-zinc-900 rounded-xl bg-zinc-950/20 flex-1 flex items-center justify-center min-h-[120px]">
                            Empty
                          </div>
                        ) : (
                          dayClasses.map(cls => {
                            const spotsRemaining = cls.totalSpots - cls.bookedSpots.length;
                            const isFull = spotsRemaining <= 0;

                            const isFrameMode = bookingWidgetMode === 'frame';
                            const CardWrapper: any = isFrameMode ? 'button' : Link;
                            const wrapperProps = isFrameMode 
                              ? { onClick: () => setActiveEmbeddedClassId(cls.id), type: 'button' as const }
                              : { href: `/book/${cls.id}` };

                            return (
                              <CardWrapper
                                key={cls.id}
                                {...wrapperProps}
                                className="w-full block text-left p-2.5 rounded-xl border border-zinc-900 bg-black hover:border-[#C9A961] transition-all cursor-pointer space-y-1.5 group active:scale-[0.98]"
                              >
                                <div>
                                  <div className="text-[9px] font-black uppercase text-white truncate group-hover:text-[#C9A961] transition-colors leading-tight">
                                    {cls.title}
                                  </div>
                                  <div className="text-[7px] text-[#C9A961] font-bold uppercase tracking-wider mt-0.5">
                                    {cls.time} &middot; {cls.duration || 60}m
                                  </div>
                                </div>
                                
                                <div className="text-[8px] text-zinc-400 font-semibold truncate">
                                  Led by {cls.instructor.name}
                                </div>

                                <div className="flex justify-between items-center text-[7px] text-zinc-550 pt-1 border-t border-zinc-900 mt-1">
                                  <span className="truncate max-w-[50px]">{cls.type}</span>
                                  {isFull ? (
                                    <span className="text-red-500 font-bold uppercase">Full</span>
                                  ) : (
                                    <span className="text-[#C9A961] font-bold uppercase">{spotsRemaining} left</span>
                                  )}
                                </div>
                              </CardWrapper>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredClasses.map(cls => {
                  const spotsRemaining = cls.totalSpots - cls.bookedSpots.length;
                  const isFull = spotsRemaining <= 0;

                  return (
                    <div 
                      key={cls.id} 
                      className="bg-black border border-zinc-900 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#C9A961] transition-all duration-300 group hover:shadow-md hover:shadow-[#C9A961]/5 text-left"
                    >
                      {/* Left Side: Time column */}
                      <div className="sm:border-r border-zinc-900 sm:pr-8 min-w-[110px]">
                        <div className="text-base sm:text-lg font-black text-white group-hover:text-[#C9A961] transition-colors">
                          {cls.time}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide mt-0.5">
                          {cls.duration || 60} mins
                        </div>
                      </div>

                      {/* Middle: Info and Availability Column */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="border-zinc-900 text-zinc-450 text-[8px] font-black tracking-widest uppercase bg-zinc-950">
                            {cls.type}
                          </Badge>
                          {isFull ? (
                            <Badge className="bg-red-950/20 border border-red-900/40 text-red-400 text-[8px] font-black uppercase">
                              Waitlist Only
                            </Badge>
                          ) : (
                            <Badge className="bg-[#C9A961]/10 border border-[#C9A961]/20 text-[#C9A961] text-[8px] font-black uppercase">
                              {spotsRemaining} Spots Left
                            </Badge>
                          )}
                        </div>

                        <div>
                          <h4 className="text-base font-bold text-white uppercase tracking-tight font-serif">
                            {cls.title}
                          </h4>
                          <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1 font-semibold">
                            Led by {cls.instructor.name}
                          </p>
                        </div>
                      </div>

                      {/* Right: Select button column */}
                      <div className="sm:pl-4 min-w-[145px]">
                        {bookingWidgetMode === 'frame' ? (
                          <button
                            onClick={() => setActiveEmbeddedClassId(cls.id)}
                            className={cn(
                              "w-full py-2.5 px-6 rounded-full flex items-center justify-center gap-1 text-[9px] font-black uppercase tracking-widest transition-all active:scale-[0.98] cursor-pointer border-none outline-none",
                              isFull 
                                ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
                                : "bg-[#C9A961] hover:bg-[#b09352] text-black shadow-xs"
                            )}
                          >
                            <span>{isFull ? 'Join Waitlist' : 'Select Spot'}</span>
                            <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        ) : (
                          <Link
                            href={`/book/${cls.id}`}
                            className={cn(
                              "w-full py-2.5 px-6 rounded-full flex items-center justify-center gap-1 text-[9px] font-black uppercase tracking-widest transition-all active:scale-[0.98] cursor-pointer",
                              isFull 
                                ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
                                : "bg-[#C9A961] hover:bg-[#b09352] text-black shadow-xs"
                            )}
                          >
                            <span>{isFull ? 'Join Waitlist' : 'Select Spot'}</span>
                            <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </section>
      </div>

      {/* --- EVENT INFO DRAWER/MODAL --- */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0F0F0F] border border-zinc-900 rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 text-left text-white relative">
            
            {/* Header */}
            <div className="space-y-2 border-b border-zinc-900 pb-4">
              <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-[#C9A961] px-2 py-0.5 rounded bg-[#C9A961]/10 border border-[#C9A961]/35">
                {selectedEvent.tag}
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-semibold tracking-wide uppercase text-white pt-2 leading-tight">
                {selectedEvent.title}
              </h3>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium text-wrap-pretty">
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
                <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold block">Admittance</span>
                <span className="text-base font-black text-[#C9A961] font-mono">{selectedEvent.price}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="py-2.5 px-4 rounded-full border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer active:scale-95"
                >
                  Close
                </button>
                <Link 
                  href={`/events#book-class`}
                  onClick={() => setSelectedEvent(null)}
                  className="py-2.5 px-5 rounded-full bg-[#C9A961] hover:bg-[#b09352] text-black font-black text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95"
                >
                  Book Session
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- PERSONAL TRAINING MODAL --- */}
      {showPersonalTrainingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0F0F0F] border border-zinc-900 rounded-2xl max-w-md w-full p-8 space-y-6 shadow-2xl animate-scale-up text-left">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h3 className="text-lg font-semibold font-serif uppercase tracking-wide text-white flex items-center gap-2">
                <MessageCircle className="text-[#C9A961]" size={20} />
                PT Inquiry
              </h3>
              <button 
                onClick={() => setShowPersonalTrainingModal(false)}
                className="text-zinc-500 hover:text-white font-black uppercase text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
            
            <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
              Fill out this inquiry to schedule a 1-on-1 personal training session. Our coaches will review your request and reach out within 24 hours.
            </p>
            
            <form className="space-y-4 text-xs font-semibold" onSubmit={(e) => { e.preventDefault(); alert('Inquiry sent successfully!'); setShowPersonalTrainingModal(false); }}>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-zinc-450">Full Name</label>
                <input required type="text" className="w-full p-3 bg-black border border-zinc-900 text-white rounded-md focus:outline-none focus:border-[#C9A961]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-zinc-450">Contact Email</label>
                <input required type="email" className="w-full p-3 bg-black border border-zinc-900 text-white rounded-md focus:outline-none focus:border-[#C9A961]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-zinc-450">Preferred Time Slot</label>
                <input required type="text" placeholder="e.g. Weekdays 6:00 AM" className="w-full p-3 bg-black border border-zinc-900 text-white rounded-md focus:outline-none focus:border-[#C9A961]" />
              </div>
              
              <button type="submit" className="w-full py-3.5 bg-[#C9A961] text-black rounded-md font-black uppercase tracking-widest text-[10px] mt-4 cursor-pointer hover:bg-[#b09352] active:scale-[0.98]">
                Submit PT Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Embedded Booking Flow Frame Modal Overlay */}
      {activeEmbeddedClassId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fade-in text-left">
          <div className="w-full max-w-4xl bg-black border border-zinc-900 rounded-3xl p-6 relative overflow-y-auto max-h-[90vh] shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-4 mb-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-[#C9A961]">Embedded Booking Flow</h3>
              <button
                onClick={() => setActiveEmbeddedClassId(null)}
                className="px-4 py-2 rounded-full border border-zinc-805 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-[9px] font-black uppercase tracking-widest cursor-pointer"
              >
                Exit Booking
              </button>
            </div>
            <div>
              <BookingFlow overrideClassId={activeEmbeddedClassId} />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
