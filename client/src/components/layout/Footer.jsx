
import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const Footer = () => {
  const { t } = useTranslation()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <img 
                src="/images/logo.png" 
                alt="LokalHunt" 
                className="h-10 w-auto filter brightness-0 invert"
              />
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Your city, your career. Connecting local talent with opportunities in your hometown. Building stronger communities through meaningful employment connections.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com/lokalhunt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Follow us on Facebook"
              >
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a 
                href="https://twitter.com/lokalhunt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Follow us on Twitter"
              >
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a 
                href="https://linkedin.com/company/lokalhunt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Follow us on LinkedIn"
              >
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" clipRule="evenodd" />
                </svg>
              </a>
              <a 
                href="https://instagram.com/lokalhunt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Follow us on Instagram"
              >
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.017 0C8.396 0 7.989.013 7.041.048 6.094.084 5.52.204 5.009.388a6.609 6.609 0 0 0-2.384 1.551A6.581 6.581 0 0 0 1.074 4.322c-.186.51-.304 1.084-.34 2.031C.696 7.298.686 7.704.686 11.325s.01 4.027.048 4.975c.036.947.154 1.521.34 2.031.184.78.43 1.35.81 1.949a6.581 6.581 0 0 0 1.551 2.384c.599.38 1.169.626 1.949.81.51.186 1.084.304 2.031.34.948.036 1.354.048 4.975.048s4.027-.012 4.975-.048c.947-.036 1.521-.154 2.031-.34a6.609 6.609 0 0 0 2.384-1.551 6.581 6.581 0 0 0 1.551-2.384c.186-.51.304-1.084.34-2.031.036-.948.048-1.354.048-4.975s-.012-4.027-.048-4.975c-.036-.947-.154-1.521-.34-2.031a6.609 6.609 0 0 0-1.551-2.384A6.581 6.581 0 0 0 18.322 1.074c-.51-.186-1.084-.304-2.031-.34C15.343.696 14.937.686 11.325.686h.692z" clipRule="evenodd" />
                  <path d="M12.017 5.8a6.225 6.225 0 1 0 0 12.45 6.225 6.225 0 0 0 0-12.45zm0 10.267a4.042 4.042 0 1 1 0-8.084 4.042 4.042 0 0 1 0 8.084zm7.94-10.525a1.453 1.453 0 1 1-2.908 0 1.453 1.453 0 0 1 2.908 0z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              For Job Seekers
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/jobs" className="text-gray-300 hover:text-white transition-colors">
                  Find Jobs
                </Link>
              </li>
              <li>
                <Link to="/companies" className="text-gray-300 hover:text-white transition-colors">
                  Browse Companies
                </Link>
              </li>
              <li>
                <Link to="/career-advice" className="text-gray-300 hover:text-white transition-colors">
                  Career Advice
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>

            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4 mt-8">
              For Employers
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/register" className="text-gray-300 hover:text-white transition-colors">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-white transition-colors">
                  Hire Talent
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-gray-300 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <a 
                  href="tel:+919876543210" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  +91 9876543210
                </a>
              </li>
              <li>
                <a 
                  href="mailto:support@lokalhunt.com" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  support@lokalhunt.com
                </a>
              </li>
            </ul>

            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4 mt-8">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-gray-300 hover:text-white transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
              <p className="text-gray-400 text-sm">
                © 2025 LokalHunt Technologies Pvt Ltd. All rights reserved.
              </p>
              <div className="flex items-center space-x-1">
                <span className="text-green-500">🌟</span>
                <span className="text-gray-400 text-sm">100% FREE for Job Seekers</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-gray-400 text-sm">
                  Made with ❤️ for local communities
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Connecting talent with opportunities since 2025
                </p>
              </div>
            </div>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-6 pt-4 border-t border-gray-800">
            <div className="flex flex-wrap justify-center items-center space-x-8 text-xs text-gray-500">
              <span className="flex items-center">
                <span className="text-green-500 mr-1">🔒</span>
                Secure Platform
              </span>
              <span className="flex items-center">
                <span className="text-blue-500 mr-1">✓</span>
                Verified Companies
              </span>
              <span className="flex items-center">
                <span className="text-yellow-500 mr-1">⚡</span>
                Quick Applications
              </span>
              <span className="flex items-center">
                <span className="text-purple-500 mr-1">📱</span>
                Mobile Friendly
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
