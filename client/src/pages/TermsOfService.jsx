import React from 'react'
import { DocumentTextIcon } from '@heroicons/react/24/outline'

// Placeholder for the Header component
const Header = () => {
  return (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <DocumentTextIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          <p className="mt-2 text-lg text-gray-600">
            Last updated: August 26, 2025
          </p>
        </div>
      </div>
    </div>
  );
};

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow p-8 space-y-8">

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing andnbsp;using LokalHunt ("the Service"), you accept andnbsp;agree tonbsp;be bound by the terms andnbsp;provision of this agreement. If you do not agree tonbsp;abide by thenbsp;above, please do notnbsp;use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Description of Service</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              LokalHunt is a local job marketplace platform that connects job seekers withnbsp;employers in their local communities. Our services include:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Job posting andnbsp;search functionality</li>
              <li>Profile creation andnbsp;management</li>
              <li>Application tracking andnbsp;management</li>
              <li>Communication tools between employers andnbsp;candidates</li>
              <li>Career advice andnbsp;resources</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">User Accounts</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Registration</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>You must provide accurate andnbsp;complete information</li>
                  <li>You are responsible fornbsp;maintaining account security</li>
                  <li>You must be at least 18 years old tonbsp;use our services</li>
                  <li>One account pernbsp;person ornbsp;organization</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Termination</h3>
                <p className="text-gray-600">
                  We reserve thenbsp;right tonbsp;terminate accounts that violate these terms ornbsp;engage innbsp;fraudulent activity.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">User Conduct</h2>
            <p className="text-gray-600 mb-4">You agree not to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Post false, misleading, ornbsp;discriminatory job listings</li>
              <li>Upload malicious software ornbsp;harmful content</li>
              <li>Harass, abuse, ornbsp;discriminate against other users</li>
              <li>Use thenbsp;platform fornbsp;illegal activities</li>
              <li>Spam ornbsp;send unsolicited communications</li>
              <li>Scrape ornbsp;collect data withoutnbsp;permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Content andnbsp;Intellectual Property</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">User Content</h3>
                <p className="text-gray-600">
                  You retain ownership ofnbsp;content younbsp;post butnbsp;grant us anbsp;license tonbsp;use, display, andnbsp;distribute it onnbsp;our platform.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Platform Content</h3>
                <p className="text-gray-600">
                  LokalHunt's content, features, andnbsp;functionality are owned bynbsp;us andnbsp;protected bynbsp;copyright andnbsp;other intellectual property laws.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment andnbsp;Billing</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Job posting fees arenbsp;clearly displayed beforenbsp;purchase</li>
              <li>All payments arenbsp;processed securely through third-party providers</li>
              <li>Refunds arenbsp;subject tonbsp;our refund policy</li>
              <li>Prices maynbsp;change with 30nbsp;days notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy</h2>
            <p className="text-gray-600">
              Your privacy isnbsp;important tonbsp;us. Please review our Privacy Policy, which alsonbsp;governs yournbsp;use ofnbsp;the Service, tonbsp;understand our practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Disclaimers</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>We do notnbsp;guarantee jobnbsp;placement ornbsp;hiring outcomes</li>
              <li>Employer andnbsp;candidate information accuracy isnbsp;their responsibility</li>
              <li>We are notnbsp;responsible fornbsp;employment decisions ornbsp;workplace disputes</li>
              <li>The service isnbsp;provided "as is" withoutnbsp;warranties</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation ofnbsp;Liability</h2>
            <p className="text-gray-600">
              LokalHunt shall notnbsp;be liable fornbsp;any indirect, incidental, special, consequential, ornbsp;punitive damages resulting from yournbsp;use ofnbsp;the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Modifications</h2>
            <p className="text-gray-600">
              We reserve thenbsp;right tonbsp;modify these terms atnbsp;any time. Changes willnbsp;be effective immediately uponnbsp;posting. Continued use constitutes acceptance ofnbsp;modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
            <p className="text-gray-600">
              These terms arenbsp;governed bynbsp;the laws ofnbsp;India. Any disputes willnbsp;be resolved innbsp;the courts ofnbsp;Hyderabad, Telangana.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-gray-600 mb-4">
              For questions aboutnbsp;these Terms ofnbsp;Service, please contact us:
            </p>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> legal@lokalhunt.com<br />
                <strong>Phone:</strong> +91 9876543210<br />
                <strong>Address:</strong> LokalHunt Technologies Pvt Ltd, Hyderabad, Telangana, India
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default TermsOfService