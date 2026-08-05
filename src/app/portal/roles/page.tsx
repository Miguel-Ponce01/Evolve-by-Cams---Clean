'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, MoreVertical, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleItem {
  id: string;
  name: string;
  type: 'System' | 'Custom';
  createdBy: string;
  createdOn: string;
  usersCount: number;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleItem[]>([
    {
      id: 'admin',
      name: 'Admin',
      type: 'System',
      createdBy: 'Rezerv',
      createdOn: '19 Sep 2022 11:19',
      usersCount: 5
    },
    {
      id: 'instructor',
      name: 'Instructor',
      type: 'Custom',
      createdBy: 'Adrian Ng',
      createdOn: '05 Dec 2023 3:25',
      usersCount: 0
    },
    {
      id: 'receptionist',
      name: 'Receptionist',
      type: 'Custom',
      createdBy: 'Adrian Ng',
      createdOn: '15 Dec 2023 1:26',
      usersCount: 0
    },
    {
      id: 'no-access',
      name: 'No access',
      type: 'Custom',
      createdBy: 'Adrian Ng',
      createdOn: '28 Feb 2024 6:11',
      usersCount: 1
    },
    {
      id: 'trial-account',
      name: 'Trial Account',
      type: 'Custom',
      createdBy: 'Adrian Ng',
      createdOn: '02 Apr 2024 6:57',
      usersCount: 1
    }
  ]);

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  return (
    <div className="p-8 font-sans bg-[#F9FAFB] min-h-screen text-gray-900 animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
        <Link 
          href="/portal/roles/edit?new=true"
          className="bg-[#1D1B4B] hover:bg-[#2E2B70] text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Role
        </Link>
      </div>

      {/* Roles List Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 max-w-5xl">
        
        {/* Table Header */}
        <div className="grid grid-cols-12 px-6 py-3 text-xs font-bold text-[#1D1B4B] uppercase tracking-wider mb-2">
          <div className="col-span-3">Role</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-3">Created by</div>
          <div className="col-span-3">Created on</div>
          <div className="col-span-1 text-right">Users</div>
        </div>

        {/* Table Rows */}
        <div className="space-y-3">
          {roles.map((role) => (
            <div 
              key={role.id}
              className="grid grid-cols-12 items-center px-6 py-4 rounded-xl bg-gray-50/70 hover:bg-gray-100/80 border border-transparent hover:border-gray-200 transition-all cursor-pointer group relative"
            >
              <div className="col-span-3 font-bold text-gray-900 text-sm flex items-center gap-2">
                <Link href={`/portal/roles/edit?id=${role.id}`} className="hover:underline flex items-center gap-2 w-full">
                  {role.name}
                </Link>
              </div>

              <div className="col-span-2 text-sm text-gray-600 font-medium">
                {role.type}
              </div>

              <div className="col-span-3 text-sm text-gray-600 font-medium">
                {role.createdBy}
              </div>

              <div className="col-span-3 text-sm text-gray-600 font-medium">
                {role.createdOn}
              </div>

              <div className="col-span-1 text-right flex items-center justify-end gap-3 font-medium text-sm text-gray-700">
                <span>{role.usersCount}</span>
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === role.id ? null : role.id);
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 text-gray-700"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenuId === role.id && (
                    <div className="absolute right-0 top-9 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 text-left text-sm font-medium">
                      <Link 
                        href={`/portal/roles/edit?id=${role.id}`}
                        className="block px-4 py-2 hover:bg-gray-50 text-gray-800"
                      >
                        Edit
                      </Link>
                      {role.type !== 'System' && (
                        <button 
                          onClick={() => {
                            setRoles(roles.filter(r => r.id !== role.id));
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
