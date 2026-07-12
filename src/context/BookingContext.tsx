'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { FitnessClass, Booking, User, Customer, WaitlistEntry, SpotLock, PackType, Transaction, StudioEvent } from '@/types';
import { SEED_CLASSES } from '@/lib/seedData';
import { parseClassDateTime } from '@/lib/utils';
import { useWebSockets, SocketMessage } from '@/hooks/useWebSockets';
import { registerPushNotifications } from '@/lib/pushNotifications';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface BookingContextType {
  user: User;
  customers: Customer[];
  classes: FitnessClass[];
  bookings: Booking[];
  waitlist: WaitlistEntry[];

  updateUser: (updates: Partial<User>) => void;

  bookSpot: (
    classId: string,
    spotNumber: number,
    method: 'credit' | 'card' | 'cash',
    customerName: string,
    customerEmail: string,
    customerPhone?: string,
    promoCode?: string,
    handledBy?: string,
    priceOverride?: number
  ) => { success: boolean; message: string; booking?: Booking };

  cancelBooking: (bookingId: string) => { success: boolean; message: string };

  checkInBooking: (bookingId: string) => { success: boolean; message: string };

  confirmBooking: (bookingId: string) => { success: boolean; message: string };

  buyCreditsForCustomer: (customerId: string, packType: PackType) => void;

  addOrUpdateCustomer: (
    customerData: {
      id?: string;
      name: string;
      email: string;
      phone?: string;
      credits: number;
      membershipTier: string;
      emergencyContactName?: string;
      emergencyContactPhone?: string;
      emergencyContactRelation?: string;
      medicalNotes?: string;
      birthday?: string;
      gender?: string;
      address?: string;
      referralSource?: string;
      communicationConsent?: boolean;
      tags?: string[];
    }
  ) => Customer;

  getClassById: (classId: string) => FitnessClass | undefined;
  getBookingForSpot: (classId: string, spotNumber: number) => Booking | undefined;

  joinWaitlist: (classId: string, customerName: string, customerEmail: string, customerPhone?: string) => void;
  leaveWaitlist: (classId: string, customerEmail: string) => void;
  isOnWaitlist: (classId: string, customerEmail: string) => boolean;

  promoteFromWaitlist: (
    classId: string,
    customerEmail: string,
    method?: 'credit' | 'card' | 'cash'
  ) => { success: boolean; message: string; booking?: Booking };

  releaseExpiredHolds: () => void;
  spotLocks: SpotLock[];
  lockSpot: (classId: string, spotNumber: number) => { success: boolean; message: string };
  unlockSpot: (classId: string, spotNumber: number) => void;
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) => Transaction;
  updateTransactionStatus: (id: string, status: Transaction['status']) => void;
  addClass: (classData: Omit<FitnessClass, 'id' | 'bookedSpots'>) => FitnessClass;
  updateClass: (classId: string, updates: Partial<Omit<FitnessClass, 'id' | 'bookedSpots'>>) => void;
  deleteClass: (classId: string) => { success: boolean; message: string };
  events: StudioEvent[];
  addEvent: (eventData: Omit<StudioEvent, 'id'>) => StudioEvent;
  updateEvent: (eventId: string, updates: Partial<Omit<StudioEvent, 'id'>>) => void;
  deleteEvent: (eventId: string) => { success: boolean; message: string };
  testimonials: Testimonial[];
  updateTestimonial: (index: number, updates: Partial<Testimonial>) => void;
}

export interface Testimonial {
  name: string;
  role: string;
  text: string;
  rating: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULTS
// ─────────────────────────────────────────────────────────────────────────────

const defaultAdmin: User = {
  name: 'Cams (Admin)',
  email: 'cams@evolve.studio',
  avatar: '👑',
  credits: 999,
  membershipTier: 'Studio Owner',
  membershipExpiry: 'Lifetime',
  cardLast4: '0000',
  streak: 999,
  totalClassesAttended: 999,
};

const defaultCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Mike Santos',
    email: 'mike@evolve.studio',
    phone: '+63 912 345 6789',
    credits: 5,
    membershipTier: 'Unlimited Gold',
    streak: 5,
    totalClassesAttended: 23,
    birthday: '1990-05-15',
    gender: 'Male',
    address: '123 Pioneer St, Mandaluyong, Metro Manila',
    referralSource: 'Instagram',
    communicationConsent: true,
    emergencyContactName: 'Maria Santos',
    emergencyContactPhone: '+63 917 111 2222',
    emergencyContactRelation: 'Spouse',
    medicalNotes: 'Occasional lower back stiffness. Prefers lighter spring settings on reformer.'
  },
  {
    id: 'cust-2',
    name: 'Sarah Connor',
    email: 'sarah@resistance.org',
    phone: '+63 923 456 7890',
    credits: 0,
    membershipTier: 'None',
    streak: 0,
    totalClassesAttended: 2,
    birthday: '1984-11-10',
    gender: 'Female',
    address: '456 resistance camp road, Sector 4',
    referralSource: 'Google',
    communicationConsent: true,
    emergencyContactName: 'John Connor',
    emergencyContactPhone: '+63 918 333 4444',
    emergencyContactRelation: 'Son',
    medicalNotes: 'Prior shoulder surgery (AC joint). Avoid maximum overhead extension under high resistance.'
  },
  {
    id: 'cust-3',
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    phone: '+63 934 567 8901',
    credits: 12,
    membershipTier: '10-Class Pack',
    streak: 2,
    totalClassesAttended: 8,
    birthday: '1992-08-25',
    gender: 'Male',
    address: 'Suite 9A, Axis Towers, BGC, Taguig',
    referralSource: 'Friend',
    communicationConsent: false,
    emergencyContactName: 'Jane Doe',
    emergencyContactPhone: '+63 919 555 6666',
    emergencyContactRelation: 'Sister',
    medicalNotes: 'No medical conditions or physical limitations reported. Full reformer capacity.'
  },
  {
    id: 'cust-4',
    name: 'Jane Smith',
    email: 'jane.smith@outlook.com',
    phone: '+63 945 678 9012',
    credits: 1,
    membershipTier: 'Single Session',
    streak: 1,
    totalClassesAttended: 1,
    birthday: '1995-03-04',
    gender: 'Female',
    address: '789 Emerald Condominiums, Ortigas, Pasig',
    referralSource: 'Walk-in',
    communicationConsent: true,
    emergencyContactName: 'Robert Smith',
    emergencyContactPhone: '+63 920 777 8888',
    emergencyContactRelation: 'Father',
    medicalNotes: 'Mild asthma. Always carries inhaler in training bag.'
  },
];

const CREDIT_PACKS = {
  single:    { credits: 1,   price: 600  },
  five:      { credits: 5,   price: 2800 },
  ten:       { credits: 10,  price: 5000 },
  unlimited: { credits: 999, price: 7500 },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — Parse "7:00 AM" / "6:00 PM" into a full Date object
// ─────────────────────────────────────────────────────────────────────────────



// ─────────────────────────────────────────────────────────────────────────────
// LOCALSTORAGE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────────────────────────────────────

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const SEED_EVENTS: StudioEvent[] = [
  {
    id: 'evt-001',
    title: "Vertical Artistry Showcase 2026",
    tag: "Showcase",
    startTime: "2026-08-15T18:00:00.000Z",
    endTime: "2026-08-15T21:00:00.000Z",
    location: "Davao Studio (Main Hall)",
    price: "₱750 / Ticket",
    description: "Our annual theatrical studio showcase celebrating vertical movement. Experience original choreography performed by advanced students and certified coaches under professional stage lighting.",
    instructorName: "Ervy Tweetie & Leadership Team",
    spotsLeft: 12
  },
  {
    id: 'evt-002',
    title: "Aerial Hoop & Lyra Basics Intensive",
    tag: "Workshop",
    startTime: "2026-07-25T14:00:00.000Z",
    endTime: "2026-07-25T17:00:00.000Z",
    location: "Davao Studio (Aerial Sanctuary)",
    price: "₱1,500 / Entry",
    description: "A focused 3-hour technique masterclass designed to optimize grip, transitions, and mount structures on the hoop. Ideal for beginner to intermediate aerialists.",
    instructorName: "Tweety Bullecer",
    spotsLeft: 4
  },
  {
    id: 'evt-003',
    title: "Pole Drops & Dynamic Rebounds",
    tag: "Masterclass",
    startTime: "2026-09-05T16:00:00.000Z",
    endTime: "2026-09-05T18:30:00.000Z",
    location: "Davao Studio (Main Hall)",
    price: "₱1,800 / Entry",
    description: "An advanced masterclass focusing on high-velocity drop catches, dynamic flips, and rebound setups. Prerequisites: Solid handspring and inside leg hangs.",
    instructorName: "Cams & Guest Instructors",
    spotsLeft: 6
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────────────────────────────────────

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [user,      setUser]      = useState<User>(defaultAdmin);
  const [customers, setCustomers] = useState<Customer[]>(defaultCustomers);
  const [classes,   setClasses]   = useState<FitnessClass[]>(SEED_CLASSES);
  const [bookings,  setBookings]  = useState<Booking[]>([]);
  const [waitlist,  setWaitlist]  = useState<WaitlistEntry[]>([]);
  const [spotLocks, setSpotLocks] = useState<SpotLock[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [events,       setEvents]       = useState<StudioEvent[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [hydrated,  setHydrated]  = useState(false);

  // ── WebSocket Terminal Syncing ──────────────────────────────────────────
  const { sendMessage, sessionId } = useWebSockets(useCallback((msg: SocketMessage) => {
    switch (msg.type) {
      case 'SPOT_LOCKED':
        setSpotLocks(prev => {
          const next = [
            ...prev.filter(l => !(l.classId === msg.payload.classId && l.spotNumber === msg.payload.spotNumber)),
            msg.payload
          ];
          saveToStorage('evolve_spot_locks', next);
          return next;
        });
        break;
      case 'SPOT_UNLOCKED':
        setSpotLocks(prev => {
          const next = prev.filter(
            l => !(l.classId === msg.payload.classId && l.spotNumber === msg.payload.spotNumber)
          );
          saveToStorage('evolve_spot_locks', next);
          return next;
        });
        break;
      case 'BOOKING_CREATED':
        setBookings(prev => {
          const next = [...prev, msg.payload.booking];
          saveToStorage('evolve_bookings', next);
          return next;
        });
        setClasses(prev => {
          const next = prev.map(c => 
            c.id === msg.payload.booking.classId
              ? { ...c, bookedSpots: [...c.bookedSpots, msg.payload.booking.spotNumber] }
              : c
          );
          saveToStorage('evolve_classes', next);
          return next;
        });
        setWaitlist(prev => {
          const next = prev.filter(
            w => !(w.classId === msg.payload.booking.classId && w.customerEmail.toLowerCase() === msg.payload.booking.customerEmail.toLowerCase())
          );
          saveToStorage('evolve_waitlist', next);
          return next;
        });
        break;
      case 'BOOKING_CANCELLED':
        setBookings(prev => {
          const next = prev.map(b => b.id === msg.payload.bookingId ? { ...b, status: 'cancelled' as const, cancelledAt: msg.payload.cancelledAt } : b);
          saveToStorage('evolve_bookings', next);
          return next;
        });
        setClasses(prev => {
          const next = prev.map(c => 
            c.id === msg.payload.classId
              ? { ...c, bookedSpots: c.bookedSpots.filter(s => s !== msg.payload.spotNumber) }
              : c
          );
          saveToStorage('evolve_classes', next);
          return next;
        });
        break;
      case 'CUSTOMER_UPDATED':
        setCustomers(prev => {
          const next = prev.map(c => c.id === msg.payload.id ? msg.payload : c);
          saveToStorage('evolve_customers', next);
          return next;
        });
        break;
      case 'TRANSACTION_UPDATED':
        setTransactions(prev => {
          const next = [
            ...prev.filter(t => t.id !== msg.payload.id),
            msg.payload
          ].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
          saveToStorage('evolve_transactions', next);
          return next;
        });
        break;
      case 'CLASS_UPDATED':
        setClasses(prev => {
          const exists = prev.some(c => c.id === msg.payload.id);
          const next = exists
            ? prev.map(c => c.id === msg.payload.id ? msg.payload : c)
            : [...prev, msg.payload];
          saveToStorage('evolve_classes', next);
          return next;
        });
        break;
      case 'CLASS_DELETED':
        setClasses(prev => {
          const next = prev.filter(c => c.id !== msg.payload.classId);
          saveToStorage('evolve_classes', next);
          return next;
        });
        break;
    }
  }, []));

  // sessionId is established dynamically in useWebSockets

  // ── Hydrate from LocalStorage once on mount ──────────────────────────────
  useEffect(() => {
    const savedAdmin     = loadFromStorage<User>('evolve_admin', defaultAdmin);
    const savedCustomers = loadFromStorage<Customer[]>('evolve_customers', defaultCustomers);
    const savedBookings  = loadFromStorage<Booking[]>('evolve_bookings', []);
    const savedWaitlist  = loadFromStorage<WaitlistEntry[]>('evolve_waitlist', []);
    const savedClasses   = loadFromStorage<FitnessClass[]>('evolve_classes', SEED_CLASSES);
    const savedLocks     = loadFromStorage<SpotLock[]>('evolve_spot_locks', []);
    let savedTransactions = loadFromStorage<Transaction[]>('evolve_transactions', []);

    // Check if classes are outdated (e.g. they contain dates in the past)
    const todayStr = new Date().toISOString().split('T')[0];
    const hasOutdatedClasses = savedClasses.length === 0 || savedClasses.some(c => c.date < todayStr);

    let activeClasses = savedClasses;
    let activeBookings = savedBookings;
    let activeWaitlist = savedWaitlist;
    let activeTransactions = savedTransactions;

    if (hasOutdatedClasses) {
      activeClasses = SEED_CLASSES;
      activeBookings = [];
      activeWaitlist = [];
      activeTransactions = [];
      saveToStorage('evolve_classes', SEED_CLASSES);
      saveToStorage('evolve_bookings', []);
      saveToStorage('evolve_waitlist', []);
      saveToStorage('evolve_transactions', []);
    } else {
      // Auto-generate transaction logs from bookings if transactions are empty
      if (savedTransactions.length === 0 && savedBookings.length > 0) {
        savedTransactions = savedBookings.map(b => {
          const cls = savedClasses.find(c => c.id === b.classId);
          return {
            id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            type: 'booking',
            timestamp: b.bookedAt,
            customerName: b.customerName,
            customerEmail: b.customerEmail,
            customerPhone: b.customerPhone,
            description: cls ? `${cls.title} (Spot #${b.spotNumber})` : `Class Booking (Spot #${b.spotNumber})`,
            paymentMethod: b.paymentMethod,
            amount: b.amountPaid,
            status: b.status === 'cancelled' ? 'cancelled' : 'paid',
            bookingId: b.id,
          };
        });
        saveToStorage('evolve_transactions', savedTransactions);
        activeTransactions = savedTransactions;
      }
    }

    const savedEvents    = loadFromStorage<StudioEvent[]>('evolve_events', SEED_EVENTS);
    const savedTestimonials = loadFromStorage<Testimonial[]>('evolve_testimonials', [
      {
        name: "Maria Santos",
        role: "Member since 2021",
        text: "Evolve is truly my Happy Place. I came in with zero upper body strength and constant self-doubt. The structure and certification of the coaches here helped me safely build physical strength and, more importantly, confidence I never knew I had.",
        rating: 5
      },
      {
        name: "Kassandra Ramos",
        role: "Aerial Silks Enthusiast",
        text: "The B&W studio aesthetic matches the focus and grace demanded by the aerial silks program. The coaches are incredibly safe, methodical, and certified. Joining the Evolve family completely transformed my fitness path.",
        rating: 5
      },
      {
        name: "Janine De Cruz",
        role: "Pole Dance Student",
        text: "If you are looking for a studio that values technique, safety, and encouragement equally, Evolve is it. No matter your shape or size, you are welcomed with open arms. The classes are empowering and extremely fun!",
        rating: 5
      }
    ]);

    setUser(savedAdmin);
    setCustomers(savedCustomers);
    setBookings(activeBookings);
    setWaitlist(activeWaitlist);
    setClasses(activeClasses);
    setSpotLocks(savedLocks);
    setTransactions(activeTransactions);
    setEvents(savedEvents);
    setTestimonials(savedTestimonials);
    setHydrated(true);
    registerPushNotifications();
  }, []);

  // ── Persist on every state change (post-hydration) ───────────────────────
  useEffect(() => { if (hydrated) saveToStorage('evolve_admin',     user);      }, [user,      hydrated]);
  useEffect(() => { if (hydrated) saveToStorage('evolve_customers', customers); }, [customers, hydrated]);
  useEffect(() => { if (hydrated) saveToStorage('evolve_bookings',  bookings);  }, [bookings,  hydrated]);
  useEffect(() => { if (hydrated) saveToStorage('evolve_waitlist',  waitlist);  }, [waitlist,  hydrated]);
  useEffect(() => { if (hydrated) saveToStorage('evolve_classes',   classes);   }, [classes,   hydrated]);
  useEffect(() => { if (hydrated) saveToStorage('evolve_spot_locks', spotLocks); }, [spotLocks, hydrated]);
  useEffect(() => { if (hydrated) saveToStorage('evolve_transactions', transactions); }, [transactions, hydrated]);
  useEffect(() => { if (hydrated) saveToStorage('evolve_events', events); }, [events, hydrated]);
  useEffect(() => { if (hydrated) saveToStorage('evolve_testimonials', testimonials); }, [testimonials, hydrated]);

  // ── Live Real-Time Multi-Terminal Sync (simulated via storage events) ───
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (!e.key) return;
      try {
        if (e.key === 'evolve_bookings') {
          setBookings(loadFromStorage<Booking[]>('evolve_bookings', []));
        } else if (e.key === 'evolve_classes') {
          setClasses(loadFromStorage<FitnessClass[]>('evolve_classes', SEED_CLASSES));
        } else if (e.key === 'evolve_waitlist') {
          setWaitlist(loadFromStorage<WaitlistEntry[]>('evolve_waitlist', []));
        } else if (e.key === 'evolve_spot_locks') {
          setSpotLocks(loadFromStorage<SpotLock[]>('evolve_spot_locks', []));
        } else if (e.key === 'evolve_customers') {
          setCustomers(loadFromStorage<Customer[]>('evolve_customers', defaultCustomers));
        } else if (e.key === 'evolve_transactions') {
          setTransactions(loadFromStorage<Transaction[]>('evolve_transactions', []));
        } else if (e.key === 'evolve_events') {
          setEvents(loadFromStorage<StudioEvent[]>('evolve_events', SEED_EVENTS));
        }
      } catch (err) {
        console.error('Real-time synchronization error:', err);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // BASIC READS
  // ─────────────────────────────────────────────────────────────────────────

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updates }));
  }, []);

  const getClassById = useCallback((classId: string) => {
    return classes.find(c => c.id === classId);
  }, [classes]);

  const getBookingForSpot = useCallback((classId: string, spotNumber: number) => {
    return bookings.find(
      b => b.classId === classId && b.spotNumber === spotNumber && b.status !== 'cancelled'
    );
  }, [bookings]);

  const isOnWaitlist = useCallback((classId: string, customerEmail: string) => {
    return waitlist.some(
      w => w.classId === classId && w.customerEmail.toLowerCase() === customerEmail.toLowerCase()
    );
  }, [waitlist]);

  // ── Concurrent Spot Locking Functions ──────────────────────────────────
  const lockSpot = useCallback((classId: string, spotNumber: number): { success: boolean; message: string } => {
    const now = new Date();
    // Remove expired locks first (30 seconds)
    let currentLocks = loadFromStorage<SpotLock[]>('evolve_spot_locks', []);
    currentLocks = currentLocks.filter(l => {
      const lockTime = new Date(l.lockedAt);
      const diffMs = now.getTime() - lockTime.getTime();
      return diffMs < 30000;
    });

    // Check if locked by another session
    const activeLock = currentLocks.find(
      l => l.classId === classId && l.spotNumber === spotNumber && l.lockedBy !== sessionId
    );

    if (activeLock) {
      return { success: false, message: 'Spot Temporarily Reserved by another terminal.' };
    }

    const newLock: SpotLock = {
      classId,
      spotNumber,
      lockedAt: now.toISOString(),
      lockedBy: sessionId,
    };

    const nextLocks = [
      ...currentLocks.filter(l => !(l.classId === classId && l.spotNumber === spotNumber)),
      newLock
    ];

    setSpotLocks(nextLocks);
    saveToStorage('evolve_spot_locks', nextLocks);
    sendMessage('SPOT_LOCKED', newLock);
    return { success: true, message: 'Spot locked successfully.' };
  }, [sessionId, sendMessage]);

  const unlockSpot = useCallback((classId: string, spotNumber: number) => {
    setSpotLocks(prev => {
      const next = prev.filter(
        l => !(l.classId === classId && l.spotNumber === spotNumber && l.lockedBy === sessionId)
      );
      saveToStorage('evolve_spot_locks', next);
      return next;
    });
    sendMessage('SPOT_UNLOCKED', { classId, spotNumber });
  }, [sessionId, sendMessage]);

  // ─────────────────────────────────────────────────────────────────────────
  // CUSTOMER MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────

  const addOrUpdateCustomer = useCallback((
    customerData: {
      id?: string;
      name: string;
      email: string;
      phone?: string;
      credits: number;
      membershipTier: string;
      emergencyContactName?: string;
      emergencyContactPhone?: string;
      emergencyContactRelation?: string;
      medicalNotes?: string;
      birthday?: string;
      gender?: string;
      address?: string;
      referralSource?: string;
      communicationConsent?: boolean;
      tags?: string[];
    }
  ): Customer => {
    const existing = customerData.id
      ? customers.find(c => c.id === customerData.id)
      : customers.find(c => c.email.toLowerCase() === customerData.email.toLowerCase());

    let resultCustomer: Customer;

    if (existing) {
      resultCustomer = {
        ...existing,
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        credits: customerData.credits,
        membershipTier: customerData.membershipTier,
        emergencyContactName: customerData.emergencyContactName,
        emergencyContactPhone: customerData.emergencyContactPhone,
        emergencyContactRelation: customerData.emergencyContactRelation,
        medicalNotes: customerData.medicalNotes,
        birthday: customerData.birthday,
        gender: customerData.gender,
        address: customerData.address,
        referralSource: customerData.referralSource,
        communicationConsent: customerData.communicationConsent,
        tags: customerData.tags,
      };
      setCustomers(prev => prev.map(c => c.id === resultCustomer.id ? resultCustomer : c));
    } else {
      resultCustomer = {
        id: customerData.id || `cust-${Date.now()}`,
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        credits: customerData.credits,
        membershipTier: customerData.membershipTier || 'None',
        streak: 0,
        totalClassesAttended: 0,
        emergencyContactName: customerData.emergencyContactName || '',
        emergencyContactPhone: customerData.emergencyContactPhone || '',
        emergencyContactRelation: customerData.emergencyContactRelation || '',
        medicalNotes: customerData.medicalNotes || '',
        birthday: customerData.birthday || '',
        gender: customerData.gender || '',
        address: customerData.address || '',
        referralSource: customerData.referralSource || '',
        communicationConsent: customerData.communicationConsent !== undefined ? customerData.communicationConsent : false,
        tags: customerData.tags || [],
      };
      setCustomers(prev => [...prev, resultCustomer]);
    }

    sendMessage('CUSTOMER_UPDATED', resultCustomer);
    return resultCustomer;
  }, [customers, sendMessage]);

  const buyCreditsForCustomer = useCallback((customerId: string, packType: PackType) => {
    const pack = CREDIT_PACKS[packType];
    setCustomers(prev => prev.map(c => {
      if (c.id !== customerId) return c;
      return {
        ...c,
        credits: packType === 'unlimited' ? 999 : c.credits + pack.credits,
        membershipTier:
          packType === 'unlimited'
            ? 'Unlimited Gold'
            : c.membershipTier === 'None'
            ? `${pack.credits}-Class Pack`
            : c.membershipTier,
      };
    }));
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // BOOK SPOT
  // ─────────────────────────────────────────────────────────────────────────

  const bookSpot = useCallback((
    classId:       string,
    spotNumber:    number,
    method:        'credit' | 'card' | 'cash',
    customerName:  string,
    customerEmail: string,
    customerPhone?: string,
    promoCode?:    string,
    handledBy?:    string,
    priceOverride?: number
  ): { success: boolean; message: string; booking?: Booking } => {
    const cls = classes.find(c => c.id === classId);
    if (!cls) return { success: false, message: 'Class not found.' };
    if (cls.bookedSpots.includes(spotNumber)) {
      return { success: false, message: 'This spot was just taken. Please select another.' };
    }

    // ── Promo code discount & Price Overrides ───────────────────────────────
    let finalPrice = priceOverride !== undefined ? priceOverride : cls.price;
    const appliedPromo = promoCode?.toUpperCase() === 'EVOLVE10' ? 'EVOLVE10' : undefined;
    if (appliedPromo && priceOverride === undefined) {
      finalPrice = cls.price * 0.9; // 10% off
    }
    const subtotal  = finalPrice;
    const taxAmount = priceOverride !== undefined ? 0 : Math.round(subtotal * 0.08 * 100) / 100;
    const total     = priceOverride !== undefined ? finalPrice : Math.round((subtotal + taxAmount) * 100) / 100;

    // ── Find or register customer ─────────────────────────────────────────
    let targetCustomer = customers.find(
      c => c.email.toLowerCase() === customerEmail.toLowerCase()
    );
    if (!targetCustomer) {
      targetCustomer = addOrUpdateCustomer({
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        credits: 0,
        membershipTier: 'None',
      });
    }

    // ── Credit validation ─────────────────────────────────────────────────
    if (method === 'credit') {
      if (targetCustomer.credits < 1) {
        return {
          success: false,
          message: `${customerName} does not have enough class credits.`,
        };
      }
      setCustomers(prev => prev.map(c =>
        c.email.toLowerCase() === customerEmail.toLowerCase()
          ? { ...c, credits: c.credits - 1 }
          : c
      ));
    }

    // ── Create booking ────────────────────────────────────────────────────
    const newBooking: Booking = {
      id:             `booking-${Date.now()}`,
      classId,
      spotNumber,
      bookedAt:       new Date().toISOString(),
      paymentMethod:  method,
      amountPaid:     method === 'credit' ? 0 : total,
      status:         method === 'credit' ? 'upcoming' : 'pending',
      customerName,
      customerEmail,
      customerPhone,
      discountCode:   appliedPromo,
    };

    setBookings(prev => [...prev, newBooking]);
    setClasses(prev => prev.map(c =>
      c.id === classId
        ? { ...c, bookedSpots: [...c.bookedSpots, spotNumber] }
        : c
    ));

    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'booking',
      timestamp: new Date().toISOString(),
      customerName,
      customerEmail,
      customerPhone,
      description: `${cls.title} (Spot #${spotNumber})`,
      paymentMethod: method,
      amount: method === 'credit' ? 0 : total,
      status: method === 'credit' ? 'paid' : 'pending',
      bookingId: newBooking.id,
      handledBy: handledBy || 'Cams Rivera',
    };
    setTransactions(prev => [newTx, ...prev]);

    // ── Remove from waitlist if present (and release hold) ────────────────
    setWaitlist(prev => prev.filter(
      w => !(w.classId === classId && w.customerEmail.toLowerCase() === customerEmail.toLowerCase())
    ));

    // Release our reservation/lock on successful book
    unlockSpot(classId, spotNumber);

    sendMessage('BOOKING_CREATED', { booking: newBooking });
    return { success: true, message: 'Spot successfully booked!', booking: newBooking };
  }, [classes, customers, addOrUpdateCustomer, unlockSpot, sendMessage]);

  // ─────────────────────────────────────────────────────────────────────────
  // CANCEL BOOKING  — 12-Hour Cancellation Matrix Controller
  // ─────────────────────────────────────────────────────────────────────────

  const cancelBooking = useCallback((bookingId: string): { success: boolean; message: string } => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking not found.' };
    if (booking.status === 'cancelled') return { success: false, message: 'Booking already cancelled.' };

    const cls = classes.find(c => c.id === booking.classId);

    // ── Compute delta to class start using proper AM/PM parser ────────────
    const now = new Date();
    let hoursUntilClass = Infinity; // default safe value (always refund if class not found)

    if (cls) {
      const classStart = parseClassDateTime(cls.date, cls.time);
      const deltaMs    = classStart.getTime() - now.getTime();
      hoursUntilClass  = deltaMs / (1000 * 60 * 60);
    }

    // ── 12-hour matrix decision ───────────────────────────────────────────
    // Early cancellation  (≥ 12 h before class):  refund 1 credit if paid by credit
    // Late  cancellation  (<  12 h before class):  no refund — studio retains revenue
    const isEarlyCancel = hoursUntilClass >= 12;
    const creditRefund  = isEarlyCancel && booking.paymentMethod === 'credit';

    // ── Mutate booking status + strip spot from class ─────────────────────
    const cancelledAt = new Date().toISOString();
    setBookings(prev => prev.map(b =>
      b.id === bookingId ? { ...b, status: 'cancelled', cancelledAt } : b
    ));
    setClasses(prev => prev.map(c =>
      c.id === booking.classId
        ? { ...c, bookedSpots: c.bookedSpots.filter(s => s !== booking.spotNumber) }
        : c
    ));
    setTransactions(prev => prev.map(t =>
      t.bookingId === bookingId ? { ...t, status: 'cancelled' } : t
    ));
    sendMessage('BOOKING_CANCELLED', { bookingId, cancelledAt, classId: booking.classId, spotNumber: booking.spotNumber });

    // ── Credit refund (early cancel only) ─────────────────────────────────
    if (creditRefund) {
      setCustomers(prev => prev.map(c =>
        c.email.toLowerCase() === booking.customerEmail.toLowerCase()
          ? { ...c, credits: c.credits + 1 }
          : c
      ));
    }

    // ── After a spot opens, auto-promote oldest waitlisted client ─────────
    // We defer this to a microtask so class state has settled.
    if (cls) {
      setTimeout(() => {
        setWaitlist(prevWl => {
          const classQueue = prevWl
            .filter(w => w.classId === booking.classId)
            .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));

          if (classQueue.length === 0) return prevWl;

          const nextUp = classQueue[0];

          // Determine payment method — use held credit if hold is active
          const payMethod: 'credit' | 'cash' = nextUp.holdCredit ? 'credit' : 'cash';

          // If the hold credit was pre-authorized, restore it first so bookSpot can deduct it
          if (nextUp.holdCredit) {
            setCustomers(prev => prev.map(c =>
              c.email.toLowerCase() === nextUp.customerEmail.toLowerCase()
                ? { ...c, credits: c.credits + 1 }
                : c
            ));
          }

          // Find a free spot
          setClasses(prevCls => {
            const targetClass = prevCls.find(c => c.id === booking.classId);
            if (!targetClass) return prevCls;

            let freeSpot = -1;
            for (let s = 1; s <= targetClass.totalSpots; s++) {
              if (!targetClass.bookedSpots.includes(s)) { freeSpot = s; break; }
            }
            if (freeSpot === -1) return prevCls;

            // Build the promoted booking
            const promotedBooking: Booking = {
              id:            `booking-${Date.now()}`,
              classId:       booking.classId,
              spotNumber:    freeSpot,
              bookedAt:      new Date().toISOString(),
              paymentMethod: payMethod,
              amountPaid:    0, // credit or zero — settled in-context
              status:        'upcoming',
              customerName:  nextUp.customerName,
              customerEmail: nextUp.customerEmail,
              customerPhone: nextUp.customerPhone,
            };

            // Deduct credit if used
            if (payMethod === 'credit') {
              setCustomers(prev => prev.map(c =>
                c.email.toLowerCase() === nextUp.customerEmail.toLowerCase()
                  ? { ...c, credits: c.credits - 1 }
                  : c
              ));
            }

            setBookings(prev => [...prev, promotedBooking]);
            const promotedTx: Transaction = {
              id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              type: 'booking',
              timestamp: new Date().toISOString(),
              customerName: nextUp.customerName,
              customerEmail: nextUp.customerEmail,
              customerPhone: nextUp.customerPhone,
              description: `${targetClass.title} (Spot #${freeSpot})`,
              paymentMethod: payMethod,
              amount: 0,
              status: 'paid',
              bookingId: promotedBooking.id,
            };
            setTransactions(prev => [promotedTx, ...prev]);
            sendMessage('BOOKING_CREATED', { booking: promotedBooking });

            return prevCls.map(c =>
              c.id === booking.classId
                ? { ...c, bookedSpots: [...c.bookedSpots, freeSpot] }
                : c
            );
          });

          // Remove promoted client from waitlist
          return prevWl.filter(
            w => !(w.classId === booking.classId &&
              w.customerEmail.toLowerCase() === nextUp.customerEmail.toLowerCase())
          );
        });
      }, 0);
    }

    if (!cls) return { success: true, message: 'Booking cancelled.' };
    if (creditRefund) return { success: true, message: 'Early cancellation — 1 credit refunded.' };
    return { success: true, message: 'Late cancellation (<12 h) — no credit refund retained.' };
  }, [bookings, classes, sendMessage]);

  // ─────────────────────────────────────────────────────────────────────────
  // CHECK IN
  // ─────────────────────────────────────────────────────────────────────────

  const checkInBooking = useCallback((bookingId: string): { success: boolean; message: string } => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking not found.' };
    if (booking.status === 'cancelled') return { success: false, message: 'Cannot check-in a cancelled booking.' };
    if (booking.status === 'attended') return { success: false, message: 'Already checked in.' };

    setBookings(prev => prev.map(b =>
      b.id === bookingId ? { ...b, status: 'attended' } : b
    ));

    // Increment customer's attended count + streak
    setCustomers(prev => prev.map(c =>
      c.email.toLowerCase() === booking.customerEmail.toLowerCase()
        ? { ...c, totalClassesAttended: c.totalClassesAttended + 1, streak: c.streak + 1 }
        : c
    ));

    return { success: true, message: `${booking.customerName} checked in successfully.` };
  }, [bookings]);

  // ─────────────────────────────────────────────────────────────────────────
  // CONFIRM PENDING BOOKING
  // ─────────────────────────────────────────────────────────────────────────

  const confirmBooking = useCallback((bookingId: string): { success: boolean; message: string } => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking not found.' };
    if (booking.status !== 'pending') return { success: false, message: 'Booking is not pending confirmation.' };

    setBookings(prev => {
      const next = prev.map(b =>
        b.id === bookingId ? { ...b, status: 'upcoming' as const } : b
      );
      saveToStorage('evolve_bookings', next);
      return next;
    });

    setTransactions(prev => {
      const next = prev.map(t =>
        t.bookingId === bookingId ? { ...t, status: 'paid' as const } : t
      );
      saveToStorage('evolve_transactions', next);
      return next;
    });

    return { success: true, message: `Booking for ${booking.customerName} has been confirmed.` };
  }, [bookings]);

  // ─────────────────────────────────────────────────────────────────────────
  // WAITLIST — Join / Leave / Promote / Expire Holds
  // ─────────────────────────────────────────────────────────────────────────

  const joinWaitlist = useCallback((
    classId:       string,
    customerName:  string,
    customerEmail: string,
    customerPhone?: string
  ) => {
    const alreadyQueued = waitlist.some(
      w => w.classId === classId && w.customerEmail.toLowerCase() === customerEmail.toLowerCase()
    );
    if (alreadyQueued) return;

    // Check if the customer has a credit to pre-authorize (hold)
    const customer = customers.find(
      c => c.email.toLowerCase() === customerEmail.toLowerCase()
    );
    const hasCredit = customer && customer.credits >= 1;

    // Place a hold — deduct 1 credit from visible balance
    if (hasCredit && customer) {
      setCustomers(prevC => prevC.map(c =>
        c.email.toLowerCase() === customerEmail.toLowerCase()
          ? { ...c, credits: c.credits - 1 }
          : c
      ));
    }

    setWaitlist(prev => [
      ...prev,
      {
        classId,
        customerName,
        customerEmail,
        customerPhone,
        joinedAt:    new Date().toISOString(),
        holdCredit:  !!hasCredit,
      },
    ]);
  }, [customers, waitlist]);

  const leaveWaitlist = useCallback((classId: string, customerEmail: string) => {
    const entry = waitlist.find(
      w => w.classId === classId && w.customerEmail.toLowerCase() === customerEmail.toLowerCase()
    );

    // Restore held credit when leaving waitlist voluntarily
    if (entry?.holdCredit) {
      setCustomers(prevC => prevC.map(c =>
        c.email.toLowerCase() === customerEmail.toLowerCase()
          ? { ...c, credits: c.credits + 1 }
          : c
      ));
    }

    setWaitlist(prev => prev.filter(
      w => !(w.classId === classId && w.customerEmail.toLowerCase() === customerEmail.toLowerCase())
    ));
  }, [waitlist]);

  const releaseExpiredHolds = useCallback(() => {
    const now = new Date();

    const toRelease = waitlist.filter(w => {
      const cls = classes.find(c => c.id === w.classId);
      if (!cls || !w.holdCredit) return false;
      const classStart = parseClassDateTime(cls.date, cls.time);
      return classStart <= now; // class already started / passed
    });

    if (toRelease.length === 0) return;

    // Restore credits for each expired hold
    toRelease.forEach(entry => {
      setCustomers(prevC => prevC.map(c =>
        c.email.toLowerCase() === entry.customerEmail.toLowerCase()
          ? { ...c, credits: c.credits + 1 }
          : c
      ));
    });

    const releasedKeys = new Set(
      toRelease.map(e => `${e.classId}::${e.customerEmail.toLowerCase()}`)
    );
    
    setWaitlist(prev => prev.filter(
      w => !releasedKeys.has(`${w.classId}::${w.customerEmail.toLowerCase()}`)
    ));
  }, [classes, waitlist]);

  /**
   * promoteFromWaitlist — manually promote the oldest queued client into an open spot.
   * Called from BookingTerminal "Promote Client" button.
   */
  const promoteFromWaitlist = useCallback((
    classId:       string,
    customerEmail: string,
    method:        'credit' | 'card' | 'cash' = 'cash'
  ): { success: boolean; message: string; booking?: Booking } => {
    const cls = classes.find(c => c.id === classId);
    if (!cls) return { success: false, message: 'Class not found.' };

    let freeSpot = -1;
    for (let s = 1; s <= cls.totalSpots; s++) {
      if (!cls.bookedSpots.includes(s)) { freeSpot = s; break; }
    }
    if (freeSpot === -1) return { success: false, message: 'No free spots available.' };

    const wlEntry = waitlist.find(
      w => w.classId === classId && w.customerEmail.toLowerCase() === customerEmail.toLowerCase()
    );
    if (!wlEntry) return { success: false, message: 'Client is not on the waitlist.' };

    // If hold credit was pre-authorized, restore it so bookSpot can deduct properly
    const effectiveMethod = wlEntry.holdCredit ? 'credit' : method;
    if (wlEntry.holdCredit) {
      setCustomers(prevC => prevC.map(c =>
        c.email.toLowerCase() === customerEmail.toLowerCase()
          ? { ...c, credits: c.credits + 1 }
          : c
      ));
    }

    return bookSpot(
      classId,
      freeSpot,
      effectiveMethod,
      wlEntry.customerName,
      wlEntry.customerEmail,
      wlEntry.customerPhone,
      undefined
    );
  }, [classes, waitlist, bookSpot]);

  // ─────────────────────────────────────────────────────────────────────────
  // CLASS MANAGEMENT (Schedule Builder)
  // ─────────────────────────────────────────────────────────────────────────

  const addClass = useCallback((classData: Omit<FitnessClass, 'id' | 'bookedSpots'>): FitnessClass => {
    const newClass: FitnessClass = {
      ...classData,
      id: `class-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      bookedSpots: [],
    };
    setClasses(prev => {
      const next = [...prev, newClass];
      saveToStorage('evolve_classes', next);
      return next;
    });
    sendMessage('CLASS_UPDATED', newClass);
    return newClass;
  }, [sendMessage]);

  const updateClass = useCallback((classId: string, updates: Partial<Omit<FitnessClass, 'id' | 'bookedSpots'>>) => {
    let updatedClass: FitnessClass | undefined;
    setClasses(prev => {
      const next = prev.map(c => {
        if (c.id === classId) {
          updatedClass = { ...c, ...updates };
          return updatedClass;
        }
        return c;
      });
      saveToStorage('evolve_classes', next);
      return next;
    });
    if (updatedClass) {
      sendMessage('CLASS_UPDATED', updatedClass);
    }
  }, [sendMessage]);

  const deleteClass = useCallback((classId: string): { success: boolean; message: string } => {
    const activeBookings = bookings.filter(
      b => b.classId === classId && b.status !== 'cancelled'
    );
    if (activeBookings.length > 0) {
      return {
        success: false,
        message: `Cannot delete: ${activeBookings.length} active booking(s) exist for this class.`,
      };
    }
    setClasses(prev => {
      const next = prev.filter(c => c.id !== classId);
      saveToStorage('evolve_classes', next);
      return next;
    });
    sendMessage('CLASS_DELETED', { classId });
    return { success: true, message: 'Class deleted successfully.' };
  }, [bookings, sendMessage]);

  const addTransaction = useCallback((txData: Omit<Transaction, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) => {
    const newTx: Transaction = {
      id: txData.id || `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: txData.timestamp || new Date().toISOString(),
      type: txData.type,
      customerName: txData.customerName,
      customerEmail: txData.customerEmail,
      customerPhone: txData.customerPhone,
      description: txData.description,
      paymentMethod: txData.paymentMethod,
      amount: txData.amount,
      status: txData.status,
      bookingId: txData.bookingId,
      handledBy: txData.handledBy || 'Cams Rivera',
    };
    setTransactions(prev => {
      const next = [newTx, ...prev];
      saveToStorage('evolve_transactions', next);
      return next;
    });
    sendMessage('TRANSACTION_UPDATED', newTx);
    return newTx;
  }, [sendMessage]);

  const updateTransactionStatus = useCallback((id: string, status: Transaction['status']) => {
    setTransactions(prev => {
      const next = prev.map(t => {
        if (t.id === id) {
          const updated = { ...t, status };
          sendMessage('TRANSACTION_UPDATED', updated);
          return updated;
        }
        return t;
      });
      saveToStorage('evolve_transactions', next);
      return next;
    });
  }, [sendMessage]);

  // ── Events CRUD Functions ──────────────────────────────────────────────
  const addEvent = useCallback((eventData: Omit<StudioEvent, 'id'>) => {
    const newEvent: StudioEvent = {
      ...eventData,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setEvents(prev => [...prev, newEvent]);
    return newEvent;
  }, []);

  const updateEvent = useCallback((eventId: string, updates: Partial<Omit<StudioEvent, 'id'>>) => {
    setEvents(prev => prev.map(evt => evt.id === eventId ? { ...evt, ...updates } : evt));
  }, []);

  const deleteEvent = useCallback((eventId: string) => {
    setEvents(prev => prev.filter(evt => evt.id !== eventId));
    return { success: true, message: 'Event deleted successfully.' };
  }, []);

  const updateTestimonial = useCallback((index: number, updates: Partial<Testimonial>) => {
    setTestimonials(prev => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], ...updates };
      }
      return copy;
    });
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <BookingContext.Provider value={{
      user, customers, classes, bookings, waitlist, spotLocks, transactions,
      updateUser,
      bookSpot, cancelBooking, checkInBooking, confirmBooking,
      buyCreditsForCustomer,
      addOrUpdateCustomer,
      getClassById, getBookingForSpot,
      joinWaitlist, leaveWaitlist, isOnWaitlist,
      promoteFromWaitlist, releaseExpiredHolds,
      lockSpot, unlockSpot,
      addTransaction, updateTransactionStatus,
      addClass, updateClass, deleteClass,
      events, addEvent, updateEvent, deleteEvent,
      testimonials, updateTestimonial,
    }}>
      {children}
    </BookingContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
}
