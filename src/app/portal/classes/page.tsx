'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, ChevronDown, ChevronUp, Pencil, Trash2, MoreVertical, Clock, GripVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SEED_CLASSES } from '@/lib/seedData';
import type { FitnessClass } from '@/types';
import { useBooking } from '@/context/BookingContext';

interface CategoryGroup {
  name: string;
  classes: FitnessClass[];
}

export default function ClassesPage() {
  const { classes: contextClasses } = useBooking();
  
  // Combine context classes or seed classes
  const allClasses = (contextClasses && contextClasses.length > 0) ? contextClasses : SEED_CLASSES;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Track expanded state for categories
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Pole Fitness': true,
    'Aerial Sling': true,
    'Exole': true,
    'Yoga': true,
    'Sexy Chair': false,
    'Aerial Sling Kids': false,
    'Massage & Pilates': false
  });

  const toggleCategory = (catName: string) => {
    setExpandedCategories(prev => ({ ...prev, [catName]: !prev[catName] }));
  };

  // Group classes dynamically by type/category
  const groupedCategories = useMemo(() => {
    // Unique list of categories
    const categoriesMap: Record<string, FitnessClass[]> = {
      'Pole Fitness': [],
      'Aerial Sling': [],
      'Exole': [],
      'Yoga': [],
      'Sexy Chair': [],
      'Aerial Sling Kids': [],
      'Massage & Pilates': []
    };

    allClasses.forEach(cls => {
      const type = cls.type || 'Other';
      if (type.includes('Pole') && !type.includes('Exole')) {
        categoriesMap['Pole Fitness'].push(cls);
      } else if (type.includes('Sling') && !type.includes('Kids')) {
        categoriesMap['Aerial Sling'].push(cls);
      } else if (type.includes('Kids')) {
        categoriesMap['Aerial Sling Kids'].push(cls);
      } else if (type.includes('Exole') || type.includes('Exotic')) {
        categoriesMap['Exole'].push(cls);
      } else if (type.includes('Yoga')) {
        categoriesMap['Yoga'].push(cls);
      } else if (type.includes('Chair')) {
        categoriesMap['Sexy Chair'].push(cls);
      } else {
        categoriesMap['Massage & Pilates'].push(cls);
      }
    });

    // Add extra mock items if category is empty so UI feels full
    if (categoriesMap['Massage & Pilates'].length === 0) {
      categoriesMap['Massage & Pilates'] = [
        {
          id: 'class-massage-1',
          title: 'Deep Tissue Massage',
          type: 'Yoga',
          instructor: allClasses[0]?.instructor || { id: 'inst-1', name: 'Cams Rivera', avatar: '', bio: '', specialty: '', musicStyle: '', playlist: '', totalStudents: 0, rating: 5 },
          date: 'Every Monday',
          time: '10:00 AM',
          duration: 60,
          totalSpots: 4,
          bookedSpots: [],
          price: 1200,
          level: 'All Levels',
          description: 'Deep therapeutic muscle work.',
          tags: ['Open to all', 'Onsite']
        },
        {
          id: 'class-mat-1',
          title: 'Beginner Mat Pilates',
          type: 'Yoga',
          instructor: allClasses[1]?.instructor || { id: 'inst-2', name: 'Tweetie Bullecer', avatar: '', bio: '', specialty: '', musicStyle: '', playlist: '', totalStudents: 0, rating: 5 },
          date: 'Every Wednesday',
          time: '2:00 PM',
          duration: 45,
          totalSpots: 10,
          bookedSpots: [],
          price: 650,
          level: 'Beginner',
          description: 'Core conditioning mat workout.',
          tags: ['Open to all', 'Onsite']
        }
      ];
    }

    return Object.entries(categoriesMap).map(([name, classes]) => ({
      name,
      classes: classes.filter(c => {
        const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCategory = categoryFilter === 'All' || name === categoryFilter;
        return matchSearch && matchCategory;
      })
    }));
  }, [allClasses, searchQuery, categoryFilter]);

  return (
    <div className="p-8 font-sans bg-[#F9FAFB] min-h-screen text-gray-900 animate-fade-in max-w-5xl">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Classes</h1>
          <p className="text-sm text-gray-500 max-w-2xl font-medium leading-relaxed">
            A class is when it occurs on a weekly basis at a specific time and day. Customers can book classes at any time without a long-term commitment. Classes will also be taught by a single staff member in a large group setting.
          </p>
        </div>

        <Link 
          href="/portal/classes/edit?new=true"
          className="bg-[#1D1B4B] hover:bg-[#2E2B70] text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors shrink-0 shadow-sm"
        >
          <Plus size={16} /> Add Class
        </Link>
      </div>

      {/* Toolbar Filters */}
      <div className="flex flex-wrap gap-4 items-center mb-8">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search class"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#1D1B4B] outline-none shadow-sm"
          />
        </div>

        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 outline-none shadow-sm cursor-pointer"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 outline-none shadow-sm cursor-pointer"
        >
          <option value="All">All category</option>
          <option value="Pole Fitness">Pole Fitness</option>
          <option value="Aerial Sling">Aerial Sling</option>
          <option value="Exole">Exole</option>
          <option value="Yoga">Yoga</option>
          <option value="Sexy Chair">Sexy Chair</option>
          <option value="Massage & Pilates">Massage & Pilates</option>
        </select>
      </div>

      {/* Accordion Categories */}
      <div className="space-y-4">
        {groupedCategories.map((cat) => (
          <div key={cat.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all">
            
            {/* Category Header Bar */}
            <div 
              onClick={() => toggleCategory(cat.name)}
              className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <GripVertical size={16} className="text-gray-400" />
                <h3 className="text-lg font-bold text-gray-900">{cat.name}</h3>
                <span className="text-xs text-gray-400 font-semibold ml-2">
                  {cat.classes.length} items
                </span>
                <Link 
                  href={`/portal/classes/edit?category=${encodeURIComponent(cat.name)}`}
                  onClick={(e) => { e.stopPropagation(); }} 
                  className="text-xs font-bold text-[#1D1B4B] hover:underline ml-2"
                >
                  Add classes +
                </Link>
              </div>

              <div className="flex items-center gap-4 text-gray-400">
                <button onClick={(e) => { e.stopPropagation(); }} className="hover:text-black"><Pencil size={16} /></button>
                <button onClick={(e) => { e.stopPropagation(); }} className="hover:text-red-500"><Trash2 size={16} /></button>
                {expandedCategories[cat.name] ? <ChevronUp size={20} className="text-gray-600" /> : <ChevronDown size={20} className="text-gray-600" />}
              </div>
            </div>

            {/* Expanded Classes List */}
            {expandedCategories[cat.name] && cat.classes.length > 0 && (
              <div className="p-4 pt-0 space-y-3 bg-gray-50/50">
                {cat.classes.map((cls) => (
                  <div key={cls.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative">
                    
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <GripVertical size={16} className="text-gray-400" />
                        <Link href={`/portal/classes/edit?id=${cls.id}`} className="text-base font-bold text-gray-900 hover:underline">
                          {cls.title}
                        </Link>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-0.5 rounded">
                          Active
                        </span>
                        <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-black">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-3">
                      <Clock size={12} /> {cls.duration} mins • {cls.instructor.name}
                    </div>

                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      {(cls.tags && cls.tags.length > 0 ? cls.tags : ['Open to all', 'Onsite']).map((t: string) => (
                        <span key={t} className="px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-700 text-[10px] font-bold rounded-md">
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <Link 
                          href="/schedule" 
                          className="bg-[#1D1B4B] hover:bg-[#2E2B70] text-white px-4 py-2 rounded-full text-xs font-semibold transition-colors"
                        >
                          View Schedule
                        </Link>
                        <Link 
                          href="/portal/pricing" 
                          className="bg-[#1D1B4B] hover:bg-[#2E2B70] text-white px-4 py-2 rounded-full text-xs font-semibold transition-colors"
                        >
                          View Pricing Plans
                        </Link>
                      </div>

                      <span className="text-xs text-gray-400 font-medium">
                        ₱{cls.price} • {cls.level}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  );
}
