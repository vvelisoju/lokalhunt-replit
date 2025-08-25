
import React, { useState } from "react";
import {
  AcademicCapIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  CurrencyRupeeIcon,
  BriefcaseIcon,
  TrophyIcon,
  QuestionMarkCircleIcon,
  ArrowTrendingUpIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  LightBulbIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Card from "../components/ui/Card";

const CareerAdvice = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I create an effective profile on LokalHunt?",
      answer: "Complete all sections of your profile including personal details, education, experience, and skills. Upload a professional photo and write a compelling summary. Keep your profile updated with recent achievements and certifications."
    },
    {
      question: "What should I include in my resume for local jobs?",
      answer: "Include your contact information, professional summary, work experience, education, relevant skills, and any local certifications. Highlight achievements with numbers and focus on skills relevant to local job market demands."
    },
    {
      question: "How can I prepare for video interviews?",
      answer: "Test your technology beforehand, ensure good lighting and audio, dress professionally, prepare answers to common questions, research the company, and have questions ready to ask the interviewer."
    },
    {
      question: "What are the most in-demand skills in our local job market?",
      answer: "Digital literacy, communication skills, customer service, basic computer skills, time management, teamwork, and industry-specific technical skills are highly valued in the local job market."
    },
    {
      question: "How do I negotiate salary for entry-level positions?",
      answer: "Research market rates, highlight your unique value, be prepared to discuss your accomplishments, consider the complete compensation package, and be willing to negotiate other benefits if salary is fixed."
    }
  ];

  const successStories = [
    {
      name: "Priya Sharma",
      role: "Marketing Executive",
      story: "Started as a fresher, completed digital marketing certification through free online courses, and got promoted to Marketing Executive within 18 months.",
      company: "Local Tech Startup",
      salary: "₹4.5L per year",
      avatar: "👩‍💼"
    },
    {
      name: "Rajesh Kumar",
      role: "Team Lead",
      story: "Worked part-time while studying, focused on communication skills, and gradually moved from customer service to team leadership role.",
      company: "Regional BPO",
      salary: "₹6.2L per year",
      avatar: "👨‍💻"
    },
    {
      name: "Anitha Reddy",
      role: "HR Manager",
      story: "Started with basic HR role, pursued HR certification, built strong networking skills, and became HR Manager in 3 years.",
      company: "Manufacturing Company",
      salary: "₹5.8L per year",
      avatar: "👩‍💼"
    }
  ];

  const localTrends = [
    { role: "Customer Service Representative", demand: "High", avgSalary: "₹2.5-4L", growth: "+15%" },
    { role: "Sales Executive", demand: "High", avgSalary: "₹3-5L", growth: "+12%" },
    { role: "Digital Marketing Specialist", demand: "Growing", avgSalary: "₹3.5-6L", growth: "+25%" },
    { role: "Data Entry Operator", demand: "Moderate", avgSalary: "₹2-3.5L", growth: "+8%" },
    { role: "Content Writer", demand: "Growing", avgSalary: "₹2.5-4.5L", growth: "+18%" },
    { role: "Administrative Assistant", demand: "Stable", avgSalary: "₹2.5-4L", growth: "+5%" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mb-6">
              <LightBulbIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Career <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">Advice</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Your complete guide to building a successful career in the local job market.
              Get expert tips, practical advice, and real success stories to accelerate your professional journey.
            </p>
          </div>

          <div className="space-y-8 sm:space-y-12">
            {/* Getting Started Section */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 sm:p-8">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-xl mr-4">
                    <AcademicCapIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Getting Started with Local Jobs</h2>
                    <p className="text-blue-700 mt-1">Build your foundation for success</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-6 text-lg">
                  Start your local job search journey with these essential steps to maximize your success.
                </p>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                      Profile Completion Tips
                    </h4>
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        Complete all profile sections (100% completion gets 3x more views)
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        Upload a professional profile photo
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        Write a compelling professional summary
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        Add relevant skills and certifications
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <MapPinIcon className="h-5 w-5 text-blue-500 mr-2" />
                      Location-Based Search
                    </h4>
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        Set your preferred work locations accurately
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        Enable job alerts for your area
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        Use local job filters effectively
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        Follow local companies you're interested in
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            {/* Resume & Profile Building */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 sm:p-8">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-3 rounded-xl mr-4">
                    <DocumentTextIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Resume & Profile Building</h2>
                    <p className="text-green-700 mt-1">Create a standout professional presence</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-8 text-lg">
                  Create a standout resume that gets noticed by local employers and hiring managers.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-4">Resume Writing Tips</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Keep it concise (1-2 pages max)</li>
                      <li>• Use action verbs and quantify achievements</li>
                      <li>• Customize for each job application</li>
                      <li>• Include relevant keywords</li>
                      <li>• Proofread for spelling and grammar</li>
                    </ul>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-4">Essential Sections</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Contact Information</li>
                      <li>• Professional Summary</li>
                      <li>• Work Experience</li>
                      <li>• Education & Certifications</li>
                      <li>• Relevant Skills</li>
                    </ul>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-4">Skills to Highlight</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Technical skills</li>
                      <li>• Language proficiency</li>
                      <li>• Software knowledge</li>
                      <li>• Industry certifications</li>
                      <li>• Soft skills</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            {/* Interview Preparation */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 sm:p-8">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 p-3 rounded-xl mr-4">
                    <UserGroupIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Interview Preparation</h2>
                    <p className="text-purple-700 mt-1">Master the art of interviewing</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-8 text-lg">
                  Ace your interviews with these preparation strategies and common local job interview insights.
                </p>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-6">Common Interview Questions</h4>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border-l-4 border-purple-500">
                        <p className="font-medium text-gray-800">"Tell me about yourself"</p>
                        <p className="text-gray-600 mt-2 text-sm">Prepare a 2-minute professional summary highlighting your key achievements and career goals.</p>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
                        <p className="font-medium text-gray-800">"Why do you want this job?"</p>
                        <p className="text-gray-600 mt-2 text-sm">Research the company thoroughly and connect your skills to their specific needs.</p>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border-l-4 border-green-500">
                        <p className="font-medium text-gray-800">"What are your strengths?"</p>
                        <p className="text-gray-600 mt-2 text-sm">Provide specific examples that demonstrate your strengths in action.</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-6">Preparation Checklist</h4>
                    <div className="space-y-3">
                      {[
                        "Research the company and role thoroughly",
                        "Prepare specific examples of achievements",
                        "Practice common interview questions",
                        "Prepare questions to ask the interviewer",
                        "Plan your outfit and route in advance",
                        "Bring multiple copies of your resume"
                      ].map((item, index) => (
                        <div key={index} className="flex items-center">
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                          <span className="text-gray-600">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Skill Development */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 sm:p-8">
                <div className="flex items-center mb-4">
                  <div className="bg-orange-100 p-3 rounded-xl mr-4">
                    <ChartBarIcon className="h-8 w-8 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Skill Development</h2>
                    <p className="text-orange-700 mt-1">Stay competitive in the market</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-8 text-lg">
                  Develop in-demand skills to stay competitive in the local job market.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                    <h4 className="font-semibold text-gray-900 mb-4">Technical Skills</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Microsoft Office Suite</li>
                      <li>• Basic Computer Skills</li>
                      <li>• Digital Marketing</li>
                      <li>• Data Entry & Analysis</li>
                      <li>• Social Media Management</li>
                    </ul>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                    <h4 className="font-semibold text-gray-900 mb-4">Soft Skills</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Communication Skills</li>
                      <li>• Time Management</li>
                      <li>• Problem Solving</li>
                      <li>• Teamwork</li>
                      <li>• Customer Service</li>
                    </ul>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
                    <h4 className="font-semibold text-gray-900 mb-4">Free Learning Resources</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Google Digital Garage</li>
                      <li>• Coursera Free Courses</li>
                      <li>• YouTube Tutorials</li>
                      <li>• Government Skill Programs</li>
                      <li>• Local Training Centers</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            {/* Salary & Negotiation */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 sm:p-8">
                <div className="flex items-center mb-4">
                  <div className="bg-yellow-100 p-3 rounded-xl mr-4">
                    <CurrencyRupeeIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Salary & Negotiation Guidance</h2>
                    <p className="text-yellow-700 mt-1">Know your worth and negotiate effectively</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-8 text-lg">
                  Understand local salary ranges and learn effective negotiation strategies.
                </p>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-6">Popular Local Job Salary Ranges</h4>
                    <div className="space-y-3">
                      {[
                        { role: "Customer Service Rep", salary: "₹2.5-4L/year" },
                        { role: "Sales Executive", salary: "₹3-5L/year" },
                        { role: "Digital Marketing", salary: "₹3.5-6L/year" },
                        { role: "Administrative Assistant", salary: "₹2.5-4L/year" }
                      ].map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">{item.role}</span>
                          <span className="font-semibold text-green-600">{item.salary}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-6">Negotiation Tips</h4>
                    <div className="space-y-3">
                      {[
                        "Research market rates before negotiating",
                        "Highlight your unique value proposition",
                        "Consider the complete compensation package",
                        "Be prepared to justify your ask with examples",
                        "Negotiate other benefits if salary is fixed"
                      ].map((tip, index) => (
                        <div key={index} className="flex items-start">
                          <ShieldCheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                          <span className="text-gray-600">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Career Growth Stories */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 sm:p-8">
                <div className="flex items-center mb-4">
                  <div className="bg-pink-100 p-3 rounded-xl mr-4">
                    <TrophyIcon className="h-8 w-8 text-pink-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Career Growth Stories</h2>
                    <p className="text-pink-700 mt-1">Real success stories from our community</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-8 text-lg">
                  Get inspired by real success stories from local professionals who started their journey on LokalHunt.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {successStories.map((story, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center mb-4">
                        <div className="text-3xl mr-3">{story.avatar}</div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{story.name}</h4>
                          <p className="text-sm text-pink-600 font-medium">{story.role}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">{story.story}</p>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">{story.company}</span>
                        <span className="font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">{story.salary}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Local Job Trends */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 sm:p-8">
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-100 p-3 rounded-xl mr-4">
                    <ArrowTrendingUpIcon className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Local Job Trends</h2>
                    <p className="text-indigo-700 mt-1">Stay ahead of market trends</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-8 text-lg">
                  Stay updated with the latest hiring trends and in-demand roles in your local job market.
                </p>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demand</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Salary</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {localTrends.map((trend, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trend.role}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                trend.demand === 'High' ? 'bg-green-100 text-green-800' :
                                trend.demand === 'Growing' ? 'bg-blue-100 text-blue-800' :
                                trend.demand === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {trend.demand}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trend.avgSalary}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{trend.growth}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </Card>

            {/* FAQs Section */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 sm:p-8">
                <div className="flex items-center mb-4">
                  <div className="bg-gray-100 p-3 rounded-xl mr-4">
                    <QuestionMarkCircleIcon className="h-8 w-8 text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">FAQs & Guidance</h2>
                    <p className="text-gray-600 mt-1">Get answers to common questions</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-8 text-lg">
                  Find answers to commonly asked questions about job searching and career development.
                </p>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        onClick={() => toggleFaq(index)}
                      >
                        <span className="font-medium text-gray-900">{faq.question}</span>
                        {openFaq === index ? (
                          <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                      {openFaq === index && (
                        <div className="px-6 pb-4">
                          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 sm:p-12 text-white shadow-xl">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Start Your Career Journey?</h2>
              <p className="text-xl mb-8 opacity-90 leading-relaxed">
                Join thousands of successful candidates who found their dream jobs through LokalHunt.
                Your perfect opportunity is waiting for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/jobs"
                  className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Browse Jobs
                </a>
                <a
                  href="/register"
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-primary-600 transition-colors"
                >
                  Create Account
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CareerAdvice;
