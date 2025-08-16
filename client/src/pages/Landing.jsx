import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { publicApi } from '../services/publicApi'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { 
  MagnifyingGlassIcon, 
  MapPinIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  UsersIcon,
  StarIcon,
  ArrowRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

const Landing = () => {
  const { t, i18n } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [stats, setStats] = useState({
    jobs: 0,
    companies: 0,
    employees: 0
  })
  const [categories, setCategories] = useState([])
  const [popularJobs, setPopularJobs] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  // Load landing page data
  useEffect(() => {
    loadLandingPageData()
  }, [])

  const loadLandingPageData = async () => {
    try {
      setLoading(true)
      
      // Load all data in parallel
      const [statsRes, categoriesRes, jobsRes, reviewsRes] = await Promise.all([
        publicApi.getStats(),
        publicApi.getCategories(),
        publicApi.getFeaturedJobs(4),
        publicApi.getTestimonials()
      ])

      setStats({
        jobs: statsRes.data?.jobs || 0,
        companies: statsRes.data?.companies || 0,
        employees: statsRes.data?.candidates || 0
      })

      setCategories(categoriesRes.data || [])
      setPopularJobs(jobsRes.data || [])
      setReviews(reviewsRes.data || [])
      
    } catch (error) {
      console.error('Error loading landing page data:', error)
      // Keep default empty states
    } finally {
      setLoading(false)
    }
  }

  // Static popular jobs fallback (remove this when backend is working)
  const staticJobs = [
    // Fallback jobs - will be replaced by API data
  ]

  // Blog posts
  const blogPosts = [
    {
      id: 1,
      title: 'Master Your Career: How to Excel as a Hiring Manager in Every Step',
      date: '07 May 2025',
      excerpt: 'Learn the essential skills and strategies to become an effective hiring manager.',
      image: '📚'
    },
    {
      id: 2,
      title: 'From Applications to Offers: How to Navigate Your Job Search Successfully',
      date: '07 May 2025',
      excerpt: 'A comprehensive guide to job searching in the digital age.',
      image: '🚀'
    },
    {
      id: 3,
      title: 'The Future of Job Management: Why Digital Platforms are Leading the Way',
      date: '07 May 2025',
      excerpt: 'Discover how technology is transforming recruitment and job searching.',
      image: '🔮'
    }
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    // Navigate to jobs page with search parameters
    const params = new URLSearchParams()
    if (searchQuery) params.append('search', searchQuery)
    if (location) params.append('location', location)
    if (selectedCategory) params.append('category', selectedCategory)
    
    window.location.href = `/jobs?${params.toString()}`
  }

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-400 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {t('hero.findJobs', 'Find Jobs Near You.')}
              <br />
              <span className="text-3xl md:text-5xl">
                {t('hero.hireLocal', 'Hire Local Talent Fast.')}
              </span>
            </h1>
            <p className="text-xl text-white text-opacity-90 mb-12 max-w-2xl mx-auto">
              {t('hero.description', 'LokalHunt connects you with the best local opportunities and talent — all in one easy-to-use platform.')}
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-xl p-6 md:flex md:items-center md:space-x-4">
                <div className="flex-1 relative mb-4 md:mb-0">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('search.placeholder', 'Job title, keywords, or company')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="flex-1 relative mb-4 md:mb-0">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('search.location', 'City or state')}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="flex-1 mb-4 md:mb-0">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">{t('search.selectCategory', 'Select Category')}</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors w-full md:w-auto"
                >
                  {t('search.search', 'Search')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Statistics Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BriefcaseIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.jobs}+</h3>
              <p className="text-gray-600 font-medium">{t('stats.jobAvailable', 'JOB AVAILABLE')}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.companies}+</h3>
              <p className="text-gray-600 font-medium">{t('stats.company', 'COMPANY')}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.employees}+</h3>
              <p className="text-gray-600 font-medium">{t('stats.availableEmployee', 'AVAILABLE EMPLOYEE')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-green-600 font-semibold mb-2">{t('categories.popular', 'Popular Categories')}</p>
            <h2 className="text-3xl font-bold text-gray-900">{t('categories.browse', 'Browse Top Categories')}</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/jobs?category=${encodeURIComponent(category.name)}`}
                className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg hover:border-primary-300 transition-all group"
              >
                <div className="text-3xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500">{category.count} jobs</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Jobs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-green-600 font-semibold mb-2">{t('jobs.recent', 'Recent Job')}</p>
            <h2 className="text-3xl font-bold text-gray-900">{t('jobs.popular', 'Popular Listed Jobs')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow relative">
                {job.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-semibold">
                      {t('jobs.featured', 'Featured')}
                    </span>
                    <StarSolidIcon className="h-4 w-4 text-green-500 absolute -top-1 -right-1" />
                  </div>
                )}

                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl mr-3">
                    {job.company?.logo ? (
                      <img 
                        src={job.company.logo} 
                        alt={job.company.name || 'Company logo'}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <BriefcaseIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-500">{job.company?.name || job.company}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <UsersIcon className="h-4 w-4 mr-2" />
                    {job.vacancy} Vacancy
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">₹</span>
                    {job.salary}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    {job.location}
                  </div>
                  <div className="text-sm text-gray-500">{job.posted}</div>
                </div>

                <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-primary-50 hover:text-primary-600 transition-colors">
                  {t('jobs.applyNow', 'Apply Now')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-green-600 font-semibold mb-2">{t('reviews.our', 'Our Reviews')}</p>
            <h2 className="text-3xl font-bold text-gray-900">{t('reviews.customerSaying', 'What Our Customer Saying')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <div key={review.id} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl mr-3">
                    {review.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{review.name}</h4>
                    <p className="text-sm text-gray-600">{review.role}</p>
                  </div>
                </div>

                <div className="flex mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <StarSolidIcon key={i} className="h-5 w-5 text-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-700 leading-relaxed">{review.review}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-green-600 font-semibold mb-2">{t('blog.our', 'Our Blog')}</p>
            <h2 className="text-3xl font-bold text-gray-900">
              {t('blog.careerStatus', 'See How You Can Up Your Career Status')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                  <span className="text-6xl">{post.image}</span>
                </div>
                
                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-2">{post.date}</p>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  
                  <Link
                    to={`/blog/${post.id}`}
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {t('blog.readMore', 'Read More')}
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/blog"
              className="bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              {t('blog.seeAll', 'See All Blog')}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.aboutCompany', 'About Company')}</h3>
              <p className="text-gray-400 mb-6">
                LokalHunt connects local talent with opportunities in your city. 
                Building stronger communities through meaningful employment connections.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <MapIcon className="h-5 w-5 mr-3 text-green-500" />
                  <span className="text-sm">Hyderabad, India</span>
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 mr-3 text-green-500" />
                  <span className="text-sm">+91-9876543210</span>
                </div>
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 mr-3 text-green-500" />
                  <span className="text-sm">info@lokalhunt.com</span>
                </div>
              </div>
            </div>

            {/* For Candidates */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.forCandidates', 'For Candidates')}</h3>
              <ul className="space-y-2">
                <li><Link to="/jobs" className="text-gray-400 hover:text-white">{t('footer.browseJobs', 'Browse Jobs')}</Link></li>
                <li><Link to="/categories" className="text-gray-400 hover:text-white">{t('footer.browseCategory', 'Browse Category')}</Link></li>
                <li><Link to="/candidate/dashboard" className="text-gray-400 hover:text-white">{t('footer.dashboard', 'Candidate Dashboard')}</Link></li>
                <li><Link to="/job-alerts" className="text-gray-400 hover:text-white">{t('footer.jobAlert', 'Job Alert')}</Link></li>
                <li><Link to="/candidate/bookmarks" className="text-gray-400 hover:text-white">{t('footer.bookmarks', 'My Bookmarks')}</Link></li>
              </ul>
            </div>

            {/* For Employers */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.forEmployer', 'For Employer')}</h3>
              <ul className="space-y-2">
                <li><Link to="/candidates" className="text-gray-400 hover:text-white">{t('footer.browseCandidates', 'Browse Candidates')}</Link></li>
                <li><Link to="/employer/categories" className="text-gray-400 hover:text-white">{t('footer.browseCategory', 'Browse Category')}</Link></li>
                <li><Link to="/employer/dashboard" className="text-gray-400 hover:text-white">{t('footer.employerDashboard', 'Employer Dashboard')}</Link></li>
                <li><Link to="/post-job" className="text-gray-400 hover:text-white">{t('footer.postJob', 'Post a Job')}</Link></li>
                <li><Link to="/employer/bookmarks" className="text-gray-400 hover:text-white">{t('footer.bookmarks', 'My Bookmarks')}</Link></li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.quickLink', 'Quick Link')}</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-400 hover:text-white">{t('footer.aboutUs', 'About Us')}</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white">{t('footer.contactUs', 'Contact Us')}</Link></li>
                <li><Link to="/privacy" className="text-gray-400 hover:text-white">{t('footer.privacyPolicy', 'Privacy Policy')}</Link></li>
                <li><Link to="/terms" className="text-gray-400 hover:text-white">{t('footer.termsOfUse', 'Terms of Use')}</Link></li>
                <li><Link to="/faq" className="text-gray-400 hover:text-white">{t('footer.faq', 'FAQ')}</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 LokalHunt. {t('footer.allRights', 'All Rights Reserved')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing