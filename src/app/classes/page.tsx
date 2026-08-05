'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  LayoutGrid, 
  List, 
  Table as TableIcon, 
  Search, 
  Filter, 
  X, 
  Check, 
  Clock, 
  User, 
  Tag, 
  ChevronRight, 
  SlidersHorizontal,
  Info,
  Sparkles,
  Zap
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { cn } from '@/lib/utils';

export interface ClassOffering {
  id: string;
  title: string;
  subtitle: string;
  category: 'Pole Fitness' | 'Aerial Sling' | 'Exole' | 'Yoga' | 'Sexy Chair' | 'Acro Chair' | 'Aerial Sling Kids';
  type: 'Group Class' | 'Private Class';
  level: 'All Levels' | 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  whatToBring: string[];
  price: string;
  creditsCost: number;
  duration: string;
  link: string;
  image: string;
  instructor: {
    name: string;
    avatar: string;
    specialty: string;
  };
  branch: 'both' | 'davao';
}

const classOfferings: ClassOffering[] = [
  {
    id: 'class-001',
    title: 'Pole Fitness - Community Class',
    subtitle: 'Community Class. All Levels.',
    category: 'Pole Fitness',
    type: 'Group Class',
    level: 'All Levels',
    description: 'Build strength, flexibility, and confidence through guided pole fitness training. Our group classes welcome all body types and skill levels — from first-timers to advanced students. Each session emphasizes proper technique, safe progression, and creative expression on the pole.',
    whatToBring: ['Fitted shorts & sports bra', 'Grip aid / liquid chalk', 'Water bottle', 'Small towel'],
    price: '₱1,000',
    creditsCost: 1,
    duration: '60 MINS',
    link: '/book/class-001',
    image: '/images/class_pole_group.png',
    instructor: {
      name: 'Cams Rivera',
      avatar: '👩‍🦱',
      specialty: 'Pole Fitness & Exole',
    },
    branch: 'both',
  },
  {
    id: 'class-002',
    title: 'Aerial Sling Flow',
    subtitle: 'Community Class. All Levels.',
    category: 'Aerial Sling',
    type: 'Group Class',
    level: 'All Levels',
    description: 'Explore the art of aerial silks, sling, and hammock in a supportive group setting. Develop upper body strength, spatial awareness, and graceful movement while learning wraps, drops, and dynamic sequences under certified instructor guidance.',
    whatToBring: ['Leggings & fitted top', 'Socks (optional)', 'Water bottle'],
    price: '₱1,000',
    creditsCost: 1,
    duration: '60 MINS',
    link: '/book/class-002',
    image: '/images/class_aerial_group.png',
    instructor: {
      name: 'Tweetie Bullecer',
      avatar: '👩‍🦰',
      specialty: 'Aerial Sling & Yoga',
    },
    branch: 'both',
  },
  {
    id: 'class-003',
    title: 'Pole - Private Class',
    subtitle: 'Personalized Training. Faster Progress. Stronger You.',
    category: 'Pole Fitness',
    type: 'Private Class',
    level: 'Intermediate',
    description: 'One-on-one sessions tailored to your goals, pace, and skill level. Private pole classes offer focused attention, customized choreography, and accelerated progression — ideal for students who want dedicated coaching time.',
    whatToBring: ['Fitted shorts & sports bra', 'Grip aid', 'Kneepads'],
    price: '₱1,800',
    creditsCost: 2,
    duration: '60 MINS',
    link: '/book/class-003',
    image: '/images/class_private.png',
    instructor: {
      name: 'Cams Rivera',
      avatar: '👩‍🦱',
      specialty: 'Pole Fitness & Exole',
    },
    branch: 'both',
  },
  {
    id: 'class-004',
    title: 'Aerial - Private Class',
    subtitle: 'Grace in the Air. Strength in Your Body. Confidence in Motion.',
    category: 'Aerial Sling',
    type: 'Private Class',
    level: 'Intermediate',
    description: 'Personalized aerial training sessions designed to refine your technique, build trust in your apparatus, and push your creative boundaries at your own pace. Perfect for skill-specific goals or performance preparation.',
    whatToBring: ['Form-fitting leggings', 'Long sleeve top', 'Water bottle'],
    price: '₱1,800',
    creditsCost: 2,
    duration: '60 MINS',
    link: '/book/class-004',
    image: '/images/class_private.png',
    instructor: {
      name: 'Alex Tran',
      avatar: '🧑‍🦲',
      specialty: 'Aerial & Chair Acrobatics',
    },
    branch: 'both',
  },
  {
    id: 'class-005',
    title: 'Exole (Exotic Pole)',
    subtitle: 'Move Boldly. Express Freely.',
    category: 'Exole',
    type: 'Group Class',
    level: 'All Levels',
    description: 'A sensual, high-energy fusion of pole dance and floor work set to expressive music. Exole celebrates movement freedom, body confidence, and artistic storytelling through choreography that empowers you to own every transition.',
    whatToBring: ['Kneepads (required)', 'Heels / Pleasers (optional)', 'Shorts or leggings'],
    price: '₱1,800',
    creditsCost: 2,
    duration: '60 MINS',
    link: '/book/class-003',
    image: '/images/class_exole.png',
    instructor: {
      name: 'Cams Rivera',
      avatar: '👩‍🦱',
      specialty: 'Pole Fitness & Exole',
    },
    branch: 'davao',
  },
  {
    id: 'class-006',
    title: 'Acro Chair',
    subtitle: 'Strength, Control, and Powerful Movement.',
    category: 'Acro Chair',
    type: 'Group Class',
    level: 'Intermediate',
    description: 'A dynamic class combining acrobatic chair work with strength conditioning. Learn gravity-defying balances, controlled inversions, and power moves that build functional strength and body control using nothing but a chair.',
    whatToBring: ['Comfortable workout wear', 'Kneepads', 'Grip socks'],
    price: '₱1,800',
    creditsCost: 2,
    duration: '60 MINS',
    link: '/book/class-005',
    image: '/images/class_chair.png',
    instructor: {
      name: 'Alex Tran',
      avatar: '🧑‍🦲',
      specialty: 'Aerial & Chair Acrobatics',
    },
    branch: 'davao',
  },
  {
    id: 'class-007',
    title: 'Sexy Chair',
    subtitle: 'Confidence, Flow, and Fierce Movement.',
    category: 'Sexy Chair',
    type: 'Group Class',
    level: 'All Levels',
    description: 'A choreography-driven class blending sultry floorwork with chair dance technique. Channel your inner performer through fluid transitions, sharp isolations, and bold expression — all in a safe, judgment-free space.',
    whatToBring: ['Kneepads', 'Heels or socks', 'Expressive outfit'],
    price: '₱1,800',
    creditsCost: 2,
    duration: '60 MINS',
    link: '/book/class-005',
    image: '/images/class_chair.png',
    instructor: {
      name: 'Alex Tran',
      avatar: '🧑‍🦲',
      specialty: 'Aerial & Chair Acrobatics',
    },
    branch: 'davao',
  },
  {
    id: 'class-008',
    title: 'Aerial Sling Kids',
    subtitle: 'Little Bodies. Fearless Spirits.',
    category: 'Aerial Sling Kids',
    type: 'Group Class',
    level: 'Beginner',
    description: 'A safe, playful aerial sling class designed for kids ages 6–12. Builds coordination, upper body strength, and confidence while learning colorful tricks and spins in a fun group environment.',
    whatToBring: ['Fitted leggings', 'T-shirt', 'Water bottle'],
    price: '₱600',
    creditsCost: 1,
    duration: '45 MINS',
    link: '/book/class-002',
    image: '/images/class_aerial_group.png',
    instructor: {
      name: 'Tweetie Bullecer',
      avatar: '👩‍🦰',
      specialty: 'Aerial Sling & Kids Coach',
    },
    branch: 'both',
  },
];

type ViewMode = 'grid' | 'table' | 'compact';

export default function ClassesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeDrawerClass, setActiveDrawerClass] = useState<ClassOffering | null>(null);

  // Filter logic
  const filteredOfferings = useMemo(() => {
    return classOfferings.filter((cls) => {
      const searchMatch = 
        cls.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const categoryMatch = selectedCategory === 'All' || cls.category === selectedCategory;
      const levelMatch = selectedLevel === 'All' || cls.level === selectedLevel;
      const typeMatch = selectedType === 'All' || cls.type === selectedType;

      return searchMatch && categoryMatch && levelMatch && typeMatch;
    });
  }, [searchQuery, selectedCategory, selectedLevel, selectedType]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F3] overflow-x-hidden font-sans relative">
      
      <div className="max-w-[1240px] mx-auto px-6 py-12 md:py-20 space-y-10">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-zinc-900 pb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="w-11 h-11 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-[#C9A961] hover:text-black transition-colors shrink-0" 
              aria-label="Go back to Home"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-[#C9A961]" />
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9A961] font-bold">Studio Catalog</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-semibold tracking-wide uppercase text-white mt-1">
                Classes We Offer
              </h1>
            </div>
          </div>

          {/* View Mode Toggle Controls */}
          <div className="flex items-center gap-2 bg-zinc-900/80 p-1.5 rounded-xl border border-zinc-800 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                viewMode === 'grid' ? "bg-[#C9A961] text-black shadow-md" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              )}
              title="Grid View"
            >
              <LayoutGrid size={16} />
              <span className="hidden sm:inline">Grid</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                viewMode === 'table' ? "bg-[#C9A961] text-black shadow-md" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              )}
              title="Table View"
            >
              <TableIcon size={16} />
              <span className="hidden sm:inline">Table</span>
            </button>

            <button
              onClick={() => setViewMode('compact')}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                viewMode === 'compact' ? "bg-[#C9A961] text-black shadow-md" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              )}
              title="Compact View"
            >
              <List size={16} />
              <span className="hidden sm:inline">Compact</span>
            </button>
          </div>
        </div>

        {/* Toolbar & Search Bar */}
        <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="text"
                placeholder="Search by class name, keyword or coach..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-xs font-medium text-white focus:outline-none focus:border-[#C9A961] transition-colors placeholder:text-zinc-600"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Quick Category Filters */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {['All', 'Pole Fitness', 'Aerial Sling', 'Exole', 'Sexy Chair'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer",
                    selectedCategory === cat
                      ? "bg-white text-black font-bold shadow-sm"
                      : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                  )}
                >
                  {cat}
                </button>
              ))}

              {/* Hidden / Advanced Filter Toggle */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={cn(
                  "px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer shrink-0",
                  showAdvancedFilters 
                    ? "border-[#C9A961] text-[#C9A961] bg-[#C9A961]/10" 
                    : "border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 bg-zinc-900"
                )}
              >
                <SlidersHorizontal size={14} />
                <span>Filter Options</span>
              </button>
            </div>
          </div>

          {/* Advanced Filter Collapsible Drawer */}
          {showAdvancedFilters && (
            <div className="pt-4 border-t border-zinc-900 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2 font-bold">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#C9A961] cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="Pole Fitness">Pole Fitness</option>
                  <option value="Aerial Sling">Aerial Sling</option>
                  <option value="Exole">Exole (Exotic Pole)</option>
                  <option value="Sexy Chair">Sexy Chair</option>
                  <option value="Acro Chair">Acro Chair</option>
                  <option value="Aerial Sling Kids">Aerial Sling Kids</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2 font-bold">Skill Level</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#C9A961] cursor-pointer"
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2 font-bold">Session Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#C9A961] cursor-pointer"
                >
                  <option value="All">All Types</option>
                  <option value="Group Class">Group Class</option>
                  <option value="Private Class">Private Class</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* ── 1. GRID VIEW MODE ── */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredOfferings.map((cls) => (
              <div
                key={cls.id}
                className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden group hover:border-[#C9A961]/50 transition-all duration-300 flex flex-col justify-between shadow-lg"
              >
                <div>
                  {/* Card Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-900">
                    <Image
                      src={cls.image}
                      alt={cls.title}
                      fill
                      className="object-cover filter grayscale contrast-110 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                    
                    <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-[#C9A961] text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-[#C9A961]/30">
                      {cls.category}
                    </span>

                    <span className="absolute top-3 right-3 bg-zinc-900/90 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-zinc-700">
                      {cls.level}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 space-y-3 text-left">
                    <h3 className="text-xl font-serif font-bold text-white uppercase tracking-wide leading-snug group-hover:text-[#C9A961] transition-colors">
                      {cls.title}
                    </h3>

                    <p className="text-[11px] font-bold text-[#C9A961] uppercase tracking-wider">
                      {cls.subtitle}
                    </p>

                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-medium">
                      {cls.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-6 pt-0 space-y-4">
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-white font-mono">{cls.price}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">({cls.creditsCost} cr)</span>
                    </div>

                    <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest flex items-center gap-1">
                      <Clock size={12} className="text-[#C9A961]" /> {cls.duration}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setActiveDrawerClass(cls)}
                      className="w-full py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Details
                    </button>

                    <Link
                      href={cls.link}
                      className="w-full py-2.5 rounded-xl bg-[#C9A961] hover:bg-[#b09352] text-black font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-1 shadow-md shadow-[#C9A961]/10"
                    >
                      <span>Book</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* ── 2. TABLE VIEW MODE ── */}
        {viewMode === 'table' && (
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-900/50 text-zinc-400 uppercase tracking-wider font-mono text-[10px]">
                    <th className="py-4 px-6 font-bold">Class Name</th>
                    <th className="py-4 px-6 font-bold">Category</th>
                    <th className="py-4 px-6 font-bold">Coach</th>
                    <th className="py-4 px-6 font-bold">Level</th>
                    <th className="py-4 px-6 font-bold">Duration</th>
                    <th className="py-4 px-6 font-bold">Price</th>
                    <th className="py-4 px-6 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-zinc-300">
                  {filteredOfferings.map((cls) => (
                    <tr key={cls.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-white text-sm uppercase tracking-wide">{cls.title}</div>
                        <div className="text-[10px] text-[#C9A961] font-semibold tracking-wider uppercase mt-0.5">{cls.subtitle}</div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-zinc-400">
                        {cls.category}
                      </td>
                      <td className="py-4 px-6 font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{cls.instructor.avatar}</span>
                          <span>{cls.instructor.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-bold px-2.5 py-1 rounded">
                          {cls.level}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-zinc-400">
                        {cls.duration}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-white text-sm">
                        {cls.price}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setActiveDrawerClass(cls)}
                            className="px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-600 text-xs font-bold uppercase tracking-wider text-zinc-300 cursor-pointer"
                          >
                            Details
                          </button>
                          <Link
                            href={cls.link}
                            className="px-4 py-1.5 rounded-lg bg-[#C9A961] hover:bg-[#b09352] text-black font-black text-xs uppercase tracking-wider shadow-sm"
                          >
                            Book
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── 3. COMPACT VIEW MODE ── */}
        {viewMode === 'compact' && (
          <div className="space-y-4">
            {filteredOfferings.map((cls) => (
              <div 
                key={cls.id}
                className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#C9A961]/40 transition-colors shadow-lg"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800 hidden sm:block">
                    <Image src={cls.image} alt={cls.title} fill className="object-cover filter grayscale contrast-110" />
                  </div>
                  
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-serif font-bold text-white uppercase tracking-wide">{cls.title}</h3>
                      <span className="bg-zinc-900 text-[#C9A961] text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border border-[#C9A961]/20">
                        {cls.category}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 font-medium line-clamp-1">{cls.description}</p>
                    
                    <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-mono pt-1">
                      <span>Led by {cls.instructor.name}</span>
                      <span>&bull;</span>
                      <span>{cls.duration}</span>
                      <span>&bull;</span>
                      <span>{cls.level}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-center shrink-0 border-t md:border-t-0 border-zinc-900 pt-3 md:pt-0 w-full md:w-auto justify-between md:justify-end">
                  <span className="text-xl font-bold font-mono text-white">{cls.price}</span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveDrawerClass(cls)}
                      className="px-4 py-2 rounded-xl border border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white cursor-pointer"
                    >
                      Details
                    </button>
                    <Link
                      href={cls.link}
                      className="px-5 py-2 rounded-xl bg-[#C9A961] hover:bg-[#b09352] text-black font-black text-xs uppercase tracking-wider shadow-sm"
                    >
                      Book
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ── RIGHT-SIDE SLIDE-OVER DETAILS DRAWER / PANEL ── */}
      {activeDrawerClass && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setActiveDrawerClass(null)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
          />

          {/* Slide-over Drawer Panel */}
          <div className="relative w-full max-w-md bg-[#0D0D0D] border-l border-zinc-800 h-full overflow-y-auto z-10 shadow-2xl p-6 sm:p-8 flex flex-col justify-between space-y-8 animate-in slide-in-from-right duration-300 text-left">
            
            <div className="space-y-6">
              {/* Top Bar / Close */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9A961] font-bold flex items-center gap-1.5">
                  <Sparkles size={14} /> Class Details
                </span>
                
                <button
                  onClick={() => setActiveDrawerClass(null)}
                  className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Banner Image */}
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-zinc-800">
                <Image
                  src={activeDrawerClass.image}
                  alt={activeDrawerClass.title}
                  fill
                  className="object-cover filter contrast-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                <div className="absolute bottom-3 left-3 flex gap-2">
                  <span className="bg-black/90 text-[#C9A961] text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#C9A961]/30">
                    {activeDrawerClass.category}
                  </span>
                  <span className="bg-zinc-900/90 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-zinc-700">
                    {activeDrawerClass.level}
                  </span>
                </div>
              </div>

              {/* Titles & Meta */}
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold uppercase tracking-wide text-white leading-tight">
                  {activeDrawerClass.title}
                </h2>
                <p className="text-xs font-bold uppercase tracking-wider text-[#C9A961]">
                  {activeDrawerClass.subtitle}
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-zinc-950 border border-zinc-900 rounded-2xl text-center">
                <div>
                  <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-500 block">Price</span>
                  <span className="text-base font-bold text-white font-mono">{activeDrawerClass.price}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-500 block">Credits</span>
                  <span className="text-base font-bold text-[#C9A961] font-mono">{activeDrawerClass.creditsCost} credit</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-500 block">Duration</span>
                  <span className="text-base font-bold text-white font-mono">{activeDrawerClass.duration}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">About This Class</h4>
                <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                  {activeDrawerClass.description}
                </p>
              </div>

              {/* What to Bring */}
              <div className="space-y-2 pt-2 border-t border-zinc-900">
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">What to Bring</h4>
                <ul className="space-y-1.5">
                  {activeDrawerClass.whatToBring.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
                      <Check size={14} className="text-[#C9A961] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructor Card */}
              <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center gap-4">
                <span className="text-3xl">{activeDrawerClass.instructor.avatar}</span>
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-bold block">Assigned Coach</span>
                  <h5 className="text-sm font-bold text-white">{activeDrawerClass.instructor.name}</h5>
                  <span className="text-xs text-[#C9A961] font-semibold">{activeDrawerClass.instructor.specialty}</span>
                </div>
              </div>
            </div>

            {/* Bottom Action CTA */}
            <div className="pt-4 border-t border-zinc-900">
              <Link
                href={activeDrawerClass.link}
                onClick={() => setActiveDrawerClass(null)}
                className="w-full py-3.5 rounded-2xl bg-[#C9A961] hover:bg-[#b09352] text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#C9A961]/20 cursor-pointer"
              >
                <span>Book This Class</span>
                <ChevronRight size={16} />
              </Link>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
