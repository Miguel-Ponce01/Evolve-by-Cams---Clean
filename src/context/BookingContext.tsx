'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { FitnessClass, Booking, User, Customer, WaitlistEntry, PackType } from '@/types';
import { SEED_CLASSES } from '@/lib/seedData';

interface BookingContextType {
  user: User; // Logged-in Admin (Owner)
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
    promoCode?: string
  ) => { success: boolean; message: string; booking?: Booking };
  cancelBooking: (bookingId: string) => { success: boolean; message: string };
  buyCreditsForCustomer: (customerId: string, packType: PackType) => void;
  addOrUpdateCustomer: (customerData: { id?: string; name: string; email: string; phone?: string; credits: number; membershipTier: string }) => Customer;
  getClassById: (classId: string) => FitnessClass | undefined;
  getBookingForSpot: (classId: string, spotNumber: number) => Booking | undefined;
  joinWaitlist: (classId: string, customerName: string, customerEmail: string, customerPhone?: string) => void;
  leaveWaitlist: (classId: string, customerEmail: string) => void;
  isOnWaitlist: (classId: string, customerEmail: string) => boolean;
}

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
  { id: 'cust-1', name: 'Mike Santos', email: 'mike@evolve.studio', phone: '+63 912 345 6789', credits: 5, membershipTier: 'Unlimited Gold', streak: 5, totalClassesAttended: 23 },
  { id: 'cust-2', name: 'Sarah Connor', email: 'sarah@resistance.org', phone: '+63 923 456 7890', credits: 0, membershipTier: 'None', streak: 0, totalClassesAttended: 2 },
  { id: 'cust-3', name: 'John Doe', email: 'john.doe@gmail.com', phone: '+63 934 567 8901', credits: 12, membershipTier: '10-Class Pack', streak: 2, totalClassesAttended: 8 },
  { id: 'cust-4', name: 'Jane Smith', email: 'jane.smith@outlook.com', phone: '+63 945 678 9012', credits: 1, membershipTier: 'Single Session', streak: 1, totalClassesAttended: 1 },
];

const CREDIT_PACKS = {
  single: { credits: 1, price: 35 },
  five: { credits: 5, price: 160 },
  ten: { credits: 10, price: 300 },
  unlimited: { credits: 999, price: 199 },
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
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

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(defaultAdmin);
  const [customers, setCustomers] = useState<Customer[]>(defaultCustomers);
  const [classes, setClasses] = useState<FitnessClass[]>(SEED_CLASSES);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedAdmin = loadFromStorage<User>('evolve_admin', defaultAdmin);
    const savedCustomers = loadFromStorage<Customer[]>('evolve_customers', defaultCustomers);
    const savedBookings = loadFromStorage<Booking[]>('evolve_bookings', []);
    const savedWaitlist = loadFromStorage<WaitlistEntry[]>('evolve_waitlist', []);
    const savedClasses = loadFromStorage<FitnessClass[]>('evolve_classes', SEED_CLASSES);

    setUser(savedAdmin);
    setCustomers(savedCustomers);
    setBookings(savedBookings);
    setWaitlist(savedWaitlist);
    setClasses(savedClasses);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveToStorage('evolve_admin', user);
  }, [user, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveToStorage('evolve_customers', customers);
  }, [customers, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveToStorage('evolve_bookings', bookings);
  }, [bookings, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveToStorage('evolve_waitlist', waitlist);
  }, [waitlist, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveToStorage('evolve_classes', classes);
  }, [classes, hydrated]);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updates }));
  }, []);

  const getClassById = useCallback((classId: string) => {
    return classes.find(c => c.id === classId);
  }, [classes]);

  const getBookingForSpot = useCallback((classId: string, spotNumber: number) => {
    return bookings.find(b => b.classId === classId && b.spotNumber === spotNumber && b.status !== 'cancelled');
  }, [bookings]);

  const isOnWaitlist = useCallback((classId: string, customerEmail: string) => {
    return waitlist.some(w => w.classId === classId && w.customerEmail.toLowerCase() === customerEmail.toLowerCase());
  }, [waitlist]);

  const addOrUpdateCustomer = useCallback((customerData: { id?: string; name: string; email: string; phone?: string; credits: number; membershipTier: string }): Customer => {
    let resultCustomer: Customer;
    setCustomers(prev => {
      const existingIdx = customerData.id ? prev.findIndex(c => c.id === customerData.id) : prev.findIndex(c => c.email.toLowerCase() === customerData.email.toLowerCase());
      
      if (existingIdx > -1) {
        const updated = {
          ...prev[existingIdx],
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          credits: customerData.credits,
          membershipTier: customerData.membershipTier,
        };
        const next = [...prev];
        next[existingIdx] = updated;
        resultCustomer = updated;
        return next;
      } else {
        const newCustomer: Customer = {
          id: `cust-${Date.now()}`,
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          credits: customerData.credits,
          membershipTier: customerData.membershipTier || 'None',
          streak: 0,
          totalClassesAttended: 0,
        };
        resultCustomer = newCustomer;
        return [...prev, newCustomer];
      }
    });

    // Generate safe fallback return value
    return resultCustomer! || {
      id: customerData.id || `cust-${Date.now()}`,
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      credits: customerData.credits,
      membershipTier: customerData.membershipTier || 'None',
      streak: 0,
      totalClassesAttended: 0,
    };
  }, []);

  const bookSpot = useCallback((
    classId: string,
    spotNumber: number,
    method: 'credit' | 'card' | 'cash',
    customerName: string,
    customerEmail: string,
    customerPhone?: string,
    promoCode?: string
  ): { success: boolean; message: string; booking?: Booking } => {
    const cls = classes.find(c => c.id === classId);
    if (!cls) return { success: false, message: 'Class not found.' };
    if (cls.bookedSpots.includes(spotNumber)) return { success: false, message: 'This spot was just taken. Please select another.' };

    let discount = 0;
    let finalPrice = cls.price;
    if (promoCode?.toUpperCase() === 'EVOLVE10') {
      discount = cls.price * 0.1;
      finalPrice = cls.price - discount;
    }

    // Find or register customer
    let targetCustomer = customers.find(c => c.email.toLowerCase() === customerEmail.toLowerCase());
    
    if (!targetCustomer) {
      // Create new customer on the fly
      targetCustomer = addOrUpdateCustomer({
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        credits: 0,
        membershipTier: 'None'
      });
    }

    if (method === 'credit') {
      if (targetCustomer.credits < 1) {
        return { success: false, message: `Customer ${customerName} does not have enough class credits.` };
      }
      // Deduct credit
      setCustomers(prev => prev.map(c => 
        c.email.toLowerCase() === customerEmail.toLowerCase() ? { ...c, credits: c.credits - 1 } : c
      ));
    }

    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      classId,
      spotNumber,
      bookedAt: new Date().toISOString(),
      paymentMethod: method,
      amountPaid: method === 'credit' ? 0 : finalPrice,
      status: 'upcoming',
      customerName,
      customerEmail,
      customerPhone,
    };

    setBookings(prev => [...prev, newBooking]);
    setClasses(prev => prev.map(c =>
      c.id === classId ? { ...c, bookedSpots: [...c.bookedSpots, spotNumber] } : c
    ));

    // Remove from waitlist if they were on it
    setWaitlist(prev => prev.filter(w => !(w.classId === classId && w.customerEmail.toLowerCase() === customerEmail.toLowerCase())));

    return { success: true, message: 'Spot successfully booked!', booking: newBooking };
  }, [classes, customers, addOrUpdateCustomer]);

  const cancelBooking = useCallback((bookingId: string): { success: boolean; message: string } => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking not found.' };

    const cls = classes.find(c => c.id === booking.classId);
    const bookedAt = new Date(booking.bookedAt);
    const now = new Date();
    const hoursAgo = (now.getTime() - bookedAt.getTime()) / (1000 * 60 * 60);
    const isLate = cls ? new Date(`${cls.date}T${cls.time.includes('PM') ? parseInt(cls.time) + 12 : parseInt(cls.time)}:00:00`) < now : false;
    const refund = !isLate && hoursAgo < 12 && booking.paymentMethod === 'credit';

    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
    setClasses(prev => prev.map(c =>
      c.id === booking.classId
        ? { ...c, bookedSpots: c.bookedSpots.filter(s => s !== booking.spotNumber) }
        : c
    ));

    if (refund) {
      setCustomers(prev => prev.map(c => 
        c.email.toLowerCase() === booking.customerEmail.toLowerCase() ? { ...c, credits: c.credits + 1 } : c
      ));
      return { success: true, message: 'Booking cancelled. 1 credit refunded to customer.' };
    }

    return { success: true, message: isLate ? 'Booking cancelled. No refund for past classes.' : 'Booking cancelled. Late cancellation — no refund.' };
  }, [bookings, classes]);

  const buyCreditsForCustomer = useCallback((customerId: string, packType: PackType) => {
    const pack = CREDIT_PACKS[packType];
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          credits: packType === 'unlimited' ? 999 : c.credits + pack.credits,
          membershipTier: packType === 'unlimited' ? 'Unlimited Gold' : c.membershipTier === 'None' ? `${pack.credits}-Class Pack` : c.membershipTier,
        };
      }
      return c;
    }));
  }, []);

  const joinWaitlist = useCallback((classId: string, customerName: string, customerEmail: string, customerPhone?: string) => {
    setWaitlist(prev => {
      if (!prev.some(w => w.classId === classId && w.customerEmail.toLowerCase() === customerEmail.toLowerCase())) {
        return [...prev, { classId, customerName, customerEmail, customerPhone, joinedAt: new Date().toISOString() }];
      }
      return prev;
    });
  }, []);

  const leaveWaitlist = useCallback((classId: string, customerEmail: string) => {
    setWaitlist(prev => prev.filter(w => !(w.classId === classId && w.customerEmail.toLowerCase() === customerEmail.toLowerCase())));
  }, []);

  return (
    <BookingContext.Provider value={{
      user, customers, classes, bookings, waitlist,
      updateUser, bookSpot, cancelBooking, buyCreditsForCustomer,
      addOrUpdateCustomer, getClassById, getBookingForSpot,
      joinWaitlist, leaveWaitlist, isOnWaitlist,
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
}
