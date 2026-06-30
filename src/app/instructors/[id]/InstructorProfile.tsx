'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { INSTRUCTORS } from '@/lib/seedData';
import { useBooking } from '@/context/BookingContext';
import { formatDate, cn } from '@/lib/utils';
import {
  ArrowLeft, Star, Instagram, TrendingUp, Users, BarChart3, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const GRADIENT_MAP: Record<string, string> = {
  cams:  'linear-gradient(135deg, #7C3AED, #F59E0B)',
  sarah: 'linear-gradient(135deg, #10B981, #3B82F6)',
  alex:  'linear-gradient(135deg, #EF4444, #EC4899)',
};

export default function InstructorProfile() {
  const params = useParams();
  const id = params?.id as string;
  const { classes, bookings, transactions } = useBooking();
  const instructor = INSTRUCTORS.find(i => i.id === id);

  const instructorClasses = useMemo(() => {
    return classes
      .filter(c => c.instructor.id === id)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      });
  }, [classes, id]);

  const todayStr = new Date().toISOString().split('T')[0];
  const totalClasses = instructorClasses.length;

  const avgOccupancy = useMemo(() => {
    if (instructorClasses.length === 0) return 0;
    const totalBooked = instructorClasses.reduce((sum, c) => {
      const active = bookings.filter(b => b.classId === c.id && b.status !== 'cancelled').length;
      return sum + active;
    }, 0);
    const totalCapacity = instructorClasses.reduce((sum, c) => sum + c.totalSpots, 0);
    return totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;
  }, [instructorClasses, bookings]);

  const revenueGenerated = useMemo(() => {
    const classIds = new Set(instructorClasses.map(c => c.id));
    return transactions
      .filter(t => {
        if (t.status !== 'paid') return false;
        if (!t.bookingId) return false;
        const relatedBooking = bookings.find(b => b.id === t.bookingId);
        return relatedBooking ? classIds.has(relatedBooking.classId) : false;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [instructorClasses, transactions, bookings]);

  if (!instructor) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="font-bold text-foreground">Instructor not found.</p>
        <Link href="/instructors" className="text-primary hover:underline text-sm mt-2 inline-block">Back to Coaches Roster</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <Link href="/instructors" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Coaches Roster
      </Link>

      <div className="rounded-3xl overflow-hidden border border-border shadow-sm mb-6">
        <div className="relative h-40 flex items-end p-6" style={{ background: GRADIENT_MAP[instructor.id] || GRADIENT_MAP.cams }}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 flex items-end gap-5">
            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center text-6xl shadow-xl">{instructor.avatar}</div>
            <div className="pb-1">
              <span className="text-white/80 text-[10px] font-mono uppercase tracking-widest font-bold">POS Coaches</span>
              <h1 className="text-3xl font-heading font-black text-white uppercase tracking-wide drop-shadow">{instructor.name}</h1>
              <p className="text-white/80 text-xs font-bold">{instructor.specialty}</p>
            </div>
          </div>
          <div className="absolute top-4 right-5 flex items-center gap-2 z-10">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-sm text-white text-xs font-bold font-mono">
              <Star size={11} className="fill-amber-400 text-amber-400" />{instructor.rating.toFixed(2)}
            </div>
            <a href={`https://instagram.com/${instructor.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white hover:text-primary transition-all">
              <Instagram size={14} />
            </a>
          </div>
        </div>
        <div className="bg-white px-6 py-4"><p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{instructor.bio}</p></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center"><TrendingUp size={16} className="text-emerald-600" /></div>
            <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Revenue Generated</span>
          </div>
          <p className="text-3xl font-heading font-black text-foreground">{revenueGenerated > 0 ? `P${revenueGenerated.toLocaleString()}` : 'P0'}</p>
          <p className="text-[10px] text-muted-foreground font-semibold mt-1">From paid bookings</p>
        </div>
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center"><BarChart3 size={16} className="text-primary" /></div>
            <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Avg Occupancy</span>
          </div>
          <p className={cn('text-3xl font-heading font-black', avgOccupancy >= 80 ? 'text-emerald-600' : avgOccupancy >= 50 ? 'text-foreground' : 'text-amber-600')}>{avgOccupancy}%</p>
          <div className="w-full h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
            <div className={cn('h-full rounded-full transition-all', avgOccupancy >= 80 ? 'bg-emerald-500' : avgOccupancy >= 50 ? 'bg-primary' : 'bg-amber-400')} style={{ width: `${avgOccupancy}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground font-semibold mt-1">Booked / Total Capacity</p>
        </div>
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center"><Users size={16} className="text-violet-600" /></div>
            <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Classes Scheduled</span>
          </div>
          <p className="text-3xl font-heading font-black text-foreground">{totalClasses}</p>
          <p className="text-[10px] text-muted-foreground font-semibold mt-1">All-time class sessions</p>
        </div>
      </div>

      <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Performance Timeline</span>
            <h2 className="text-base font-heading font-black uppercase text-foreground">Class Schedule Results</h2>
          </div>
          <Badge variant="outline" className="font-mono text-xs">{totalClasses} sessions</Badge>
        </div>
        {instructorClasses.length === 0 ? (
          <div className="text-center py-16"><p className="font-bold text-foreground">No scheduled classes yet.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-secondary/40 border-b border-border font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  <th className="p-3 pl-5">Date</th>
                  <th className="p-3">Class</th>
                  <th className="p-3 text-center">Fill Rate</th>
                  <th className="p-3 text-center">Occupancy</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {instructorClasses.map(cls => {
                  const activeBookings = bookings.filter(b => b.classId === cls.id && b.status !== 'cancelled').length;
                  const occupancyPct = cls.totalSpots > 0 ? Math.round((activeBookings / cls.totalSpots) * 100) : 0;
                  const isHigh = occupancyPct >= 80;
                  const isLow = occupancyPct < 30;
                  const isPast = cls.date < todayStr;
                  return (
                    <tr key={cls.id} className={cn('transition-colors', isHigh && !isPast ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-secondary/20', isPast && 'opacity-60')}>
                      <td className="p-3 pl-5">
                        <p className="font-bold text-foreground font-mono">{formatDate(cls.date)}</p>
                        <p className="text-muted-foreground">{cls.time} &middot; {cls.duration}min</p>
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-foreground">{cls.title}</p>
                        <p className="text-muted-foreground">{cls.type} &middot; {cls.level}</p>
                        {isLow && !isPast && (
                          <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300 text-[9px] font-black uppercase tracking-wider">
                            <AlertTriangle size={8} /> Low Occupancy
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className={cn('font-bold font-mono text-sm', isHigh ? 'text-emerald-600' : isLow ? 'text-amber-600' : 'text-foreground')}>{activeBookings}/{cls.totalSpots}</span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={cn('text-xs font-black', isHigh ? 'text-emerald-600' : isLow ? 'text-amber-600' : 'text-foreground')}>{occupancyPct}%</span>
                          <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div className={cn('h-full rounded-full', isHigh ? 'bg-emerald-500' : isLow ? 'bg-amber-400' : 'bg-primary')} style={{ width: `${occupancyPct}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        {isPast ? (
                          <Badge className="bg-secondary text-muted-foreground border-border text-[9px] font-black uppercase">Past</Badge>
                        ) : (
                          <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 text-[9px] font-black uppercase">
                            <CheckCircle2 size={9} className="mr-0.5" /> Upcoming
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
