'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Check, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PermissionItem {
  id: string;
  label: string;
  viewOnly: boolean;
  allowEditing: boolean;
  children?: PermissionItem[];
}

export default function EditRolePage() {
  const [roleName, setRoleName] = useState('Instructor');

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    schedule: true,
    services: false,
    classes: false,
  });

  const toggleExpand = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [permissions, setPermissions] = useState<PermissionItem[]>([
    {
      id: 'home',
      label: 'Home',
      viewOnly: true,
      allowEditing: true,
    },
    {
      id: 'schedule',
      label: 'Schedule',
      viewOnly: false,
      allowEditing: false,
      children: [
        {
          id: 'schedule-no-staff',
          label: 'Manage calendar with no staff assigned',
          viewOnly: false,
          allowEditing: false,
        },
        {
          id: 'schedule-own',
          label: 'Manage own calendar',
          viewOnly: true,
          allowEditing: true,
        },
        {
          id: 'schedule-other',
          label: 'Manage other staff calendar',
          viewOnly: false,
          allowEditing: false,
        },
      ]
    },
    {
      id: 'services',
      label: 'Services',
      viewOnly: false,
      allowEditing: false,
      children: [
        {
          id: 'services-view',
          label: 'View services list',
          viewOnly: true,
          allowEditing: false,
        },
        {
          id: 'services-edit',
          label: 'Create & edit services',
          viewOnly: false,
          allowEditing: false,
        }
      ]
    },
    {
      id: 'classes',
      label: 'Classes',
      viewOnly: false,
      allowEditing: false,
      children: [
        {
          id: 'classes-schedule',
          label: 'Manage class timetables',
          viewOnly: true,
          allowEditing: true,
        }
      ]
    },
    {
      id: 'bookings',
      label: 'Bookings',
      viewOnly: true,
      allowEditing: true,
    },
    {
      id: 'customers',
      label: 'Customers',
      viewOnly: true,
      allowEditing: false,
    },
    {
      id: 'reports',
      label: 'Reports',
      viewOnly: false,
      allowEditing: false,
    }
  ]);

  const togglePermission = (id: string, type: 'viewOnly' | 'allowEditing', parentId?: string) => {
    setPermissions(prev => prev.map(item => {
      if (parentId && item.id === parentId && item.children) {
        return {
          ...item,
          children: item.children.map(child => {
            if (child.id === id) {
              return { ...child, [type]: !child[type] };
            }
            return child;
          })
        };
      } else if (item.id === id) {
        return { ...item, [type]: !item[type] };
      }
      return item;
    }));
  };

  return (
    <div className="p-8 font-sans bg-[#F9FAFB] min-h-screen text-gray-900 animate-fade-in max-w-5xl">
      
      {/* Top Bar Actions */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="text-xs text-gray-500 font-medium mb-1">
            <Link href="/portal/roles" className="hover:text-black">Roles</Link> &gt; <span className="text-black font-bold">Edit role</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Edit role</h1>
        </div>

        <button className="bg-[#1D1B4B] hover:bg-[#2E2B70] text-white px-6 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm">
          <Save size={16} /> Save Changes
        </button>
      </div>

      {/* Role Title Input */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <label className="block text-xs font-bold text-gray-700 mb-2">Role</label>
        <input 
          type="text"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1D1B4B]"
        />
      </div>

      {/* Assign Permissions Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Assign permissions</h2>
        <p className="text-sm text-gray-500 font-medium">
          Assign permissions for menu access and define which feature menus are available to the user role.
        </p>
      </div>

      {/* Permissions Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
        
        {/* Table Header */}
        <div className="grid grid-cols-12 px-6 py-3 text-xs font-bold text-[#1D1B4B] mb-4">
          <div className="col-span-8"></div>
          <div className="col-span-2 text-center">View only</div>
          <div className="col-span-2 text-center">Allow editing</div>
        </div>

        {/* Permissions List */}
        <div className="space-y-3">
          {permissions.map((perm) => (
            <div key={perm.id} className="space-y-2">
              
              {/* Parent Row */}
              <div className="grid grid-cols-12 items-center px-6 py-4 rounded-xl bg-gray-50/70 border border-gray-100 font-bold text-sm text-gray-900">
                <div className="col-span-8 flex items-center gap-3">
                  <span>{perm.label}</span>
                </div>

                <div className="col-span-2 flex justify-center">
                  {!perm.children && (
                    <input 
                      type="checkbox"
                      checked={perm.viewOnly}
                      onChange={() => togglePermission(perm.id, 'viewOnly')}
                      className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black cursor-pointer accent-black"
                    />
                  )}
                </div>

                <div className="col-span-2 flex justify-center items-center gap-4">
                  {!perm.children ? (
                    <input 
                      type="checkbox"
                      checked={perm.allowEditing}
                      onChange={() => togglePermission(perm.id, 'allowEditing')}
                      className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black cursor-pointer accent-black"
                    />
                  ) : (
                    <button 
                      onClick={() => toggleExpand(perm.id)}
                      className="text-gray-500 hover:text-black ml-auto"
                    >
                      {expandedSections[perm.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  )}
                </div>
              </div>

              {/* Children Rows */}
              {perm.children && expandedSections[perm.id] && (
                <div className="space-y-2 pl-4">
                  {perm.children.map((child) => (
                    <div 
                      key={child.id}
                      className="grid grid-cols-12 items-center px-6 py-3.5 rounded-xl bg-white border border-gray-100 text-sm font-medium text-gray-800"
                    >
                      <div className="col-span-8 text-gray-700">
                        {child.label}
                      </div>

                      <div className="col-span-2 flex justify-center">
                        <input 
                          type="checkbox"
                          checked={child.viewOnly}
                          onChange={() => togglePermission(child.id, 'viewOnly', perm.id)}
                          className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black cursor-pointer accent-black"
                        />
                      </div>

                      <div className="col-span-2 flex justify-center">
                        <input 
                          type="checkbox"
                          checked={child.allowEditing}
                          onChange={() => togglePermission(child.id, 'allowEditing', perm.id)}
                          className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black cursor-pointer accent-black"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
