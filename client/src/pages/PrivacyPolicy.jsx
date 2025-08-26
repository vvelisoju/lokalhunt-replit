import React from 'react'
import { ShieldCheckIcon } from '@heroicons/react/24/outline'

// Assume Header component is defined elsewhere and imported
const Header = () => {
  return (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <ShieldCheckIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="mt-2 text-lg text-gray-600">
            Last updated: August 26, 2025
          </p>
        </div>
      </div>
    </div>
  );
};

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow p-8 space-y-8">

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              At LokalHunt ("we," "our," or "us"), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Information</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Name, email address, phone number</li>
                  <li>Professional information (resume, work experience, skills)</li>
                  <li>Educational background and certifications</li>
                  <li>Profile photos and other uploaded documents</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Usage Information</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>IP address, browser type, and device information</li>
                  <li>Pages visited, time spent on site, and click patterns</li>
                  <li>Search queries and job application history</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>To provide and maintain our job matching services</li>
              <li>To process job applications and facilitate connections between candidates and employers</li>
              <li>To send relevant job recommendations and notifications</li>
              <li>To improve our platform and user experience</li>
              <li>To communicate with you about our services</li>
              <li>To comply with legal obligations and protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing</h2>
            <p className="text-gray-600 mb-4">We may share your information in the following circumstances:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>With Employers:</strong> When you apply for jobs, your profile information is shared with relevant employers</li>
              <li><strong>Service Providers:</strong> With trusted third parties who assist in operating our platform</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
              <li><strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-600">
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Access and update your personal information</li>
              <li>Request deletion of your account and data</li>
              <li>Opt-out of marketing communications</li>
              <li>Download your data in a portable format</li>
              <li>Lodge complaints with data protection authorities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking</h2>
            <p className="text-gray-600">
              We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
            <p className="text-gray-600">
              We retain your personal information for as long as necessary to provide our services and comply with legal obligations. You may request deletion of your account at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
            <p className="text-gray-600">
              Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children under 18.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              If you have questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> privacy@lokalhunt.com<br />
                <strong>Phone:</strong> +91 9876543210<br />
                <strong>Address:</strong> LokalHunt Technologies Pvt Ltd, Hyderabad, Telangana, India
              </p>
            </div>
          </section>
        </div>
      </div>
      {/* Footer would typically be placed here */}
    </div>
  )
}

export default PrivacyPolicy