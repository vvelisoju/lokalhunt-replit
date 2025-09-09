
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Get safe area inset values from CSS custom properties
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    const safeAreaTop = computedStyle.getPropertyValue('--safe-area-inset-top').trim() || '0px';
    const safeAreaTopValue = parseFloat(safeAreaTop) || 0;

    // Scroll to top accounting for safe area insets
    const scrollTarget = Math.max(0, safeAreaTopValue);
    
    // Scroll main window
    window.scrollTo({
      top: scrollTarget,
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
          top: scrollTarget,
          left: 0,
          behavior: 'instant'
        });
      }
    });

    // For mobile layouts with fixed headers, also reset any transforms
    const body = document.body;
    if (body) {
      body.style.transform = '';
      body.scrollTop = scrollTarget;
    }

    // Reset document element scroll with safe area consideration
    const documentElement = document.documentElement;
    if (documentElement) {
      documentElement.scrollTop = scrollTarget;
    }

    // Handle safe area aware content positioning
    const safeAreaAwareElements = document.querySelectorAll('.safe-area-full, .mobile-header, .fixed-header');
    safeAreaAwareElements.forEach(element => {
      if (element.scrollTop !== undefined) {
        element.scrollTop = 0;
      }
    });

    // Debug log for development (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('ScrollToTop: Applied scroll with safe area top:', safeAreaTop, 'Target:', scrollTarget);
    }

  }, [pathname]);

  return null;
};

export default ScrollToTop;
