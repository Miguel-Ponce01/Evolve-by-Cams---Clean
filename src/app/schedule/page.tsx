'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useBooking } from '@/context/BookingContext';
import { INSTRUCTORS } from '@/lib/seedData';
import { formatDate } from '@/lib/utils';
import { CustomSelect } from '@/components/ui/custom-select';
import {
  ArrowLeft, Plus, Edit3, Trash2, X, Check,
  Calendar, Clock, Users, DollarSign, Tag,
  Search, Filter, ChevronDown, AlertTriangle,
  Dumbbell, Flame, Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FitnessClass, ClassType, Instructor } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const CLASS_TYPES: ClassType[] = ['Reformer', 'Mat Pilates', 'HIIT', 'Yoga', 'Sculpt'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'] as const;
const TIME_SLOTS = [
  '6:00 AM','7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM',
  '12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM',
  '6:00 PM','7:00 PM','8:00 PM',
];
const DURATIONS = [30, 45, 50, 60, 75, 90];

type Level = typeof LEVELS[number];

const TYPE_COLORS: Record<ClassType, string> = {
  Reformer:     'bg-violet-500/10 text-violet-700 border-violet-500/20',
  'Mat Pilates':'bg-sky-500/10 text-sky-700 border-sky-500/20',
  HIIT:         'bg-red-500/10 text-red-700 border-red-500/20',
  Yoga:         'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  Sculpt:       'bg-amber-500/10 text-amber-700 border-amber-500/20',
};

const TYPE_ICONS: Record<ClassType, React.ReactNode> = {
  Reformer:     <Dumbbell size={12} />,
  'Mat Pilates':<Sparkles size={12} />,
  HIIT:         <Flame size={12} />,
  Yoga:         <Sparkles size={12} />,
  Sculpt:       <Flame size={12} />,
};

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY FORM STATE
// ─────────────────────────────────────────────────────────────────────────────

function emptyForm() {
  const today = new Date().toISOString().split('T')[0];
  return {
    title: '',
    type: 'Reformer' as ClassType,
    instructorId: INSTRUCTORS[0].id,
    date: today,
    time: '7:00 AM',
    duration: 50,
    totalSpots: 12,
    price: 35,
    level: 'All Levels' as Level,
    description: '',
    tags: '',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function ScheduleBuilderPage() {
  const { classes, bookings, addClass, updateClass, deleteClass } = useBooking();

  // ── UI state ──────────────────────────────────────────────────────────────
  const [searchQuery,      setSearchQuery]      = useState('');
  const [filterType,       setFilterType]       = useState<string>('All');
  const [filterInstructor, setFilterInstructor] = useState<string>('All');
  const [filterDateFrom,   setFilterDateFrom]   = useState<string>('');
  const [filterDateTo,     setFilterDateTo]     = useState<string>('');
  const [filterLowOccupancy, setFilterLowOccupancy] = useState(false);

  const [showModal,    setShowModal]    = useState(false);
  const [editingClass, setEditingClass] = useState<FitnessClass | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FitnessClass | null>(null);
  const [toastMsg,     setToastMsg]     = useState('');
  const [toastType,    setToastType]    = useState<'success' | 'error'>('success');

  // ── Form state ────────────────────────────────────────────────────────────
  const [form, setForm] = useState(emptyForm());

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(''), 4000);
  }

  function getActiveBookingCount(classId: string) {
    return bookings.filter(b => b.classId === classId && b.status !== 'cancelled').length;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FILTERED CLASSES
  // ─────────────────────────────────────────────────────────────────────────

  const sortedFiltered = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return classes
      .filter(cls => {
        const matchType  = filterType === 'All' || cls.type === filterType;
        const matchInstr = filterInstructor === 'All' || cls.instructor.id === filterInstructor;
        const matchFrom  = !filterDateFrom || cls.date >= filterDateFrom;
        const matchTo    = !filterDateTo   || cls.date <= filterDateTo;
        const matchSearch = !searchQuery ||
          cls.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cls.instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cls.type.toLowerCase().includes(searchQuery.toLowerCase());
        const occupancyPct = cls.totalSpots > 0 ? (cls.bookedSpots.length / cls.totalSpots) : 1;
        const matchLow = !filterLowOccupancy || (occupancyPct < 0.30 && cls.date >= todayStr);
        return matchType && matchInstr && matchFrom && matchTo && matchSearch && matchLow;
      })
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      });
  }, [classes, filterType, filterInstructor, filterDateFrom, filterDateTo, searchQuery, filterLowOccupancy]);

  // ─────────────────────────────────────────────────────────────────────────
  // OPEN MODAL (create or edit)
  // ─────────────────────────────────────────────────────────────────────────

  function openCreate() {
    setEditingClass(null);
    setForm(emptyForm());
    setShowModal(true);
  }

  function openEdit(cls: FitnessClass) {
    setEditingClass(cls);
    setForm({
      title:        cls.title,
      type:         cls.type,
      instructorId: cls.instructor.id,
      date:         cls.date,
      time:         cls.time,
      duration:     cls.duration,
      totalSpots:   cls.totalSpots,
      price:        cls.price,
      level:        cls.level,
      description:  cls.description,
      tags:         cls.tags.join(', '),
    });
    setShowModal(true);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SAVE (create or update)
  // ─────────────────────────────────────────────────────────────────────────

  function handleSave() {
    if (!form.title.trim()) {
      showToast('Class title is required.', 'error');
      return;
    }
    if (!form.date) {
      showToast('Date is required.', 'error');
      return;
    }

    const instructor = INSTRUCTORS.find(i => i.id === form.instructorId) as Instructor;
    const tagsArray  = form.tags.split(',').map(t => t.trim()).filter(Boolean);

    const classData: Omit<FitnessClass, 'id' | 'bookedSpots'> = {
      title:       form.title.trim(),
      type:        form.type,
      instructor,
      date:        form.date,
      time:        form.time,
      duration:    form.duration,
      totalSpots:  form.totalSpots,
      price:       form.price,
      level:       form.level,
      description: form.description.trim(),
      tags:        tagsArray,
    };

    if (editingClass) {
      updateClass(editingClass.id, classData);
      showToast(`✓ "${form.title}" updated successfully.`);
    } else {
      addClass(classData);
      showToast(`✓ "${form.title}" added to schedule.`);
    }

    setShowModal(false);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE
  // ─────────────────────────────────────────────────────────────────────────

  function handleDelete() {
    if (!deleteTarget) return;
    const result = deleteClass(deleteTarget.id);
    if (result.success) {
      showToast(`✓ "${deleteTarget.title}" removed from schedule.`);
    } else {
      showToast(result.message, 'error');
    }
    setDeleteTarget(null);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SELECT OPTIONS
  // ─────────────────────────────────────────────────────────────────────────

  const typeOptions    = [{ value: 'All', label: 'All Types' }, ...CLASS_TYPES.map(t => ({ value: t, label: t }))];
  const instrOptions   = [{ value: 'All', label: 'All Coaches' }, ...INSTRUCTORS.map(i => ({ value: i.id, label: `${i.avatar} ${i.name}` }))];
  const formTypeOpts   = CLASS_TYPES.map(t => ({ value: t, label: t }));
  const formInstrOpts  = INSTRUCTORS.map(i => ({ value: i.id, label: `${i.avatar} ${i.name}` }));
  const formLevelOpts  = LEVELS.map(l => ({ value: l, label: l }));
  const formTimeOpts   = TIME_SLOTS.map(t => ({ value: t, label: t }));
  const formDurationOpts = DURATIONS.map(d => ({ value: String(d), label: `${d} min` }));

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/"
          className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors text-foreground"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <span className="text-xs uppercase font-mono tracking-widest text-primary font-bold">POS Administration</span>
          <h1 className="text-3xl font-heading font-black tracking-wide uppercase">Class Schedule Builder</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold uppercase tracking-wider rounded-pill hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
        >
          <Plus size={15} /> New Class
        </button>
      </div>

      {/* ── Toast ── */}
      {toastMsg && (
        <div className={cn(
          'mb-5 p-3 rounded-xl border text-sm font-semibold animate-slide-up',
          toastType === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700'
            : 'bg-red-500/10 border-red-500/30 text-red-700'
        )}>
          {toastMsg}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="bg-white border border-border rounded-2xl p-4 mb-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search classes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
            />
          </div>
          {/* Type filter */}
          <CustomSelect value={filterType} onChange={setFilterType} options={typeOptions} placeholder="All Types" />
          {/* Instructor filter */}
          <CustomSelect value={filterInstructor} onChange={setFilterInstructor} options={instrOptions} placeholder="All Coaches" />
          {/* Date range */}
          <div className="flex items-center gap-2 lg:col-span-2">
            <input
              type="date"
              value={filterDateFrom}
              onChange={e => setFilterDateFrom(e.target.value)}
              className="flex-1 px-2 py-2 text-xs bg-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-foreground font-mono"
            />
            <span className="text-muted-foreground text-xs font-mono shrink-0">to</span>
            <input
              type="date"
              value={filterDateTo}
              onChange={e => setFilterDateTo(e.target.value)}
              className="flex-1 px-2 py-2 text-xs bg-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-foreground font-mono"
            />
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground font-semibold">
            Showing <span className="text-foreground font-bold">{sortedFiltered.length}</span> of <span className="text-foreground font-bold">{classes.length}</span> classes
          </p>
          <div className="flex items-center gap-2">
            {/* Low Occupancy Filter Toggle */}
            <button
              onClick={() => setFilterLowOccupancy(v => !v)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer',
                filterLowOccupancy
                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                  : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
              )}
            >
              <AlertTriangle size={11} />
              Review Weak Classes
            </button>
            {(searchQuery || filterType !== 'All' || filterInstructor !== 'All' || filterDateFrom || filterDateTo || filterLowOccupancy) && (
              <button
                onClick={() => { setSearchQuery(''); setFilterType('All'); setFilterInstructor('All'); setFilterDateFrom(''); setFilterDateTo(''); setFilterLowOccupancy(false); }}
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary cursor-pointer flex items-center gap-1"
              >
                <X size={11} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Class Table ── */}
      <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm">
        {sortedFiltered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">📅</p>
            <p className="font-heading font-black text-lg uppercase">No Classes Found</p>
            <p className="text-sm text-muted-foreground mt-1 mb-5">
              {classes.length === 0
                ? 'No classes in schedule yet. Click "New Class" to add one.'
                : 'No classes match your current filters.'}
            </p>
            {classes.length === 0 && (
              <button
                onClick={openCreate}
                className="px-5 py-2.5 bg-primary text-white text-sm font-bold uppercase rounded-pill cursor-pointer hover:bg-primary/90 transition-all"
              >
                <Plus size={14} className="inline mr-1.5" /> Add First Class
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-secondary/40 border-b border-border font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  <th className="p-3 pl-5">Class</th>
                  <th className="p-3">Coach</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3 text-center">Spots</th>
                  <th className="p-3 text-center">Booked</th>
                  <th className="p-3 text-right">Price</th>
                  <th className="p-3 text-center">Level</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {sortedFiltered.map(cls => {
                  const bookedCount  = getActiveBookingCount(cls.id);
                  const occupancyPct = cls.totalSpots > 0 ? Math.round((bookedCount / cls.totalSpots) * 100) : 0;
                  const isFull       = bookedCount >= cls.totalSpots;
                  const isLow        = occupancyPct < 30 && cls.totalSpots > 0;
                  const isPast       = cls.date < new Date().toISOString().split('T')[0];

                  return (
                    <tr
                      key={cls.id}
                      className={cn('transition-colors hover:bg-secondary/20', isPast && 'opacity-60')}
                    >
                      {/* Class info */}
                      <td className="p-3 pl-5">
                        <div className="flex items-start gap-2.5">
                          <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold shrink-0 mt-0.5', TYPE_COLORS[cls.type])}>
                            {TYPE_ICONS[cls.type]} {cls.type}
                          </span>
                          <div>
                            <p className="font-bold text-foreground text-[13px] leading-tight">{cls.title}</p>
                            {cls.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {cls.tags.slice(0, 3).map(tag => (
                                  <span key={tag} className="text-[9px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded font-mono">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Coach */}
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{cls.instructor.avatar}</span>
                          <span className="font-semibold text-foreground whitespace-nowrap">{cls.instructor.name}</span>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="p-3">
                        <p className="font-bold text-foreground font-mono">{formatDate(cls.date)}</p>
                        <p className="text-muted-foreground">{cls.time} · {cls.duration}min</p>
                      </td>

                      {/* Total Spots */}
                      <td className="p-3 text-center">
                        <span className="font-bold text-foreground">{cls.totalSpots}</span>
                      </td>

                      {/* Booked / Occupancy */}
                      <td className="p-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={cn('font-bold', isFull ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-emerald-600')}>
                            {bookedCount}/{cls.totalSpots}
                          </span>
                          <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={cn('h-full rounded-full transition-all', isFull ? 'bg-red-500' : isLow ? 'bg-amber-400' : 'bg-emerald-500')}
                              style={{ width: `${occupancyPct}%` }}
                            />
                          </div>
                          {isLow && !isPast && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300 text-[9px] font-black uppercase tracking-wider">
                              <AlertTriangle size={9} /> Low Occupancy (&lt;30%)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="p-3 text-right">
                        <span className="font-bold text-foreground font-mono">₱{cls.price}</span>
                      </td>

                      {/* Level */}
                      <td className="p-3 text-center">
                        <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wide whitespace-nowrap">
                          {cls.level}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEdit(cls)}
                            className="w-7 h-7 rounded-full bg-secondary hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors cursor-pointer text-foreground"
                            title="Edit Class"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(cls)}
                            className="w-7 h-7 rounded-full bg-secondary hover:bg-red-500/10 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer text-foreground"
                            title="Delete Class"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          MODAL: Create / Edit Class
      ───────────────────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in-0 duration-150">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-border/60 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
                  {editingClass ? 'Edit Class' : 'New Class'}
                </p>
                <h2 className="font-heading font-black text-xl uppercase">
                  {editingClass ? editingClass.title : 'Schedule a Class'}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-secondary hover:bg-destructive/10 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">

              {/* Row 1: Title + Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Class Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Full Body Reformer"
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-sm font-semibold text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Class Type *</label>
                  <CustomSelect value={form.type} onChange={v => setForm(f => ({ ...f, type: v as ClassType }))} options={formTypeOpts} placeholder="Select Type" />
                </div>
              </div>

              {/* Row 2: Instructor + Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Coach / Instructor *</label>
                  <CustomSelect value={form.instructorId} onChange={v => setForm(f => ({ ...f, instructorId: v }))} options={formInstrOpts} placeholder="Select Coach" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Difficulty Level</label>
                  <CustomSelect value={form.level} onChange={v => setForm(f => ({ ...f, level: v as Level }))} options={formLevelOpts} placeholder="All Levels" />
                </div>
              </div>

              {/* Row 3: Date + Time + Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-sm font-mono text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Start Time *</label>
                  <CustomSelect value={form.time} onChange={v => setForm(f => ({ ...f, time: v }))} options={formTimeOpts} placeholder="Select Time" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Duration</label>
                  <CustomSelect
                    value={String(form.duration)}
                    onChange={v => setForm(f => ({ ...f, duration: Number(v) }))}
                    options={formDurationOpts}
                    placeholder="50 min"
                  />
                </div>
              </div>

              {/* Row 4: Spots + Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                    <Users size={11} className="inline mr-1" /> Total Spots (Capacity)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={form.totalSpots}
                    onChange={e => setForm(f => ({ ...f, totalSpots: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-sm font-mono text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                    <DollarSign size={11} className="inline mr-1" /> Drop-in Price (₱)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={5}
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-sm font-mono text-foreground"
                  />
                </div>
              </div>

              {/* Row 5: Description */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Class Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="Describe what clients can expect in this class..."
                  className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-foreground resize-none"
                />
              </div>

              {/* Row 6: Tags */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  <Tag size={11} className="inline mr-1" /> Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="e.g. Core, Low Impact, Strength"
                  className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-foreground font-mono"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-border/60 px-6 py-4 flex items-center justify-end gap-3 rounded-b-3xl">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 rounded-pill bg-secondary text-foreground text-xs font-bold uppercase tracking-wider hover:bg-secondary/80 transition-all cursor-pointer border border-border"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-pill bg-primary text-white text-xs font-bold uppercase tracking-wider hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Check size={13} />
                {editingClass ? 'Save Changes' : 'Create Class'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          MODAL: Delete Confirmation
      ───────────────────────────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in-0 duration-150">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="text-red-500" size={18} />
              </div>
              <div>
                <h3 className="font-heading font-black text-lg uppercase">Delete Class?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Are you sure you want to remove <strong className="text-foreground">{deleteTarget.title}</strong> on {formatDate(deleteTarget.date)} from the schedule?
                </p>
              </div>
            </div>

            {getActiveBookingCount(deleteTarget.id) > 0 && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-3 mb-4 text-sm text-red-700 font-semibold">
                ⚠ This class has <strong>{getActiveBookingCount(deleteTarget.id)} active booking(s)</strong>. Deletion will be blocked. Cancel those bookings first.
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2 rounded-pill bg-secondary text-foreground text-xs font-bold uppercase tracking-wider hover:bg-secondary/80 transition-all cursor-pointer border border-border"
              >
                Keep It
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 rounded-pill bg-red-500 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-600 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
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
