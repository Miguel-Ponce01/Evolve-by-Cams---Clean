'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-zinc-500 text-xs font-mono">Last Updated: July 4, 2026</p>
          <div className="w-20 h-[1px] bg-zinc-800" />
        </div>

        {/* Introduction */}
        <p className="text-zinc-400 text-sm leading-relaxed">
          This Privacy Policy describes how Evolve Studio (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects, uses, protects, and handles personal data and sensitive personal information of our clients, instructors, and website visitors in the Philippines, in compliance with <strong>Republic Act No. 10173</strong>, otherwise known as the <strong>Data Privacy Act of 2012 (DPA)</strong>, its Implementing Rules and Regulations (IRR), and other relevant circulars issued by the National Privacy Commission (NPC).
        </p>

        {/* Content Sections */}
        <div className="space-y-10 pt-4 text-left">
          
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#C9A961] uppercase tracking-wide">
              1. Scope and Consent
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              By using our online booking system, registering an account, purchasing credit packages, signing our physical or electronic waivers, or visiting our physical studio branches, you explicitly consent to the collection, processing, storage, and sharing of your personal data as described in this Policy.
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed">
              If you are registering on behalf of a family member, you warrant that you have obtained their explicit consent before submitting their details.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#C9A961] uppercase tracking-wide">
              2. Information We Collect
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              To provide booking, scheduling, payment processing, and safety assessments, we collect the following personal data:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 text-sm leading-relaxed">
              <li>
                <strong className="text-white font-medium">Identity Information:</strong> Full name, birthdate, sex, and profile pictures.
              </li>
              <li>
                <strong className="text-white font-medium">Contact Information:</strong> Mobile phone number, email address, and home/billing address.
              </li>
              <li>
                <strong className="text-white font-medium">Health and Safety Information (Sensitive Personal Information):</strong> Current physical health condition, history of injuries, and emergency contact details collected through our studio waivers to ensure safety during fitness sessions.
              </li>
              <li>
                <strong className="text-white font-medium">Transaction Information:</strong> Payment methods used (GCash, Maya, card transaction IDs), wallet credit balance, package purchase history, and booking logs. (We do <em>not</em> store raw credit card details; payments are handled directly by PCI-DSS compliant gateways like PayMongo).
              </li>
              <li>
                <strong className="text-white font-medium">Technical Information:</strong> IP address, browser type, device identifiers, and session metadata captured during system access.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#C9A961] uppercase tracking-wide">
              3. Purpose of Processing
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Your personal data is processed solely for the following business purposes:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-zinc-400 text-sm leading-relaxed">
              <li>
                <strong className="text-white font-medium">Service Delivery:</strong> Processing class bookings, holding spots on reformers/rig points, managing waitlists, and maintaining wallet balances.
              </li>
              <li>
                <strong className="text-white font-medium">Safety &amp; Legal Requirements:</strong> Evaluating health declarations on waivers to verify fitness for class participation and satisfying emergency notification needs.
              </li>
              <li>
                <strong className="text-white font-medium">Communication:</strong> Sending booking confirmations, Tuesday lockout schedules, instructor changes, and OTP (One-Time Password) login codes.
              </li>
              <li>
                <strong className="text-white font-medium">Analytics &amp; Compliance:</strong> Monitoring class capacities, compiling anonymous studio analytics, and complying with Bureau of Internal Revenue (BIR) transaction logs.
              </li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#C9A961] uppercase tracking-wide">
              4. Data Sharing and Disclosures
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              We do not sell, rent, or lease your personal data. We disclose personal data only to the following authorized parties under strict confidentiality terms:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 text-sm leading-relaxed">
              <li>
                <strong className="text-white font-medium">Payment Gateways:</strong> PayMongo (for processing GCash, Maya, and credit card payments).
              </li>
              <li>
                <strong className="text-white font-medium">Communications Providers:</strong> Local SMS gateways (for OTP verification) and Resend (for email notifications).
              </li>
              <li>
                <strong className="text-white font-medium">Platform Administrators:</strong> Authorized studio staff (Super Admins, Front Desk Staff, and Instructors) to verify attendance, packages, and check-in statuses.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#C9A961] uppercase tracking-wide">
              5. Security Measures
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              We implement organization-wide, physical, and technical security measures to protect your data:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 text-sm leading-relaxed">
              <li>
                <strong className="text-white font-medium">Encryption:</strong> Data in transit is protected using SSL/TLS protocols. Database rows are isolated per tenant, and access tokens are signed securely.
              </li>
              <li>
                <strong className="text-white font-medium">Access Control:</strong> Strict Role-Based Access Control (RBAC) blocks clients from accessing staff POS dashboards or other users' profiles.
              </li>
              <li>
                <strong className="text-white font-medium">Audit Logging:</strong> Changes to credits and booking statuses are permanently recorded to identify unauthorized modifications.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#C9A961] uppercase tracking-wide">
              6. Retention and Disposal
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              We retain your personal data for as long as your account is active or as necessary to fulfill the purposes outlined in this Policy. Waiver documents and transaction ledgers are kept for up to five (5) years in compliance with Philippine civil and tax laws, after which they are securely deleted or anonymized.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#C9A961] uppercase tracking-wide">
              7. Rights of the Data Subject
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Under the DPA, you have the following rights:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-zinc-400 text-sm leading-relaxed">
              <li><strong>Right to be Informed:</strong> Know whether your data is being processed and the details of such processing.</li>
              <li><strong>Right to Access:</strong> Obtain a copy of your personal data stored in our system.</li>
              <li><strong>Right to Object:</strong> Object to processing for direct marketing or profiling.</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate or outdated information.</li>
              <li><strong>Right to Erasure or Blocking:</strong> Request the suspension, withdrawal, or deletion of your personal data under legal grounds.</li>
              <li><strong>Right to Damages:</strong> Seek indemnity for damages sustained due to inaccurate, incomplete, outdated, false, unlawfully obtained, or unauthorized use of personal data.</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#C9A961] uppercase tracking-wide">
              8. Contact Us
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              For any privacy concerns, requests, or questions regarding your rights, you may contact our designated Data Protection Officer (DPO) at:
            </p>
            <div className="bg-[#121212] border border-zinc-800 p-6 rounded-xl space-y-2 mt-4 text-xs sm:text-sm font-semibold">
              <p className="text-[#C9A961] uppercase tracking-wider text-[10px] font-bold">Evolve Studio Data Protection Officer</p>
              <p className="text-zinc-300">Email: <a href="mailto:privacy@evolvebycams.com" className="hover:underline text-white">privacy@evolvebycams.com</a></p>
              <p className="text-zinc-300">Address: Manila, Philippines</p>
            </div>
          </section>

        </div>
      </div>

      <Footer />
    </div>
  );
}
