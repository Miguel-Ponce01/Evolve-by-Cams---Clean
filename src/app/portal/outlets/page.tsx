'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useBooking } from '@/context/BookingContext';
import { Save, Plus, Trash2, Check, DoorOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Room {
  id: string;
  name: string;
  coachId: string;
  capacity: number;
  description: string;
  notes: string;
  spotBookingsActive: boolean;
  spots: Array<{ id: number; name: string; active: boolean; section: 'pole' | 'silks' | 'hoop' | 'floor' }>;
}

function generateId() {
  return `room-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function createDefaultRoom(name: string): Room {
  return {
    id: generateId(),
    name,
    coachId: 'cams',
    capacity: 8,
    description: '',
    notes: '',
    spotBookingsActive: true,
    spots: Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      name: `Spot #${i + 1}`,
      active: true,
      section: 'floor',
    })),
  };
}

export default function OutletsPage() {
  const { classes } = useBooking();

  const [rooms, setRooms] = useState<Room[]>([
    {
      id: 'room-1',
      name: 'Main Studio Room CDO',
      coachId: 'cams',
      capacity: 12,
      description: 'Primary studio room featuring professional training poles, aerial rigging, and mirrors.',
      notes: 'Ensure mats are placed under all rigging spots before every session.',
      spotBookingsActive: true,
      spots: [
        { id: 1,  name: 'Mat A1 (Pole)',   active: true,  section: 'pole'  },
        { id: 2,  name: 'Mat A2 (Pole)',   active: true,  section: 'pole'  },
        { id: 3,  name: 'Mat A3 (Pole)',   active: true,  section: 'pole'  },
        { id: 4,  name: 'Hoop B1',         active: true,  section: 'hoop'  },
        { id: 5,  name: 'Hoop B2',         active: true,  section: 'hoop'  },
        { id: 6,  name: 'Silk C1',         active: true,  section: 'silks' },
        { id: 7,  name: 'Silk C2',         active: true,  section: 'silks' },
        { id: 8,  name: 'Floor space 1',   active: true,  section: 'floor' },
        { id: 9,  name: 'Floor space 2',   active: true,  section: 'floor' },
        { id: 10, name: 'Floor space 3',   active: true,  section: 'floor' },
        { id: 11, name: 'Hoop B3',         active: false, section: 'hoop'  },
        { id: 12, name: 'Silk C3',         active: false, section: 'silks' },
      ],
    },
  ]);

  const [activeRoomId, setActiveRoomId]   = useState<string>('room-1');
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [newRoomName, setNewRoomName]     = useState('');
  const [showAddPanel, setShowAddPanel]   = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const activeRoom = rooms.find(r => r.id === activeRoomId) ?? rooms[0];

  // ── Persist to localStorage ─────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('evolve_rooms_config');
      if (cached) {
        try { setRooms(JSON.parse(cached)); } catch {}
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('evolve_rooms_config', JSON.stringify(rooms));
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  // ── Room CRUD ───────────────────────────────────────────────────────────────
  const handleAddRoom = () => {
    const name = newRoomName.trim() || `New Room ${rooms.length + 1}`;
    const newRoom = createDefaultRoom(name);
    setRooms(prev => [...prev, newRoom]);
    setActiveRoomId(newRoom.id);
    setNewRoomName('');
    setShowAddPanel(false);
  };

  const handleDeleteRoom = (id: string) => {
    if (rooms.length <= 1) return; // always keep at least 1
    const remaining = rooms.filter(r => r.id !== id);
    setRooms(remaining);
    if (activeRoomId === id) setActiveRoomId(remaining[0].id);
    setConfirmDeleteId(null);
  };

  // ── Room field editing ──────────────────────────────────────────────────────
  const handleUpdateRoomField = (field: keyof Room, val: any) => {
    setRooms(prev => prev.map(r => r.id === activeRoomId ? { ...r, [field]: val } : r));
  };

  const handleUpdateSpot = (spotId: number, field: 'name' | 'active' | 'section', val: any) => {
    setRooms(prev => prev.map(r => {
      if (r.id !== activeRoomId) return r;
      return { ...r, spots: r.spots.map(s => s.id === spotId ? { ...s, [field]: val } : s) };
    }));
  };

  const handleCapacityChange = (newCap: number) => {
    const clamped = Math.max(1, Math.min(20, newCap));
    let updatedSpots = [...activeRoom.spots];
    if (updatedSpots.length < clamped) {
      for (let i = updatedSpots.length + 1; i <= clamped; i++) {
        updatedSpots.push({ id: i, name: `Spot #${i}`, active: true, section: 'floor' });
      }
    } else {
      updatedSpots = updatedSpots.slice(0, clamped);
    }
    setRooms(prev => prev.map(r =>
      r.id === activeRoomId ? { ...r, capacity: clamped, spots: updatedSpots } : r
    ));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F3] py-10 px-6 sm:px-8 font-sans selection:bg-[#C9A961] selection:text-black">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="border-b border-zinc-900 pb-7 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9A961] font-bold">
              Business Settings
            </span>
            <h1 className="text-3xl font-serif font-light tracking-[0.08em] text-white mt-1">
              ROOMS
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Manage your studio rooms, configure spot layouts, and assign default coaches.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddPanel(v => !v)}
              className="px-5 py-3 rounded-xl text-black font-black uppercase text-[9px] tracking-widest flex items-center gap-1.5 transition-all duration-150 active:scale-[0.96]"
              style={{ background: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
            >
              <Plus size={12} /> Add Room
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-3 rounded-xl text-black font-black uppercase text-[9px] tracking-widest flex items-center gap-1.5 transition-all duration-150 active:scale-[0.96]"
              style={{ background: '#C9A961', boxShadow: '0 2px 8px rgba(201,169,97,0.25)' }}
            >
              <Save size={12} /> Save Rooms
            </button>
          </div>
        </div>

        {/* ── Success Toast ─────────────────────────────────────────────── */}
        {showSavedToast && (
          <div className="flex items-center gap-2 p-3 rounded-xl text-xs font-bold text-emerald-400"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <Check size={14} /> Room configuration saved successfully!
          </div>
        )}

        {/* ── Add Room Panel ───────────────────────────────────────────── */}
        {showAddPanel && (
          <div
            className="rounded-2xl p-5 space-y-3"
            style={{ background: '#121212', border: '1px solid rgba(201,169,97,0.25)' }}
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-[#C9A961]">New Room</p>
            <div className="flex gap-3">
              <input
                autoFocus
                type="text"
                placeholder="e.g. Studio Room B – Manila"
                value={newRoomName}
                onChange={e => setNewRoomName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddRoom()}
                className="flex-1 bg-[#1C1C1C] border border-zinc-800 text-sm text-white px-3 py-2 rounded-xl focus:outline-none focus:border-[#C9A961] placeholder:text-zinc-600"
              />
              <button
                onClick={handleAddRoom}
                className="px-5 py-2 rounded-xl text-black font-black text-[11px] uppercase tracking-widest flex items-center gap-1.5 transition-all duration-150 active:scale-[0.96]"
                style={{ background: '#C9A961' }}
              >
                <Plus size={12} /> Create
              </button>
              <button
                onClick={() => { setShowAddPanel(false); setNewRoomName(''); }}
                className="px-4 py-2 rounded-xl text-zinc-400 font-bold text-[11px] uppercase tracking-widest transition-all duration-150 hover:text-white"
                style={{ background: '#1C1C1C', border: '1px solid #2a2a2a' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Room Tabs ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap">
          {rooms.map(room => (
            <div key={room.id} className="relative group flex items-center gap-1">
              <button
                onClick={() => setActiveRoomId(room.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all duration-150 active:scale-[0.97]"
                style={{
                  background: room.id === activeRoomId ? '#C9A961' : '#1C1C1C',
                  color:      room.id === activeRoomId ? '#000000' : '#9CA3AF',
                  border:     room.id === activeRoomId ? '1px solid transparent' : '1px solid #2a2a2a',
                }}
              >
                <DoorOpen size={13} />
                {room.name}
              </button>
              {/* Delete button — show on hover, always visible for non-active */}
              {rooms.length > 1 && (
                confirmDeleteId === room.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-red-400 transition-all active:scale-[0.96]"
                      style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold text-zinc-500 hover:text-white transition-all"
                      style={{ background: '#1C1C1C', border: '1px solid #2a2a2a' }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(room.id)}
                    className="w-6 h-6 flex items-center justify-center rounded-lg transition-all duration-150 opacity-0 group-hover:opacity-100 hover:text-red-400"
                    style={{ background: '#1C1C1C', color: '#6B7280', border: '1px solid #2a2a2a' }}
                    title={`Remove "${room.name}"`}
                  >
                    <Trash2 size={11} />
                  </button>
                )
              )}
            </div>
          ))}
        </div>

        {/* ── Editor Grid ───────────────────────────────────────────────── */}
        {activeRoom && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: Room Details Form */}
            <div
              className="lg:col-span-1 space-y-5 rounded-3xl p-6"
              style={{ background: '#121212', border: '1px solid #1e1e1e' }}
            >
              <h3 className="text-[11px] font-black uppercase tracking-widest text-white">About the Room</h3>

              <div className="space-y-4">
                {/* Room Name */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-zinc-500">Room Name</label>
                  <input
                    type="text"
                    value={activeRoom.name}
                    onChange={e => handleUpdateRoomField('name', e.target.value)}
                    className="w-full bg-[#1C1C1C] border border-zinc-800 text-sm text-white px-3 py-2 rounded-xl focus:outline-none focus:border-[#C9A961]"
                  />
                </div>

                {/* Default Coach */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-zinc-500">Default Coach</label>
                  <select
                    value={activeRoom.coachId}
                    onChange={e => handleUpdateRoomField('coachId', e.target.value)}
                    className="w-full bg-[#1C1C1C] border border-zinc-800 text-sm text-white px-3 py-2 rounded-xl focus:outline-none focus:border-[#C9A961]"
                  >
                    <option value="cams">Cams Rivera</option>
                    <option value="tweetie">Tweetie C. Macas</option>
                    <option value="alex">Alex B. Nolasco</option>
                  </select>
                </div>

                {/* Capacity */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-zinc-500">Capacity Limit (1 – 20)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={activeRoom.capacity}
                    onChange={e => handleCapacityChange(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#1C1C1C] border border-zinc-800 text-sm text-white px-3 py-2 rounded-xl focus:outline-none focus:border-[#C9A961]"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-zinc-500">Description</label>
                  <textarea
                    value={activeRoom.description}
                    onChange={e => handleUpdateRoomField('description', e.target.value)}
                    rows={3}
                    className="w-full bg-[#1C1C1C] border border-zinc-800 text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-[#C9A961] resize-none"
                  />
                </div>

                {/* Instructor Notes */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-zinc-500">Special Instructor Notes</label>
                  <textarea
                    value={activeRoom.notes}
                    onChange={e => handleUpdateRoomField('notes', e.target.value)}
                    rows={2}
                    className="w-full bg-[#1C1C1C] border border-zinc-800 text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-[#C9A961] resize-none"
                  />
                </div>

                {/* Spot Bookings Toggle */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-900">
                  <span className="text-xs font-bold text-zinc-400">Toggle Spot Bookings Mode</span>
                  <input
                    type="checkbox"
                    checked={activeRoom.spotBookingsActive}
                    onChange={e => handleUpdateRoomField('spotBookingsActive', e.target.checked)}
                    className="w-4 h-4 rounded bg-zinc-900 border-zinc-800 focus:ring-[#C9A961] accent-[#C9A961]"
                  />
                </div>
              </div>
            </div>

            {/* Right: Interactive Spot Layout */}
            <div
              className="lg:col-span-2 space-y-5 rounded-3xl p-6"
              style={{ background: '#121212', border: '1px solid #1e1e1e' }}
            >
              <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-white">
                    Interactive Spot Layout
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                    Click spots to toggle status, name mats, or set disciplines
                  </p>
                </div>
                <Badge className="bg-[#C9A961]/10 text-[#C9A961] border border-[#C9A961]/20 uppercase text-[8px] font-black tracking-wider">
                  {activeRoom.spots.filter(s => s.active).length} Active Spots
                </Badge>
              </div>

              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl"
                style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid #1e1e1e' }}
              >
                {activeRoom.spots.map(spot => (
                  <div
                    key={spot.id}
                    className="p-3.5 rounded-xl border flex flex-col justify-between gap-3 text-left transition-all relative"
                    style={{
                      background: spot.active ? 'rgba(201,169,97,0.05)' : 'rgba(28,28,28,0.4)',
                      borderColor: spot.active ? 'rgba(201,169,97,0.3)' : '#1e1e1e',
                      color: spot.active ? '#C9A961' : '#6B7280',
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-bold font-mono">Spot #{spot.id}</span>
                      <input
                        type="checkbox"
                        checked={spot.active}
                        onChange={e => handleUpdateSpot(spot.id, 'active', e.target.checked)}
                        className="w-3 h-3 rounded bg-zinc-900 border-zinc-800 focus:ring-[#C9A961] accent-[#C9A961]"
                      />
                    </div>
                    {spot.active ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={spot.name}
                          onChange={e => handleUpdateSpot(spot.id, 'name', e.target.value)}
                          className="w-full bg-[#1C1C1C] border border-zinc-800 text-[10px] font-bold text-white px-2 py-1 rounded focus:outline-none focus:border-[#C9A961]"
                        />
                        <select
                          value={spot.section}
                          onChange={e => handleUpdateSpot(spot.id, 'section', e.target.value as any)}
                          className="w-full bg-[#1C1C1C] border border-zinc-800 text-[9px] font-bold text-[#C9A961] px-2 py-0.5 rounded focus:outline-none"
                        >
                          <option value="pole">Pole</option>
                          <option value="hoop">Hoop</option>
                          <option value="silks">Silks</option>
                          <option value="floor">Floor</option>
                        </select>
                      </div>
                    ) : (
                      <span className="text-[10px] italic text-zinc-600 block mt-2">Inactive</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
