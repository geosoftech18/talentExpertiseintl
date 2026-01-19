'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, GraduationCap, Facebook, Twitter, Linkedin, Youtube, Instagram, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'

export default function Footer() {
  const [expandedLocation, setExpandedLocation] = useState<string | null>(null)

  const locations = [
    {
      id: 'dubai',
      name: 'Dubai, UAE',
      description: 'Creative Tower, P.O Box 213984, Dubai, UAE'
    },
    {
      id: 'abuja',
      name: 'Abuja, Nigeria',
      description: '6 Ekket Close, Area 8, Abuja Nigeria'
    },
    {
      id: 'london',
      name: 'London, UK',
      description: '4 Cleveleys Road, Great Sankey, Warrington.'
    },
    {
      id: 'kuala-lumpur',
      name: 'Kuala Lumpur, Malaysia',
      description: 'A-3-6, Carlton Court, Jalan 17, Sri Hartamas, Kuala Lumpur, Malaysia'
    }
  ]

  const toggleLocation = (locationId: string) => {
    setExpandedLocation(expandedLocation === locationId ? null : locationId)
  }
  return (
    <footer className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section: Logo and Social Media */}
        <div className="py-8 border-b border-slate-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center">
              <Image src="/talent-footer-logo.png" alt="TEI Training" width={250} height={200} />
            </div>
            
            {/* Social Media */}
            <div className="flex flex-col items-center md:items-end gap-4">
              <p className="text-white text-sm font-medium">Follow Us On Social Media</p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <Facebook className="w-5 h-5 text-white" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center hover:opacity-90 transition-opacity">
                  <Instagram className="w-5 h-5 text-white" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center hover:bg-blue-800 transition-colors">
                  <Linkedin className="w-5 h-5 text-white" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors">
                  <Twitter className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Three Columns */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Quick Links Column */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
              <div className="grid grid-cols-2 gap-6">
                {/* Left Sub-column */}
                <ul className="space-y-3">
                  <li>
                    <Link href="/about" className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/courses" className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                      All Courses
                    </Link>
                  </li>
                  <li>
                    <Link href="/calendar" className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                      Training Calendar
                    </Link>
                  </li>
                  <li>
                    <Link href="/certificates" className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                      Certificates
                    </Link>
                  </li>
                  <li>
                    <Link href="/venues" className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                      Training Venues
                    </Link>
                  </li>
                  
                </ul>
                
                {/* Right Sub-column */}
                <ul className="space-y-3">
                  <li>
                    <Link href="/why-choose-tei" className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                      Why Choose TEI
                    </Link>
                  </li>
                  <li>
                    <Link href="/consulting" className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                      Consulting 
                    </Link>
                  </li>
                  <li>
                    <Link href="/services" className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                      Our Services
                    </Link>
                  </li>
                  <li>
                    <Link href="/coaching" className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                      Coaching
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Info Column */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Contact Info</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Head Office: Dubai, United Arab Emirates
                  </p>
                </div>
                <div>
                  <p className="text-slate-300 text-sm">
                    Phone : <a href="tel:+97145473010" className="text-blue-400 hover:text-blue-300">+971-4-5473010</a>
                  </p>
                </div>
                <div>
                  <p className="text-slate-300 text-sm">
                    Mail : <a href="mailto:info@talentexpertiseintl.com" className="text-blue-400 hover:text-blue-300">info@talentexpertiseintl.com</a>
                  </p>
                </div>
              </div>
            </div>

            {/* Locations Column */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Locations</h3>
              <ul className="space-y-0">
                {locations.map((location, index) => (
                  <li key={location.id} className={index !== locations.length - 1 ? 'border-b border-slate-700 pb-3 mb-3' : ''}>
                    <button
                      onClick={() => toggleLocation(location.id)}
                      className="w-full flex items-center justify-between text-left text-slate-300 hover:text-blue-400 transition-colors group"
                    >
                      <span className="flex items-center gap-2">
                        {expandedLocation === location.id ? (
                          <Minus className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Plus className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                        )}
                        <span className="text-sm font-medium">{location.name}</span>
                      </span>
                    </button>
                    {expandedLocation === location.id && (
                      <div className="mt-3 ml-6 pr-4">
                        <p className="text-slate-400 text-xs leading-relaxed">
                          {location.description}
                        </p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Talent Expertise International. All rights reserved. designed & develped by <Link href="https://www.geosoftech.com" className="text-slate-400 hover:text-blue-400 transition-colors underline" target="_blank">Geosoftech</Link>
            </p>
            {/* <div className="flex items-center gap-6 text-sm">
              <Link href="/terms" className="text-slate-400 hover:text-blue-400 transition-colors">
                Terms & Conditions
              </Link>
              <Link href="/privacy" className="text-slate-400 hover:text-blue-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/cancellation" className="text-slate-400 hover:text-blue-400 transition-colors">
                Cancellation Policy
              </Link>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  )
}

