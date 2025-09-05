import React from "react";
import {
  DocumentTextIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ScaleIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

// Terms of Service specific header
const TermsHeader = () => {
  return (
    <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <DocumentTextIcon className="h-16 w-16 text-white mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl text-green-100 mb-2">
            Clear terms and conditions for using LokalHunt
          </p>
          <p className="text-lg text-green-200">
            Last updated: September 5, 2025
          </p>
        </div>
      </div>
    </div>
  );
};

// Reusable section component with icons
const SectionIcon = ({ icon: Icon, title, children, id }) => {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-primary-100 rounded-lg mr-4">
          <Icon className="h-6 w-6 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="ml-16">{children}</div>
    </section>
  );
};

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <TermsHeader />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border-l-4 border-primary-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Quick Navigation
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <a
              href="#agreement"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              Agreement to Terms
            </a>
            <a
              href="#service-description"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              Service Description
            </a>
            <a
              href="#user-accounts"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              User Accounts
            </a>
            <a
              href="#user-conduct"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              User Conduct
            </a>
            <a
              href="#content-ip"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              Content & IP
            </a>
            <a
              href="#payment-billing"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              Payment & Billing
            </a>
            <a
              href="#privacy"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              Privacy
            </a>
            <a
              href="#disclaimers"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              Disclaimers
            </a>
            <a
              href="#liability"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              Limitation of Liability
            </a>
            <a
              href="#modifications"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              Modifications
            </a>
            <a
              href="#governing-law"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              Governing Law
            </a>
            <a
              href="#contact"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              Contact Us
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-10">
          <SectionIcon
            icon={DocumentTextIcon}
            title="Agreement to Terms"
            id="agreement"
          >
            <p className="text-gray-600 leading-relaxed">
              By accessing and using LokalHunt ("the Service"), you accept and
              agree to be bound by the terms and provision of this agreement. If
              you do not agree to abide by the above, please do not use this
              service.
            </p>
          </SectionIcon>

          <SectionIcon
            icon={ShieldCheckIcon}
            title="Description of Service"
            id="service-description"
          >
            <p className="text-gray-600 leading-relaxed mb-4">
              LokalHunt is a local job marketplace platform that connects job
              seekers with employers in their local communities. Our services
              include:
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Job posting and search functionality</li>
                <li>Profile creation and management</li>
                <li>Application tracking and management</li>
                <li>Communication tools between employers and candidates</li>
                <li>Career advice and resources</li>
                <li>Resume building and optimization tools</li>
                <li>Interview scheduling and management</li>
              </ul>
            </div>
          </SectionIcon>

          <SectionIcon
            icon={UserGroupIcon}
            title="User Accounts"
            id="user-accounts"
          >
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Account Registration
                </h4>
                <ul className="list-disc list-inside text-blue-800 text-sm space-y-1">
                  <li>You must provide accurate and complete information</li>
                  <li>You are responsible for maintaining account security</li>
                  <li>You must be at least 18 years old to use our services</li>
                  <li>One account per person or organization</li>
                  <li>You must verify your phone number and email address</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">
                  Account Termination
                </h4>
                <p className="text-yellow-800 text-sm">
                  We reserve the right to terminate accounts that violate these
                  terms or engage in fraudulent activity. You may also delete
                  your account at any time through the account settings.
                </p>
              </div>
            </div>
          </SectionIcon>

          <SectionIcon
            icon={ExclamationTriangleIcon}
            title="User Conduct"
            id="user-conduct"
          >
            <p className="text-gray-600 mb-4">You agree not to:</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <ul className="list-disc list-inside text-red-800 space-y-2 text-sm">
                <li>Post false, misleading, or discriminatory job listings</li>
                <li>Upload malicious software or harmful content</li>
                <li>Harass, abuse, or discriminate against other users</li>
                <li>Use the platform for illegal activities</li>
                <li>Spam or send unsolicited communications</li>
                <li>Scrape or collect data without permission</li>
                <li>Impersonate other individuals or organizations</li>
                <li>Violate any local, state, or national laws</li>
              </ul>
            </div>
          </SectionIcon>

          <SectionIcon
            icon={DocumentTextIcon}
            title="Content and Intellectual Property"
            id="content-ip"
          >
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  User Content
                </h4>
                <p className="text-gray-600 text-sm">
                  You retain ownership of content you post but grant us a
                  license to use, display, and distribute it on our platform for
                  the purpose of providing our services.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Platform Content
                </h4>
                <p className="text-gray-600 text-sm">
                  LokalHunt's content, features, and functionality are owned by
                  us and protected by copyright and other intellectual property
                  laws.
                </p>
              </div>
            </div>
          </SectionIcon>

          <SectionIcon
            icon={CurrencyDollarIcon}
            title="Payment and Billing"
            id="payment-billing"
          >
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <ul className="list-disc list-inside text-green-800 space-y-2 text-sm">
                <li>Job posting fees are clearly displayed before purchase</li>
                <li>
                  All payments are processed securely through third-party
                  providers
                </li>
                <li>Refunds are subject to our refund policy</li>
                <li>Prices may change with 30 days notice</li>
                <li>Free services remain free for job seekers</li>
                <li>Premium features may require subscription</li>
              </ul>
            </div>
          </SectionIcon>

          <SectionIcon icon={ShieldCheckIcon} title="Privacy" id="privacy">
            <p className="text-gray-600">
              Your privacy is important to us. Please review our Privacy Policy,
              which also governs your use of the Service, to understand our
              practices regarding your personal information.
            </p>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> When you apply for jobs, your profile
                information may be shared with employers. You control what
                information to include in your public profile.
              </p>
            </div>
          </SectionIcon>

          <SectionIcon
            icon={ExclamationTriangleIcon}
            title="Disclaimers"
            id="disclaimers"
          >
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <ul className="list-disc list-inside text-yellow-800 space-y-2 text-sm">
                <li>We do not guarantee job placement or hiring outcomes</li>
                <li>
                  Employer and candidate information accuracy is their
                  responsibility
                </li>
                <li>
                  We are not responsible for employment decisions or workplace
                  disputes
                </li>
                <li>The service is provided "as is" without warranties</li>
                <li>We do not verify all employer or candidate claims</li>
                <li>Job availability and accuracy are subject to change</li>
              </ul>
            </div>
          </SectionIcon>

          <SectionIcon
            icon={ScaleIcon}
            title="Limitation of Liability"
            id="liability"
          >
            <p className="text-gray-600">
              LokalHunt shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages resulting from your
              use of the service. Our total liability is limited to the amount
              paid by you for our services in the past 12 months.
            </p>
          </SectionIcon>

          <SectionIcon
            icon={DocumentTextIcon}
            title="Modifications"
            id="modifications"
          >
            <p className="text-gray-600">
              We reserve the right to modify these terms at any time. Changes
              will be effective immediately upon posting. Continued use
              constitutes acceptance of modified terms. We will notify users of
              significant changes via email or platform notifications.
            </p>
          </SectionIcon>

          <SectionIcon
            icon={GlobeAltIcon}
            title="Governing Law"
            id="governing-law"
          >
            <p className="text-gray-600">
              These terms are governed by the laws of India. Any disputes will
              be resolved in the courts of Hyderabad, Telangana, India. If any
              provision is found unenforceable, the remaining provisions shall
              remain in effect.
            </p>
          </SectionIcon>

          <SectionIcon icon={EnvelopeIcon} title="Contact Us" id="contact">
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-6">
              <p className="text-gray-600 mb-6">
                If you have questions about this Privacy Policy or our data
                practices, please contact us:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="h-5 w-5 text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <a
                        href="mailto:privacy@lokalhunt.com"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        privacy@lokalhunt.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-5 w-5 text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900">Phone</p>
                      <a
                        href="tel:+919494644848"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        +91 9494 64 4848
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="h-5 w-5 text-primary-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Address</p>
                      <p className="text-gray-600 text-sm">
                        Codevel Technologies LLP
                        <br />
                        3rd Floor, Jakotia Complex
                        <br />
                        Opp. Ratna Hotel, Pochamma Maidan
                        <br />
                        Vasavi Colony, Kothawada
                        <br />
                        Warangal, Telangana 506002
                        <br />
                        India
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Response Timeline
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• General inquiries: 48-72 hours</li>
                    <li>• Data access requests: 7-14 days</li>
                    <li>• Data deletion requests: 30 days</li>
                    <li>• Privacy concerns: Priority response</li>
                  </ul>

                  <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                    <p className="text-xs text-primary-700">
                      <strong>Business Hours:</strong> Monday - Friday, 9:00 AM
                      - 6:00 PM IST
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SectionIcon>

          {/* Additional Legal Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Important Notes
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Effective Date
                </h4>
                <p>These terms became effective on September 5, 2025</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Version</h4>
                <p>Version 2.0 - Updated for enhanced clarity</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Language</h4>
                <p>
                  This agreement is written in English. Translations are for
                  convenience only.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Severability</h4>
                <p>
                  If any provision is invalid, the remainder shall continue in
                  effect.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfService;
