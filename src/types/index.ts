export type ClassType = 'Pole Fitness' | 'Aerial Sling' | 'Exole' | 'Sexy Chair' | 'Yoga' | 'Aerial Sling Kids';

export interface Instructor {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  specialty: string;
  musicStyle: string;
  playlist: string;
  instagram: string;
  totalStudents: number;
  rating: number;
}

export interface FitnessClass {
  id: string;
  title: string;
  type: ClassType;
  instructor: Instructor;
  date: string;       // ISO date string  YYYY-MM-DD
  time: string;       // "7:00 AM"
  duration: number;   // minutes
  totalSpots: number;
  bookedSpots: number[];
  price: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  description: string;
  tags: string[];
}

export interface Booking {
  id: string;
  classId: string;
  spotNumber: number;
  bookedAt: string;                               // ISO timestamp
  paymentMethod: 'credit' | 'card' | 'cash';
  amountPaid: number;
  status: 'upcoming' | 'attended' | 'cancelled' | 'pending';
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  discountCode?: string;                          // e.g. 'EVOLVE10'
  cancelledAt?: string;                           // ISO timestamp – set on cancellation
}

export interface Transaction {
  id: string;
  type: 'booking' | 'membership';
  timestamp: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  description: string;
  paymentMethod: 'cash' | 'card' | 'credit';
  amount: number;
  status: 'paid' | 'pending' | 'cancelled';
  bookingId?: string;
  handledBy?: string;
}

export interface User {
  name: string;
  email: string;
  avatar: string;
  credits: number;
  membershipTier: string;
  membershipExpiry: string;
  cardLast4: string;
  streak: number;
  totalClassesAttended: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  credits: number;
  membershipTier: string;
  streak: number;
  totalClassesAttended: number;
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

export interface WaitlistEntry {
  classId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  joinedAt: string;           // ISO timestamp
  holdCredit: boolean;        // true = 1 credit is pre-authorized (on hold)
}

export interface SpotLock {
  classId: string;
  spotNumber: number;
  lockedAt: string;           // ISO timestamp
  lockedBy: string;           // sessionId of locking terminal
}

export type PackType = 'single' | 'five' | 'ten' | 'unlimited';

export interface CreditPack {
  type: PackType;
  label: string;
  credits: number;
  price: number;
  perClass: string;
  popular?: boolean;
}

/**
 * Computed daily analytics snapshot — never persisted, always derived.
 */
export interface DailyStats {
  occupancyRate: number;        // 0-100 percentage
  totalBookings: number;        // non-cancelled bookings booked today
  activeCustomers: number;      // total customer records
  revenue: {
    cash: number;
    card: number;
    total: number;
  };
  creditsRedeemed: number;      // credit-method bookings today
  cancellations: number;        // cancellations logged today
}

export interface StudioEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  tag: string;
  spotsLeft: number;
  price: string;
  location: string;
  instructorName?: string;
}
