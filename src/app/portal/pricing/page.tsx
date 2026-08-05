'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, ChevronDown, ChevronUp, MoreVertical, GripVertical, Package, CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PackageItem {
  id: string;
  name: string;
  isPrivate?: boolean;
  status: 'Active' | 'Inactive' | 'Draft';
  validity: string;
  price: string;
  totalPurchase: number;
  totalSales: string;
  createdOn: string;
}

interface PackageCategory {
  id: string;
  name: string;
  items: PackageItem[];
  isExpanded: boolean;
}

export default function PricingPlansPage() {
  const [activeTab, setActiveTab] = useState<'packages' | 'memberships'>('packages');
  const [searchQuery, setSearchQuery] = useState('');

  // Packages Categories State
  const [packageCategories, setPackageCategories] = useState<PackageCategory[]>([
    {
      id: 'credit-packs',
      name: 'Credit Packs',
      isExpanded: true,
      items: [
        {
          id: '88-session-pack',
          name: '88 Session Pack',
          status: 'Active',
          validity: 'Valid for 6 months',
          price: 'S$ 88.00',
          totalPurchase: 32,
          totalSales: 'S$ 4,686.00',
          createdOn: 'Created on 16 Nov 2023, 2:2 PM'
        },
        {
          id: 'private-8-pack',
          name: 'Private 8 credit pack',
          isPrivate: true,
          status: 'Active',
          validity: 'Valid for 2 months',
          price: 'S$ 100.00',
          totalPurchase: 36,
          totalSales: 'S$ 12,400.00',
          createdOn: 'Created on 16 Nov 2023, 2:3 PM'
        },
        {
          id: 'starter-5-pack',
          name: 'Starter 5 Credit Pack',
          status: 'Active',
          validity: 'Valid for 1 month',
          price: 'S$ 50.00',
          totalPurchase: 54,
          totalSales: 'S$ 2,700.00',
          createdOn: 'Created on 01 Dec 2023, 10:15 AM'
        }
      ]
    },
    {
      id: 'multi-packs',
      name: 'Multi Packs',
      isExpanded: false,
      items: [
        {
          id: 'multi-class-pass',
          name: '10-Class All Access Pass',
          status: 'Active',
          validity: 'Valid for 3 months',
          price: 'S$ 120.00',
          totalPurchase: 18,
          totalSales: 'S$ 2,160.00',
          createdOn: 'Created on 20 Jan 2024, 4:00 PM'
        }
      ]
    },
    {
      id: 'reformer-package',
      name: 'Reformer Package',
      isExpanded: false,
      items: [
        {
          id: 'reformer-10-pack',
          name: 'Reformer Intensive 10 Sessions',
          status: 'Active',
          validity: 'Valid for 2 months',
          price: 'S$ 150.00',
          totalPurchase: 22,
          totalSales: 'S$ 3,300.00',
          createdOn: 'Created on 12 Feb 2024, 11:30 AM'
        }
      ]
    },
    {
      id: 'ranis-package',
      name: 'Rani\'s Package',
      isExpanded: false,
      items: []
    },
    {
      id: 'for-trainers-only',
      name: 'For Trainers Only',
      isExpanded: false,
      items: []
    }
  ]);

  // Memberships Categories State (Images 3 & 4)
  const [membershipCategories, setMembershipCategories] = useState<PackageCategory[]>([
    {
      id: 'monthly',
      name: 'Monthly',
      isExpanded: true,
      items: [
        {
          id: 'monthly-membership',
          name: 'Monthly',
          status: 'Active',
          validity: 'Valid for 3 months',
          price: 'S$ 30.00',
          totalPurchase: 7,
          totalSales: 'S$ 2,400.00',
          createdOn: 'Created on 5 Dec 2023, 9:37 PM'
        },
        {
          id: 'my-membership',
          name: 'My Membership',
          status: 'Draft',
          validity: 'Valid for 1 day',
          price: 'S$ 0.00',
          totalPurchase: 0,
          totalSales: 'S$ 0.00',
          createdOn: 'Created on 21 Feb 2024, 2:1 AM'
        }
      ]
    },
    {
      id: 'rani',
      name: 'RANI',
      isExpanded: false,
      items: []
    },
    {
      id: 'for-rani-only',
      name: 'FOR RANI ONLY',
      isExpanded: false,
      items: []
    },
    {
      id: 'rani-use',
      name: 'RANI USE',
      isExpanded: false,
      items: []
    },
    {
      id: 'lavish',
      name: 'LAVISH',
      isExpanded: false,
      items: []
    },
    {
      id: 'residential',
      name: 'RESIDENTIAL',
      isExpanded: false,
      items: []
    }
  ]);

  const activeCategories = activeTab === 'packages' ? packageCategories : membershipCategories;

  const toggleCategory = (catId: string) => {
    if (activeTab === 'packages') {
      setPackageCategories(packageCategories.map(c => c.id === catId ? { ...c, isExpanded: !c.isExpanded } : c));
    } else {
      setMembershipCategories(membershipCategories.map(c => c.id === catId ? { ...c, isExpanded: !c.isExpanded } : c));
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] font-sans text-gray-900 animate-fade-in">
      
      {/* Sub Sidebar Navigation */}
      <aside className="w-56 bg-white border-r border-gray-200 p-6 shrink-0 hidden md:block">
        <h2 className="text-xl font-bold mb-6 text-gray-900">Pricing Plans</h2>
        
        <nav className="space-y-1">
          <button
            onClick={() => setActiveTab('packages')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors text-left",
              activeTab === 'packages' ? "bg-gray-100 text-black font-bold" : "text-gray-600 hover:bg-gray-50 hover:text-black"
            )}
          >
            <Package size={18} /> Packages
          </button>

          <button
            onClick={() => setActiveTab('memberships')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors text-left",
              activeTab === 'memberships' ? "bg-gray-100 text-black font-bold" : "text-gray-600 hover:bg-gray-50 hover:text-black"
            )}
          >
            <CreditCard size={18} /> Memberships
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 max-w-5xl">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {activeTab === 'packages' ? 'Packages' : 'Memberships'}
          </h1>

          <Link 
            href="/portal/pricing/edit?new=true"
            className="bg-[#1D1B4B] hover:bg-[#2E2B70] text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={16} /> Add {activeTab === 'packages' ? 'Package' : 'Membership'}
          </Link>
        </div>

        {/* Toolbar Filters */}
        <div className="flex flex-wrap gap-4 items-center mb-8">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'packages' ? 'package' : 'membership plan'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#1D1B4B] outline-none shadow-sm"
            />
          </div>

          <select className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 outline-none shadow-sm cursor-pointer">
            <option>All status</option>
            <option>Active</option>
            <option>Draft</option>
            <option>Inactive</option>
          </select>

          <select className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 outline-none shadow-sm cursor-pointer">
            <option>All category</option>
          </select>
        </div>

        {/* Accordion Categories */}
        <div className="space-y-4">
          {activeCategories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all">
              
              {/* Category Header */}
              <div 
                onClick={() => toggleCategory(cat.id)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <GripVertical size={16} className="text-gray-400" />
                  <h3 className="text-lg font-bold text-gray-900">{cat.name}</h3>
                  <span className="text-xs text-gray-400 font-semibold ml-2">
                    {cat.items.length} {cat.items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-gray-400">
                  <span className="text-sm font-bold text-gray-700 hover:text-black">+</span>
                  <span className="text-sm font-bold text-gray-700 hover:text-black">...</span>
                  {cat.isExpanded ? <ChevronUp size={20} className="text-gray-600" /> : <ChevronDown size={20} className="text-gray-600" />}
                </div>
              </div>

              {/* Expanded Items */}
              {cat.isExpanded && cat.items.length > 0 && (
                <div className="p-4 pt-0 space-y-4 bg-gray-50/50">
                  {cat.items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-6">
                      
                      {/* Left Details */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <GripVertical size={16} className="text-gray-400 shrink-0" />
                          {item.isPrivate && (
                            <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded">
                              Private
                            </span>
                          )}
                          <Link 
                            href={`/portal/pricing/edit?id=${item.id}`}
                            className="text-lg font-bold text-gray-900 hover:underline"
                          >
                            {item.name}
                          </Link>

                          <span className={cn(
                            "text-xs font-bold px-2.5 py-0.5 rounded ml-2",
                            item.status === 'Active' ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
                          )}>
                            {item.status}
                          </span>

                          <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-black ml-auto md:ml-2">
                            <MoreVertical size={16} />
                          </button>
                        </div>

                        <p className="text-xs text-gray-500 font-medium pl-6">
                          🗓️ {item.validity}
                        </p>

                        <p className="text-xs text-gray-400 font-medium pt-4 pl-6">
                          {item.createdOn}
                        </p>
                      </div>

                      {/* Right Stats Table */}
                      <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 space-y-2 text-sm font-medium">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">PRICE</span>
                          <span className="font-bold text-gray-900">{item.price}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">TOTAL PURCHASE</span>
                          <span className="font-bold text-gray-900">{item.totalPurchase}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">TOTAL SALES</span>
                          <span className="font-bold text-gray-900">{item.totalSales}</span>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          ))}
        </div>

      </main>

    </div>
  );
}
