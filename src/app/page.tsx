'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useBooking } from '@/context/BookingContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Users, 
  DollarSign, 
  Flame, 
  Clock, 
  Filter, 
  Search, 
  Plus, 
  ClipboardList, 
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function POSDashboard() {
  const { classes, bookings, customers, waitlist } = useBooking();
  
  // Dynamic 7-day dates swiper starting today
  const dates = useMemo(() => {
    const list = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      list.push({
        day: days[d.getDay()],
        dateNum: d.getDate().toString(),
        dateStr,
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[d.getDay()],
      });
    }
    return list;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(dates[0].dateStr);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedInstructor, setSelectedInstructor] = useState<string>('All');
  const [showAvailableOnly, setShowAvailableOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Stats Calculations
  const stats = useMemo(() => {
    const todayStr = dates[0].dateStr;
    const todayClasses = classes.filter(c => c.date === todayStr);
    
    // Occupancy
    const totalSpots = todayClasses.reduce((acc, c) => acc + c.totalSpots, 0);
    const takenSpots = todayClasses.reduce((acc, c) => acc + c.bookedSpots.length, 0);
    const occupancyRate = totalSpots > 0 ? Math.round((takenSpots / totalSpots) * 100) : 0;
    
    // Bookings
    const todayBookingsCount = bookings.filter(b => b.bookedAt.split('T')[0] === todayStr && b.status !== 'cancelled').length;
    
    // Revenue
    const todayRevenue = bookings
      .filter(b => b.bookedAt.split('T')[0] === todayStr && b.status !== 'cancelled' && b.paymentMethod !== 'credit')
      .reduce((acc, b) => acc + b.amountPaid, 0);

    return {
      occupancyRate,
      todayBookingsCount,
      activeCustomers: customers.length,
      todayRevenue
    };
  }, [classes, bookings, customers, dates]);

  // Filtered classes
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      const dateMatch = cls.date === selectedDate;
      const typeMatch = selectedType === 'All' || cls.type === selectedType;
      const instructorMatch = selectedInstructor === 'All' || cls.instructor.id === selectedInstructor;
      const availabilityMatch = !showAvailableOnly || cls.bookedSpots.length < cls.totalSpots;
      
      const searchMatch = !searchQuery || 
        cls.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        cls.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());

      return dateMatch && typeMatch && instructorMatch && availabilityMatch && searchMatch;
    });
  }, [classes, selectedDate, selectedType, selectedInstructor, showAvailableOnly, searchQuery]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-[1240px] animate-slide-up">
      {/* POS Terminal Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-primary font-extrabold font-display">Front Desk Operations</span>
          <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight text-ink mt-1 uppercase">POS Terminal Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/profile" 
            className="btn-secondary-pill flex items-center justify-center gap-1.5 border border-hairline bg-white"
          >
            <Users size={16} /> Customers Registry
          </Link>
          <Link 
            href="/wallet" 
            className="btn-primary-pill flex items-center justify-center gap-1.5"
          >
            <DollarSign size={16} /> Sales Ledger
          </Link>
        </div>
      </div>

      {/* POS Administrative Stats Block */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-hairline rounded-xl p-6 transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-ink-mute font-bold uppercase tracking-wider">Today's Occupancy</p>
              <h3 className="text-3xl font-display font-black text-primary mt-2">{stats.occupancyRate}%</h3>
            </div>
            <div className="w-10 h-10 rounded-pill bg-canvas-lavender flex items-center justify-center text-primary">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-hairline rounded-xl p-6 transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-ink-mute font-bold uppercase tracking-wider">Bookings Logged</p>
              <h3 className="text-3xl font-display font-black text-primary mt-2">{stats.todayBookingsCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-pill bg-canvas-lavender flex items-center justify-center text-primary">
              <ClipboardList size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-hairline rounded-xl p-6 transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-ink-mute font-bold uppercase tracking-wider">Active Customers</p>
              <h3 className="text-3xl font-display font-black text-primary mt-2">{stats.activeCustomers}</h3>
            </div>
            <div className="w-10 h-10 rounded-pill bg-canvas-lavender flex items-center justify-center text-primary">
              <Users size={20} />
            </div>
          </div>
        </div>

        {/* Featured stat card in solid aubergine */}
        <div className="bg-surface-aubergine text-on-primary rounded-xl p-6 transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-on-aubergine-mute font-bold uppercase tracking-wider">Today's Revenue</p>
              <h3 className="text-3xl font-display font-black text-on-primary mt-2">${stats.todayRevenue}</h3>
            </div>
            <div className="w-10 h-10 rounded-pill bg-primary-press flex items-center justify-center text-on-primary">
              <DollarSign size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Date Swiper */}
      <div className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-widest text-ink-mute mb-3 font-display">Select Booking Date</h2>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-3 p-1">
            {dates.map((d, i) => (
              <button
                key={i}
                onClick={() => setSelectedDate(d.dateStr)}
                className={cn(
                  "flex flex-col items-center justify-center w-20 h-22 rounded-xl border transition-all cursor-pointer",
                  selectedDate === d.dateStr
                    ? "bg-primary text-on-primary border-primary shadow-md"
                    : "bg-white text-ink-mute border-hairline hover:border-primary/50 hover:bg-canvas-lavender/30"
                )}
              >
                <span className="text-[10px] font-extrabold uppercase tracking-wider">{d.label}</span>
                <span className="text-2xl font-display font-black mt-1">{d.dateNum}</span>
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>

      {/* Search and Filters panel */}
      <div className="bg-canvas-cream border border-hairline rounded-xl p-5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute w-4 h-4" />
            <input
              type="text"
              placeholder="Search classes or coaches..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-hairline rounded-sm focus:outline-none focus:border-primary text-ink"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-mute font-bold uppercase tracking-wider">Type:</span>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="flex-1 px-3 py-2.5 text-sm bg-white border border-hairline rounded-sm focus:outline-none focus:border-primary text-ink"
            >
              <option value="All">All Types</option>
              <option value="Reformer">Reformer</option>
              <option value="Mat Pilates">Mat Pilates</option>
              <option value="HIIT">HIIT</option>
              <option value="Yoga">Yoga</option>
              <option value="Sculpt">Sculpt</option>
            </select>
          </div>

          {/* Instructor Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-mute font-bold uppercase tracking-wider">Coach:</span>
            <select
              value={selectedInstructor}
              onChange={e => setSelectedInstructor(e.target.value)}
              className="flex-1 px-3 py-2.5 text-sm bg-white border border-hairline rounded-sm focus:outline-none focus:border-primary text-ink"
            >
              <option value="All">All Coaches</option>
              <option value="cams">Cams Rivera</option>
              <option value="sarah">Sarah Lee</option>
              <option value="alex">Alex Tran</option>
            </select>
          </div>

          {/* Available checkbox */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-ink-mute font-bold uppercase tracking-wider ml-2">
            <input
              type="checkbox"
              checked={showAvailableOnly}
              onChange={e => setShowAvailableOnly(e.target.checked)}
              className="w-4 h-4 accent-primary rounded border-hairline"
            />
            Show Open Slots Only
          </label>
        </div>
      </div>

      {/* Class Rows / Schedule List */}
      <div className="space-y-4">
        {filteredClasses.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-hairline rounded-xl bg-white/50">
            <p className="text-4xl mb-3">🗓️</p>
            <p className="text-ink-mute font-semibold uppercase tracking-wider text-sm">No sessions scheduled matching the active filters.</p>
          </div>
        ) : (
          filteredClasses.map((cls) => {
            const bookedCount = cls.bookedSpots.length;
            const isFull = bookedCount >= cls.totalSpots;
            
            // Get waitlist entries for this class
            const classWaitlist = waitlist.filter(w => w.classId === cls.id);

            return (
              <div key={cls.id} className="overflow-hidden border border-hairline bg-white rounded-xl hover:border-primary/50 transition-all hover:scale-[1.005] shadow-sm">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6 gap-6">
                  <div className="space-y-3 flex-1 min-w-0">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-primary flex items-center gap-1.5">
                          <Clock className="w-4 h-4" /> {cls.time}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-pill text-[10px] font-bold uppercase tracking-wider bg-canvas-lavender text-primary border border-primary/20">
                          {cls.type}
                        </span>
                        <span className="text-xs text-ink-mute font-medium">({cls.level})</span>
                      </div>
                      <h3 className="text-xl font-display font-black tracking-tight text-ink uppercase">{cls.title}</h3>
                      <p className="text-sm text-ink-mute mt-1">
                        Duration: {cls.duration} min &bull; Coach: <span className="font-semibold text-ink">{cls.instructor.avatar} {cls.instructor.name}</span>
                      </p>
                    </div>

                    {/* Display roster inline */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="text-ink-mute font-bold uppercase tracking-wider text-[10px]">Occupancy:</span>
                      <span className="font-semibold text-ink">{bookedCount} / {cls.totalSpots} spots taken</span>
                      
                      {bookedCount > 0 && (
                        <div className="flex -space-x-1.5 ml-2">
                          {cls.bookedSpots.map((spot, idx) => {
                            const b = bookings.find(x => x.classId === cls.id && x.spotNumber === spot && x.status !== 'cancelled');
                            return b ? (
                              <div 
                                key={idx}
                                title={`Spot #${spot}: ${b.customerName}`}
                                className="w-5 h-5 rounded-pill bg-canvas-lavender border border-primary/20 text-[9px] flex items-center justify-center font-bold text-primary"
                              >
                                {spot}
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}

                      {classWaitlist.length > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-pill text-[10px] font-bold uppercase tracking-wider bg-destructive/10 text-destructive border border-destructive/20 ml-2">
                          Waitlist: {classWaitlist.length} clients
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex lg:flex-col items-stretch lg:items-end gap-3 w-full lg:w-auto">
                    <div className="hidden lg:flex flex-col items-end">
                      {isFull ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-pill text-[10px] font-black uppercase tracking-wider bg-destructive/15 text-destructive border border-destructive/25">Class Full</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-pill text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-700 border border-emerald-500/25">
                          {cls.totalSpots - bookedCount} Slots Open
                        </span>
                      )}
                    </div>
                    
                    <Link 
                      href={`/book/${cls.id}`}
                      className={cn(
                        isFull ? "btn-secondary-pill" : "btn-primary-pill",
                        "flex-1 lg:flex-none text-center text-xs uppercase tracking-widest font-black"
                      )}
                    >
                      {isFull ? "Manage Waitlist" : "Book Spot Terminal"}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
