
import React from "react";
import { 
  ShieldCheckIcon, 
  LockClosedIcon, 
  EyeIcon, 
  DocumentTextIcon,
  UserGroupIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

// Privacy Policy specific header
const PrivacyHeader = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <ShieldCheckIcon className="h-16 w-16 text-white mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-blue-100 mb-2">
            Your privacy and data security are our top priorities
          </p>
          <p className="text-lg text-blue-200">
            Last updated: September 5, 2025
          </p>
        </div>
      </div>
    </div>
  );
};

const SectionIcon = ({ icon: Icon, title, children }) => (
  <section className="mb-8">
    <div className="flex items-center mb-4">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-100">
          <Icon className="h-6 w-6 text-primary-600" />
        </div>
      </div>
      <div className="ml-4">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
    </div>
    <div className="ml-16">
      {children}
    </div>
  </section>
);

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PrivacyHeader />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border-l-4 border-primary-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Navigation</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <a href="#introduction" className="text-primary-600 hover:text-primary-700 hover:underline">Introduction</a>
            <a href="#data-collection" className="text-primary-600 hover:text-primary-700 hover:underline">Data Collection</a>
            <a href="#data-usage" className="text-primary-600 hover:text-primary-700 hover:underline">How We Use Data</a>
            <a href="#data-sharing" className="text-primary-600 hover:text-primary-700 hover:underline">Data Sharing</a>
            <a href="#data-security" className="text-primary-600 hover:text-primary-700 hover:underline">Security</a>
            <a href="#user-rights" className="text-primary-600 hover:text-primary-700 hover:underline">Your Rights</a>
            <a href="#cookies" className="text-primary-600 hover:text-primary-700 hover:underline">Cookies</a>
            <a href="#retention" className="text-primary-600 hover:text-primary-700 hover:underline">Data Retention</a>
            <a href="#contact" className="text-primary-600 hover:text-primary-700 hover:underline">Contact Us</a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-10">
          <SectionIcon icon={DocumentTextIcon} title="Introduction" id="introduction">
            <p className="text-gray-600 leading-relaxed mb-4">
              Welcome to LokalHunt ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our job portal platform, mobile application, and related services.
            </p>
            <p className="text-gray-600 leading-relaxed">
              By using LokalHunt, you consent to the practices described in this policy. If you do not agree with our practices, please do not use our services.
            </p>
          </SectionIcon>

          <SectionIcon icon={EyeIcon} title="Information We Collect" id="data-collection">
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li><strong>Account Information:</strong> Name, email address, phone number, password</li>
                  <li><strong>Profile Data:</strong> Professional experience, education, skills, certifications</li>
                  <li><strong>Identity Verification:</strong> Government ID documents (when required)</li>
                  <li><strong>Resume/CV:</strong> Uploaded documents and extracted information</li>
                  <li><strong>Photos:</strong> Profile pictures and portfolio images</li>
                  <li><strong>Location Data:</strong> City, state, and preferred work locations</li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Job-Related Information</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Job applications and application status</li>
                  <li>Job preferences (salary expectations, work type, industry)</li>
                  <li>Interview feedback and assessment results</li>
                  <li>Communication with employers through our platform</li>
                  <li>Job bookmarks and saved searches</li>
                </ul>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Usage Information</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>IP address, browser type, and device information</li>
                  <li>Pages visited, time spent on site, and navigation patterns</li>
                  <li>Search queries and filter preferences</li>
                  <li>Feature usage and interaction data</li>
                  <li>Error logs and performance data</li>
                </ul>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Mobile App Data</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Device identifiers and push notification tokens</li>
                  <li>App usage analytics and crash reports</li>
                  <li>Location data (with your permission)</li>
                  <li>Camera and file access (when uploading documents)</li>
                </ul>
              </div>
            </div>
          </SectionIcon>

          <SectionIcon icon={UserGroupIcon} title="How We Use Your Information" id="data-usage">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Core Services</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Create and maintain your account</li>
                  <li>Process job applications</li>
                  <li>Match you with relevant job opportunities</li>
                  <li>Facilitate communication with employers</li>
                  <li>Provide personalized job recommendations</li>
                  <li>Send important notifications and updates</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Platform Improvement</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Analyze usage patterns and trends</li>
                  <li>Improve our matching algorithms</li>
                  <li>Develop new features and services</li>
                  <li>Conduct research and analytics</li>
                  <li>Prevent fraud and abuse</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </div>
          </SectionIcon>

          <SectionIcon icon={GlobeAltIcon} title="Information Sharing" id="data-sharing">
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                We may share your information in the following circumstances:
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">⚠️ Important: What Employers See</h4>
                <p className="text-red-800 text-sm">
                  When you apply for jobs, your profile information (name, experience, education, skills, resume) is shared with the respective employers. You control what information to include in your profile.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">With Employers</h4>
                  <p className="text-gray-600 text-sm">Your profile and application data when you apply for positions</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Service Providers</h4>
                  <p className="text-gray-600 text-sm">Trusted third parties who help us operate our platform (payment processing, email services, analytics)</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Legal Compliance</h4>
                  <p className="text-gray-600 text-sm">When required by law or to protect our rights and safety</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Business Transfers</h4>
                  <p className="text-gray-600 text-sm">In case of merger, acquisition, or asset sale (with user notification)</p>
                </div>
              </div>
            </div>
          </SectionIcon>

          <SectionIcon icon={LockClosedIcon} title="Data Security" id="data-security">
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                We implement comprehensive security measures to protect your personal information:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">🔐 Technical Safeguards</h4>
                  <ul className="text-green-800 text-sm space-y-1">
                    <li>• SSL/TLS encryption for data transmission</li>
                    <li>• Encrypted database storage</li>
                    <li>• Secure server infrastructure</li>
                    <li>• Regular security audits</li>
                    <li>• Multi-factor authentication options</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">🛡️ Operational Security</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Access controls and permissions</li>
                    <li>• Employee security training</li>
                    <li>• Incident response procedures</li>
                    <li>• Regular backups and recovery plans</li>
                    <li>• Third-party security assessments</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Important Security Note</h4>
                <p className="text-yellow-800 text-sm">
                  While we implement strong security measures, no internet transmission is completely secure. Please use strong passwords and keep your account credentials confidential.
                </p>
              </div>
            </div>
          </SectionIcon>

          <SectionIcon icon={UserGroupIcon} title="Your Rights and Choices" id="user-rights">
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">You have the following rights regarding your personal information:</p>
              
              <div className="grid gap-3">
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-medium">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Access and Update</h4>
                    <p className="text-gray-600 text-sm">View and modify your personal information through your account settings</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-sm font-medium">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Data Deletion</h4>
                    <p className="text-gray-600 text-sm">Request deletion of your account and associated data</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm font-medium">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Data Portability</h4>
                    <p className="text-gray-600 text-sm">Download your data in a portable format</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-sm font-medium">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Communication Preferences</h4>
                    <p className="text-gray-600 text-sm">Control email notifications and marketing communications</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 text-sm font-medium">5</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Privacy Complaints</h4>
                    <p className="text-gray-600 text-sm">Lodge complaints with data protection authorities if needed</p>
                  </div>
                </div>
              </div>
            </div>
          </SectionIcon>

          <SectionIcon icon={GlobeAltIcon} title="Cookies and Tracking Technologies" id="cookies">
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                We use cookies and similar technologies to enhance your experience and analyze platform usage:
              </p>
              
              <div className="grid gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Essential Cookies</h4>
                  <p className="text-gray-600 text-sm">Required for basic site functionality (login, security, preferences)</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Analytics Cookies</h4>
                  <p className="text-gray-600 text-sm">Help us understand how users interact with our platform</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Preference Cookies</h4>
                  <p className="text-gray-600 text-sm">Remember your settings and personalize your experience</p>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm">
                You can control cookie preferences through your browser settings. Note that disabling certain cookies may affect site functionality.
              </p>
            </div>
          </SectionIcon>

          <SectionIcon icon={DocumentTextIcon} title="Data Retention" id="retention">
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-600 mb-4">
                We retain your personal information for as long as necessary to provide our services and comply with legal obligations:
              </p>
              
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li><strong>Active Accounts:</strong> Data retained while your account remains active</li>
                <li><strong>Closed Accounts:</strong> Most data deleted within 30 days, some retained for legal compliance</li>
                <li><strong>Job Applications:</strong> Maintained for potential future opportunities (unless you opt-out)</li>
                <li><strong>Legal Requirements:</strong> Some data retained longer as required by applicable laws</li>
                <li><strong>Analytics Data:</strong> Aggregated, anonymized data may be retained indefinitely</li>
              </ul>
            </div>
          </SectionIcon>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Children's Privacy</h3>
                <p className="text-blue-800 text-sm">
                  Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children under 18.
                </p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900 mb-3">International Transfers</h3>
                <p className="text-green-800 text-sm">
                  Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place.
                </p>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-900 mb-3">Policy Updates</h3>
                <p className="text-yellow-800 text-sm">
                  We may update this policy periodically. Significant changes will be communicated through email or platform notifications.
                </p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-900 mb-3">Third-Party Links</h3>
                <p className="text-purple-800 text-sm">
                  Our platform may contain links to external websites. We are not responsible for the privacy practices of third-party sites.
                </p>
              </div>
            </div>
          </section>

          <SectionIcon icon={EnvelopeIcon} title="Contact Us" id="contact">
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-6">
              <p className="text-gray-600 mb-6">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="h-5 w-5 text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <a href="mailto:privacy@lokalhunt.com" className="text-primary-600 hover:text-primary-700">
                        privacy@lokalhunt.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-5 w-5 text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900">Phone</p>
                      <a href="tel:+919494644848" className="text-primary-600 hover:text-primary-700">
                        +91 9494 64 4848
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="h-5 w-5 text-primary-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Address</p>
                      <p className="text-gray-600 text-sm">
                        Codevel Technologies LLP<br />
                        3rd Floor, Jakotia Complex<br />
                        Opp. Ratna Hotel, Pochamma Maidan<br />
                        Vasavi Colony, Kothawada<br />
                        Warangal, Telangana 506002<br />
                        India
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Response Timeline</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• General inquiries: 48-72 hours</li>
                    <li>• Data access requests: 7-14 days</li>
                    <li>• Data deletion requests: 30 days</li>
                    <li>• Privacy concerns: Priority response</li>
                  </ul>
                  
                  <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                    <p className="text-xs text-primary-700">
                      <strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SectionIcon>
        </div>
        
        {/* Footer Call-to-Action */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-primary-200 p-6 mt-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Questions about your privacy?</h3>
          <p className="text-gray-600 mb-4">
            Our privacy team is here to help. Don't hesitate to reach out with any concerns.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <a
              href="mailto:privacy@lokalhunt.com"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              <EnvelopeIcon className="h-5 w-5 mr-2" />
              Email Privacy Team
            </a>
            <a
              href="/help-center"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Visit Help Center
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
