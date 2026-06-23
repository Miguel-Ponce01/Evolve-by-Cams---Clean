export type ClassType = 'Reformer' | 'Mat Pilates' | 'HIIT' | 'Yoga' | 'Sculpt';

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
  date: string; // ISO date string
  time: string; // "7:00 AM"
  duration: number; // minutes
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
  bookedAt: string;
  paymentMethod: 'credit' | 'card' | 'cash';
  amountPaid: number;
  status: 'upcoming' | 'attended' | 'cancelled';
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
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
}

export interface WaitlistEntry {
  classId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  joinedAt: string;
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
