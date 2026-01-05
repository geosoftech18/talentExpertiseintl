'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, GraduationCap, Facebook, Twitter, Linkedin, Youtube, Instagram } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/talent-footer-logo.png" alt="TEI Training" width={250} height={200} />
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Empowering professionals worldwide with world-class training programs and cutting-edge expertise.
            </p>
            <div className="flex gap-4 pt-4">
              <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

         
          <div className="flex flex-row gap-12">
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
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
              <li>
                <Link href="/contact" className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Training Programs */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Training Programs</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/subjects/business-management" className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                  Business & Management
                </Link>
              </li>
              <li>
                <Link href="/subjects/engineering" className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                  Engineering & Technical
                </Link>
              </li>
              <li>
                <Link href="/subjects/finance" className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                  Finance & Investment
                </Link>
              </li>
              <li>
                <Link href="/subjects/project-management" className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                  Project Management
                </Link>
              </li>
              <li>
                <Link href="/subjects/technology" className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                  Emerging Technology
                </Link>
              </li>
              <li>
                <Link href="/subjects/hse" className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                  HSE & Security
                </Link>
              </li>
            </ul>
          </div>
          </div>

          {/* Newsletter & Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <p className="text-slate-300 text-sm mb-4">
              Subscribe to receive the latest training insights, course updates, and exclusive offers.
            </p>
            <form className="space-y-2 mb-6">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
              />
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#5f482c] to-[#6F4E25] "
              >
                Subscribe
              </Button>
            </form>
            <div className="space-y-3 pt-4 border-t border-slate-700">
              <div className="flex  items-start gap-3">
                <Phone className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-400 text-xs">Phone</p>
                  <p className="text-slate-200 text-sm">+971-4-5473010</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-400 text-xs">Email</p>
                  <p className="text-slate-200 text-sm">info@talenexpertiseintl.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-400 text-xs">Address</p>
                  <p className="text-slate-200 text-sm">Dubai, UAE</p>
                </div>
              </div>
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
            <div className="flex items-center gap-6 text-sm">
              <Link href="/terms" className="text-slate-400 hover:text-blue-400 transition-colors">
                Terms & Conditions
              </Link>
              <Link href="/privacy" className="text-slate-400 hover:text-blue-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/cancellation" className="text-slate-400 hover:text-blue-400 transition-colors">
                Cancellation Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

