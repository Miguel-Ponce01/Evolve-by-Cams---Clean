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
  Search,
  Lightbulb,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Step = 'Details' | 'Upload image' | 'What customer should bring' | 'Pricing plan';

export default function EditClassPage() {
  const [activeStep, setActiveStep] = useState<Step>('Details');
  
  // Form state
  const [showListing, setShowListing] = useState(true);
  const [className, setClassName] = useState('Hot Yoga');
  const [description, setDescription] = useState(
    'Vinyasa means "to place in a special way" and, in this case, yoga postures. Vinyasa yoga is often considered the most athletic yoga style, and was adapted from ashtanga yoga in the 1980s. Many types of yoga can also be considered "vinyasa flows," such as ashtanga, power yoga, and prana.'
  );
  const [category, setCategory] = useState('Yoga');

  const steps: Step[] = ['Details', 'Upload image', 'What customer should bring', 'Pricing plan'];

  return (
    <div className="bg-[#F9FAFB] min-h-screen font-sans flex flex-col relative text-black animate-fade-in">
      
      {/* Top Bar */}
      <div className="h-20 border-b border-gray-200 bg-white flex items-center justify-end px-8 gap-4 sticky top-0 z-20">
        <span className="text-xs text-gray-400 font-medium mr-2">Saved 14 days ago</span>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 text-sm">
          <Eye size={16} className="text-[#1D1B4B]" /> Preview
        </button>
        <Link 
          href="/portal/classes"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 text-sm"
        >
          Save & Exit
        </Link>
      </div>

      <div className="flex flex-1 max-w-[1200px] w-full mx-auto p-8 gap-12">
        
        {/* Left Sidebar Steps */}
        <div className="w-64 shrink-0">
          <div className="text-sm text-gray-500 font-medium mb-2">
            <Link href="/portal/classes" className="hover:text-black">Classes</Link> &gt; <span className="text-black font-bold">{className}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{className}</h1>
          
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

        {/* Main Content Form */}
        <div className="flex-1 max-w-xl">
          {activeStep === 'Details' && (
            <div className="animate-fade-in space-y-6">
              
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Edit details of your class</h2>

              {/* Online Store Listing Toggle */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Show class listing on Online Store</h3>
                  <p className="text-xs text-gray-500 font-medium">Allow customers to view this listing</p>
                </div>

                <button 
                  type="button"
                  onClick={() => setShowListing(!showListing)}
                  className={cn(
                    "w-12 h-6 rounded-full relative transition-colors p-1 cursor-pointer",
                    showListing ? "bg-green-500" : "bg-gray-300"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full bg-white transition-transform",
                    showListing ? "translate-x-6" : "translate-x-0"
                  )} />
                </button>
              </div>

              {/* Class Name */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-gray-700">Class name</label>
                  <span className="text-xs text-gray-400">{className.length}/100</span>
                </div>
                <input 
                  type="text" 
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1D1B4B]"
                />
              </div>

              {/* Description */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-gray-700">Description</label>
                  <span className="text-xs text-gray-400">{description.length}/1000</span>
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
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-4 text-sm text-gray-800 resize-none outline-none border-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Class Category */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                  Class category <span className="w-4 h-4 rounded-full border border-gray-400 text-gray-400 flex items-center justify-center text-[10px]">?</span>
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1D1B4B]"
                  />
                  <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Sub category */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                  Sub category (Optional) <span className="w-4 h-4 rounded-full border border-gray-400 text-gray-400 flex items-center justify-center text-[10px]">?</span>
                </label>
                <input 
                  type="text" 
                  placeholder=""
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1D1B4B]"
                />
              </div>

              {/* Next Button */}
              <div className="pt-4 flex justify-center">
                <button 
                  onClick={() => setActiveStep('Upload image')}
                  className="bg-[#1D1B4B] hover:bg-[#2E2B70] text-white px-10 py-3 rounded-full text-sm font-bold transition-colors shadow-md"
                >
                  Next
                </button>
              </div>

            </div>
          )}

          {activeStep !== 'Details' && (
            <div className="py-12 text-center text-gray-400 font-medium">
              Section ({activeStep}) settings loaded.
            </div>
          )}
        </div>

        {/* Right Info Tips Box */}
        <div className="w-72 shrink-0">
          <div className="bg-black text-white rounded-2xl p-6 shadow-xl sticky top-28">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Lightbulb size={20} className="text-yellow-400 fill-yellow-400" /> Tips
            </h3>
            <p className="text-xs leading-relaxed text-gray-300">
              Provide any information necessary to ensure that your customers understand what to expect, whether any prior experience or expertise is required to take this class, and whether there are any equipment needs
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
