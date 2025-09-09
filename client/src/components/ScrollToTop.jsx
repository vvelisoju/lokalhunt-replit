
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Use instant instead of smooth for immediate effect
    });

    // Also scroll any main content containers to top
    const scrollContainers = [
      document.querySelector('main'), // Main content areas
      document.querySelector('.overflow-y-auto'), // Scrollable containers
      document.querySelector('[data-scroll-container]'), // Custom scroll containers
      document.getElementById('root') // Root container
    ];

    scrollContainers.forEach(container => {
      if (container) {
        container.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant'
        });
      }
    });

    // For mobile layouts with fixed headers, also reset any transforms
    const body = document.body;
    if (body) {
      body.style.transform = '';
      body.scrollTop = 0;
    }

    // Reset document element scroll
    const documentElement = document.documentElement;
    if (documentElement) {
      documentElement.scrollTop = 0;
    }

  }, [pathname]);

  return null;
};

export default ScrollToTop;
