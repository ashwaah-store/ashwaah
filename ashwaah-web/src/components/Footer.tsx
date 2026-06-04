"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Undo2 } from 'lucide-react';

const Facebook = ({ size = 20, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const Twitter = ({ size = 20, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

const Youtube = ({ size = 20, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
  </svg>
);

const Instagram = ({ size = 20, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

export default function Footer() {
  const pathname = usePathname();

  // Hide Footer for Admin Portal
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="w-full bg-[#fafbfc] pt-12 pb-6 px-4 md:px-8 border-t border-brand/10 text-[#282c3f]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
        {/* Column 1: Online Shopping & Useful Links */}
        <div className="md:col-span-2">
          <h4 className="text-[11px] font-bold mb-4 uppercase tracking-wider text-[#282c3f]">Online Shopping</h4>
          <ul className="space-y-2 text-[13px] text-[#696b79] mb-6 font-medium">
            <li><Link href="#" className="hover:text-brand transition">Men</Link></li>
            <li><Link href="#" className="hover:text-brand transition">Women</Link></li>
            <li><Link href="#" className="hover:text-brand transition">Kids</Link></li>
            <li><Link href="#" className="hover:text-brand transition">Home</Link></li>
            <li><Link href="#" className="hover:text-brand transition">Beauty</Link></li>
            <li><Link href="#" className="hover:text-brand transition">Genz</Link></li>
            <li><Link href="#" className="hover:text-brand transition">Gift Cards</Link></li>
            <li><Link href="#" className="hover:text-brand transition">Ashwaah Insider</Link></li>
          </ul>

          <h4 className="text-[11px] font-bold mb-4 uppercase tracking-wider text-[#282c3f]">Useful Links</h4>
          <ul className="space-y-2 text-[13px] text-[#696b79] font-medium">
            <li><Link href="#" className="hover:text-brand transition">Blog</Link></li>
            <li><Link href="#" className="hover:text-brand transition">Careers</Link></li>
            <li><Link href="#" className="hover:text-brand transition">Site Map</Link></li>
            <li><Link href="#" className="hover:text-brand transition">Corporate Information</Link></li>
            <li><Link href="#" className="hover:text-brand transition">Whitehat</Link></li>
            <li><Link href="#" className="hover:text-brand transition">Cleartrip</Link></li>
            <li><Link href="#" className="hover:text-brand transition">Ashwaah Global</Link></li>
          </ul>
        </div>

        {/* Column 2: Customer Policies */}
        <div className="md:col-span-3 lg:col-span-2">
          <h4 className="text-[11px] font-bold mb-4 uppercase tracking-wider text-[#282c3f]">Customer Policies</h4>
          <ul className="space-y-2 text-[13px] text-[#696b79] font-medium">
            <li><Link href="#" className="hover:text-brand transition">Contact Us</Link></li>
            <li><Link href="#" className="hover:text-brand transition">FAQ</Link></li>
            <li><Link href="#" className="hover:text-brand transition">T&C</Link></li>
            <li><Link href="#" className="hover:text-brand transition">Terms Of Use</Link></li>
            <li><Link href="#" className="hover:text-brand transition">Track Orders</Link></li>
            <li><Link href="#" className="hover:text-brand transition">Shipping</Link></li>
            <li><Link href="#" className="hover:text-brand transition">Cancellation</Link></li>
            <li><Link href="#" className="hover:text-brand transition">Privacy policy</Link></li>
            <li><Link href="#" className="hover:text-brand transition">Grievance Redressal</Link></li>
            <li><Link href="#" className="hover:text-brand transition">FSSAI Food Safety</Link></li>
            <li><Link href="#" className="hover:text-brand transition">Connect app</Link></li>
          </ul>
        </div>

        {/* Column 3: App & Social */}
        <div className="md:col-span-4">
          <h4 className="text-[11px] font-bold mb-4 uppercase tracking-wider text-[#282c3f]">Experience Ashwaah App on Mobile</h4>
          <div className="flex space-x-4 mb-8">
            <Link href="#" className="block">
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="h-10 opacity-90 hover:opacity-100 transition-opacity" />
            </Link>
            <Link href="#" className="block">
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" className="h-10 opacity-90 hover:opacity-100 transition-opacity" />
            </Link>
          </div>

          <h4 className="text-[11px] font-bold mb-4 uppercase tracking-wider text-[#282c3f]">Keep In Touch</h4>
          <div className="flex space-x-4 text-[#696b79]">
            <Link href="#" className="hover:text-[#282c3f] transition"><Facebook size={20} strokeWidth={1.5} /></Link>
            <Link href="#" className="hover:text-[#282c3f] transition"><Twitter size={20} strokeWidth={1.5} /></Link>
            <Link href="#" className="hover:text-[#282c3f] transition"><Youtube size={20} strokeWidth={1.5} /></Link>
            <Link href="#" className="hover:text-[#282c3f] transition"><Instagram size={20} strokeWidth={1.5} /></Link>
          </div>
        </div>

        {/* Column 4: Guarantees */}
        <div className="md:col-span-3 space-y-6">
          <div className="flex items-start space-x-3">
            <div className="mt-0.5 flex-shrink-0 text-[#282c3f]">
              <ShieldCheck size={42} strokeWidth={1} />
            </div>
            <div>
              <p className="text-[#282c3f] font-bold text-sm">100% ORIGINAL <span className="font-normal text-[#696b79]">guarantee</span></p>
              <p className="text-[#696b79] text-[13px]">for all products at ashwaah.com</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="mt-0.5 flex-shrink-0 text-[#282c3f]">
              <Undo2 size={42} strokeWidth={1} />
            </div>
            <div>
              <p className="text-[#282c3f] font-bold text-sm">Return within 14days <span className="font-normal text-[#696b79]">of</span></p>
              <p className="text-[#696b79] text-[13px]">receiving your order</p>
            </div>
          </div>
        </div>
      </div>
      
    </footer>
  );
}
