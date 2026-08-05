'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Eye, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  List, 
  ListOrdered, 
  Image as ImageIcon, 
  Link2,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  Lightbulb,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Step = 'About' | 'Upload media' | 'Additional details' | 'Address' | 'Timing' | 'Facilities' | 'Amenities';

export default function EditOutletPage() {
  const [activeStep, setActiveStep] = useState<Step>('About');

  const steps: Step[] = ['About', 'Upload media', 'Additional details', 'Address', 'Timing', 'Facilities', 'Amenities'];

  return (
    <div className="bg-[#F9FAFB] min-h-full font-sans flex flex-col relative text-black">
      
      {/* Top Bar */}
      <div className="h-20 border-b border-gray-200 bg-white flex items-center justify-end px-8 gap-4 sticky top-0 z-20">
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 text-sm">
          <Eye size={16} className="text-[#1D1B4B]" /> Preview
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 text-sm">
          Save & Exit
        </button>
      </div>

      <div className="flex flex-1 max-w-[1200px] w-full mx-auto p-8 gap-12">
        
        {/* Left Sidebar Steps */}
        <div className="w-64 shrink-0">
          <div className="text-sm text-gray-500 font-medium mb-2">
            <Link href="/portal/outlets" className="hover:text-black">Outlets</Link> &gt; <span className="text-black font-bold">Edit outlet</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit outlet</h1>
          
          <div className="h-1 w-full bg-green-500 rounded-full mb-3"></div>
          <p className="text-sm font-bold text-gray-900 mb-8">100% completed</p>

          <nav className="flex flex-col gap-1 border-l-2 border-gray-100 pl-4 relative">
            {steps.map(step => (
              <button
                key={step}
                onClick={() => setActiveStep(step)}
                className={cn(
                  "flex items-center gap-3 py-3 px-4 rounded-lg text-left text-sm font-semibold transition-colors",
                  activeStep === step ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:text-gray-900"
                )}
              >
                <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                {step}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 max-w-2xl">
          {activeStep === 'About' && <AboutTab />}
          {activeStep === 'Timing' && <TimingTab />}
          {activeStep === 'Facilities' && <FacilitiesTab />}
          
          {/* Placeholders for others */}
          {!['About', 'Timing', 'Facilities'].includes(activeStep) && (
            <div className="py-12 text-center text-gray-400 font-medium">
              This section is coming soon.
            </div>
          )}
        </div>

        {/* Right Info Box */}
        <div className="w-72 shrink-0">
          <div className="bg-black text-white rounded-2xl p-6 shadow-xl sticky top-28">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Lightbulb size={20} className="text-yellow-400" /> Tips
            </h3>
            <p className="text-sm leading-relaxed text-gray-300">
              {activeStep === 'About' && "Describe your outlet so that your customers can explore."}
              {activeStep === 'Timing' && "Set your default opening hours. This affects booking availability globally."}
              {activeStep === 'Facilities' && "Manage rooms, courts, or specific areas within your outlet here."}
              {!['About', 'Timing', 'Facilities'].includes(activeStep) && "Helpful tips will appear here based on your selection."}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// -------------------------------------------------------------
// ABOUT TAB COMPONENT
// -------------------------------------------------------------
function AboutTab() {
  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">About your outlet</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Outlet name</label>
          <input 
            type="text" 
            defaultValue="Nex Studio"
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D1B4B]"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-semibold text-gray-700">Description</label>
            <span className="text-xs text-gray-400">211/1000</span>
          </div>
          
          <div className="border border-gray-300 rounded-xl bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#1D1B4B]">
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-3 border-b border-gray-200 bg-gray-50 flex-wrap">
              <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><Bold size={16} /></button>
              <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><Italic size={16} /></button>
              <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><Underline size={16} /></button>
              <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><Strikethrough size={16} /></button>
              <div className="w-px h-4 bg-gray-300 mx-1"></div>
              <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><AlignLeft size={16} /></button>
              <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><AlignCenter size={16} /></button>
              <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><AlignRight size={16} /></button>
              <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><AlignJustify size={16} /></button>
              <div className="w-px h-4 bg-gray-300 mx-1"></div>
              <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><List size={16} /></button>
              <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><ListOrdered size={16} /></button>
              <div className="w-px h-4 bg-gray-300 mx-1"></div>
              <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><ImageIcon size={16} /></button>
              <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><Link2 size={16} /></button>
            </div>
            {/* Textarea */}
            <textarea 
              rows={5}
              defaultValue="Our yoga studio offers a peaceful and welcoming environment for yogis of all levels. With experienced instructors and a variety of classes to choose from, you're sure to find the perfect practice for your needs."
              className="w-full p-4 text-sm text-gray-800 resize-none outline-none border-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Contact number (Optional)</label>
          <div className="flex">
            <div className="flex items-center gap-2 px-4 border border-r-0 border-gray-300 bg-white rounded-l-xl">
              <span className="text-xl">🇸🇬</span> <ChevronDown size={14} className="text-gray-500" />
            </div>
            <input 
              type="text" 
              defaultValue="+65 6455-9790"
              className="flex-1 bg-white border border-gray-300 rounded-r-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D1B4B]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email address (Optional)</label>
          <input 
            type="email" 
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D1B4B]"
          />
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// TIMING TAB COMPONENT
// -------------------------------------------------------------
function TimingTab() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-900 mb-10">What are your opening hours?</h2>

      <div className="space-y-6">
        {days.map(day => (
          <div key={day} className="flex items-center gap-6">
            <div className="flex items-center gap-3 w-32 shrink-0">
              <div className="w-5 h-5 rounded border-2 border-gray-300 bg-black flex items-center justify-center">
                <CheckCircle2 size={14} className="text-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm">{day}</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <select className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium outline-none focus:border-[#1D1B4B]">
                  <option>08:00 AM</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
              <span className="text-gray-300 font-bold">-</span>
              <div className="relative">
                <select className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium outline-none focus:border-[#1D1B4B]">
                  <option>09:00 PM</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>

            <button className="text-[#1D1B4B] text-sm font-bold ml-2 hover:underline">
              Apply To All
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// FACILITIES TAB COMPONENT
// -------------------------------------------------------------
function FacilitiesTab() {
  const facilities = [
    { id: 1, name: 'Tennis Court 2', desc: 'Tennis Court 2', pax: 4, img: 'bg-orange-200' },
    { id: 2, name: 'Tennis Court 1', desc: 'Tennis Court for max 4 pax', pax: 4, img: 'bg-orange-200' },
    { id: 3, name: 'Padel Court B', desc: 'Padel Court', pax: 4, img: 'bg-blue-200' },
  ];

  return (
    <div className="animate-fade-in">
      
      {/* Level Tabs (mock) */}
      <div className="flex border-b border-gray-200 mb-8">
        <button className="bg-black text-white px-6 py-2.5 font-bold rounded-t-xl text-sm">
          Level 1
        </button>
      </div>

      <button className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl py-4 font-bold text-gray-900 mb-8 hover:bg-gray-50 transition-colors shadow-sm text-sm">
        <Plus size={18} /> Add facility
      </button>

      <div className="space-y-4">
        {facilities.map(fac => (
          <div key={fac.id} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 flex items-start justify-between group">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-bold text-lg text-gray-900">{fac.name}</h3>
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                  Active
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{fac.desc}</p>
              <div className="flex items-center gap-1.5 text-sm text-gray-900 font-semibold mb-4">
                <Users size={14} className="text-gray-500" /> {fac.pax} pax
              </div>
              <div className={cn("w-20 h-12 rounded-lg border border-gray-200", fac.img)}></div>
            </div>

            <div className="flex items-center gap-3 text-gray-400">
              <button className="hover:text-black"><Pencil size={16} /></button>
              <button className="hover:text-red-500"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Room Layout Mapper Mock (from image-3) */}
      <div className="mt-12">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-1">Room layout <span className="w-4 h-4 rounded-full border border-gray-400 text-gray-400 flex items-center justify-center text-[10px] ml-1">?</span></h3>
        
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8 text-center mb-8 relative">
          <h4 className="text-xl font-black tracking-widest text-[#B5A58A] mb-8 uppercase">Shine Cycle Bike Map</h4>
          <div className="flex justify-center items-center gap-8 mb-8 relative">
            <div className="text-[10px] font-bold text-gray-400 transform -rotate-90 absolute left-4">ENTRANCE</div>
            <div className="border-2 border-black p-4 font-bold text-sm tracking-wider w-32 ml-12">INSTRUCTOR</div>
            <div className="border border-black p-2 text-left text-xs font-bold leading-tight absolute right-4">
              <div><span className="inline-block w-4 text-center">🚲</span> BIKES</div>
              <div><span className="inline-block w-4 text-center">❄️</span> FAN</div>
              <div><span className="inline-block w-4 text-center">⬜</span> STAGE</div>
            </div>
          </div>

          {/* Semicircle layout mockup */}
          <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
            {/* Just a visual approximation */}
            <div className="w-full flex justify-center gap-3 mb-2">
              {[1,2,3,4,5,6,7,8,9,10,11].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-xs font-bold">{i}</div>
              ))}
            </div>
            <div className="w-full flex justify-center gap-3 mb-2">
              {[12,13,14,15,16,17,18,19,20,21,22].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-xs font-bold">{i}</div>
              ))}
            </div>
            <div className="w-full flex justify-center gap-3">
              {[23,24,25,26,27,28,29,30,31,32,33].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-xs font-bold">{i}</div>
              ))}
            </div>
          </div>
        </div>

        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-1">Spot name <span className="w-4 h-4 rounded-full border border-gray-400 text-gray-400 flex items-center justify-center text-[10px] ml-1">?</span></h3>
        <div className="bg-gray-100 rounded-2xl p-6 border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array.from({length: 33}).map((_, idx) => (
              <div key={idx} className="flex items-center justify-center gap-3">
                <span className="text-xs font-bold text-gray-500 w-4 text-right">{idx + 1}</span>
                <input 
                  type="text" 
                  defaultValue={idx + 1} 
                  className="w-12 h-12 bg-white border border-gray-300 rounded-xl text-center font-bold text-base focus:outline-none focus:border-[#1D1B4B] focus:ring-1 focus:ring-[#1D1B4B]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
