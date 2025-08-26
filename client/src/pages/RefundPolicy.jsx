import React from 'react'
import { CurrencyDollarIcon } from '@heroicons/react/24/outline'

// Placeholder for Header component
const Header = () => (
  <div className="bg-white shadow">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <CurrencyDollarIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900">Refund Policy</h1>
        <p className="mt-2 text-lg text-gray-600">
          Last updated: August 26, 2025
        </p>
      </div>
    </div>
  </div>
);

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow p-8 space-y-8">

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-600 leading-relaxed">
              At LokalHunt, we strive to provide excellent service to all our users. This Refund Policy outlines the terms and conditions for refunds on our paid services, including job posting fees and premium subscriptions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Refund Eligibility</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Posting Fees</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Refund requests must be made within 7 days of payment</li>
                  <li>Job posting must not have received any applications</li>
                  <li>Job must not have been promoted or featured</li>
                  <li>Technical issues preventing job posting qualify for full refund</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Subscriptions</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>30-day money-back guarantee for new subscribers</li>
                  <li>Pro-rated refunds for annual subscriptions cancelled within 60 days</li>
                  <li>No refund for partially used monthly subscriptions</li>
                  <li>Technical issues preventing service access qualify for extension or refund</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Non-Refundable Services</h2>
            <p className="text-gray-600 mb-4">The following services are not eligible for refunds:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Featured job promotions that have been activated</li>
              <li>Job postings that have received applications</li>
              <li>Premium features that have been used</li>
              <li>Services cancelled after the refund period</li>
              <li>Violations of Terms of Service resulting in account suspension</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Refund Process</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How to Request a Refund</h3>
                <ol className="list-decimal list-inside text-gray-600 space-y-2">
                  <li>Contact our support team at support@lokalhunt.com</li>
                  <li>Provide your account details and payment information</li>
                  <li>Explain the reason for your refund request</li>
                  <li>Include any relevant documentation or screenshots</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Time</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Refund requests are reviewed within 2-3 business days</li>
                  <li>Approved refunds are processed within 5-7 business days</li>
                  <li>Refunds are issued to the original payment method</li>
                  <li>Bank processing may take additional 3-5 business days</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Special Circumstances</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Technical Issues</h3>
                <p className="text-gray-600">
                  If you experience technical difficulties that prevent you from using our services, we will work to resolve the issue or provide a refund or service credit.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Interruptions</h3>
                <p className="text-gray-600">
                  Extended service outages may qualify for service credits or partial refunds based on the duration and impact of the interruption.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Dispute Resolution</h2>
            <p className="text-gray-600 mb-4">
              If you're not satisfied with our refund decision, you can:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Request a review by our customer service manager</li>
              <li>Provide additional documentation or information</li>
              <li>Contact your payment provider for chargeback options</li>
              <li>Seek resolution through consumer protection agencies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Modifications</h2>
            <p className="text-gray-600">
              We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately upon posting on our website. We recommend reviewing this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-gray-600 mb-4">
              For refund requests or questions about this policy, please contact us:
            </p>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> billing@lokalhunt.com<br />
                <strong>Phone:</strong> +91 9876543210<br />
                <strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST<br />
                <strong>Address:</strong> LokalHunt Technologies Pvt Ltd, Hyderabad, Telangana, India
              </p>
            </div>
          </section>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-2">Need Help?</h3>
            <p className="text-green-700">
              Our customer support team is here to help resolve any issues before you consider a refund. 
              Contact us at support@lokalhunt.com or call +91 9876543210.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RefundPolicy