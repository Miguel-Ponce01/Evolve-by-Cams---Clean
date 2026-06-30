'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useBooking } from '@/context/BookingContext';
import { getManilaDate } from '@/lib/business-hours';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  ArrowRight, 
  Sparkles,
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
        categoryMatch = cls.type === 'Reformer' || cls.type === 'Sculpt';
      } else if (selectedCategory === 'Conditioning') {
        categoryMatch = cls.type === 'Mat Pilates';
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
    <div className="min-h-screen bg-white text-black overflow-x-hidden font-sans">
      
      {/* Page Header Banner */}
      <section className="container mx-auto px-6 py-12 max-w-[1240px]">
        <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase leading-none text-black animate-fade-in">
          BOOK A <span className="text-[#7c8cf2]">SESSION</span>
        </h1>
      </section>

      {/* Category Grid Section (Community -> Conditioning -> Strength) */}
      <section className="container mx-auto px-6 pb-12 max-w-[1240px] grid md:grid-cols-3 gap-0 border-y border-zinc-200 animate-fade-in">
        
        {/* Card 1: Community Classes (First) */}
        <div className="border-r border-zinc-200 p-8 flex flex-col justify-between min-h-[380px] bg-white hover:bg-zinc-50 transition-colors">
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-tight text-black">Community Classes</h2>
            <div className="space-y-3 font-semibold text-xs border-y border-zinc-200 py-4 text-zinc-500">
              <p>Every day on the hour</p>
            </div>
            <p className="text-xs font-semibold leading-relaxed text-zinc-600">
              Experience the power of collective effort with our custom Workout of the Day. Push your limits alongside like-minded individuals.
            </p>
          </div>
          <button 
            onClick={() => handleCategorySelect('Community')}
            className={cn(
              "w-full py-3.5 rounded-md font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer",
              selectedCategory === 'Community'
                ? "bg-black text-white"
                : "bg-[#7c8cf2] text-white hover:bg-[#6c7ef0]"
            )}
          >
            {selectedCategory === 'Community' ? 'Viewing Community' : 'Reserve Your Spot'}
          </button>
        </div>

        {/* Card 2: Conditioning (Second) */}
        <div className="border-r border-zinc-200 p-8 flex flex-col justify-between min-h-[380px] bg-white hover:bg-zinc-50 transition-colors">
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-tight text-black">Conditioning</h2>
            <div className="space-y-3 font-semibold text-xs border-y border-zinc-200 py-4 text-zinc-500">
              <p>Weekdays at 8AM</p>
              <p>Weekends and Holidays at 10AM</p>
            </div>
            <p className="text-xs font-semibold leading-relaxed text-zinc-600">
              Push your limits with high-intensity workouts that challenge your cardiovascular endurance and build functional fitness.
            </p>
          </div>
          <button 
            onClick={() => handleCategorySelect('Conditioning')}
            className={cn(
              "w-full py-3.5 rounded-md font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer",
              selectedCategory === 'Conditioning'
                ? "bg-black text-white"
                : "bg-[#7c8cf2] text-white hover:bg-[#6c7ef0]"
            )}
          >
            {selectedCategory === 'Conditioning' ? 'Viewing Conditioning' : 'Reserve Your Spot'}
          </button>
        </div>

        {/* Card 3: Strength (Third) */}
        <div className="p-8 flex flex-col justify-between min-h-[380px] bg-white hover:bg-zinc-50 transition-colors">
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-tight text-black">Strength</h2>
            <div className="space-y-3 font-semibold text-xs border-y border-zinc-200 py-4 text-zinc-500">
              <p>Weekdays at 6AM</p>
              <p>Weekends and Holidays at 8AM</p>
            </div>
            <p className="text-xs font-semibold leading-relaxed text-zinc-600">
              Build a foundation of raw power with our comprehensive weightlifting and strength training programs.
            </p>
          </div>
          <button 
            onClick={() => handleCategorySelect('Strength')}
            className={cn(
              "w-full py-3.5 rounded-md font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer",
              selectedCategory === 'Strength'
                ? "bg-black text-white"
                : "bg-[#7c8cf2] text-white hover:bg-[#6c7ef0]"
            )}
          >
            {selectedCategory === 'Strength' ? 'Viewing Strength' : 'Reserve Your Spot'}
          </button>
        </div>

      </section>

      {/* Evolve Personal Training Block */}
      <section className="bg-[#7c8cf2] text-white py-16 px-6 text-center space-y-4">
        <h2 className="text-4xl font-black tracking-tight uppercase">
          Evolve Personal Training
        </h2>
        <p className="text-xs sm:text-sm max-w-xl mx-auto font-medium leading-relaxed text-[#e8ebfc]">
          Receive personalized guidance and tailored programs designed to unlock your individual primal potential. Our expert coaches will guide you every step of the way.
        </p>
        <div className="pt-2">
          <button 
            onClick={() => setShowPersonalTrainingModal(true)}
            className="inline-block bg-white text-[#7c8cf2] hover:bg-zinc-100 px-8 py-3.5 rounded-md font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-md cursor-pointer"
          >
            Reserve Your Spot
          </button>
        </div>
      </section>

      {/* Active Schedule & Calendar Section */}
      <section ref={scheduleSectionRef} className="container mx-auto px-6 py-16 max-w-[1240px] space-y-8 scroll-mt-24">
        
        {/* Section Title & Filter Summary */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4">
          <div className="space-y-1">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <CalendarIcon className="text-[#7c8cf2]" size={20} />
              {selectedDayInfo ? `${selectedDayInfo.dayName}, ${formatDate(selectedDate)}` : 'Select Date'}
            </h3>
            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
              Selected Category: <span className="text-[#7c8cf2]">{selectedCategory === 'All' ? 'All Classes' : selectedCategory}</span>
            </p>
          </div>

          {/* Reset Filters Option */}
          {selectedCategory !== 'All' && (
            <button 
              onClick={() => setSelectedCategory('All')}
              className="text-xs font-black uppercase tracking-wider text-[#7c8cf2] hover:text-[#6c7ef0] hover:underline cursor-pointer"
            >
              Clear Category Filter [Show All]
            </button>
          )}
        </div>

        {/* Date Selector Carousel */}
        <div className="bg-[#EEF2FF] border border-zinc-200 p-4 rounded-xl">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {calendarDays.map(day => (
              <button
                key={day.dateStr}
                onClick={() => setSelectedDate(day.dateStr)}
                className={cn(
                  "flex-1 min-w-[85px] py-3.5 px-2 rounded-lg border transition-all duration-300 flex flex-col items-center gap-1 bg-white cursor-pointer",
                  day.isTuesday
                    ? "border-dashed border-zinc-300 opacity-40 cursor-not-allowed"
                    : selectedDate === day.dateStr
                    ? "border-[#7c8cf2] bg-[#7c8cf2]/10 text-[#7c8cf2] shadow-sm"
                    : "border-zinc-200 hover:border-zinc-400 text-zinc-600"
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
                  <span className="text-[9px] font-semibold text-zinc-450">Bookable</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Locked Tuesdays Message */}
        {selectedDayInfo?.isTuesday ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-10 text-center space-y-4 max-w-lg mx-auto">
            <Lock className="text-red-500 mx-auto" size={40} />
            <h4 className="text-lg font-bold text-red-500 uppercase tracking-wide">Tuesday Lockout Active</h4>
            <p className="text-xs text-zinc-650 leading-relaxed font-semibold">
              Evolve Studio is closed every Tuesday. No class scheduling, front-desk shifts, or client bookings are permitted to be recorded for Tuesday dates. Please select another day.
            </p>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-12 text-center text-zinc-500">
            <Clock size={36} className="mx-auto mb-3 text-zinc-400" />
            <p className="text-sm font-semibold uppercase tracking-wider text-black">No classes scheduled matching your criteria.</p>
            <p className="text-xs text-zinc-400 mt-1 font-semibold">Please select a different date or clear your category filter.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map(cls => {
              const spotsRemaining = cls.totalSpots - cls.bookedSpots.length;
              const isFull = spotsRemaining <= 0;

              return (
                <div 
                  key={cls.id} 
                  className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col justify-between hover:border-[#7c8cf2] transition-all duration-300 group hover:shadow-md"
                >
                  <div className="space-y-4">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="border-zinc-200 text-zinc-500 text-[9px] font-black tracking-widest uppercase bg-zinc-50">
                        {cls.type}
                      </Badge>
                      {isFull ? (
                        <Badge className="bg-red-50 border border-red-200 text-red-500 text-[8px] font-black uppercase">
                          Waitlist Only
                        </Badge>
                      ) : (
                        <Badge className="bg-[#EEF2FF] border border-[#e0e7ff] text-[#7c8cf2] text-[8px] font-black uppercase">
                          {spotsRemaining} Spots Left
                        </Badge>
                      )}
                    </div>

                    {/* Title & Instructor */}
                    <div>
                      <h4 className="text-lg font-bold group-hover:text-[#7c8cf2] transition-colors duration-300 uppercase tracking-tight">
                        {cls.title}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                        Led by {cls.instructor.name}
                      </p>
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-zinc-500 pt-2 border-t border-zinc-100">
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-zinc-400" />
                        <span>{cls.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={12} className="text-zinc-400" />
                        <span>Capacity: {cls.totalSpots}</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking CTA Button */}
                  <div className="pt-6">
                    <Link
                      href={`/book/${cls.id}`}
                      className={cn(
                        "w-full py-3 rounded-md flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-widest transition-all",
                        isFull 
                          ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-800"
                          : "bg-[#7c8cf2] hover:bg-[#6c7ef0] text-white shadow-xs"
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

      {/* Personal Training Inquiry Modal (Periwinkle Light theme UI) */}
      {showPersonalTrainingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-8 space-y-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <MessageCircle className="text-[#7c8cf2]" size={20} />
                PT Inquiry
              </h3>
              <button 
                onClick={() => setShowPersonalTrainingModal(false)}
                className="text-zinc-400 hover:text-black font-black uppercase text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
            
            <p className="text-xs text-zinc-500 font-semibold leading-relaxed">
              Fill out this inquiry to schedule a 1-on-1 personal training session. Our coaches will review your request and reach out within 24 hours.
            </p>
            
            <form className="space-y-4 text-xs font-semibold" onSubmit={(e) => { e.preventDefault(); alert('Inquiry sent successfully!'); setShowPersonalTrainingModal(false); }}>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-zinc-500">Full Name</label>
                <input required type="text" className="w-full p-3 bg-zinc-50 border border-zinc-200 text-black rounded-md focus:outline-none focus:border-[#7c8cf2]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-zinc-500">Contact Email</label>
                <input required type="email" className="w-full p-3 bg-zinc-50 border border-zinc-200 text-black rounded-md focus:outline-none focus:border-[#7c8cf2]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-zinc-500">Preferred Time Slot</label>
                <input required type="text" placeholder="e.g. Weekdays 6:00 AM" className="w-full p-3 bg-zinc-50 border border-zinc-200 text-black rounded-md focus:outline-none focus:border-[#7c8cf2]" />
              </div>
              
              <button type="submit" className="w-full py-3.5 bg-[#7c8cf2] text-white rounded-md font-black uppercase tracking-widest text-[10px] mt-4 cursor-pointer hover:bg-[#6c7ef0] active:scale-[0.98]">
                Submit PT Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Dark Slate Footer from Mockup */}
      <footer className="bg-[#1d1e2c] border-t border-zinc-800 py-16 px-6 text-zinc-400">
        <div className="container mx-auto max-w-[1240px] space-y-12">
          
          {/* Logo row */}
          <div className="flex flex-col items-start gap-1 select-none">
            <span className="text-3xl font-light tracking-[0.25em] font-serif text-white uppercase leading-none">
              EVOLVE
            </span>
          </div>

          {/* Grid details */}
          <div className="grid sm:grid-cols-3 gap-8 pt-8 border-t border-zinc-800 text-xs font-semibold">
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#7c8cf2] block">Contact</span>
              <p className="text-zinc-300">Email: hello@figma.com</p>
              <p className="text-zinc-300">Phone: (203) 555-5555</p>
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#7c8cf2] block">Opening Hours</span>
              <div className="space-y-1 text-zinc-300">
                <p>MON - FRI: &nbsp; &nbsp; &nbsp; 5:00 - 23:00</p>
                <p>SATURDAYS: &nbsp; &nbsp; 8:00 - 16:00</p>
                <p>SUNDAYS: &nbsp; &nbsp; &nbsp; 8:00 - 13:00</p>
                <p>HOLIDAYS: &nbsp; &nbsp; &nbsp;8:00 - 16:00</p>
              </div>
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#7c8cf2] block">Social</span>
              <div className="flex flex-col gap-1.5 text-zinc-300">
                <a href="#" className="hover:underline hover:text-white">Instagram</a>
                <a href="#" className="hover:underline hover:text-white">X</a>
                <a href="#" className="hover:underline hover:text-white">LinkedIn</a>
                <a href="#" className="hover:underline hover:text-white">Spotify</a>
              </div>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
