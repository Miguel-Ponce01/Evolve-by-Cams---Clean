'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useBooking } from '@/context/BookingContext';
import { INSTRUCTORS } from '@/lib/seedData';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft, Plus, Edit3, Trash2, X, Check,
  Calendar as CalendarIcon, Clock, Users, DollarSign, Tag,
  Search, Filter, ChevronDown, ChevronLeft, ChevronRight,
  AlertTriangle, Flame, Dumbbell, Sparkles, MapPin, 
  Layers, User, CalendarRange, Copy, Download, Upload, Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FitnessClass, ClassType, Instructor } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const CLASS_TYPES: ClassType[] = ['Pole Fitness', 'Aerial Sling', 'Exole', 'Sexy Chair', 'Yoga', 'Aerial Sling Kids'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'] as const;

// Time slots for vertical rows in the timetable grid
const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM',
  '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'
];

const DURATIONS = [30, 45, 50, 60, 75, 90];
type Level = typeof LEVELS[number];

// Class type color styles (sleek dark mode colors matching screenshot vibe)
const TYPE_COLORS: Record<ClassType, { bg: string, text: string, border: string, dot: string }> = {
  'Pole Fitness':      { bg: 'bg-[#C9A961]/15', text: 'text-[#C9A961]', border: 'border-[#C9A961]/30', dot: 'bg-[#C9A961]' },
  'Aerial Sling':      { bg: 'bg-sky-500/15', text: 'text-sky-400', border: 'border-sky-500/30', dot: 'bg-sky-400' },
  'Exole':             { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30', dot: 'bg-rose-400' },
  'Sexy Chair':        { bg: 'bg-pink-500/15', text: 'text-pink-400', border: 'border-pink-500/30', dot: 'bg-pink-400' },
  'Yoga':              { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  'Aerial Sling Kids': { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-400' },
};

function emptyForm() {
  const today = new Date().toISOString().split('T')[0];
  return {
    title: '',
    type: 'Pole Fitness' as ClassType,
    instructorId: INSTRUCTORS[0].id,
    date: today,
    time: '12:00 PM',
    duration: 60,
    totalSpots: 12,
    price: 35,
    level: 'All Levels' as Level,
    description: '',
    tags: '',
  };
}

export default function ScheduleBuilderPage() {
  const { classes, bookings, addClass, updateClass, deleteClass } = useBooking();

  // ── TIMETABLE DATE NAVIGATION ──────────────────────────────────────────────
  // Seed dates center around Aug 2026
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    // Find the Monday of the week of Aug 3, 2026
    const d = new Date(2026, 7, 3);
    return d;
  });

  const [selectedDay, setSelectedDay] = useState<string>('All'); // filter by specific day of week ('All', 'Mon', etc.)
  const [filterType, setFilterType] = useState<string>('All');
  const [filterInstructor, setFilterInstructor] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<FitnessClass | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FitnessClass | null>(null);
  
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [form, setForm] = useState(emptyForm());

  // Generate 7 days of the active week
  const weekDays = useMemo(() => {
    const start = new Date(currentWeekStart);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday is 1
    const monday = new Date(start.setDate(diff));

    const list = [];
    const daysName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      list.push({
        date: d,
        dateStr: d.toISOString().split('T')[0],
        dayNum: d.getDate(),
        dayName: daysName[d.getDay()],
        shortDayName: daysName[d.getDay()].substring(0, 3),
        isToday: new Date().toISOString().split('T')[0] === d.toISOString().split('T')[0]
      });
    }
    return list;
  }, [currentWeekStart]);

  // Navigate weeks
  const prevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };

  const setToday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeekStart(new Date(today.setDate(diff)));
  };

  // Mini Calendar selection helper
  const [miniCalMonth, setMiniCalMonth] = useState<Date>(new Date(2026, 7, 1));
  const miniCalDays = useMemo(() => {
    const y = miniCalMonth.getFullYear();
    const m = miniCalMonth.getMonth();
    const daysInM = new Date(y, m + 1, 0).getDate();
    const firstDay = new Date(y, m, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1; // Align to Mon

    const list = [];
    // Padding
    for (let i = 0; i < offset; i++) {
      list.push(null);
    }
    // Days
    for (let i = 1; i <= daysInM; i++) {
      list.push(new Date(y, m, i));
    }
    return list;
  }, [miniCalMonth]);

  const selectMiniCalDate = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeekStart(new Date(date.setDate(diff)));
  };

  // Filtered classes that fall within the current active week
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      // Date boundary check
      const dateInWeek = weekDays.some(wd => wd.dateStr === cls.date);
      if (!dateInWeek) return false;

      // Dropdown type filter
      if (filterType !== 'All' && cls.type !== filterType) return false;

      // Dropdown instructor filter
      if (filterInstructor !== 'All' && cls.instructor.id !== filterInstructor) return false;

      // Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = cls.title.toLowerCase().includes(query);
        const matchesInstructor = cls.instructor.name.toLowerCase().includes(query);
        const matchesType = cls.type.toLowerCase().includes(query);
        if (!matchesTitle && !matchesInstructor && !matchesType) return false;
      }

      // Day of week sidebar filter
      if (selectedDay !== 'All') {
        const clsDate = new Date(cls.date);
        const daysName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        if (daysName[clsDate.getDay()] !== selectedDay) return false;
      }

      return true;
    });
  }, [classes, weekDays, filterType, filterInstructor, searchQuery, selectedDay]);

  // ── TOAST ──────────────────────────────────────────────────────────────────
  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(''), 4000);
  }

  // ── MUTATIONS ──────────────────────────────────────────────────────────────
  function openCreate() {
    setEditingClass(null);
    setForm(emptyForm());
    setShowModal(true);
  }

  function openCreateForSlot(dateStr: string, timeStr: string) {
    setEditingClass(null);
    const defaults = emptyForm();
    defaults.date = dateStr;
    defaults.time = timeStr;
    setForm(defaults);
    setShowModal(true);
  }

  function openEdit(cls: FitnessClass) {
    setEditingClass(cls);
    setForm({
      title: cls.title,
      type: cls.type,
      instructorId: cls.instructor.id,
      date: cls.date,
      time: cls.time,
      duration: cls.duration || 60,
      totalSpots: cls.totalSpots,
      price: cls.price,
      level: cls.level as Level,
      description: cls.description || '',
      tags: cls.tags?.join(', ') || '',
    });
    setShowModal(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast('Class title is required.', 'error');
      return;
    }

    const instructor = INSTRUCTORS.find(i => i.id === form.instructorId) || INSTRUCTORS[0];
    const tagsArr = form.tags.split(',').map(t => t.trim()).filter(Boolean);

    const classData = {
      title: form.title,
      type: form.type,
      date: form.date,
      time: form.time,
      duration: Number(form.duration),
      totalSpots: Number(form.totalSpots),
      price: Number(form.price),
      level: form.level,
      description: form.description,
      tags: tagsArr,
      instructor: instructor as any,
    };

    if (editingClass) {
      updateClass(editingClass.id, classData);
      showToast(`✓ "${form.title}" updated.`);
    } else {
      addClass(classData);
      showToast(`✓ "${form.title}" created.`);
    }

    setShowModal(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const result = deleteClass(deleteTarget.id);
    if (result.success) {
      showToast(`✓ "${deleteTarget.title}" removed.`);
    } else {
      showToast(result.message, 'error');
    }
    setDeleteTarget(null);
  }

  // Duplicate current week's classes to the next week
  const duplicateWeek = () => {
    if (filteredClasses.length === 0) {
      showToast('No classes in the current week to duplicate.', 'error');
      return;
    }

    filteredClasses.forEach(cls => {
      const originalDate = new Date(cls.date);
      const nextWeekDate = new Date(originalDate);
      nextWeekDate.setDate(originalDate.getDate() + 7);
      
      const classData = {
        title: cls.title,
        type: cls.type,
        date: nextWeekDate.toISOString().split('T')[0],
        time: cls.time,
        duration: cls.duration,
        totalSpots: cls.totalSpots,
        price: cls.price,
        level: cls.level,
        description: cls.description,
        tags: cls.tags,
        instructor: cls.instructor,
      };

      addClass(classData);
    });

    showToast(`✓ Duplicated ${filteredClasses.length} classes to next week.`);
  };

  const importSchedule = () => {
    showToast('✓ Mock class schedule imported successfully!');
  };

  // Mock template downloader
  const downloadTemplate = () => {
    const content = "title,type,date,time,duration,instructorId,spots,price,level\nHot Yoga,Yoga,2026-08-10,10:00 AM,60,inst-1,24,35,All Levels";
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'class_schedule_template.csv');
    a.click();
    showToast('✓ Template downloaded.');
  };

  // Close menus on outside click
  const addMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setShowAddMenu(false);
      }
    };
    document.addEventListener('mousedown', clickHandler);
    return () => document.removeEventListener('mousedown', clickHandler);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F3] font-sans pb-16">
      
      {/* ── HEADER TOOLBAR ── */}
      <header className="border-b border-zinc-800 bg-[#0F0F0F] sticky top-0 z-30">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} />
            </Link>
            <div className="text-left">
              <span className="text-[9px] uppercase font-mono tracking-widest text-[#C9A961] font-bold">Evolve Management</span>
              <h1 className="text-lg font-black uppercase text-white tracking-wide">Timetable Grid Builder</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => showToast('✓ Current timetable changes published.')}
              className="px-4 py-1.5 rounded-full border border-zinc-850 bg-zinc-900 text-xs font-bold text-zinc-300 hover:text-white active:scale-95 transition-all cursor-pointer"
            >
              Publish
            </button>
            <div className="h-4 w-[1px] bg-zinc-800 mx-2" />
            <button 
              onClick={setToday}
              className="px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-[#C9A961] hover:bg-zinc-850 active:scale-95 transition-all cursor-pointer"
            >
              Today
            </button>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={prevWeek}
                className="w-8 h-8 rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center hover:border-zinc-700 text-zinc-400 cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-mono font-black text-white px-2">
                {weekDays[0].date.toLocaleDateString([], { month: 'short', year: 'numeric' })}
              </span>
              <button 
                onClick={nextWeek}
                className="w-8 h-8 rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center hover:border-zinc-700 text-zinc-400 cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── TOAST NOTIFICATIONS ── */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className={cn(
            "px-5 py-3 rounded-2xl border text-xs font-black uppercase tracking-wider shadow-xl flex items-center gap-2",
            toastType === 'success' ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400" : "bg-red-950/20 border-red-900/40 text-red-400"
          )}>
            <Check size={14} />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* ── MAIN WORKSPACE ── */}
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
        
        {/* ── LEFT SIDEBAR (CONTROL & FILTERS) ── */}
        <aside className="lg:col-span-3 space-y-6 text-left">
          
          {/* Add Actions Selector */}
          <div className="relative" ref={addMenuRef}>
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="w-full py-3 px-4 bg-[#C9A961] hover:bg-[#b09352] text-black font-black uppercase tracking-widest text-[10px] rounded-2xl flex items-center justify-between active:scale-[0.98] transition-all shadow-md cursor-pointer"
            >
              <span className="flex items-center gap-1.5"><Plus size={14} /> Add Action</span>
              <ChevronDown size={12} className={cn("transition-transform", showAddMenu && "rotate-185")} />
            </button>

            {showAddMenu && (
              <div className="absolute left-0 right-0 mt-2 z-40 bg-[#121212] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl p-1 animate-in fade-in slide-in-from-top-2 duration-150 text-[10px] font-black uppercase tracking-wider text-zinc-300">
                <button 
                  onClick={() => { setShowAddMenu(false); openCreate(); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#C9A961]/10 hover:text-white rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <CalendarIcon size={12} className="text-[#C9A961]" /> Class
                </button>
                <button 
                  onClick={() => { setShowAddMenu(false); showToast('✓ Appointment scheduler active.'); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#C9A961]/10 hover:text-white rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <Users size={12} className="text-[#C9A961]" /> Appointment
                </button>
                <button 
                  onClick={() => { setShowAddMenu(false); showToast('✓ Locked out time block.'); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#C9A961]/10 hover:text-white rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <Clock size={12} className="text-[#C9A961]" /> Time Block
                </button>
                <div className="h-[1px] bg-zinc-800 my-1" />
                <button 
                  onClick={() => { setShowAddMenu(false); importSchedule(); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#C9A961]/10 hover:text-white rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <Upload size={12} /> Import Schedule
                </button>
                <button 
                  onClick={() => { setShowAddMenu(false); downloadTemplate(); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#C9A961]/10 hover:text-white rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <Download size={12} /> Download Template
                </button>
                <button 
                  onClick={() => { setShowAddMenu(false); duplicateWeek(); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#C9A961]/10 hover:text-white rounded-xl flex items-center gap-2 cursor-pointer text-amber-400"
                >
                  <Copy size={12} /> Duplicate Schedule
                </button>
              </div>
            )}
          </div>

          {/* Mini Calendar Widget */}
          <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
              <span className="text-[10px] font-black uppercase text-white font-mono">
                {miniCalMonth.toLocaleDateString([], { month: 'short', year: 'numeric' })}
              </span>
              <div className="flex gap-1">
                <button 
                  onClick={() => setMiniCalMonth(new Date(miniCalMonth.getFullYear(), miniCalMonth.getMonth() - 1, 1))}
                  className="w-6 h-6 rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center hover:border-zinc-800 text-zinc-500 hover:text-white cursor-pointer"
                >
                  <ChevronLeft size={10} />
                </button>
                <button 
                  onClick={() => setMiniCalMonth(new Date(miniCalMonth.getFullYear(), miniCalMonth.getMonth() + 1, 1))}
                  className="w-6 h-6 rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center hover:border-zinc-800 text-zinc-500 hover:text-white cursor-pointer"
                >
                  <ChevronRight size={10} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-zinc-500">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <span key={i} className="py-1">{d}</span>
              ))}
              {miniCalDays.map((day, idx) => {
                if (!day) return <span key={`pad-${idx}`} />;
                const isSelected = weekDays.some(wd => wd.dateStr === day.toISOString().split('T')[0]);
                
                return (
                  <button
                    key={idx}
                    onClick={() => selectMiniCalDate(day)}
                    className={cn(
                      "w-6 h-6 rounded-md text-[9px] font-black transition-all cursor-pointer flex items-center justify-center mx-auto",
                      isSelected
                        ? "bg-[#C9A961] text-black"
                        : "text-zinc-400 hover:bg-zinc-800"
                    )}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timetable Filters Section */}
          <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-5 space-y-6">
            <div className="space-y-1">
              <span className="text-[8px] uppercase font-mono tracking-widest text-[#C9A961] font-bold">Schedule Filters</span>
              <h3 className="text-xs uppercase tracking-wider font-bold text-white">Grid Views</h3>
            </div>

            {/* Quick search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search classes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-950 border border-zinc-850 rounded-xl focus:outline-none focus:border-[#C9A961] text-white"
              />
            </div>

            {/* Day of Week filter */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-zinc-500">Focus Day</label>
              <div className="grid grid-cols-4 gap-1.5 text-[9px] font-black uppercase tracking-wider">
                {['All', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      "py-2 rounded-lg border text-center transition-all cursor-pointer active:scale-95",
                      selectedDay === day
                        ? "border-[#C9A961]/40 bg-[#C9A961]/10 text-[#C9A961]"
                        : "border-zinc-900 bg-zinc-950 text-zinc-400 hover:text-white"
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Type dropdown */}
            <div className="space-y-1.5 text-xs font-semibold">
              <label className="text-[9px] font-black uppercase text-zinc-500">Discipline</label>
              <div className="relative">
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-850 text-zinc-300 rounded-xl focus:outline-none focus:border-[#C9A961] appearance-none"
                >
                  <option value="All">All Disciplines</option>
                  {CLASS_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={14} />
              </div>
            </div>

            {/* Instructor dropdown */}
            <div className="space-y-1.5 text-xs font-semibold">
              <label className="text-[9px] font-black uppercase text-zinc-500">Coaches & Instructors</label>
              <div className="relative">
                <select
                  value={filterInstructor}
                  onChange={e => setFilterInstructor(e.target.value)}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-850 text-zinc-300 rounded-xl focus:outline-none focus:border-[#C9A961] appearance-none"
                >
                  <option value="All">All Instructors</option>
                  {INSTRUCTORS.map(i => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={14} />
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-850 flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
              <button 
                onClick={() => { setSearchQuery(''); setFilterType('All'); setFilterInstructor('All'); setSelectedDay('All'); }}
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                Reset all
              </button>
              <span className="text-zinc-400">{filteredClasses.length} found</span>
            </div>
          </div>
        </aside>

        {/* ── MAIN TIMETABLE GRID VIEW ── */}
        <main className="lg:col-span-9 bg-[#121212] border border-zinc-800 rounded-3xl p-4 sm:p-6 overflow-hidden">
          
          <div className="overflow-x-auto pb-4 scrollbar-thin">
            <div className="min-w-[1000px] table-layout-fixed w-full">
              
              {/* Day Header Row */}
              <div className="grid grid-cols-[100px_repeat(7,_1fr)] border-b border-zinc-900 pb-3 mb-2 text-center items-center">
                <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-500 font-bold">Timeline</span>
                {weekDays.map(day => (
                  <div key={day.dateStr} className={cn("py-1", day.isToday && "text-[#C9A961]")}>
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold block text-zinc-450">
                      {day.shortDayName}
                    </span>
                    <span className={cn(
                      "text-lg font-black block mt-0.5",
                      day.isToday ? "text-[#C9A961]" : "text-white"
                    )}>
                      {day.dayNum}
                    </span>
                  </div>
                ))}
              </div>

              {/* Hour Slots Matrix */}
              <div className="divide-y divide-zinc-900/60">
                {TIME_SLOTS.map(hour => (
                  <div key={hour} className="grid grid-cols-[100px_repeat(7,_1fr)] items-stretch min-h-[90px]">
                    
                    {/* Time Label cell */}
                    <div className="flex items-center justify-center border-r border-zinc-900/40 text-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 font-mono">
                        {hour}
                      </span>
                    </div>

                    {/* 7 Day cells */}
                    {weekDays.map(day => {
                      // Filter classes matching this day and this hour block
                      const cellClasses = filteredClasses.filter(cls => {
                        const dateMatch = cls.date === day.dateStr;
                        // Extract hour portion from class time (e.g. "12:00 PM" -> "12:00 PM", "12:30 PM" -> "12:00 PM")
                        const clsHourStr = cls.time.replace(/:\d+/, ':00');
                        return dateMatch && clsHourStr === hour;
                      });

                      return (
                        <div 
                          key={day.dateStr} 
                          className="border-r border-zinc-900/40 last:border-r-0 p-1.5 flex flex-col gap-1.5 justify-start bg-black/10 hover:bg-zinc-900/10 transition-colors relative min-h-[85px] group"
                        >
                          {/* Floating Create Trigger */}
                          <button
                            onClick={() => openCreateForSlot(day.dateStr, hour)}
                            className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer shadow-md"
                          >
                            <Plus size={10} />
                          </button>

                          {cellClasses.map(cls => {
                            const spots = cls.totalSpots - cls.bookedSpots.length;
                            const colors = TYPE_COLORS[cls.type] || TYPE_COLORS['Pole Fitness'];

                            return (
                              <div
                                key={cls.id}
                                className={cn(
                                  "p-2 rounded-xl border text-left flex flex-col justify-between h-full gap-2 transition-all hover:scale-[1.02] shadow-sm select-none",
                                  colors.bg, colors.border
                                )}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", colors.dot)} />
                                    <span className="text-[7px] font-mono text-zinc-400 font-bold uppercase">{cls.time}</span>
                                  </div>
                                  <h4 className={cn("text-[9px] font-black uppercase tracking-tight line-clamp-2 leading-snug", colors.text)}>
                                    {cls.title}
                                  </h4>
                                </div>

                                <div className="space-y-1 pt-1.5 border-t border-zinc-800/40 text-[7px] text-zinc-400 font-semibold">
                                  <div className="truncate">👤 {cls.instructor.name}</div>
                                  <div className="flex items-center justify-between text-zinc-500">
                                    <span>{spots}/{cls.totalSpots} left</span>
                                    <div className="flex gap-1">
                                      <button 
                                        onClick={() => openEdit(cls)}
                                        className="text-[#C9A961] hover:text-white cursor-pointer"
                                      >
                                        <Edit3 size={8} />
                                      </button>
                                      <button 
                                        onClick={() => setDeleteTarget(cls)}
                                        className="text-red-500 hover:text-white cursor-pointer"
                                      >
                                        <Trash2 size={8} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}

                  </div>
                ))}
              </div>

            </div>
          </div>

        </main>
      </div>

      {/* ── CLASS CREATION / EDITING FORM MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0F0F0F] border border-zinc-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-scale-up text-left text-white max-h-[90vh] overflow-y-auto scrollbar-thin">
            
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h3 className="text-base font-semibold font-serif uppercase tracking-widest text-[#C9A961] flex items-center gap-2">
                <CalendarIcon size={18} />
                {editingClass ? 'Edit Scheduled Class' : 'Schedule New Class'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-zinc-550 hover:text-white font-black uppercase text-[10px] tracking-wider cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Title */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Class Title</label>
                  <input
                    required
                    type="text"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Pole Tricks Masterclass"
                    className="w-full p-3 bg-black border border-zinc-900 text-white rounded-xl focus:outline-none focus:border-[#C9A961]"
                  />
                </div>

                {/* Type */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Discipline</label>
                  <div className="relative">
                    <select
                      value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value as ClassType })}
                      className="w-full p-3 bg-black border border-zinc-900 text-white rounded-xl focus:outline-none focus:border-[#C9A961] appearance-none"
                    >
                      {CLASS_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={14} />
                  </div>
                </div>

                {/* Instructor */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Coach / Instructor</label>
                  <div className="relative">
                    <select
                      value={form.instructorId}
                      onChange={e => setForm({ ...form, instructorId: e.target.value })}
                      className="w-full p-3 bg-black border border-zinc-900 text-white rounded-xl focus:outline-none focus:border-[#C9A961] appearance-none"
                    >
                      {INSTRUCTORS.map(i => (
                        <option key={i.id} value={i.id}>{i.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={14} />
                  </div>
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Date</label>
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full p-3 bg-black border border-zinc-900 text-white rounded-xl focus:outline-none focus:border-[#C9A961]"
                  />
                </div>

                {/* Time */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Start Time</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. 10:00 AM"
                    value={form.time}
                    onChange={e => setForm({ ...form, time: e.target.value })}
                    className="w-full p-3 bg-black border border-zinc-900 text-white rounded-xl focus:outline-none focus:border-[#C9A961]"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Duration (mins)</label>
                  <div className="relative">
                    <select
                      value={form.duration}
                      onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
                      className="w-full p-3 bg-black border border-zinc-900 text-white rounded-xl focus:outline-none focus:border-[#C9A961] appearance-none"
                    >
                      {DURATIONS.map(d => (
                        <option key={d} value={d}>{d} mins</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={14} />
                  </div>
                </div>

                {/* Level */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Difficulty Level</label>
                  <div className="relative">
                    <select
                      value={form.level}
                      onChange={e => setForm({ ...form, level: e.target.value as Level })}
                      className="w-full p-3 bg-black border border-zinc-900 text-white rounded-xl focus:outline-none focus:border-[#C9A961] appearance-none"
                    >
                      {LEVELS.map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={14} />
                  </div>
                </div>

                {/* Total Spots */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Total Capacity</label>
                  <input
                    required
                    type="number"
                    value={form.totalSpots}
                    onChange={e => setForm({ ...form, totalSpots: Number(e.target.value) })}
                    className="w-full p-3 bg-black border border-zinc-900 text-white rounded-xl focus:outline-none focus:border-[#C9A961]"
                  />
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Admittance Price ($)</label>
                  <input
                    required
                    type="number"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full p-3 bg-black border border-zinc-900 text-white rounded-xl focus:outline-none focus:border-[#C9A961]"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Class Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Provide details about the class routine, prerequisite moves, or notes..."
                    rows={3}
                    className="w-full p-3 bg-black border border-zinc-900 text-white rounded-xl focus:outline-none focus:border-[#C9A961] resize-none"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Search tags (comma separated)</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={e => setForm({ ...form, tags: e.target.value })}
                    placeholder="e.g. choreography, splits, spinning"
                    className="w-full p-3 bg-black border border-zinc-900 text-white rounded-xl focus:outline-none focus:border-[#C9A961]"
                  />
                </div>

              </div>

              <button 
                type="submit" 
                className="w-full py-3.5 bg-[#C9A961] text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-[#b09352] active:scale-[0.98] transition-all cursor-pointer mt-4"
              >
                {editingClass ? 'Save Changes' : 'Schedule Class'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION DIALOG ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0F0F0F] border border-zinc-900 rounded-3xl max-w-sm w-full p-6 space-y-5 text-center shadow-2xl">
            <AlertTriangle className="text-red-500 mx-auto" size={36} />
            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-white uppercase tracking-wider">Delete Scheduled Class?</h4>
              <p className="text-xs text-zinc-400 leading-normal">
                Are you sure you want to remove <span className="text-white font-bold">"{deleteTarget.title}"</span>? This will cancel all client bookings associated with this session.
              </p>
            </div>
            <div className="flex gap-2 text-xs font-black uppercase tracking-widest pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-full border border-zinc-800 text-zinc-450 hover:text-white cursor-pointer"
              >
                No, Keep
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-full bg-red-655 hover:bg-red-750 text-white cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
