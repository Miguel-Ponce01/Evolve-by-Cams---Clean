'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useBooking } from '@/context/BookingContext';
import { formatDate } from '@/lib/utils';
import { 
  ArrowLeft, 
  Search, 
  UserPlus, 
  User, 
  Edit3, 
  X, 
  Check, 
  AlertTriangle, 
  Flame, 
  Dumbbell, 
  Award,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CustomerDirectoryPage() {
  const { customers, bookings, getClassById, cancelBooking, addOrUpdateCustomer } = useBooking();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustId, setSelectedCustId] = useState<string | null>(null);
  
  // Registration form
  const [showRegForm, setShowRegForm] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCredits, setRegCredits] = useState(0);
  const [regTier, setRegTier] = useState('None');
  
  // Edit mode
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCredits, setEditCredits] = useState(0);
  const [editTier, setEditTier] = useState('None');

  const [toastMsg, setToastMsg] = useState('');
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  // Search filter
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery))
    );
  }, [customers, searchQuery]);

  const activeCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustId);
  }, [customers, selectedCustId]);

  const activeCustomerBookings = useMemo(() => {
    if (!activeCustomer) return [];
    // Bookings for this customer
    return bookings.filter(b => b.customerEmail.toLowerCase() === activeCustomer.email.toLowerCase());
  }, [bookings, activeCustomer]);

  const upcomingBookings = useMemo(() => {
    return activeCustomerBookings.filter(b => b.status === 'upcoming');
  }, [activeCustomerBookings]);

  const pastBookings = useMemo(() => {
    return activeCustomerBookings.filter(b => b.status === 'attended' || b.status === 'cancelled');
  }, [activeCustomerBookings]);

  const handleSelectCustomer = (id: string) => {
    setSelectedCustId(id);
    setEditMode(false);
    const c = customers.find(x => x.id === id);
    if (c) {
      setEditName(c.name);
      setEditEmail(c.email);
      setEditPhone(c.phone || '');
      setEditCredits(c.credits);
      setEditTier(c.membershipTier);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      setToastMsg('⚠ Client Name and Email are required.');
      return;
    }
    const newCust = addOrUpdateCustomer({
      name: regName,
      email: regEmail,
      phone: regPhone,
      credits: regCredits,
      membershipTier: regTier
    });
    setToastMsg(`✓ Successfully registered customer: ${newCust.name}`);
    
    // reset form
    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegCredits(0);
    setRegTier('None');
    setShowRegForm(false);
    
    // Select the newly created customer
    handleSelectCustomer(newCust.id);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleSaveEdit = () => {
    if (!editName.trim() || !editEmail.trim()) {
      setToastMsg('⚠ Name and Email cannot be empty.');
      return;
    }
    addOrUpdateCustomer({
      id: selectedCustId || undefined,
      name: editName,
      email: editEmail,
      phone: editPhone,
      credits: editCredits,
      membershipTier: editTier
    });
    setToastMsg('✓ Customer profile updated successfully.');
    setEditMode(false);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleCancelBooking = (bookingId: string) => {
    const res = cancelBooking(bookingId);
    setToastMsg(`✓ ${res.message}`);
    setCancelTarget(null);
    setTimeout(() => setToastMsg(''), 4000);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-primary font-bold">POS Administration</span>
          <h1 className="text-3xl font-heading font-black tracking-wide uppercase">Client Directory Registry</h1>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-400 font-semibold animate-slide-up">
          {toastMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Directory search list */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search by client name/email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:border-primary"
              />
            </div>
            <button
              onClick={() => {
                setShowRegForm(!showRegForm);
                setSelectedCustId(null);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary text-xs font-bold uppercase tracking-wider rounded-pill hover:bg-primary-press active:scale-[0.98] transition-all cursor-pointer shadow-sm"
            >
              <UserPlus size={14} /> Add Client
            </button>
          </div>

          {showRegForm ? (
            /* Onboard new client form */
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4 animate-in slide-in-from-left-5">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <h3 className="font-bold text-sm text-primary uppercase font-mono">Register New Customer</h3>
                <button onClick={() => setShowRegForm(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-muted-foreground mb-1 font-semibold uppercase tracking-wider text-[10px] font-mono">Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Sarah Jenkins"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1 font-semibold uppercase tracking-wider text-[10px] font-mono">Client Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@example.com"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1 font-semibold uppercase tracking-wider text-[10px] font-mono">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+63 9xx xxx xxxx"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground mb-1 font-semibold uppercase tracking-wider text-[10px] font-mono">Initial Credits</label>
                    <input
                      type="number"
                      min="0"
                      value={regCredits}
                      onChange={e => setRegCredits(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1 font-semibold uppercase tracking-wider text-[10px] font-mono">Membership Tier</label>
                    <select
                      value={regTier}
                      onChange={e => setRegTier(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
                    >
                      <option value="None">None</option>
                      <option value="Single Session">Single Session</option>
                      <option value="5-Class Pack">5-Class Pack</option>
                      <option value="10-Class Pack">10-Class Pack</option>
                      <option value="Unlimited Gold">Unlimited Gold</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn-primary-pill w-full text-center uppercase tracking-widest cursor-pointer">
                  Confirm Client Registration
                </button>
              </form>
            </div>
          ) : (
            /* Scrollable list of active clients */
            <div className="bg-card border border-border rounded-3xl divide-y divide-border/60 max-h-[550px] overflow-y-auto">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-xl mb-1">🔍</p>
                  <p className="text-xs text-muted-foreground">No customer records found.</p>
                </div>
              ) : (
                filteredCustomers.map(c => {
                  const isSelected = c.id === selectedCustId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleSelectCustomer(c.id)}
                      className={`w-full text-left p-4 flex justify-between items-center transition-colors cursor-pointer ${
                        isSelected ? 'bg-primary/10' : 'hover:bg-secondary/40'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                        {c.phone && <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{c.phone}</p>}
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={`font-mono text-xs font-black ${
                          c.credits > 0 ? 'border-primary/20 text-primary bg-primary/5' : 'border-border text-muted-foreground'
                        }`}>
                          {c.credits === 999 ? '∞' : c.credits} credits
                        </Badge>
                        <p className="text-[10px] text-muted-foreground font-semibold mt-1 uppercase tracking-wider">{c.membershipTier}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Right Side: Manage client details desk */}
        <div className="lg:col-span-7">
          {!activeCustomer ? (
            <div className="bg-card/30 border border-border/50 rounded-3xl text-center py-16 px-6">
              <span className="text-4xl block mb-2">🧑‍💻</span>
              <h3 className="font-heading font-black text-xl uppercase">Customer Panel</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">Please select an existing customer from the registry directory list on the left to edit details, add class packages, or review class rosters.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in-20">
              {/* Profile Card */}
              <div className="bg-card border border-border rounded-3xl p-5 relative overflow-hidden">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-2xl font-black">
                    {activeCustomer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    {editMode ? (
                      <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary text-sm font-semibold"
                            placeholder="Full Name"
                          />
                          <input
                            type="email"
                            value={editEmail}
                            onChange={e => setEditEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary text-sm"
                            placeholder="Email"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="tel"
                            value={editPhone}
                            onChange={e => setEditPhone(e.target.value)}
                            className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary text-xs"
                            placeholder="Phone (Optional)"
                          />
                          <input
                            type="number"
                            value={editCredits}
                            onChange={e => setEditCredits(parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary text-xs font-mono"
                            placeholder="Credits"
                          />
                          <select
                            value={editTier}
                            onChange={e => setEditTier(e.target.value)}
                            className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary text-xs"
                          >
                            <option value="None">None</option>
                            <option value="Single Session">Single Session</option>
                            <option value="5-Class Pack">5-Class Pack</option>
                            <option value="10-Class Pack">10-Class Pack</option>
                            <option value="Unlimited Gold">Unlimited Gold</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={handleSaveEdit} className="px-4 py-2 rounded-pill bg-primary text-on-primary text-xs font-bold uppercase tracking-wider hover:bg-primary-press active:scale-[0.98] transition-all cursor-pointer">Save Updates</button>
                          <button onClick={() => setEditMode(false)} className="px-4 py-2 rounded-pill bg-canvas-lavender text-ink text-xs font-bold uppercase tracking-wider hover:bg-primary/10 active:scale-[0.98] transition-all cursor-pointer">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-xl font-bold text-foreground">{activeCustomer.name}</h3>
                        <p className="text-sm text-muted-foreground">{activeCustomer.email} {activeCustomer.phone ? `· ${activeCustomer.phone}` : ''}</p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wide border-primary/20 text-primary bg-primary/5">
                            Tier: {activeCustomer.membershipTier}
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>
                  {!editMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                      title="Edit Customer Profile"
                    >
                      <Edit3 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-card border border-border p-3.5 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1 text-primary">
                    <Flame size={15} />
                  </div>
                  <p className="font-black text-2xl">{activeCustomer.streak}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Attendance Streak</p>
                </div>
                <div className="rounded-2xl bg-card border border-border p-3.5 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1 text-primary">
                    <Dumbbell size={15} />
                  </div>
                  <p className="font-black text-2xl">{activeCustomer.totalClassesAttended}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Workouts Logged</p>
                </div>
                <div className="rounded-2xl bg-card border border-border p-3.5 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1 text-primary">
                    <Award size={15} />
                  </div>
                  <p className="font-black text-2xl font-mono text-primary">{activeCustomer.credits === 999 ? '∞' : activeCustomer.credits}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Available Credits</p>
                </div>
              </div>

              {/* Roster of Upcoming booked classes */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-foreground uppercase tracking-wide">Upcoming Schedule Books ({upcomingBookings.length})</h4>
                {upcomingBookings.length === 0 ? (
                  <div className="bg-card/20 border border-dashed border-border rounded-2xl p-6 text-center text-xs text-muted-foreground">
                    This client has no active upcoming reservations.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingBookings.map(b => {
                      const cls = getClassById(b.classId);
                      if (!cls) return null;
                      const isLate = new Date(`${cls.date}T${cls.time.includes('PM') ? parseInt(cls.time) + 12 : parseInt(cls.time)}:00:00`) < new Date();
                      
                      return (
                        <div key={b.id} className="bg-card border border-border rounded-2xl p-4 flex justify-between items-start gap-4 text-xs font-mono">
                          <div className="space-y-1">
                            <p className="font-bold text-sm font-sans text-foreground">{cls.title}</p>
                            <p className="text-muted-foreground">Date: {formatDate(cls.date)}</p>
                            <p className="text-muted-foreground">Time: {cls.time} · Coach: {cls.instructor.name}</p>
                            <p className="text-primary font-bold">Spot secured: #{b.spotNumber}</p>
                            {isLate && (
                              <div className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 rounded-lg px-2 py-1 mt-1 text-[10px]">
                                <AlertTriangle size={12} />
                                Late cancellation warning applies
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            {cancelTarget === b.id ? (
                              <div className="bg-destructive/10 border border-red-500/20 p-2 rounded-xl text-center space-y-1.5 animate-in fade-in-10">
                                <p className="text-[10px] text-red-300 font-bold">Confirm Cancellation?</p>
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => handleCancelBooking(b.id)}
                                    className="px-2 py-1 bg-destructive text-white rounded text-[10px] font-bold cursor-pointer"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    onClick={() => setCancelTarget(null)}
                                    className="px-2 py-1 bg-secondary rounded text-[10px] cursor-pointer"
                                  >
                                    No
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setCancelTarget(b.id)}
                                className="w-7 h-7 rounded-full bg-secondary hover:bg-destructive/20 hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                                title="Cancel Client Booking"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Roster of past bookings history */}
              {pastBookings.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-foreground uppercase tracking-wide">Attended History ({pastBookings.length})</h4>
                  <div className="bg-card border border-border rounded-2xl divide-y divide-border/60 text-xs">
                    {pastBookings.slice(0, 5).map(b => {
                      const cls = getClassById(b.classId);
                      return (
                        <div key={b.id} className="p-3.5 flex justify-between items-center gap-4">
                          <div>
                            <p className="font-semibold">{cls?.title ?? 'Fitness Class'}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{cls ? formatDate(cls.date) : ''} · Spot #{b.spotNumber}</p>
                          </div>
                          <Badge variant="outline" className={b.status === 'cancelled' ? 'border-red-500/20 text-red-400 bg-red-500/5' : 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5'}>
                            {b.status}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
