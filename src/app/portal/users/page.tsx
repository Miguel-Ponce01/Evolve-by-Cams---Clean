'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, MoreVertical, Phone, Mail, Star, Circle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  roleName: string; // Used as Tag 1 (Owner, Instructor)
  employmentType: string; // Used as Tag 2 (Full-Time)
  status: 'Active' | 'Pending';
  available: boolean;
  rating: number;
  reviews: number;
  avatar: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<StaffUser[]>([
    {
      id: '1',
      name: 'Adrian Ng',
      email: 'adrian.yoga@codigo.co',
      phone: '+65 88111188',
      roleName: 'Owner',
      employmentType: 'Full-Time',
      status: 'Active',
      available: true,
      rating: 5,
      reviews: 1,
      avatar: 'AN'
    },
    {
      id: '2',
      name: 'Esther Rezeve',
      email: 'esther@rezeve.com',
      phone: '+65 12345678',
      roleName: 'Instructor',
      employmentType: 'Full-Time',
      status: 'Active',
      available: true,
      rating: 5,
      reviews: 3,
      avatar: 'ER'
    },
    {
      id: '3',
      name: 'Apiradee We Fitness TH',
      email: 'apiradee.c@wefitnesssociety.c...',
      phone: '+60 166096967',
      roleName: 'Testing Only',
      employmentType: 'Full-Time',
      status: 'Active',
      available: true,
      rating: 0,
      reviews: 0,
      avatar: 'AW'
    },
    {
      id: '4',
      name: 'Alex Yee',
      email: 'alex@example.com',
      phone: '+65 99998888',
      roleName: 'Instructor',
      employmentType: 'Part-Time',
      status: 'Active',
      available: true,
      rating: 4.5,
      reviews: 12,
      avatar: 'AY'
    },
    {
      id: '5',
      name: 'Billy Halim',
      email: 'billy@example.com',
      phone: '+65 88887777',
      roleName: 'Instructor',
      employmentType: 'Full-Time',
      status: 'Pending',
      available: false,
      rating: 0,
      reviews: 0,
      avatar: 'BH'
    },
    {
      id: '6',
      name: 'Lely Pilates',
      email: 'lely@example.com',
      phone: '+65 77776666',
      roleName: 'Instructor',
      employmentType: 'Contractor',
      status: 'Pending',
      available: false,
      rating: 0,
      reviews: 0,
      avatar: 'LP'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  return (
    <div className="p-8 font-sans animate-fade-in text-gray-900 bg-[#F9FAFB] min-h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Staff</h1>
        <button className="bg-[#1D1B4B] hover:bg-[#2E2B70] text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors">
          <Plus size={16} /> Add Staff
        </button>
      </div>

      {/* Toolbar Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
        <div className="relative mb-4">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by staff name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#1D1B4B] outline-none"
          />
        </div>
        
        <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-600">
          <select className="bg-transparent outline-none cursor-pointer hover:text-black">
            <option>All locations</option>
          </select>
          <select className="bg-transparent outline-none cursor-pointer hover:text-black">
            <option>Employment Type</option>
          </select>
          <select className="bg-transparent outline-none cursor-pointer hover:text-black">
            <option>All status</option>
          </select>
          <select className="bg-transparent outline-none cursor-pointer hover:text-black">
            <option>All Availability</option>
          </select>
          <select className="bg-transparent outline-none cursor-pointer hover:text-black ml-auto">
            <option>Last Updated</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map(user => (
          <div key={user.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative">
            {/* Top Right Badges & Actions */}
            <div className="absolute top-6 right-6 flex items-center gap-2">
              <span className={cn(
                "px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide",
                user.status === 'Active' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
              )}>
                {user.status}
              </span>
              <div className="relative">
                <button 
                  onClick={() => setActiveMenuId(activeMenuId === user.id ? null : user.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 bg-gray-50 text-black border border-gray-200"
                >
                  <MoreVertical size={16} />
                </button>

                {activeMenuId === user.id && (
                  <div className="absolute right-0 top-9 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 text-left text-sm font-medium">
                    <Link 
                      href="/portal/users/edit"
                      onClick={() => setActiveMenuId(null)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-800"
                    >
                      Edit
                    </Link>
                    <Link 
                      href="/schedule"
                      onClick={() => setActiveMenuId(null)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-800"
                    >
                      View Timetable
                    </Link>
                    <button 
                      onClick={() => {
                        setUsers(users.map(u => u.id === user.id ? { ...u, status: u.status === 'Active' ? 'Pending' : 'Active' } : u));
                        setActiveMenuId(null);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-500 font-semibold"
                    >
                      {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Avatar & Name */}
            <div className="mb-4">
              <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg mb-3 object-cover shadow-sm">
                {/* Fallback to initials since we don't have actual images in mock */}
                {user.avatar}
              </div>
              <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-2.5">
              <Circle size={8} className={cn("fill-current", user.available ? "text-green-500" : "text-gray-300")} />
              {user.available ? 'Available for booking' : 'Unavailable'}
            </div>

            {/* Ratings */}
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  className={cn(i < Math.floor(user.rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200")} 
                />
              ))}
              <span className="text-xs text-gray-500 font-medium ml-1">
                {user.rating > 0 ? `(${user.reviews} reviews)` : 'No rating yet...'}
              </span>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2 mb-6">
              <span className="px-3 py-1 bg-gray-50 border border-gray-100 text-gray-700 text-[10px] font-bold rounded-md">
                {user.roleName}
              </span>
              <span className="px-3 py-1 bg-gray-50 border border-gray-100 text-gray-700 text-[10px] font-bold rounded-md">
                {user.employmentType}
              </span>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                <Phone size={14} />
                {user.phone}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 font-medium truncate">
                <Mail size={14} className="shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
