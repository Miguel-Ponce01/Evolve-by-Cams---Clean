'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useBooking } from '@/context/BookingContext';
import { formatDate, parseClassDateTime, cn } from '@/lib/utils';
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
  Trash2,
  Heart,
  ShieldAlert,
  Calendar,
  UserCheck,
  MapPin,
  Sparkles,
  Activity,
  Coins,
  Receipt,
  Printer,
  Download,
  Tag,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CustomSelect } from '@/components/ui/custom-select';
import type { Transaction } from '@/types';

// ── Birthday today check ──────────────────────────────────────────────────
function isBirthdayToday(birthday?: string): boolean {
  if (!birthday) return false;
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return birthday.slice(5) === `${mm}-${dd}`; // compare MM-DD
}

const genderOptions = [
  { value: '', label: 'Not Specified' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
  { value: 'Prefer not to say', label: 'Prefer not to say' }
];

const tierOptions = [
  { value: 'None', label: 'None' },
  { value: 'Single Session', label: 'Single Session' },
  { value: '5-Class Pack', label: '5-Class Pack' },
  { value: '10-Class Pack', label: '10-Class Pack' },
  { value: 'Unlimited Gold', label: 'Unlimited Gold' }
];

const referralOptions = [
  { value: '', label: 'Select Channel' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Google', label: 'Google Search' },
  { value: 'Friend', label: 'Friend Referral' },
  { value: 'Walk-in', label: 'Walk-in / Direct' },
  { value: 'Other', label: 'Other' }
];

export default function CustomerDirectoryPage() {
  const { customers, bookings, getClassById, cancelBooking, addOrUpdateCustomer, transactions, addTransaction } = useBooking();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustId, setSelectedCustId] = useState<string | null>(null);
  
  // Registration form
  const [showRegForm, setShowRegForm] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCredits, setRegCredits] = useState(0);
  const [regTier, setRegTier] = useState('None');
  const [regEmergencyContactName, setRegEmergencyContactName] = useState('');
  const [regEmergencyContactPhone, setRegEmergencyContactPhone] = useState('');
  const [regEmergencyContactRelation, setRegEmergencyContactRelation] = useState('');
  const [regMedicalNotes, setRegMedicalNotes] = useState('');
  const [regBirthday, setRegBirthday] = useState('');
  const [regGender, setRegGender] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regReferralSource, setRegReferralSource] = useState('');
  const [regCommunicationConsent, setRegCommunicationConsent] = useState(false);
  const [regRole, setRegRole] = useState<'student' | 'instructor'>('student');
  
  // Edit mode
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCredits, setEditCredits] = useState(0);
  const [editTier, setEditTier] = useState('None');
  const [editEmergencyContactName, setEditEmergencyContactName] = useState('');
  const [editEmergencyContactPhone, setEditEmergencyContactPhone] = useState('');
  const [editEmergencyContactRelation, setEditEmergencyContactRelation] = useState('');
  const [editMedicalNotes, setEditMedicalNotes] = useState('');
  const [editBirthday, setEditBirthday] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editReferralSource, setEditReferralSource] = useState('');
  const [editCommunicationConsent, setEditCommunicationConsent] = useState(false);

  const [toastMsg, setToastMsg] = useState('');
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  // Tags input state (edit + register)
  const [regTags, setRegTags] = useState<string[]>([]);
  const [regTagInput, setRegTagInput] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('Cams Rivera');

  // ── CSV Export ─────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Membership Tier', 'Credits', 'Classes Attended', 'Tags'];
    const rows = filteredCustomers.map(c => [
      `"${c.name}"`,
      `"${c.email}"`,
      `"${c.phone || ''}"`,
      `"${c.membershipTier}"`,
      c.credits === 999 ? '"Unlimited"' : `"${c.credits}"`,
      `"${c.totalClassesAttended}"`,
      `"${(c.tags || []).join('; ')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evolve-clients-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Administrative override / billing action states
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpCredits, setTopUpCredits] = useState(1);
  const [topUpAmountPaid, setTopUpAmountPaid] = useState(35);
  const [topUpPaymentMethod, setTopUpPaymentMethod] = useState('cash');

  const [showTierModal, setShowTierModal] = useState(false);
  const [selectedNewTier, setSelectedNewTier] = useState('None');
  const [tierAmountPaid, setTierAmountPaid] = useState(0);
  const [tierPaymentMethod, setTierPaymentMethod] = useState('cash');
  const [includeTierCredits, setIncludeTierCredits] = useState(true);

  const [showCancelModal, setShowCancelModal] = useState(false);

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

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

  const customerTransactions = useMemo(() => {
    if (!activeCustomer) return [];
    return transactions.filter(t => t.customerEmail.toLowerCase() === activeCustomer.email.toLowerCase());
  }, [transactions, activeCustomer]);

  const handleTopUpConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer) return;
    
    const newCredits = activeCustomer.credits + topUpCredits;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { streak: _s1, totalClassesAttended: _t1, ...cleanCust } = activeCustomer;
    
    addOrUpdateCustomer({
      ...cleanCust,
      credits: newCredits,
    });
    
    addTransaction({
      type: 'membership',
      customerName: activeCustomer.name,
      customerEmail: activeCustomer.email,
      customerPhone: activeCustomer.phone,
      description: `Top-up: +${topUpCredits} Credits`,
      paymentMethod: topUpPaymentMethod as 'cash' | 'card' | 'credit',
      amount: topUpAmountPaid,
      status: 'paid',
      handledBy: selectedStaff,
    });
    
    setToastMsg(`✓ Successfully topped up ${topUpCredits} credits for ${activeCustomer.name}`);
    setShowTopUpModal(false);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleTierChangeConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer) return;
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { streak: _s2, totalClassesAttended: _t2, ...cleanCust } = activeCustomer;
    
    let newCredits = activeCustomer.credits;
    if (selectedNewTier === 'Unlimited Gold') {
      newCredits = 999;
    } else if (includeTierCredits) {
      if (selectedNewTier === '5-Class Pack') {
        newCredits = activeCustomer.credits + 5;
      } else if (selectedNewTier === '10-Class Pack') {
        newCredits = activeCustomer.credits + 10;
      } else if (selectedNewTier === 'Single Session') {
        newCredits = activeCustomer.credits + 1;
      }
    }
    
    addOrUpdateCustomer({
      ...cleanCust,
      membershipTier: selectedNewTier,
      credits: newCredits,
    });
    
    addTransaction({
      type: 'membership',
      customerName: activeCustomer.name,
      customerEmail: activeCustomer.email,
      customerPhone: activeCustomer.phone,
      description: `Membership change: ${activeCustomer.membershipTier} ➔ ${selectedNewTier}`,
      paymentMethod: tierPaymentMethod as 'cash' | 'card' | 'credit',
      amount: tierAmountPaid,
      status: 'paid',
      handledBy: selectedStaff,
    });
    
    setToastMsg(`✓ Membership tier updated to ${selectedNewTier} for ${activeCustomer.name}`);
    setShowTierModal(false);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleCancelMembershipConfirm = () => {
    if (!activeCustomer) return;
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { streak: _s3, totalClassesAttended: _t3, ...cleanCust } = activeCustomer;
    
    const newCredits = activeCustomer.credits === 999 ? 0 : activeCustomer.credits;
    
    addOrUpdateCustomer({
      ...cleanCust,
      membershipTier: 'None',
      credits: newCredits,
    });
    
    addTransaction({
      type: 'membership',
      customerName: activeCustomer.name,
      customerEmail: activeCustomer.email,
      customerPhone: activeCustomer.phone,
      description: `Membership Cancelled (Tier was: ${activeCustomer.membershipTier})`,
      paymentMethod: 'cash',
      amount: 0,
      status: 'cancelled',
      handledBy: selectedStaff,
    });
    
    setToastMsg(`✓ Cancelled membership for ${activeCustomer.name}`);
    setShowCancelModal(false);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-receipt')?.innerHTML;
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - Evolve Studio</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #18181b; }
              .receipt-container { max-width: 600px; margin: 0 auto; border: 1px solid #e4e4e7; padding: 30px; border-radius: 20px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px dashed #e4e4e7; padding-bottom: 20px; }
              .studio-title { font-size: 28px; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; margin: 0; }
              .studio-subtitle { font-size: 11px; font-weight: 600; text-transform: uppercase; tracking-wider; color: #a1a1aa; margin-top: 4px; }
              .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 12px; margin-bottom: 30px; }
              .meta-label { font-weight: 700; color: #71717a; text-transform: uppercase; font-size: 10px; font-family: monospace; }
              .meta-value { font-weight: 600; margin-top: 2px; }
              .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
              .table th { border-bottom: 2px solid #e4e4e7; padding: 10px 0; text-align: left; color: #71717a; font-family: monospace; font-size: 10px; text-transform: uppercase; }
              .table td { padding: 12px 0; border-bottom: 1px solid #f4f4f5; }
              .text-right { text-align: right; }
              .totals { margin-left: auto; max-width: 250px; font-size: 12px; }
              .total-row { display: flex; justify-content: space-between; padding: 6px 0; }
              .total-row.grand { border-top: 2px solid #e4e4e7; margin-top: 10px; padding-top: 10px; font-size: 16px; font-weight: 900; }
              .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #a1a1aa; border-top: 1px solid #f4f4f5; padding-top: 20px; }
              .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold; text-transform: uppercase; border: 1px solid #e4e4e7; }
              .badge-paid { background-color: #f0fdf4; color: #166534; border-color: #bbf7d0; }
              .badge-cancelled { background-color: #fef2f2; color: #991b1b; border-color: #fecaca; }
              .badge-pending { background-color: #fffbeb; color: #92400e; border-color: #fde68a; }
              @media print {
                body { padding: 0; }
                .receipt-container { border: none; box-shadow: none; padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              \${printContent}
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

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
      setEditEmergencyContactName(c.emergencyContactName || '');
      setEditEmergencyContactPhone(c.emergencyContactPhone || '');
      setEditEmergencyContactRelation(c.emergencyContactRelation || '');
      setEditMedicalNotes(c.medicalNotes || '');
      setEditBirthday(c.birthday || '');
      setEditGender(c.gender || '');
      setEditAddress(c.address || '');
      setEditReferralSource(c.referralSource || '');
      setEditCommunicationConsent(c.communicationConsent || false);
      setEditTags(c.tags || []);
      setEditTagInput('');
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
      membershipTier: regTier,
      emergencyContactName: regEmergencyContactName,
      emergencyContactPhone: regEmergencyContactPhone,
      emergencyContactRelation: regEmergencyContactRelation,
      medicalNotes: regMedicalNotes,
      birthday: regBirthday,
      gender: regGender,
      address: regAddress,
      referralSource: regReferralSource,
      communicationConsent: regCommunicationConsent,
      tags: [...regTags, regRole === 'instructor' ? 'Instructor' : 'Student'],
    });
    setToastMsg(`✓ Successfully registered ${regRole}: ${newCust.name}`);
    
    // reset form
    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegCredits(0);
    setRegTier('None');
    setRegEmergencyContactName('');
    setRegEmergencyContactPhone('');
    setRegEmergencyContactRelation('');
    setRegMedicalNotes('');
    setRegBirthday('');
    setRegGender('');
    setRegAddress('');
    setRegReferralSource('');
    setRegCommunicationConsent(false);
    setRegTags([]);
    setRegTagInput('');
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
      membershipTier: editTier,
      emergencyContactName: editEmergencyContactName,
      emergencyContactPhone: editEmergencyContactPhone,
      emergencyContactRelation: editEmergencyContactRelation,
      medicalNotes: editMedicalNotes,
      birthday: editBirthday,
      gender: editGender,
      address: editAddress,
      referralSource: editReferralSource,
      communicationConsent: editCommunicationConsent,
      tags: editTags,
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
        <Link href="/" className="w-9 h-9 rounded-full bg-secondary dark:bg-zinc-800 flex items-center justify-center hover:bg-primary hover:text-primary-foreground dark:hover:bg-zinc-700 transition-colors text-foreground dark:text-zinc-200">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-primary font-bold">POS Administration</span>
          <h1 className="text-3xl font-heading font-black tracking-wide uppercase">Client Directory Registry</h1>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-700 font-semibold animate-slide-up">
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
                setShowRegForm(true);
                setSelectedCustId(null);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary text-xs font-bold uppercase tracking-wider rounded-pill hover:bg-primary-press active:scale-[0.98] transition-all cursor-pointer shadow-sm shrink-0"
            >
              <UserPlus size={14} /> Add Client
            </button>
          </div>

          {/* CSV Export button */}
          <div className="flex justify-end">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary border border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary/40 rounded-pill transition-all cursor-pointer"
            >
              <Download size={11} /> Export CSV
            </button>
          </div>

          {/* Scrollable list of active clients */}
          <div className="bg-card border border-border rounded-3xl divide-y divide-border/60 max-h-[550px] overflow-y-auto shadow-sm bg-white">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-xl mb-1">🔍</p>
                <p className="text-xs text-muted-foreground">No customer records found.</p>
              </div>
            ) : (
              filteredCustomers.map(c => {
                const isSelected = c.id === selectedCustId;
                const isBirthday = isBirthdayToday(c.birthday);
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCustomer(c.id)}
                    className={cn(
                      'w-full text-left p-4 flex justify-between items-center transition-colors cursor-pointer',
                      isSelected ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-secondary/40',
                      isBirthday && !isSelected ? 'bg-pink-50/60 border-l-4 border-l-pink-400' : ''
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-foreground">{c.name}</p>
                        {isBirthday && <span title="Birthday today!">🎂</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                      {c.phone && <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{c.phone}</p>}
                      {(c.tags || []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {(c.tags || []).slice(0, 3).map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-bold uppercase tracking-wider">{tag}</span>
                          ))}
                        </div>
                      )}
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
              {editMode ? (
                /* Unified Edit Form */
                <div className="bg-card border border-border rounded-3xl p-6 space-y-6 bg-white dark:bg-zinc-900 shadow-sm">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3">
                    <div>
                      <h3 className="font-heading font-black text-sm uppercase tracking-wider text-primary">Edit Client Profile</h3>
                      <p className="text-[10px] text-muted-foreground font-semibold">Modify account registry details and safety attributes</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditMode(false)}
                        className="px-3.5 py-1.5 rounded-pill bg-secondary dark:bg-zinc-800 text-ink dark:text-zinc-200 text-xs font-bold uppercase tracking-wider hover:bg-secondary-press dark:hover:bg-zinc-700 active:scale-[0.98] transition-all cursor-pointer border border-border dark:border-zinc-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="px-3.5 py-1.5 rounded-pill bg-primary text-on-primary text-xs font-bold uppercase tracking-wider hover:bg-primary-press active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                      >
                        Save Updates
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    {/* Left Column: Account & Demographics */}
                    <div className="space-y-4">
                      <h4 className="font-mono font-bold text-[10px] text-muted-foreground uppercase tracking-widest border-b border-border/40 pb-1">Account & Demographics</h4>
                      
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Full Name *</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary text-sm font-semibold text-foreground"
                          placeholder="Full Name"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Email Address *</label>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={e => setEditEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary text-sm text-foreground"
                          placeholder="Email"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Phone Number</label>
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={e => setEditPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary font-mono text-xs text-foreground"
                          placeholder="Phone (Optional)"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Birthday</label>
                          <input
                            type="date"
                            value={editBirthday}
                            onChange={e => setEditBirthday(e.target.value)}
                            className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary font-mono text-xs text-foreground"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Gender</label>
                          <CustomSelect
                            value={editGender}
                            onChange={setEditGender}
                            options={genderOptions}
                            placeholder="Not Specified"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Home Address</label>
                        <textarea
                          value={editAddress}
                          onChange={e => setEditAddress(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary text-xs resize-none text-foreground"
                          placeholder="Street Address, City, Country"
                        />
                      </div>
                    </div>

                    {/* Right Column: Account Package, Emergency & Health */}
                    <div className="space-y-4">
                      <h4 className="font-mono font-bold text-[10px] text-muted-foreground uppercase tracking-widest border-b border-border/40 pb-1">Registry Settings & Safety</h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Credits</label>
                          <input
                            type="number"
                            value={editCredits}
                            onChange={e => setEditCredits(parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary text-xs font-mono text-foreground"
                            placeholder="Credits"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Membership Tier</label>
                          <CustomSelect
                            value={editTier}
                            onChange={setEditTier}
                            options={tierOptions}
                            placeholder="None"
                          />
                        </div>
                      </div>

                      <div className="bg-secondary/15 border border-border/30 rounded-2xl p-3 space-y-3">
                        <span className="block text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Emergency Contact Details</span>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={editEmergencyContactName}
                            onChange={e => setEditEmergencyContactName(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary text-xs text-foreground"
                            placeholder="Contact Name"
                          />
                          <input
                            type="text"
                            value={editEmergencyContactRelation}
                            onChange={e => setEditEmergencyContactRelation(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary text-xs text-foreground"
                            placeholder="Relationship"
                          />
                        </div>
                        <input
                          type="tel"
                          value={editEmergencyContactPhone}
                          onChange={e => setEditEmergencyContactPhone(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary font-mono text-xs text-foreground"
                          placeholder="Emergency Phone"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Medical & Injury Notes (Pilates Safety)</label>
                        <textarea
                          value={editMedicalNotes}
                          onChange={e => setEditMedicalNotes(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary text-xs resize-none text-foreground"
                          placeholder="e.g. pregnancy, prior surgery, cardiac conditions, chronic pain"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Referral Source</label>
                          <CustomSelect
                            value={editReferralSource}
                            onChange={setEditReferralSource}
                            options={referralOptions}
                            placeholder="Select Channel"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-5">
                          <input
                            type="checkbox"
                            id="editCommunicationConsent"
                            checked={editCommunicationConsent}
                            onChange={e => setEditCommunicationConsent(e.target.checked)}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:outline-none"
                          />
                          <label htmlFor="editCommunicationConsent" className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground cursor-pointer select-none">
                            SMS/Email Consent
                          </label>
                        </div>
                      </div>

                      {/* Client Tags */}
                      <div className="space-y-1.5 pt-2">
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <Tag size={10} /> Client Tags
                        </label>
                        <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-secondary border border-border rounded-lg">
                          {editTags.map(tag => (
                            <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider">
                              {tag}
                              <button type="button" onClick={() => setEditTags(editTags.filter(t => t !== tag))} className="hover:text-destructive cursor-pointer"><X size={8}/></button>
                            </span>
                          ))}
                          <input
                            type="text"
                            value={editTagInput}
                            onChange={e => setEditTagInput(e.target.value)}
                            onKeyDown={e => {
                              if ((e.key === 'Enter' || e.key === ',') && editTagInput.trim()) {
                                e.preventDefault();
                                const tag = editTagInput.trim().replace(/,$/, '');
                                if (tag && !editTags.includes(tag)) setEditTags([...editTags, tag]);
                                setEditTagInput('');
                              }
                            }}
                            placeholder={editTags.length === 0 ? 'Type tag + Enter (e.g. VIP, Comp, Trial)' : 'Add more...'}
                            className="flex-1 min-w-[120px] bg-transparent text-[10px] focus:outline-none text-foreground placeholder:text-muted-foreground/60"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Regular Details View */
                <>
                  {/* Profile Card */}
                  <div className="bg-card border border-border rounded-3xl p-5 relative overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-2xl font-black">
                        {activeCustomer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-foreground">{activeCustomer.name}</h3>
                        <p className="text-sm text-muted-foreground">{activeCustomer.email} {activeCustomer.phone ? `· ${activeCustomer.phone}` : ''}</p>
                        
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wide border-primary/20 text-primary bg-primary/5">
                            Tier: {activeCustomer.membershipTier}
                          </Badge>
                          {isBirthdayToday(activeCustomer.birthday) && (
                            <span className="text-[10px] font-bold text-pink-600 flex items-center gap-1">🎂 Birthday Today!</span>
                          )}
                          {(activeCustomer.tags || []).map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => setEditMode(true)}
                        className="w-8 h-8 rounded-full bg-secondary dark:bg-zinc-800 flex items-center justify-center hover:bg-primary dark:hover:bg-zinc-700 hover:text-primary-foreground transition-colors cursor-pointer text-foreground dark:text-zinc-200"
                        title="Edit Customer Profile"
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Statistics Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-card border border-border p-3.5 text-center bg-white dark:bg-zinc-900 shadow-sm">
                      <div className="flex items-center justify-center gap-1.5 mb-1 text-primary">
                        <Flame size={15} />
                      </div>
                      <p className="font-black text-2xl">{activeCustomer.streak}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Attendance Streak</p>
                    </div>
                    <div className="rounded-2xl bg-card border border-border p-3.5 text-center bg-white dark:bg-zinc-900 shadow-sm">
                      <div className="flex items-center justify-center gap-1.5 mb-1 text-primary">
                        <Dumbbell size={15} />
                      </div>
                      <p className="font-black text-2xl">{activeCustomer.totalClassesAttended}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Workouts Logged</p>
                    </div>
                    <div className="rounded-2xl bg-card border border-border p-3.5 text-center bg-white dark:bg-zinc-900 shadow-sm">
                      <div className="flex items-center justify-center gap-1.5 mb-1 text-primary">
                        <Award size={15} />
                      </div>
                      <p className="font-black text-2xl font-mono text-primary">{activeCustomer.credits === 999 ? '∞' : activeCustomer.credits}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Available Credits</p>
                    </div>
                  </div>

                  {/* Account Management Quick Actions */}
                  <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-sm bg-white dark:bg-zinc-900">
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                      <div>
                        <h4 className="font-heading font-black text-xs uppercase tracking-wider text-primary">Account Management Quick Actions</h4>
                        <p className="text-[10px] text-muted-foreground font-semibold">Perform administrative credits adjustments and tier overrides</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => {
                          setTopUpCredits(1);
                          setTopUpAmountPaid(35);
                          setShowTopUpModal(true);
                        }}
                        className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all duration-200 cursor-pointer shadow-sm group"
                      >
                        <Coins className="w-5 h-5 mb-1.5 transition-transform group-hover:scale-110" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-center">Top-up Credits</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedNewTier(activeCustomer.membershipTier);
                          setTierAmountPaid(0);
                          setIncludeTierCredits(true);
                          setShowTierModal(true);
                        }}
                        className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all duration-200 cursor-pointer shadow-sm group"
                      >
                        <Award className="w-5 h-5 mb-1.5 transition-transform group-hover:scale-110" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-center">Change Tier</span>
                      </button>
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-700 hover:bg-red-600 hover:text-white transition-all duration-200 cursor-pointer shadow-sm group"
                      >
                        <ShieldAlert className="w-5 h-5 mb-1.5 transition-transform group-hover:scale-110" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-center">Cancel Tier</span>
                      </button>
                    </div>
                  </div>

                  {/* Client Intake & Safety Profile */}
                  <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-sm bg-white dark:bg-zinc-900">
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                      <div>
                        <h4 className="font-heading font-black text-xs uppercase tracking-wider text-primary">Client Intake & Safety Profile</h4>
                        <p className="text-[10px] text-muted-foreground font-semibold">Detailed records, emergency contacts, and medical safety notes</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      {/* Personal & Reference */}
                      <div className="space-y-3">
                        <h5 className="font-mono font-bold text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                          <User size={12} className="text-primary" /> Personal & Reference Info
                        </h5>
                        <div className="space-y-2 bg-secondary/15 p-3.5 rounded-2xl border border-border/30">
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-muted-foreground font-medium flex items-center gap-1"><Calendar size={11} /> Birthday:</span>
                            <span className="font-bold text-foreground font-mono">{activeCustomer.birthday ? formatDate(activeCustomer.birthday) : 'Not specified'}</span>
                          </div>
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-muted-foreground font-medium flex items-center gap-1"><Activity size={11} /> Gender:</span>
                            <span className="font-bold text-foreground capitalize">{activeCustomer.gender || 'Not specified'}</span>
                          </div>
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-muted-foreground font-medium flex items-center gap-1"><Sparkles size={11} /> Referral:</span>
                            <span className="font-bold text-foreground">{activeCustomer.referralSource || 'Walk-in / Direct'}</span>
                          </div>
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-muted-foreground font-medium flex items-center gap-1"><UserCheck size={11} /> SMS/Email Consent:</span>
                            <Badge variant="outline" className={activeCustomer.communicationConsent ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : 'border-red-500/20 text-red-400 bg-red-500/5'}>
                              {activeCustomer.communicationConsent ? 'Opted In' : 'Opted Out'}
                            </Badge>
                          </div>
                          <div className="pt-2 border-t border-border/40">
                            <span className="block text-muted-foreground font-medium mb-1 flex items-center gap-1"><MapPin size={11} /> Address:</span>
                            <span className="block font-medium text-foreground leading-normal">{activeCustomer.address || 'No address registered'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Emergency & Safety */}
                      <div className="space-y-3">
                        <h5 className="font-mono font-bold text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                          <Heart size={12} className="text-primary" /> Emergency & Medical Safety
                        </h5>
                        <div className="space-y-2 bg-secondary/15 p-3.5 rounded-2xl border border-border/30">
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-muted-foreground font-medium">Contact Name:</span>
                            <span className="font-bold text-foreground">{activeCustomer.emergencyContactName || 'None'}</span>
                          </div>
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-muted-foreground font-medium">Contact Phone:</span>
                            <span className="font-bold text-foreground font-mono">{activeCustomer.emergencyContactPhone || 'None'}</span>
                          </div>
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-muted-foreground font-medium">Relationship:</span>
                            <span className="font-bold text-foreground">{activeCustomer.emergencyContactRelation || 'None'}</span>
                          </div>
                          <div className="pt-2 border-t border-border/40">
                            <span className="block text-amber-500 dark:text-amber-400 font-bold mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wider">
                              <ShieldAlert size={12} /> Medical & Injury Notes:
                            </span>
                            <p className={`font-semibold rounded-xl p-2.5 leading-relaxed text-[11px] border ${
                              activeCustomer.medicalNotes && activeCustomer.medicalNotes.toLowerCase() !== 'no medical conditions or physical limitations reported. full reformer capacity.' && activeCustomer.medicalNotes.toLowerCase() !== 'no medical conditions reported. cleared for pilates.'
                                ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20 text-foreground'
                                : 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 text-foreground'
                            }`}>
                              {activeCustomer.medicalNotes || 'No medical conditions reported. Cleared for Pilates.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enterprise Customer Intelligence & Recommendations */}
                  {(() => {
                    const ltv = activeCustomerBookings.reduce((sum, b) => sum + (b.status !== 'cancelled' ? b.amountPaid : 0), 0);
                    
                    // Badges determination
                    const badges = [];
                    if (activeCustomer.totalClassesAttended >= 20) {
                      badges.push({ name: 'Studio Legend', color: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/25', icon: '👑' });
                    } else if (activeCustomer.totalClassesAttended >= 8) {
                      badges.push({ name: 'Dedicated Athlete', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25', icon: '🏋️' });
                    }
                    
                    if (activeCustomer.streak >= 5) {
                      badges.push({ name: 'Super Streak', color: 'bg-orange-500/10 text-orange-700 border-orange-500/25', icon: '🔥' });
                    }
                    
                    if (ltv >= 200) {
                      badges.push({ name: 'VIP Spender', color: 'bg-amber-500/10 text-amber-700 border-amber-500/25', icon: '💎' });
                    } else if (ltv === 0 && activeCustomer.totalClassesAttended === 0) {
                      badges.push({ name: 'New Lead', color: 'bg-sky-500/10 text-sky-700 border-sky-500/25', icon: '🌟' });
                    }

                    // Smart Recommendation
                    let recommendation = {
                      status: 'Stable',
                      text: 'Profile is active. Standard service applies.',
                      type: 'info'
                    };
                    
                    if (activeCustomer.credits === 0 && activeCustomer.membershipTier === 'None') {
                      recommendation = {
                        status: 'High Churn Risk',
                        text: 'Client has 0 credits. Offer Evolve package upgrades or a 10-Class Pack today!',
                        type: 'warning'
                      };
                    } else if (activeCustomer.totalClassesAttended > 5 && (activeCustomer.membershipTier === 'Single Session' || activeCustomer.membershipTier === 'None')) {
                      recommendation = {
                        status: 'Upgrade Candidate',
                        text: 'High attendance logged. Recommend Unlimited Gold membership for better value.',
                        type: 'upgrade'
                      };
                    } else if (activeCustomer.streak >= 3) {
                      recommendation = {
                        status: 'Milestone Engagement',
                        text: 'Streaking client! Reward their consistency with 10% off using code EVOLVE10.',
                        type: 'reward'
                      };
                    }

                    return (
                      <div className="bg-white border border-border rounded-3xl p-5 space-y-4 shadow-sm dark:bg-zinc-900">
                        <div className="flex items-center justify-between border-b border-border/50 pb-3">
                          <div>
                            <h4 className="font-heading font-black text-xs uppercase tracking-wider text-primary">Customer Intelligence Desk</h4>
                            <p className="text-[10px] text-muted-foreground font-semibold">Real-time enterprise metrics & recommendation telemetry</p>
                          </div>
                          <Badge className="bg-primary/5 text-primary border-primary/20 text-[9px] font-mono font-bold">
                            LTV: ₱{ltv.toFixed(2)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          {/* Loyalty Milestones */}
                          <div className="space-y-2">
                            <span className="block text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Client Milestones</span>
                            <div className="flex flex-wrap gap-1.5">
                              {badges.length === 0 ? (
                                <span className="text-[10px] text-muted-foreground italic font-medium">No milestones earned yet. Keep booking!</span>
                              ) : (
                                badges.map((b, bi) => (
                                  <span key={bi} className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase border", b.color)}>
                                    <span>{b.icon}</span> {b.name}
                                  </span>
                                ))
                              )}
                            </div>
                          </div>

                          {/* AI Reception Recommendation */}
                          <div className="space-y-1.5 bg-secondary/20 border border-border/40 p-3 rounded-2xl">
                            <div className="flex items-center gap-1.5">
                              <span className={cn("w-1.5 h-1.5 rounded-full", 
                                recommendation.type === 'warning' ? 'bg-red-500 animate-pulse' :
                                recommendation.type === 'upgrade' ? 'bg-indigo-500' :
                                recommendation.type === 'reward' ? 'bg-orange-500' : 'bg-sky-500'
                              )} />
                              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-foreground">
                                Action Desk: {recommendation.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
                              {recommendation.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Roster of Upcoming booked classes */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-foreground uppercase tracking-wide">Upcoming Schedule Books ({upcomingBookings.length})</h4>
                    {upcomingBookings.length === 0 ? (
                      <div className="bg-card/20 border border-dashed border-border rounded-2xl p-6 text-center text-xs text-muted-foreground bg-white dark:bg-zinc-900">
                        This client has no active upcoming reservations.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {upcomingBookings.map(b => {
                          const cls = getClassById(b.classId);
                          if (!cls) return null;
                          const classStart = parseClassDateTime(cls.date, cls.time);
                          const now = new Date();
                          const hoursUntilClass = (classStart.getTime() - now.getTime()) / (1000 * 60 * 60);
                          const isLate = hoursUntilClass < 12;
                          
                          return (
                            <div key={b.id} className="bg-card border border-border rounded-2xl p-4 flex justify-between items-start gap-4 text-xs font-mono bg-white dark:bg-zinc-900 shadow-sm">
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
                                        className="px-2 py-1 bg-secondary dark:bg-zinc-800 text-ink dark:text-zinc-200 rounded text-[10px] cursor-pointer border border-border dark:border-zinc-700"
                                      >
                                        No
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setCancelTarget(b.id)}
                                    className="w-7 h-7 rounded-full bg-secondary dark:bg-zinc-800 hover:bg-destructive/20 hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer text-foreground dark:text-zinc-200"
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
                      <div className="bg-card border border-border rounded-2xl divide-y divide-border/60 text-xs bg-white dark:bg-zinc-900 shadow-sm">
                        {pastBookings.slice(0, 5).map(b => {
                          const cls = getClassById(b.classId);
                          return (
                            <div key={b.id} className="p-3.5 flex justify-between items-center gap-4">
                              <div>
                                <p className="font-semibold text-foreground">{cls?.title ?? 'Fitness Class'}</p>
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

                  {/* Receipts & Invoices Log */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <Receipt size={16} className="text-primary" /> Receipts & Invoices Log ({customerTransactions.length})
                    </h4>
                    {customerTransactions.length === 0 ? (
                      <div className="bg-card/25 border border-dashed border-border rounded-2xl p-6 text-center text-xs text-muted-foreground bg-white dark:bg-zinc-900 shadow-sm">
                        No transactions recorded for this client.
                      </div>
                    ) : (
                      <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm dark:bg-zinc-900">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-secondary/40 border-b border-border/80 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                                <th className="p-3">Date & Time</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Description</th>
                                <th className="p-3 text-right">Amount</th>
                                <th className="p-3">Payment</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-center">Receipt</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                              {customerTransactions.map(tx => (
                                <tr key={tx.id} className="hover:bg-secondary/20 transition-colors">
                                  <td className="p-3 font-mono text-[10px] text-muted-foreground">
                                    {new Date(tx.timestamp).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </td>
                                  <td className="p-3 font-semibold uppercase tracking-wider text-[9px]">
                                    <span className={cn(
                                      "px-2 py-0.5 rounded-full border",
                                      tx.type === 'booking'
                                        ? "bg-blue-500/5 text-blue-700 border-blue-500/20"
                                        : "bg-purple-500/5 text-purple-700 border-purple-500/20"
                                    )}>
                                      {tx.type}
                                    </span>
                                  </td>
                                  <td className="p-3 font-medium text-foreground max-w-[150px] truncate" title={tx.description}>
                                    {tx.description}
                                  </td>
                                  <td className="p-3 text-right font-bold text-foreground font-mono">
                                    ₱{tx.amount.toFixed(2)}
                                  </td>
                                  <td className="p-3">
                                    <span className="capitalize font-mono text-[10px] text-muted-foreground">{tx.paymentMethod}</span>
                                  </td>
                                  <td className="p-3">
                                    <Badge variant="outline" className={cn(
                                      "font-mono text-[9px] font-bold uppercase",
                                      tx.status === 'paid' && "border-emerald-500/25 text-emerald-700 bg-emerald-500/5",
                                      tx.status === 'pending' && "border-amber-500/25 text-amber-700 bg-amber-500/5",
                                      tx.status === 'cancelled' && "border-red-500/25 text-red-700 bg-red-500/5",
                                    )}>
                                      {tx.status}
                                    </Badge>
                                  </td>
                                  <td className="p-3 text-center">
                                    <button
                                      onClick={() => {
                                        setSelectedTransaction(tx);
                                        setShowReceiptModal(true);
                                      }}
                                      className="px-2 py-1 bg-secondary text-primary text-[10px] font-bold uppercase tracking-wider rounded-lg border border-primary/20 hover:bg-primary hover:text-white transition-all cursor-pointer"
                                    >
                                      View
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Overlay Modal for Client Onboarding */}
      {showRegForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-primary/5 border-b border-border/80 px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-sm">
                  <UserPlus size={16} />
                </div>
                <div>
                  <h2 className="font-heading font-black text-sm uppercase tracking-wider text-foreground">Register New Client</h2>
                  <p className="text-[10px] text-muted-foreground font-semibold">Onboard a guest to the POS registry</p>
                </div>
              </div>
              <button
                onClick={() => setShowRegForm(false)}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-destructive/20 hover:text-red-400 transition-colors cursor-pointer text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRegister} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Column: General & Personal info */}
                <div className="space-y-4 text-xs">
                  <h3 className="font-mono font-bold text-[10px] text-muted-foreground uppercase tracking-widest border-b border-border/40 pb-1">Account & Demographics</h3>
                  
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Registration Role</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegRole('student')}
                        className={cn(
                          "py-2 rounded-xl text-xs font-bold uppercase border transition-all cursor-pointer text-center",
                          regRole === 'student' ? "bg-primary/20 border-primary text-primary" : "border-border bg-white text-muted-foreground"
                        )}
                      >
                        Student
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegRole('instructor')}
                        className={cn(
                          "py-2 rounded-xl text-xs font-bold uppercase border transition-all cursor-pointer text-center",
                          regRole === 'instructor' ? "bg-primary/20 border-primary text-primary" : "border-border bg-white text-muted-foreground"
                        )}
                      >
                        Instructor
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Full Name <span className="text-destructive">*</span></label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-secondary border border-border rounded-xl focus:outline-none focus:border-primary font-semibold text-foreground"
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Email Address <span className="text-destructive">*</span></label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
                      placeholder="e.g. john@example.com"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Phone Number</label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-secondary border border-border rounded-xl focus:outline-none focus:border-primary font-mono text-foreground"
                      placeholder="e.g. +63 912 345 6789"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Birthday</label>
                      <input
                        type="date"
                        value={regBirthday}
                        onChange={e => setRegBirthday(e.target.value)}
                        className="w-full px-3 py-2 bg-secondary border border-border rounded-xl focus:outline-none focus:border-primary font-mono text-xs text-foreground"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Gender</label>
                      <CustomSelect
                        value={regGender}
                        onChange={setRegGender}
                        options={genderOptions}
                        placeholder="Select Gender"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Home Address</label>
                    <textarea
                      value={regAddress}
                      onChange={e => setRegAddress(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-xs resize-none text-foreground"
                      placeholder="Street Address, City, Country"
                    />
                  </div>
                </div>

                {/* Right Column: Credits, Emergency & Health */}
                <div className="space-y-4 text-xs">
                  <h3 className="font-mono font-bold text-[10px] text-muted-foreground uppercase tracking-widest border-b border-border/40 pb-1">Membership & Safety</h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Initial Credits</label>
                      <input
                        type="number"
                        min="0"
                        value={regCredits}
                        onChange={e => setRegCredits(parseInt(e.target.value) || 0)}
                        className="w-full px-3.5 py-2 text-sm bg-secondary border border-border rounded-xl focus:outline-none focus:border-primary font-mono text-foreground"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Membership Tier</label>
                      <CustomSelect
                        value={regTier}
                        onChange={setRegTier}
                        options={tierOptions}
                        placeholder="None"
                      />
                    </div>
                  </div>

                  <div className="bg-secondary/15 border border-border/30 rounded-2xl p-3 space-y-3">
                    <span className="block text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Emergency Contact Details</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={regEmergencyContactName}
                        onChange={e => setRegEmergencyContactName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary text-xs text-foreground"
                        placeholder="Contact Name"
                      />
                      <input
                        type="text"
                        value={regEmergencyContactRelation}
                        onChange={e => setRegEmergencyContactRelation(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary text-xs text-foreground"
                        placeholder="Relationship"
                      />
                    </div>
                    <input
                      type="tel"
                      value={regEmergencyContactPhone}
                      onChange={e => setRegEmergencyContactPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary font-mono text-xs text-foreground"
                      placeholder="Emergency Phone"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Medical & Injury Notes (Pilates Safety)</label>
                    <textarea
                      value={regMedicalNotes}
                      onChange={e => setRegMedicalNotes(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-xs resize-none text-foreground"
                      placeholder="e.g. pregnancy, prior surgery, cardiac conditions, chronic pain"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Referral Source</label>
                      <CustomSelect
                        value={regReferralSource}
                        onChange={setRegReferralSource}
                        options={referralOptions}
                        placeholder="Select Channel"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-5">
                      <input
                        type="checkbox"
                        id="regCommunicationConsent"
                        checked={regCommunicationConsent}
                        onChange={e => setRegCommunicationConsent(e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:outline-none"
                      />
                      <label htmlFor="regCommunicationConsent" className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground cursor-pointer select-none">
                        SMS/Email Consent
                      </label>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border/40 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowRegForm(false)}
                  className="flex-1 py-3 rounded-pill bg-secondary text-ink text-xs font-bold uppercase tracking-widest hover:bg-secondary-press active:scale-[0.98] transition-all cursor-pointer border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-pill bg-primary text-on-primary text-xs font-bold uppercase tracking-widest hover:bg-primary-press active:scale-[0.98] transition-all cursor-pointer shadow-md"
                >
                  Register Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top-up Credits Modal */}
      {showTopUpModal && activeCustomer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
            {/* Modal Header */}
            <div className="bg-primary/5 border-b border-border/80 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-sm">
                  <Coins size={16} />
                </div>
                <div>
                  <h2 className="font-heading font-black text-sm uppercase tracking-wider text-foreground">Top-up Credits</h2>
                  <p className="text-[10px] text-muted-foreground font-semibold">Add training package credits manually</p>
                </div>
              </div>
              <button
                onClick={() => setShowTopUpModal(false)}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-destructive/20 hover:text-red-400 transition-colors cursor-pointer text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleTopUpConfirm} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Select Preset Pack or Enter Custom</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '+1 Class', credits: 1, price: 35 },
                    { label: '+5 Pack', credits: 5, price: 160 },
                    { label: '+10 Pack', credits: 10, price: 300 },
                    { label: 'Unlimited', credits: 999, price: 199 }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTopUpCredits(preset.credits);
                        setTopUpAmountPaid(preset.price);
                      }}
                      className={cn(
                        "py-2 rounded-xl border text-[10px] font-bold uppercase transition-all duration-150 cursor-pointer",
                        topUpCredits === preset.credits
                          ? "bg-primary/10 border-primary text-primary"
                          : "border-border hover:bg-secondary/40 text-muted-foreground"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Credits to Add</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={topUpCredits}
                    onChange={e => {
                      const val = parseInt(e.target.value) || 1;
                      setTopUpCredits(val);
                      // Auto price logic
                      if (val === 1) setTopUpAmountPaid(35);
                      else if (val === 5) setTopUpAmountPaid(160);
                      else if (val === 10) setTopUpAmountPaid(300);
                      else if (val === 999) setTopUpAmountPaid(199);
                      else setTopUpAmountPaid(val * 30);
                    }}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-sm font-mono text-foreground font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Price Collected (₱)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={topUpAmountPaid}
                    onChange={e => setTopUpAmountPaid(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-sm font-mono text-foreground font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Payment Method</label>
                <CustomSelect
                  value={topUpPaymentMethod}
                  onChange={setTopUpPaymentMethod}
                  options={[
                    { value: 'cash', label: 'Cash' },
                    { value: 'card', label: 'Card Reader' }
                  ]}
                />
              </div>

              {/* Staff Selector */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Assisting Staff / Coach</label>
                <div className="grid grid-cols-4 gap-2 bg-secondary/20 p-1.5 rounded-2xl border border-border/40">
                  {['Cams Rivera', 'Sarah Lee', 'Alex Tran', 'Evolve Staff'].map(staff => (
                    <button
                      key={staff}
                      type="button"
                      onClick={() => setSelectedStaff(staff)}
                      className={cn(
                        "py-1.5 px-1 text-[9px] font-mono font-bold rounded-xl border text-center transition-all cursor-pointer",
                        selectedStaff === staff
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-white border-border text-muted-foreground hover:bg-secondary/40"
                      )}
                    >
                      {staff === 'Cams Rivera' ? '👑 Cams' : staff === 'Sarah Lee' ? '👟 Sarah' : staff === 'Alex Tran' ? '👟 Alex' : '🧑‍💻 Staff'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-3 text-[11px] text-amber-800 leading-normal font-medium mt-1">
                ⚠️ Top-up overrides require collecting the specified amount from the client and will log a transaction for auditing.
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border/40 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowTopUpModal(false)}
                  className="flex-1 py-2.5 rounded-pill bg-secondary text-ink text-xs font-bold uppercase tracking-widest hover:bg-secondary-press active:scale-[0.98] transition-all cursor-pointer border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-pill bg-primary text-on-primary text-xs font-bold uppercase tracking-widest hover:bg-primary-press active:scale-[0.98] transition-all cursor-pointer shadow-md"
                >
                  Confirm Top-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Membership Tier Modal */}
      {showTierModal && activeCustomer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
            {/* Modal Header */}
            <div className="bg-indigo-500/5 border-b border-border/80 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-700 shadow-sm">
                  <Award size={16} />
                </div>
                <div>
                  <h2 className="font-heading font-black text-sm uppercase tracking-wider text-foreground">Change Membership Tier</h2>
                  <p className="text-[10px] text-muted-foreground font-semibold">Modify client's level status and tier type</p>
                </div>
              </div>
              <button
                onClick={() => setShowTierModal(false)}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-destructive/20 hover:text-red-400 transition-colors cursor-pointer text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleTierChangeConfirm} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Select New Membership Tier</label>
                <CustomSelect
                  value={selectedNewTier}
                  onChange={val => {
                    setSelectedNewTier(val);
                    // Autofill logic
                    if (val === 'Single Session') {
                      setTierAmountPaid(35);
                    } else if (val === '5-Class Pack') {
                      setTierAmountPaid(160);
                    } else if (val === '10-Class Pack') {
                      setTierAmountPaid(300);
                    } else if (val === 'Unlimited Gold') {
                      setTierAmountPaid(199);
                    } else {
                      setTierAmountPaid(0);
                    }
                  }}
                  options={tierOptions}
                />
              </div>

              {selectedNewTier !== 'None' && (
                <>
                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id="includeTierCredits"
                      checked={includeTierCredits}
                      onChange={e => setIncludeTierCredits(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:outline-none"
                    />
                    <label htmlFor="includeTierCredits" className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground cursor-pointer select-none">
                      Automatically adjust class credits matching tier selection
                    </label>
                  </div>
                  {includeTierCredits && (
                    <div className="bg-indigo-500/5 border border-indigo-500/10 p-2.5 rounded-xl text-[10px] text-indigo-700 leading-normal font-mono font-semibold">
                      {selectedNewTier === 'Unlimited Gold' && "✦ Will set client credits to ∞ (999)"}
                      {selectedNewTier === '10-Class Pack' && `✦ Will add +10 class credits (New balance: ${activeCustomer.credits + 10})`}
                      {selectedNewTier === '5-Class Pack' && `✦ Will add +5 class credits (New balance: ${activeCustomer.credits + 5})`}
                      {selectedNewTier === 'Single Session' && `✦ Will add +1 class credit (New balance: ${activeCustomer.credits + 1})`}
                    </div>
                  )}
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Amount Paid for Tier Upgrade (₱)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={tierAmountPaid}
                    onChange={e => setTierAmountPaid(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-sm font-mono text-foreground font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Payment Method</label>
                  <CustomSelect
                    value={tierPaymentMethod}
                    onChange={setTierPaymentMethod}
                    options={[
                      { value: 'cash', label: 'Cash' },
                      { value: 'card', label: 'Card Reader' }
                    ]}
                  />
                </div>
              </div>

              {/* Staff Selector */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Assisting Staff / Coach</label>
                <div className="grid grid-cols-4 gap-2 bg-secondary/20 p-1.5 rounded-2xl border border-border/40">
                  {['Cams Rivera', 'Sarah Lee', 'Alex Tran', 'Evolve Staff'].map(staff => (
                    <button
                      key={staff}
                      type="button"
                      onClick={() => setSelectedStaff(staff)}
                      className={cn(
                        "py-1.5 px-1 text-[9px] font-mono font-bold rounded-xl border text-center transition-all cursor-pointer",
                        selectedStaff === staff
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-white border-border text-muted-foreground hover:bg-secondary/40"
                      )}
                    >
                      {staff === 'Cams Rivera' ? '👑 Cams' : staff === 'Sarah Lee' ? '👟 Sarah' : staff === 'Alex Tran' ? '👟 Alex' : '🧑‍💻 Staff'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border/40 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowTierModal(false)}
                  className="flex-1 py-2.5 rounded-pill bg-secondary text-ink text-xs font-bold uppercase tracking-widest hover:bg-secondary-press active:scale-[0.98] transition-all cursor-pointer border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-pill bg-primary text-on-primary text-xs font-bold uppercase tracking-widest hover:bg-primary-press active:scale-[0.98] transition-all cursor-pointer shadow-md"
                >
                  Confirm Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Membership Modal */}
      {showCancelModal && activeCustomer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-border rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
            {/* Modal Header */}
            <div className="bg-red-500/5 border-b border-border/80 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-700 shadow-sm">
                  <ShieldAlert size={16} />
                </div>
                <div>
                  <h2 className="font-heading font-black text-sm uppercase tracking-wider text-foreground">Cancel Membership</h2>
                  <p className="text-[10px] text-muted-foreground font-semibold">Confirm cancellation flow</p>
                </div>
              </div>
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-destructive/20 hover:text-red-400 transition-colors cursor-pointer text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 text-xs">
              <p className="text-sm font-semibold text-foreground">
                Are you sure you want to cancel the membership for <span className="text-red-600">{activeCustomer.name}</span>?
              </p>
              
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-3 leading-relaxed text-red-800 font-medium">
                <p>This action will instantly:</p>
                <ul className="list-disc list-inside mt-1.5 space-y-1">
                  <li>Reset membership tier status to <span className="font-black">"None"</span>.</li>
                  <li>If the client has <span className="font-black">Unlimited Gold (∞)</span> credits, they will be reset to <span className="font-black">0</span>.</li>
                  <li>Log a cancellation audit entry in the Evolve Local Registry.</li>
                </ul>
              </div>

              {/* Staff Selector */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Assisting Staff / Coach</label>
                <div className="grid grid-cols-4 gap-2 bg-secondary/20 p-1.5 rounded-2xl border border-border/40">
                  {['Cams Rivera', 'Sarah Lee', 'Alex Tran', 'Evolve Staff'].map(staff => (
                    <button
                      key={staff}
                      type="button"
                      onClick={() => setSelectedStaff(staff)}
                      className={cn(
                        "py-1.5 px-1 text-[9px] font-mono font-bold rounded-xl border text-center transition-all cursor-pointer",
                        selectedStaff === staff
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-white border-border text-muted-foreground hover:bg-secondary/40"
                      )}
                    >
                      {staff === 'Cams Rivera' ? '👑 Cams' : staff === 'Sarah Lee' ? '👟 Sarah' : staff === 'Alex Tran' ? '👟 Alex' : '🧑‍💻 Staff'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-2.5 rounded-pill bg-secondary text-ink text-xs font-bold uppercase tracking-widest hover:bg-secondary-press active:scale-[0.98] transition-all cursor-pointer border border-border"
                >
                  Keep Active
                </button>
                <button
                  type="button"
                  onClick={handleCancelMembershipConfirm}
                  className="flex-1 py-2.5 rounded-pill bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 active:scale-[0.98] transition-all cursor-pointer shadow-md"
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt / Invoice Modal */}
      {showReceiptModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-border rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="border-b border-border/80 px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-sm">
                  <Receipt size={16} />
                </div>
                <div>
                  <h2 className="font-heading font-black text-sm uppercase tracking-wider text-foreground">Transaction Receipt</h2>
                  <p className="text-[10px] text-muted-foreground font-semibold">View and print studio invoice</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary text-[10px] font-bold uppercase tracking-wider rounded-pill hover:bg-primary-press active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                >
                  <Printer size={12} /> Print
                </button>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-destructive/20 hover:text-red-400 transition-colors cursor-pointer text-foreground"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Receipt Body (Printable Area) */}
            <div className="flex-1 overflow-y-auto p-8" id="printable-receipt">
              <div className="space-y-6">
                {/* Brand Header */}
                <div className="text-center pb-4 border-b border-dashed border-border">
                  <h1 className="text-2xl font-heading font-black tracking-wider uppercase text-foreground">EVOLVE</h1>
                  <p className="text-[10px] text-muted-foreground uppercase font-mono font-bold tracking-widest mt-1">PILATES STUDIO & WELLNESS</p>
                  <p className="text-[10px] text-muted-foreground font-semibold mt-1">123 Pioneer St, Mandaluyong, Metro Manila</p>
                  <p className="text-[10px] text-muted-foreground font-semibold">support@evolve.studio · +63 912 345 6789</p>
                </div>

                {/* Receipt Title */}
                <div className="text-center">
                  <h2 className="font-heading font-black text-xs uppercase tracking-widest text-muted-foreground">Official Receipt / Invoice</h2>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs font-mono border-b border-border/40 pb-4">
                  <div>
                    <span className="block text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Invoice / Tx ID</span>
                    <span className="font-bold text-foreground">{selectedTransaction.id}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Date & Time</span>
                    <span className="font-bold text-foreground">
                      {new Date(selectedTransaction.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Payment Method</span>
                    <span className="font-bold text-foreground capitalize">{selectedTransaction.paymentMethod}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Assisted By</span>
                    <span className="font-bold text-foreground">{selectedTransaction.handledBy || 'Cams Rivera'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Payment Status</span>
                    <span className={cn(
                      "badge font-bold px-2 py-0.5 rounded-full text-[9px] inline-block mt-0.5",
                      selectedTransaction.status === 'paid' && "badge-paid",
                      selectedTransaction.status === 'pending' && "badge-pending",
                      selectedTransaction.status === 'cancelled' && "badge-cancelled"
                    )}>
                      {selectedTransaction.status}
                    </span>
                  </div>
                </div>

                {/* Demographics */}
                <div className="text-xs space-y-1 bg-secondary/20 p-4 rounded-2xl border border-border/40">
                  <span className="block text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1">Billed To</span>
                  <div className="font-bold text-foreground">{selectedTransaction.customerName}</div>
                  <div className="text-muted-foreground font-semibold">{selectedTransaction.customerEmail}</div>
                  {selectedTransaction.customerPhone && (
                    <div className="text-muted-foreground font-semibold font-mono">{selectedTransaction.customerPhone}</div>
                  )}
                </div>

                {/* Line Items Table */}
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-border/80 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                      <th className="py-2">Item Description</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Unit Price</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    <tr className="text-foreground">
                      <td className="py-3 font-semibold">
                        {selectedTransaction.type === 'booking' ? 'Class Session Booking' : 'Membership training package purchase'}
                        <span className="block text-[10px] text-muted-foreground font-normal mt-0.5">
                          {selectedTransaction.description}
                        </span>
                      </td>
                      <td className="py-3 text-center font-bold">1</td>
                      <td className="py-3 text-right font-bold font-mono">
                        ₱{(selectedTransaction.type === 'booking' && selectedTransaction.amount > 0 
                          ? selectedTransaction.amount / 1.08 
                          : selectedTransaction.amount).toFixed(2)}
                      </td>
                      <td className="py-3 text-right font-bold font-mono">
                        ₱{(selectedTransaction.type === 'booking' && selectedTransaction.amount > 0 
                          ? selectedTransaction.amount / 1.08 
                          : selectedTransaction.amount).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Totals Breakdown */}
                <div className="text-xs font-mono space-y-1.5 ml-auto max-w-[240px]">
                  <div className="flex justify-between font-semibold">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">
                      ₱{(selectedTransaction.type === 'booking' && selectedTransaction.amount > 0 
                        ? selectedTransaction.amount / 1.08 
                        : selectedTransaction.amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-muted-foreground">
                      {selectedTransaction.type === 'booking' && selectedTransaction.amount > 0 ? 'VAT (8%)' : 'VAT (0%)'}
                    </span>
                    <span className="text-foreground">
                      ₱{(selectedTransaction.type === 'booking' && selectedTransaction.amount > 0 
                        ? selectedTransaction.amount - (selectedTransaction.amount / 1.08) 
                        : 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-black text-sm pt-2 border-t-2 border-border/80">
                    <span className="text-foreground uppercase">Grand Total</span>
                    <span className="text-primary">
                      ₱{selectedTransaction.amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Studio Footer Note */}
                <div className="text-center text-[10px] text-muted-foreground border-t border-dashed border-border pt-4 mt-6 leading-relaxed font-semibold">
                  <p>Thank you for evolving with us!</p>
                  <p>All training packages are non-refundable and subject to the 12-hour class cancellation matrix policy.</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-secondary/40 border-t border-border/80 px-6 py-4 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="px-5 py-2 rounded-pill bg-secondary text-ink text-xs font-bold uppercase tracking-widest hover:bg-secondary-press active:scale-[0.98] transition-all cursor-pointer border border-border"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
