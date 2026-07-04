'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F3] overflow-x-hidden font-sans">
      <div className="max-w-[800px] mx-auto px-6 py-16 md:py-24 space-y-12">
        
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#C9A961] hover:text-[#b09352] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Home
        </Link>

        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-semibold font-serif uppercase tracking-wider text-white">
            Terms of Service
          </h1>
          <p className="text-zinc-500 text-xs font-mono">Last Updated: July 4, 2026</p>
          <div className="w-20 h-[1px] bg-zinc-800" />
        </div>

        {/* Introduction */}
        <p className="text-zinc-400 text-sm leading-relaxed">
          Welcome to Evolve Studio. These Terms of Service (&ldquo;Terms,&rdquo; &ldquo;Agreement&rdquo;) govern your access to and use of Evolve Studio's online booking platform, mobile interfaces, POS terminals, and physical studio facilities in the Philippines.
        </p>
        <p className="text-zinc-400 text-sm leading-relaxed">
          By registering an account, purchasing credit packages, booking classes, or accessing our facilities, you enter into a legally binding agreement under <strong>Republic Act No. 8792 (Electronic Commerce Act of 2000)</strong> and <strong>Republic Act No. 7394 (Consumer Act of the Philippines)</strong>.
        </p>

        {/* Content Sections */}
        <div className="space-y-10 pt-4 text-left">
          
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#C9A961] uppercase tracking-wide">
              1. Accounts and Membership
            </h2>
            <ol className="list-decimal pl-5 space-y-2 text-zinc-400 text-sm leading-relaxed">
              <li>
                <strong className="text-white font-medium">Account Security:</strong> You must provide accurate, current, and complete information during registration. You are responsible for safeguarding your login credentials (email, password, or SMS OTP codes).
              </li>
              <li>
                <strong className="text-white font-medium">Age Requirement:</strong> You must be at least eighteen (18) years of age to register an account and purchase credits. Minors must have a parent or legal guardian sign a physical waiver at the front desk.
              </li>
              <li>
                <strong className="text-white font-medium">Role-Based Separation:</strong> Clients are strictly prohibited from accessing, attempting to access, or brute-forcing staff/admin subdomains (<code className="text-[#C9A961] font-mono">pos.</code> or <code className="text-[#C9A961] font-mono">admin.</code>). Any unauthorized attempt will result in immediate account termination.
              </li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#C9A961] uppercase tracking-wide">
              2. Wallet Credits and Purchase Policies
            </h2>
            <ol className="list-decimal pl-5 space-y-2 text-zinc-400 text-sm leading-relaxed">
              <li>
                <strong className="text-white font-medium">Dual Currency &amp; Pricing:</strong> All credit packages, drop-in class rates, and membership packages are displayed and processed in Philippine Pesos (PHP).
              </li>
              <li>
                <strong className="text-white font-medium">Expiration of Credits:</strong> Purchased credit packages have distinct expiration periods from the date of purchase (e.g., 30 days, 60 days, or 90 days), as indicated at checkout. Unused credits after the expiration date are forfeited and non-refundable.
              </li>
              <li>
                <strong className="text-white font-medium">Non-Transferability:</strong> Wallet credits and classes booked are personal to the account holder and cannot be transferred, shared, or resold.
              </li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#C9A961] uppercase tracking-wide">
              3. Booking and Cancellation Rules
            </h2>
            <ol className="list-decimal pl-5 space-y-2 text-zinc-400 text-sm leading-relaxed">
              <li>
                <strong className="text-white font-medium">Reservation Policy:</strong> Spots on reformers and rig points are allocated on a first-come, first-served basis. A booking is confirmed only when the credit is successfully deducted or a POS cash/GCash receipt is generated.
              </li>
              <li>
                <strong className="text-white font-medium">Tuesday Lockout:</strong> The studio is closed on Tuesdays for deep cleaning and staff alignment. No classes can be scheduled or booked on Tuesdays. Overnight sessions spanning Monday to Tuesday are strictly prohibited.
              </li>
              <li>
                <strong className="text-white font-medium">Cancellation Window:</strong>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Clients must cancel a reservation at least <strong className="text-white font-medium">twelve (12) hours</strong> before the scheduled class starts to receive a full credit refund.</li>
                  <li>Cancellations made less than 12 hours before class starts (Late Cancellations) or failing to attend (No-Show) will result in the forfeiture of the credit.</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#C9A961] uppercase tracking-wide">
              4. Electronic Waivers and Health Liability
            </h2>
            <ol className="list-decimal pl-5 space-y-2 text-zinc-400 text-sm leading-relaxed">
              <li>
                <strong className="text-white font-medium">Binding Electronic Signatures:</strong> In compliance with Section 8 of the Electronic Commerce Act (RA 8792), checking the waiver consent box and signing the electronic waiver form constitutes a legally binding electronic signature.
              </li>
              <li>
                <strong className="text-white font-medium">Physical Suitability:</strong> You warrant that you are in good physical health and have disclosed any pre-existing injuries, pregnancies, or medical conditions. You assume all risks associated with pole fitness, aerial arts, and Pilates exercises.
              </li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#C9A961] uppercase tracking-wide">
              5. Refunds and Payments
            </h2>
            <ol className="list-decimal pl-5 space-y-2 text-zinc-400 text-sm leading-relaxed">
              <li>
                <strong className="text-white font-medium">GCash / Maya Checkout:</strong> Online payments processed via PayMongo are non-refundable once class credits are credited, except in cases where Evolve Studio cancels a class.
              </li>
              <li>
                <strong className="text-white font-medium">Cash Payments:</strong> Walk-in cash transactions processed at the front-desk POS are final. Refund requests must be directed to the studio manager and are subject to validation against our transaction logs.
              </li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#C9A961] uppercase tracking-wide">
              6. Governing Law and Dispute Resolution
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              This Agreement is governed by and construed in accordance with the laws of the Republic of the Philippines. Any dispute arising from these Terms or use of the services shall be resolved through amicable mediation, failing which it shall be submitted to the exclusive jurisdiction of the competent courts of Manila, Philippines.
            </p>
          </section>

        </div>
      </div>

      <Footer />
    </div>
  );
}
