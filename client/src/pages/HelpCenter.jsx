import React from 'react'
import { Link } from 'react-router-dom'
import { QuestionMarkCircleIcon, ChatBubbleLeftRightIcon, BookOpenIcon, PhoneIcon } from '@heroicons/react/24/outline'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'

const HelpCenter = () => {
  const faqs = [
    {
      question: "How do I create an account?",
      answer: "Click on 'Sign In' in the header and then select 'Register' to create your account. You can register as a job seeker or employer."
    },
    {
      question: "How do I apply for jobs?",
      answer: "Browse jobs, click on any job that interests you, and click the 'Apply Now' button. Make sure your profile is complete before applying."
    },
    {
      question: "How do I post a job?",
      answer: "Register as an employer, complete your company profile, and then use the 'Post a Job' feature from your dashboard."
    },
    {
      question: "Is LokalHunt free to use?",
      answer: "Yes! LokalHunt is completely free for job seekers. Employers can post jobs with various pricing plans."
    },
    {
      question: "How do I update my profile?",
      answer: "Log in to your account and go to your profile section. You can update your information, add skills, experience, and upload your resume."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <QuestionMarkCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
            <p className="mt-2 text-lg text-gray-600">
              Find answers to common questions and get support
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Quick Help */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Help</h2>
              <div className="space-y-4">
                <Link
                  to="/contact"
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Contact Support</p>
                    <p className="text-sm text-gray-600">Get personalized help</p>
                  </div>
                </Link>

                <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                  <PhoneIcon className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Call Us</p>
                    <p className="text-sm text-gray-600">+91 9876543210</p>
                  </div>
                </div>

                <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                  <BookOpenIcon className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">User Guide</p>
                    <p className="text-sm text-gray-600">Step-by-step tutorials</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Additional Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BookOpenIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">User Guides</h3>
              <p className="text-gray-600">Comprehensive guides for using LokalHunt effectively</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Forum</h3>
              <p className="text-gray-600">Connect with other users and share experiences</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <PhoneIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600">Round-the-clock assistance for urgent queries</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default HelpCenter