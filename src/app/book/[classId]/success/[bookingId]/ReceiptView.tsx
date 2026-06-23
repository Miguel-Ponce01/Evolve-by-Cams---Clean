'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBooking } from '@/context/BookingContext';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Printer, Mail, MessageSquare, Calendar, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function BookingSuccessReceiptPage() {
  const { classId, bookingId } = useParams();
  const router = useRouter();
  const { getClassById, bookings } = useBooking();

  const [activeTab, setActiveTab] = useState<'email' | 'sms'>('email');

  const booking = useMemo(() => {
    return bookings.find(b => b.id === bookingId);
  }, [bookings, bookingId]);

  const cls = useMemo(() => {
    return booking ? getClassById(booking.classId) : null;
  }, [booking, getClassById]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (!booking || !cls) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-400 font-bold">Booking receipt not found.</p>
        <Link href="/" className="text-primary hover:underline mt-4 inline-block">Return to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Back button */}
      <div className="flex items-center justify-between mb-6 no-print">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Return to Schedule
        </Link>
        <div className="flex gap-2">
          <button 
            onClick={handlePrint}
            className="btn-outline-aubergine rounded-pill font-bold uppercase tracking-wider text-xs border-border hover:bg-secondary flex items-center gap-1.5 py-2 px-4 cursor-pointer"
          >
            <Printer size={14} /> Print Receipt
          </button>
          <Link 
            href={`/book/${classId}`}
            className="btn-primary-pill inline-flex items-center justify-center rounded-pill bg-primary text-on-primary text-xs font-bold uppercase tracking-widest px-4 py-2 hover:bg-primary-press transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          >
            Register Next Client
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: POS Printed Receipt */}
        <div className="lg:col-span-6 bg-card border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black">
          {/* Tear-off decorative borders */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary/20 print:hidden" />
          
          <div className="text-center border-b border-dashed border-border/60 pb-5 mb-5">
            <h2 className="text-2xl font-black font-heading tracking-widest uppercase text-primary print:text-black">EVOLVE</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono mt-1">Pilates & Wellness Studio</p>
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">Front Desk Booking Terminal</p>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Metadata */}
            <div className="flex justify-between text-[11px] text-muted-foreground pb-2 border-b border-border/40">
              <span>Receipt ID: {booking.id}</span>
              <span>{formatDate(booking.bookedAt.split('T')[0])}</span>
            </div>

            {/* Client info */}
            <div>
              <p className="font-bold text-[10px] uppercase text-primary tracking-wider mb-1 print:text-black">Customer Details</p>
              <div className="bg-secondary/35 p-3 rounded-xl print:bg-gray-100">
                <p className="font-bold text-foreground text-sm print:text-black">{booking.customerName}</p>
                <p className="text-muted-foreground">{booking.customerEmail}</p>
                {booking.customerPhone && <p className="text-muted-foreground">{booking.customerPhone}</p>}
              </div>
            </div>

            {/* Class info */}
            <div>
              <p className="font-bold text-[10px] uppercase text-primary tracking-wider mb-1 print:text-black">Session Booked</p>
              <div className="bg-secondary/35 p-3 rounded-xl space-y-1 print:bg-gray-100">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-foreground text-sm print:text-black">{cls.title}</p>
                  <Badge className="font-mono bg-primary/20 text-primary border-none text-[10px] px-2 py-0.5 print:bg-gray-200 print:text-black">
                    Spot #{booking.spotNumber}
                  </Badge>
                </div>
                <p className="text-muted-foreground">Instructor: {cls.instructor.name}</p>
                <p className="text-muted-foreground">Time: {cls.time} ({cls.duration} mins)</p>
                <p className="text-muted-foreground">Date: {formatDate(cls.date)}</p>
              </div>
            </div>

            {/* Payment info */}
            <div>
              <p className="font-bold text-[10px] uppercase text-primary tracking-wider mb-1 print:text-black">Payment Details</p>
              <div className="space-y-2 py-1 px-1">
                <div className="flex justify-between">
                  <span>Booking Payment:</span>
                  <span className="capitalize">{booking.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span>${cls.price.toFixed(2)}</span>
                </div>
                {booking.paymentMethod === 'credit' ? (
                  <div className="flex justify-between font-bold text-primary border-t border-border/40 pt-2 text-sm print:text-black">
                    <span>Amount Charged:</span>
                    <span>1 class credit</span>
                  </div>
                ) : (
                  <>
                    {booking.amountPaid < (cls.price + Math.round(cls.price * 0.08 * 100) / 100) && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Discount Code (EVOLVE10):</span>
                        <span>-10%</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>GST Tax (8%):</span>
                      <span>{(booking.amountPaid - (booking.amountPaid / 1.08)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-primary border-t border-border/40 pt-2 text-sm print:text-black">
                      <span>Total Paid:</span>
                      <span>${booking.amountPaid.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Simulated Barcode */}
            <div className="pt-6 border-t border-dashed border-border/60 text-center">
              <div className="inline-block bg-white px-6 py-2 rounded">
                {/* Visual block mock barcode lines */}
                <div className="flex items-center justify-center gap-[2px] h-9 w-40 bg-transparent">
                  <div className="bg-black w-[1px] h-full" />
                  <div className="bg-black w-[3px] h-full" />
                  <div className="bg-black w-[1px] h-full" />
                  <div className="bg-black w-[2px] h-full" />
                  <div className="bg-black w-[4px] h-full" />
                  <div className="bg-black w-[1px] h-full" />
                  <div className="bg-black w-[2px] h-full" />
                  <div className="bg-black w-[1px] h-full" />
                  <div className="bg-black w-[3px] h-full" />
                  <div className="bg-black w-[1px] h-full" />
                  <div className="bg-black w-[4px] h-full" />
                  <div className="bg-black w-[1px] h-full" />
                  <div className="bg-black w-[2px] h-full" />
                  <div className="bg-black w-[1px] h-full" />
                  <div className="bg-black w-[3px] h-full" />
                  <div className="bg-black w-[2px] h-full" />
                </div>
                <span className="text-[9px] font-mono text-gray-500 block mt-1 tracking-widest">{booking.id.toUpperCase()}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-3 uppercase tracking-wider font-mono">Thank you for evolving with us</p>
            </div>
          </div>
        </div>

        {/* Right Side: Simulated Client Device Notifications */}
        <div className="lg:col-span-6 space-y-4 no-print">
          <div className="bg-card/45 border border-border p-4 rounded-3xl">
            <h3 className="font-heading font-black text-sm uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Check className="text-primary w-4.5 h-4.5" /> Client Notification Feed
            </h3>
            <p className="text-xs text-muted-foreground">This panel simulates what the customer is receiving on their device in real-time based on their entered contact details.</p>
          </div>

          {/* Toggle Tab */}
          <div className="flex border border-border/80 rounded-2xl p-1 bg-card/20 max-w-xs">
            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'email' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Mail size={13} /> Email Notification
            </button>
            <button
              onClick={() => setActiveTab('sms')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'sms' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MessageSquare size={13} /> SMS Alert
            </button>
          </div>

          {activeTab === 'email' ? (
            /* Email Frame Mock */
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-lg">
              {/* Email Browser Header */}
              <div className="bg-secondary/50 px-4 py-3 border-b border-border text-xs space-y-1 font-mono">
                <p><span className="text-muted-foreground">From:</span> Evolve Pilates Studio &lt;<span className="text-primary">noreply@evolve.studio</span>&gt;</p>
                <p><span className="text-muted-foreground">To:</span> {booking.customerName} &lt;<span className="text-primary">{booking.customerEmail}</span>&gt;</p>
                <p><span className="text-muted-foreground">Subject:</span> Booking Confirmed: Spot #{booking.spotNumber} in {cls.title}!</p>
              </div>

              {/* Email Body HTML Mock */}
              <div className="p-6 bg-card text-foreground space-y-4 text-sm font-sans max-h-96 overflow-y-auto">
                <div className="text-center py-2">
                  <span className="text-3xl">🎉</span>
                  <h3 className="font-heading font-black text-lg uppercase text-primary mt-2">Booking Confirmed!</h3>
                  <p className="text-xs text-muted-foreground">Evolve by Cams Reformer Studio</p>
                </div>

                <p className="text-foreground">Hi <strong>{booking.customerName.split(' ')[0]}</strong>,</p>
                
                <p>We are thrilled to confirm your reformer spot has been secured by our front desk. Here are your booking details:</p>

                <div className="bg-secondary/40 border border-border/50 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between items-center text-sm border-b border-border/30 pb-2 mb-2 font-bold text-foreground">
                    <span>{cls.title}</span>
                    <Badge variant="outline" className="border-primary/20 text-primary font-bold text-xs bg-primary/5">
                      Spot #{booking.spotNumber}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-xs text-muted-foreground">
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-wider">Coach</p>
                      <p className="text-foreground font-semibold">{cls.instructor.name}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-wider">Date</p>
                      <p className="text-foreground font-semibold">{formatDate(cls.date)}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-wider">Time</p>
                      <p className="text-foreground font-semibold">{cls.time} ({cls.duration}m)</p>
                    </div>
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-wider">Status</p>
                      <p className="text-emerald-400 font-semibold uppercase tracking-wider text-[10px]">Confirmed</p>
                    </div>
                  </div>
                </div>

                {/* Mandated Safety Reminder Box */}
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-xs leading-relaxed space-y-1">
                  <p className="font-black text-primary uppercase tracking-wider">⚠️ Mandatory Studio Guidelines:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground font-semibold">
                    <li><strong>Grip Socks Mandatory:</strong> For hygiene and safety, grip socks must be worn during reformer classes.</li>
                    <li><strong>Available at Front Desk:</strong> If you don't have grip socks, you can purchase a pair at the front desk for $15 before class.</li>
                    <li><strong>Arrival Check-in:</strong> Please arrive <strong>10 minutes early</strong> to secure your items and adjust your reformer setting.</li>
                  </ul>
                </div>

                <p className="text-xs text-muted-foreground text-center border-t border-border pt-4">
                  Evolve by Cams Pilates Studio · 123 Fitness Ave, Davao City
                </p>
              </div>
            </div>
          ) : (
            /* SMS Message Thread Mock */
            <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl overflow-hidden shadow-lg max-w-sm mx-auto">
              {/* Phone Header */}
              <div className="bg-[#2C2C2E]/60 px-4 py-3 flex items-center justify-between border-b border-[#3A3A3C] text-xs font-semibold text-white">
                <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-[10px]">EC</div>
                <span>Evolve Cams</span>
                <ChevronRight size={14} className="text-gray-400" />
              </div>

              {/* Message Feed */}
              <div className="p-4 bg-[#1C1C1E] h-80 flex flex-col justify-end space-y-3 font-sans">
                {/* Incoming Mock message */}
                <div className="self-start bg-[#2C2C2E] text-white p-3 rounded-2xl text-xs max-w-[80%] leading-normal">
                  <p className="font-mono text-[8px] text-gray-400 mb-1">Evolve by Cams - 02:47 AM</p>
                  <p>Hi {booking.customerName.split(' ')[0]}! Spot #{booking.spotNumber} in {cls.title} with {cls.instructor.name} on {formatDate(cls.date)} @ {cls.time} is locked! ⚠️ Remember, grip socks are mandatory! If you don't have them, they are available at the front desk. See you soon!</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
