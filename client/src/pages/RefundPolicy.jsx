import React from "react";
import {
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

// Refund Policy specific header
const RefundHeader = () => {
  return (
    <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <CurrencyDollarIcon className="h-16 w-16 text-white mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Refund Policy</h1>
          <p className="text-xl text-green-100 mb-2">
            Fair and transparent refund terms for all our services
          </p>
          <p className="text-lg text-green-200">
            Last updated: September 5, 2025
          </p>
        </div>
      </div>
    </div>
  );
};

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <RefundHeader />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border-l-4 border-primary-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Quick Navigation
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <a
              href="#overview"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              Overview
            </a>
            <a
              href="#eligibility"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              Refund Eligibility
            </a>
            <a
              href="#non-refundable"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              Non-Refundable
            </a>
            <a
              href="#process"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              Refund Process
            </a>
            <a
              href="#special-circumstances"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              Special Cases
            </a>
            <a
              href="#disputes"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              Disputes
            </a>
            <a
              href="#modifications"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              Modifications
            </a>
            <a
              href="#contact"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              Contact
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-8 space-y-10">
            {/* Overview Section */}
            <section id="overview">
              <div className="flex items-center mb-6">
                <DocumentTextIcon className="h-8 w-8 text-primary-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Overview</h2>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-600 leading-relaxed text-lg">
                  At LokalHunt, we strive to provide excellent service to all
                  our users. This Refund Policy outlines the terms and
                  conditions for refunds on our paid services, including job
                  posting fees and premium subscriptions. We are committed to
                  fair and transparent refund practices that protect both our
                  users and our business operations.
                </p>
              </div>
            </section>

            {/* Refund Eligibility Section */}
            <section id="eligibility">
              <div className="flex items-center mb-6">
                <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">
                  Refund Eligibility
                </h2>
              </div>
              <div className="space-y-8">
                <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Job Posting Fees
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        Refund requests must be made within 7 days of payment
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        Job posting must not have received any applications
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Job must not have been promoted or featured</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        Technical issues preventing job posting qualify for full
                        refund
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Premium Subscriptions
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        30-day money-back guarantee for new subscribers
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        Pro-rated refunds for annual subscriptions cancelled
                        within 60 days
                      </span>
                    </li>
                    <li className="flex items-start">
                      <XCircleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        No refund for partially used monthly subscriptions
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        Technical issues preventing service access qualify for
                        extension or refund
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Non-Refundable Services Section */}
            <section id="non-refundable">
              <div className="flex items-center mb-6">
                <XCircleIcon className="h-8 w-8 text-red-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">
                  Non-Refundable Services
                </h2>
              </div>
              <div className="bg-red-50 rounded-lg p-6 border-l-4 border-red-500">
                <p className="text-gray-700 mb-4 font-medium">
                  The following services are not eligible for refunds:
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <XCircleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      Featured job promotions that have been activated
                    </span>
                  </li>
                  <li className="flex items-start">
                    <XCircleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Job postings that have received applications</span>
                  </li>
                  <li className="flex items-start">
                    <XCircleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Premium features that have been used</span>
                  </li>
                  <li className="flex items-start">
                    <XCircleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Services cancelled after the refund period</span>
                  </li>
                  <li className="flex items-start">
                    <XCircleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      Violations of Terms of Service resulting in account
                      suspension
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Refund Process Section */}
            <section id="process">
              <div className="flex items-center mb-6">
                <ClockIcon className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">
                  Refund Process
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    How to Request a Refund
                  </h3>
                  <ol className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">
                        1
                      </span>
                      <span>
                        Contact our support team at support@lokalhunt.com
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">
                        2
                      </span>
                      <span>
                        Provide your account details and payment information
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">
                        3
                      </span>
                      <span>Explain the reason for your refund request</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">
                        4
                      </span>
                      <span>
                        Include any relevant documentation or screenshots
                      </span>
                    </li>
                  </ol>
                </div>

                <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Processing Time
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <ClockIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        Refund requests are reviewed within 2-3 business days
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ClockIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        Approved refunds are processed within 5-7 business days
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ClockIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        Refunds are issued to the original payment method
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ClockIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        Bank processing may take additional 3-5 business days
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Special Circumstances Section */}
            <section id="special-circumstances">
              <div className="flex items-center mb-6">
                <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">
                  Special Circumstances
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-500">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Technical Issues
                  </h3>
                  <p className="text-gray-700">
                    If you experience technical difficulties that prevent you
                    from using our services, we will work diligently to resolve
                    the issue promptly or provide a refund or service credit as
                    appropriate.
                  </p>
                </div>

                <div className="bg-orange-50 rounded-lg p-6 border-l-4 border-orange-500">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Service Interruptions
                  </h3>
                  <p className="text-gray-700">
                    Extended service outages may qualify for service credits or
                    partial refunds based on the duration and impact of the
                    interruption on your usage.
                  </p>
                </div>
              </div>
            </section>

            {/* Dispute Resolution Section */}
            <section id="disputes">
              <div className="flex items-center mb-6">
                <DocumentTextIcon className="h-8 w-8 text-purple-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">
                  Dispute Resolution
                </h2>
              </div>
              <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-500">
                <p className="text-gray-700 mb-4 font-medium">
                  If you're not satisfied with our refund decision, you can:
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      Request a review by our customer service manager
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Provide additional documentation or information</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      Contact your payment provider for chargeback options
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      Seek resolution through consumer protection agencies
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Modifications Section */}
            <section id="modifications">
              <div className="flex items-center mb-6">
                <DocumentTextIcon className="h-8 w-8 text-gray-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">
                  Policy Modifications
                </h2>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-gray-500">
                <p className="text-gray-700">
                  We reserve the right to modify this Refund Policy at any time
                  to reflect changes in our services, legal requirements, or
                  business practices. Changes will be effective immediately upon
                  posting on our website. We recommend reviewing this policy
                  periodically to stay informed of any updates.
                </p>
              </div>
            </section>

            {/* Contact Information Section */}
            <section id="contact">
              <div className="flex items-center mb-6">
                <EnvelopeIcon className="h-8 w-8 text-primary-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">
                  Contact Information
                </h2>
              </div>
              <div className="bg-primary-50 rounded-lg p-6 border-l-4 border-primary-500">
                <p className="text-gray-700 mb-6 font-medium">
                  For refund requests or questions about this policy, please
                  contact us:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <EnvelopeIcon className="h-5 w-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          Email Support
                        </p>
                        <p className="text-gray-700">support@lokalhunt.com</p>
                        <p className="text-sm text-gray-500">
                          For billing and refund inquiries
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <EnvelopeIcon className="h-5 w-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          General Support
                        </p>
                        <p className="text-gray-700">support@lokalhunt.com</p>
                        <p className="text-sm text-gray-500">
                          For technical and general support
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <PhoneIcon className="h-5 w-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          Phone Support
                        </p>
                        <p className="text-gray-700">+91 9494644848</p>
                        <p className="text-sm text-gray-500">
                          Monday - Friday, 9:00 AM - 6:00 PM IST
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPinIcon className="h-5 w-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          Office Address
                        </p>
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
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Help Section */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-8">
            <div className="text-center text-white">
              <h3 className="text-2xl font-bold mb-4">Need Help?</h3>
              <p className="text-green-100 text-lg mb-6">
                Our customer support team is here to help resolve any issues
                before you consider a refund.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:support@lokalhunt.com"
                  className="inline-flex items-center px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
                >
                  <EnvelopeIcon className="h-5 w-5 mr-2" />
                  Email Support
                </a>
                <a
                  href="tel:+919494644848"
                  className="inline-flex items-center px-6 py-3 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 transition-colors duration-200"
                >
                  <PhoneIcon className="h-5 w-5 mr-2" />
                  Call Us
                </a>
              </div>
            </div>
          </div>

          {/* Additional Legal Information */}
          <div className="bg-gray-50 border-t p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Important Notes
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Effective Date
                </h4>
                <p>This policy became effective on September 5, 2025</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Version</h4>
                <p>Version 2.0 - Updated for enhanced transparency</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Currency</h4>
                <p>All refunds are processed in Indian Rupees (INR)</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Applicability
                </h4>
                <p>This policy applies to all LokalHunt paid services</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RefundPolicy;
