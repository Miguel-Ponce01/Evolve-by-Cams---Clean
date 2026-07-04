'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useBooking } from '@/context/BookingContext';
import { getManilaDate } from '@/lib/business-hours';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/layout/Footer';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  ArrowRight, 
  Lock,
  MessageCircle
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

export default function BookingCalendarPage() {
  const { classes } = useBooking();
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

  const selectedDayInfo = useMemo(() => {
    return calendarDays.find(d => d.dateStr === selectedDate);
  }, [calendarDays, selectedDate]);

  // Retrieve classes filtered by selected date and category type
  const filteredClasses = useMemo(() => {
    if (selectedDayInfo?.isTuesday) return [];
    
    return classes.filter(cls => {
      const dateMatch = cls.date === selectedDate;
      
      let categoryMatch = true;
      if (selectedCategory === 'Strength') {
        categoryMatch = cls.type === 'Pole Fitness' || cls.type === 'Exole' || cls.type === 'Sexy Chair';
      } else if (selectedCategory === 'Conditioning') {
        categoryMatch = cls.type === 'Aerial Sling' || cls.type === 'Aerial Sling Kids';
      } else if (selectedCategory === 'Community') {
        categoryMatch = cls.type === 'Yoga';
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

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F3] overflow-x-hidden font-sans pb-16 lg:pb-0">
      
      {/* Page Header Banner */}
      <section className="container mx-auto px-6 py-12 max-w-[1240px] text-center">
        <h1 className="text-5xl sm:text-7xl font-semibold font-serif tracking-[0.05em] uppercase text-white leading-none">
          Book a <span className="text-[#C9A961]">Session</span>
        </h1>
        <div className="w-20 h-[1px] bg-zinc-800 mx-auto mt-6" />
      </section>

      {/* Category Grid Section */}
      <section className="container mx-auto px-6 pb-12 max-w-[1240px] grid md:grid-cols-3 gap-0 border-y border-zinc-900">
        
        {/* Card 1: Community Classes */}
        <div className="border-r border-zinc-900 p-8 flex flex-col justify-between min-h-[380px] bg-black hover:bg-zinc-900/40 transition-colors">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold font-serif text-white uppercase tracking-wide">Community Classes</h2>
            <div className="space-y-3 font-semibold text-xs border-y border-zinc-900 py-4 text-zinc-400">
              <p>Every day on the hour</p>
            </div>
            <p className="text-xs font-semibold leading-relaxed text-zinc-400">
              Experience the power of collective effort with our custom Workout of the Day. Push your limits alongside like-minded individuals.
            </p>
          </div>
          <button 
            onClick={() => handleCategorySelect('Community')}
            className={cn(
              "w-full py-3.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer",
              selectedCategory === 'Community'
                ? "bg-white text-black"
                : "bg-[#C9A961] text-black hover:bg-[#b09352]"
            )}
          >
            {selectedCategory === 'Community' ? 'Viewing Community' : 'Reserve Your Spot'}
          </button>
        </div>

        {/* Card 2: Conditioning */}
        <div className="border-r border-zinc-900 p-8 flex flex-col justify-between min-h-[380px] bg-black hover:bg-zinc-900/40 transition-colors">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold font-serif text-white uppercase tracking-wide">Conditioning</h2>
            <div className="space-y-3 font-semibold text-xs border-y border-zinc-900 py-4 text-zinc-400">
              <p>Weekdays at 8AM</p>
              <p>Weekends and Holidays at 10AM</p>
            </div>
            <p className="text-xs font-semibold leading-relaxed text-zinc-400">
              Push your limits with high-intensity workouts that challenge your cardiovascular endurance and build functional fitness.
            </p>
          </div>
          <button 
            onClick={() => handleCategorySelect('Conditioning')}
            className={cn(
              "w-full py-3.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer",
              selectedCategory === 'Conditioning'
                ? "bg-white text-black"
                : "bg-[#C9A961] text-black hover:bg-[#b09352]"
            )}
          >
            {selectedCategory === 'Conditioning' ? 'Viewing Conditioning' : 'Reserve Your Spot'}
          </button>
        </div>

        {/* Card 3: Strength */}
        <div className="p-8 flex flex-col justify-between min-h-[380px] bg-black hover:bg-zinc-900/40 transition-colors">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold font-serif text-white uppercase tracking-wide">Strength</h2>
            <div className="space-y-3 font-semibold text-xs border-y border-zinc-900 py-4 text-zinc-400">
              <p>Weekdays at 6AM</p>
              <p>Weekends and Holidays at 8AM</p>
            </div>
            <p className="text-xs font-semibold leading-relaxed text-zinc-400">
              Build a foundation of raw power with our comprehensive weightlifting and strength training programs.
            </p>
          </div>
          <button 
            onClick={() => handleCategorySelect('Strength')}
            className={cn(
              "w-full py-3.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer",
              selectedCategory === 'Strength'
                ? "bg-white text-black"
                : "bg-[#C9A961] text-black hover:bg-[#b09352]"
            )}
          >
            {selectedCategory === 'Strength' ? 'Viewing Strength' : 'Reserve Your Spot'}
          </button>
        </div>

      </section>

      {/* Evolve Personal Training Block */}
      <section className="bg-[#111111] py-16 px-6 text-center space-y-4 border-b border-zinc-900">
        <h2 className="text-3xl font-semibold font-serif tracking-wide uppercase text-white">
          Evolve Personal Training
        </h2>
        <p className="text-xs sm:text-sm max-w-xl mx-auto font-medium leading-relaxed text-zinc-400">
          Receive personalized guidance and tailored programs designed to unlock your individual fitness potential. Our expert coaches will guide you every step of the way.
        </p>
        <div className="pt-2">
          <button 
            onClick={() => setShowPersonalTrainingModal(true)}
            className="inline-block bg-[#C9A961] hover:bg-[#b09352] text-black px-8 py-3.5 rounded-sm font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-md cursor-pointer"
          >
            Reserve Your Spot
          </button>
        </div>
      </section>

      {/* Active Schedule & Calendar Section */}
      <section ref={scheduleSectionRef} className="container mx-auto px-6 py-16 max-w-[1240px] space-y-8 scroll-mt-24">
        
        {/* Section Title & Filter Summary */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 pb-4">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold font-serif uppercase tracking-wide text-white flex items-center gap-2">
              <CalendarIcon className="text-[#C9A961]" size={20} />
              {selectedDayInfo ? `${selectedDayInfo.dayName}, ${formatDate(selectedDate)}` : 'Select Date'}
            </h3>
            <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
              Selected Category: <span className="text-[#C9A961]">{selectedCategory === 'All' ? 'All Classes' : selectedCategory}</span>
            </p>
          </div>

          {/* Reset Filters Option */}
          {selectedCategory !== 'All' && (
            <button 
              onClick={() => setSelectedCategory('All')}
              className="text-xs font-black uppercase tracking-wider text-[#C9A961] hover:text-[#b09352] hover:underline cursor-pointer"
            >
              Clear Category Filter [Show All]
            </button>
          )}
        </div>

        {/* Date Selector Carousel */}
        <div className="bg-[#0F0F0F] border border-zinc-900 p-4 rounded-xl">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {calendarDays.map(day => (
              <button
                key={day.dateStr}
                onClick={() => setSelectedDate(day.dateStr)}
                className={cn(
                  "flex-1 min-w-[85px] py-3.5 px-2 rounded-lg border transition-all duration-300 flex flex-col items-center gap-1 bg-black cursor-pointer",
                  day.isTuesday
                    ? "border-dashed border-zinc-900 opacity-30 cursor-not-allowed text-zinc-500"
                    : selectedDate === day.dateStr
                    ? "border-[#C9A961] bg-[#C9A961]/10 text-[#C9A961] shadow-sm"
                    : "border-zinc-900 hover:border-zinc-800 text-zinc-400"
                )}
                disabled={day.isTuesday}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider">{day.label}</span>
                <span className="text-lg font-black tracking-tight">{day.formattedDate}</span>
                {day.isTuesday ? (
                  <span className="text-[8px] uppercase tracking-widest font-black text-red-500 flex items-center gap-0.5 mt-0.5">
                    <Lock size={8} /> Closed
                  </span>
                ) : (
                  <span className="text-[9px] font-semibold text-zinc-500">Bookable</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Locked Tuesdays Message */}
        {selectedDayInfo?.isTuesday ? (
          <div className="bg-red-950/20 border border-red-900/40 rounded-2xl p-10 text-center space-y-4 max-w-lg mx-auto">
            <Lock className="text-red-500 mx-auto" size={40} />
            <h4 className="text-lg font-bold text-red-400 uppercase tracking-wide">Tuesday Lockout Active</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
              Evolve Studio is closed every Tuesday. No class scheduling, front-desk shifts, or client bookings are permitted to be recorded for Tuesday dates. Please select another day.
            </p>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="bg-[#0F0F0F] border border-zinc-900 rounded-2xl p-12 text-center text-zinc-400">
            <Clock size={36} className="mx-auto mb-3 text-zinc-500" />
            <p className="text-sm font-semibold uppercase tracking-wider text-white">No classes scheduled matching your criteria.</p>
            <p className="text-xs text-zinc-500 mt-1 font-semibold">Please select a different date or clear your category filter.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map(cls => {
              const spotsRemaining = cls.totalSpots - cls.bookedSpots.length;
              const isFull = spotsRemaining <= 0;

              return (
                <div 
                  key={cls.id} 
                  className="bg-black border border-zinc-900 rounded-xl p-6 flex flex-col justify-between hover:border-[#C9A961] transition-all duration-300 group hover:shadow-md hover:shadow-[#C9A961]/5"
                >
                  <div className="space-y-4">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="border-zinc-900 text-zinc-400 text-[9px] font-black tracking-widest uppercase bg-zinc-950">
                        {cls.type}
                      </Badge>
                      {isFull ? (
                        <Badge className="bg-red-950/20 border border-red-900/45 text-red-400 text-[8px] font-black uppercase">
                          Waitlist Only
                        </Badge>
                      ) : (
                        <Badge className="bg-[#C9A961]/10 border border-[#C9A961]/20 text-[#C9A961] text-[8px] font-black uppercase">
                          {spotsRemaining} Spots Left
                        </Badge>
                      )}
                    </div>

                    {/* Title & Instructor */}
                    <div className="text-left">
                      <h4 className="text-lg font-bold text-white group-hover:text-[#C9A961] transition-colors duration-300 uppercase tracking-tight font-serif">
                        {cls.title}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                        Led by {cls.instructor.name}
                      </p>
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-zinc-400 pt-2 border-t border-zinc-900 text-left">
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-zinc-550" />
                        <span>{cls.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={12} className="text-zinc-550" />
                        <span>Capacity: {cls.totalSpots}</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking CTA Button */}
                  <div className="pt-6">
                    <Link
                      href={`/book/${cls.id}`}
                      className={cn(
                        "w-full py-3 rounded-full flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-widest transition-all",
                        isFull 
                          ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
                          : "bg-[#C9A961] hover:bg-[#b09352] text-black shadow-xs"
                      )}
                    >
                      <span>{isFull ? 'Join Waitlist' : 'Select Mat Spot'}</span>
                      <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </section>

      {/* Personal Training Inquiry Modal */}
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

      {/* Footer */}
      <Footer />

    </div>
  );
}
