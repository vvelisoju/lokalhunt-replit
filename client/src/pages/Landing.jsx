import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { publicApi } from "../services/publicApi";
import { useAuth } from "../context/AuthContext";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import JobFilters from "../components/ui/JobFilters";
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
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";

const Landing = () => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Helper function to get correct job route based on status
  const getJobRoute = (jobId, status) => {
    if (status === "DRAFT" || status === "PENDING_APPROVAL") {
      return `/jobs/${jobId}/preview`;
    }
    return `/jobs/${jobId}`;
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [stats, setStats] = useState({
    jobs: 0,
    companies: 0,
    employees: 0,
  });
  const [categories, setCategories] = useState([]);
  const [popularJobs, setPopularJobs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load landing page data
  useEffect(() => {
    loadLandingPageData();
  }, []);

  const loadLandingPageData = async () => {
    try {
      setLoading(true);

      // Load all data in parallel
      const [statsRes, categoriesRes, jobsRes, reviewsRes] = await Promise.all([
        publicApi.getStats(),
        publicApi.getCategories(),
        publicApi.getFeaturedJobs(4),
        publicApi.getTestimonials(),
      ]);

      setStats({
        jobs: statsRes.data?.jobs || 0,
        companies: statsRes.data?.companies || 0,
        employees: statsRes.data?.candidates || 0,
      });

      setCategories(categoriesRes.data || []);
      setPopularJobs(jobsRes.data || []);
      setReviews(reviewsRes.data || []);
    } catch (error) {
      console.error("Error loading landing page data:", error);
      // Keep default empty states
    } finally {
      setLoading(false);
    }
  };

  // Static popular jobs fallback (remove this when backend is working)
  const staticJobs = [
    // Fallback jobs - will be replaced by API data
  ];

  // Blog posts
  const blogPosts = [
    {
      id: 1,
      title:
        "Master Your Career: How to Excel as a Hiring Manager in Every Step",
      date: "07 May 2025",
      excerpt:
        "Learn the essential skills and strategies to become an effective hiring manager.",
      image: "📚",
    },
    {
      id: 2,
      title:
        "From Applications to Offers: How to Navigate Your Job Search Successfully",
      date: "07 May 2025",
      excerpt: "A comprehensive guide to job searching in the digital age.",
      image: "🚀",
    },
    {
      id: 3,
      title:
        "The Future of Job Management: Why Digital Platforms are Leading the Way",
      date: "07 May 2025",
      excerpt:
        "Discover how technology is transforming recruitment and job searching.",
      image: "🔮",
    },
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 to-secondary-600 relative overflow-hidden hero-bg">
        <div className="absolute inset-0 bg-black/10"></div>
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-secondary-400/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-primary-300/20 rounded-full blur-lg"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="mb-4">
              <span className="inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-secondary-500 to-primary-500 text-white shadow-lg backdrop-blur-sm">
                <span className="mr-2">🎉</span>
                India's Only Local Professional Platform -
                <span className="ml-1 font-bold text-yellow-200">FREE</span>
                <span className="ml-1">for Everyone!</span>
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {t("hero.findJobs", "Find Jobs Near You.")}
              <br />
              <span className="text-3xl md:text-5xl">
                {t("hero.hireLocal", "Hire Local Talent Fast.")}
              </span>
            </h1>
            <p className="text-xl text-white text-opacity-95 mb-8 max-w-2xl mx-auto">
              {t(
                "hero.description",
                "LokalHunt connects you with the best local opportunities and talent — all in one easy-to-use platform.",
              )}
            </p>
            <div className="flex justify-center mb-12">
              <div className="flex flex-wrap justify-center gap-4 text-white text-opacity-90">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-300 rounded-full mr-2"></span>
                  <span className="font-semibold">100% FREE</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-300 rounded-full mr-2"></span>
                  <span className="font-semibold">Local Focus</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-300 rounded-full mr-2"></span>
                  <span className="font-semibold">Professional Network</span>
                </div>
              </div>
            </div>

            {/* Job Filters Component */}
            <div className="max-w-6xl mx-auto">
              <JobFilters
                filters={{
                  search: searchQuery,
                  location: location,
                  category: selectedCategory,
                  jobType: [],
                  experience: [],
                  gender: "",
                  education: [],
                  salaryRange: "",
                  sortBy: "newest",
                }}
                onFiltersChange={(newFilters) => {
                  // Only update state, don't navigate immediately
                  setSearchQuery(newFilters.search || "");
                  setLocation(newFilters.location || "");
                  setSelectedCategory(newFilters.category || "");
                }}
                onSearch={(filters) => {
                  // Navigate only when search is triggered
                  const params = new URLSearchParams();
                  if (filters.search) params.append("search", filters.search);
                  if (filters.location)
                    params.append("location", filters.location);
                  if (filters.category)
                    params.append("category", filters.category);
                  if (filters.jobType?.length > 0)
                    params.append("jobType", filters.jobType.join(","));
                  if (filters.experience?.length > 0)
                    params.append("experience", filters.experience.join(","));
                  if (filters.gender) params.append("gender", filters.gender);
                  if (filters.education?.length > 0)
                    params.append("education", filters.education.join(","));
                  if (filters.salaryRange)
                    params.append("salaryRange", filters.salaryRange);
                  if (filters.sortBy) params.append("sortBy", filters.sortBy);

                  // Use navigate instead of window.location.href to prevent page refresh
                  navigate(`/jobs?${params.toString()}`);
                }}
                showAdvancedFilters={true}
                compact={true}
                className="hero-filters"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BriefcaseIcon className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {stats.jobs}+
              </h3>
              <p className="text-gray-600 font-medium">
                {t("stats.jobAvailable", "JOB AVAILABLE")}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BuildingOfficeIcon className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {stats.companies}+
              </h3>
              <p className="text-gray-600 font-medium">
                {t("stats.company", "COMPANY")}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {stats.employees}+
              </h3>
              <p className="text-gray-600 font-medium">
                {t("stats.availableEmployee", "AVAILABLE EMPLOYEE")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary-600 font-semibold mb-2">
              {t("categories.popular", "Popular Categories")}
            </p>
            <h2 className="text-3xl font-bold text-gray-900">
              {t("categories.browse", "Browse Top Categories")}
            </h2>
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
            <div className="flex justify-center items-center mb-4">
              <span className="bg-primary-100 text-primary-600 px-4 py-2 rounded-full text-sm font-semibold mr-4">
                {t("jobs.recent", "Recent Jobs")}
              </span>
              <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-bold">
                🎉 100% FREE Platform
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t("jobs.popular", "Popular Listed Jobs")}
            </h2>
            <p className="text-gray-600">
              Discover opportunities on India's only local professional platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {popularJobs.slice(0, 4).map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative border border-gray-100"
              >
                {job.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                      <StarSolidIcon className="h-3 w-3 mr-1" />
                      {t("jobs.featured", "Featured")}
                    </span>
                  </div>
                )}

                <div className="flex items-start mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl flex items-center justify-center text-xl mr-4 border border-primary-100">
                    {job.company?.logo ? (
                      <img
                        src={job.company.logo}
                        alt={job.company.name || "Company logo"}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <BriefcaseIcon className="w-7 h-7 text-primary-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1 leading-tight">
                      {job.title}
                    </h3>
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      {job.company?.name || job.company}
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center text-gray-600">
                        <UsersIcon className="h-4 w-4 mr-2 text-primary-500" />
                        <span>{job.vacancies || job.vacancy || 1} Vacancy</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="mr-2 text-primary-500 font-semibold">
                          ₹
                        </span>
                        <span className="font-medium">{job.salary}</span>
                      </div>
                      <div className="flex items-center text-gray-600 col-span-2">
                        <MapPinIcon className="h-4 w-4 mr-2 text-primary-500 flex-shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    {new Date(job.postedAt).toLocaleDateString()}
                  </span>
                  <Link
                    to={getJobRoute(job.id, job.status)}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2 rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 transform hover:scale-105 text-sm"
                  >
                    {t("jobs.viewJob", "View Job")}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="mb-4">
              <span className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold text-sm shadow-lg">
                <span className="mr-2">🚀</span>
                Join India's Only Local Professional Platform - FREE Forever!
              </span>
            </div>
            <Link
              to="/jobs"
              className="inline-flex items-center bg-white text-primary-600 border-2 border-primary-500 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors shadow-md"
            >
              Browse All Jobs
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary-600 font-semibold mb-2">
              {t("reviews.our", "Our Reviews")}
            </p>
            <h2 className="text-3xl font-bold text-gray-900">
              {t("reviews.customerSaying", "What Our Customer Saying")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <div key={review.id} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl mr-3">
                    {review.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {review.name}
                    </h4>
                    <p className="text-sm text-gray-600">{review.role}</p>
                  </div>
                </div>

                <div className="flex mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <StarSolidIcon
                      key={i}
                      className="h-5 w-5 text-yellow-400"
                    />
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
            <p className="text-primary-600 font-semibold mb-2">
              {t("blog.our", "Our Blog")}
            </p>
            <h2 className="text-3xl font-bold text-gray-900">
              {t("blog.careerStatus", "See How You Can Up Your Career Status")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                  <span className="text-6xl">{post.image}</span>
                </div>

                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-2">{post.date}</p>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <Link
                    to={`/blog/${post.id}`}
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {t("blog.readMore", "Read More")}
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
              {t("blog.seeAll", "See All Blog")}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
