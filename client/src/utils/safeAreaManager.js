// Safe Area Detection and CSS Injection for Mobile Apps
import { Capacitor } from '@capacitor/core';

class SafeAreaManager {
  constructor() {
    this.isInitialized = false;
    this.platform = Capacitor.getPlatform();
    this.isNative = Capacitor.isNativePlatform();
    
    console.log('🔍 SafeArea: Platform detected:', this.platform, 'Native:', this.isNative);
  }

  // Initialize safe area detection
  init() {
    if (this.isInitialized) return;

    console.log('🚀 SafeArea: Initializing safe area management');
    
    // Add platform classes to body
    this.addPlatformClasses();
    
    // Set up safe area detection
    this.detectSafeAreas();
    
    // Set up viewport meta for proper scaling
    this.setupViewport();
    
    // Listen for orientation changes
    this.setupOrientationListener();
    
    this.isInitialized = true;
    console.log('✅ SafeArea: Initialization completed');
  }

  // Add platform-specific CSS classes
  addPlatformClasses() {
    const body = document.body;
    
    // Add Capacitor classes
    if (this.isNative) {
      body.classList.add('capacitor-mobile');
      body.classList.add(`capacitor-${this.platform}`);
      console.log('📱 SafeArea: Added mobile platform classes');
    }
    
    // Force full-screen layout
    const html = document.documentElement;
    html.style.height = '100vh';
    html.style.height = '100dvh';
    body.style.minHeight = '100vh';
    body.style.minHeight = '100dvh';
    
    console.log('📐 SafeArea: Applied full-screen layout');
  }

  // Detect and apply safe areas
  detectSafeAreas() {
    // Method 1: Try to get native safe areas (if MainActivity is working)
    this.tryNativeSafeAreas();
    
    // Method 2: Use CSS env() with enhanced fallbacks
    this.applyCSSEnvSafeAreas();
    
    // Method 3: JavaScript-based detection for Android
    this.detectAndroidSafeAreas();
    
    // Apply safe areas immediately
    setTimeout(() => this.applySafeAreas(), 100);
    setTimeout(() => this.applySafeAreas(), 500);  // Double-check after layout
    setTimeout(() => this.applySafeAreas(), 1000); // Triple-check
  }

  // Try to get native safe areas from MainActivity
  tryNativeSafeAreas() {
    const root = document.documentElement;
    const nativeTop = root.style.getPropertyValue('--safe-area-inset-top');
    const nativeBottom = root.style.getPropertyValue('--safe-area-inset-bottom');
    
    if (nativeTop && nativeBottom) {
      console.log('🎯 SafeArea: Native safe areas detected!', { top: nativeTop, bottom: nativeBottom });
      return true;
    }
    
    console.log('⚠️ SafeArea: No native safe areas found, using fallbacks');
    return false;
  }

  // Apply CSS env() safe areas with better fallbacks
  applyCSSEnvSafeAreas() {
    const root = document.documentElement;
    
    // Enhanced CSS variables with better Android fallbacks
    root.style.setProperty('--safe-area-inset-top', 'max(env(safe-area-inset-top), 44px)');
    root.style.setProperty('--safe-area-inset-bottom', 'max(env(safe-area-inset-bottom), 48px)');
    root.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left, 0px)');
    root.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right, 0px)');
    
    console.log('📏 SafeArea: Applied CSS env() safe areas with fallbacks');
  }

  // JavaScript-based Android safe area detection
  detectAndroidSafeAreas() {
    if (this.platform !== 'android') return;

    const viewport = window.visualViewport || window;
    const screen = window.screen;
    
    // Estimate status bar and navigation bar heights
    const statusBarHeight = this.estimateStatusBarHeight();
    const navBarHeight = this.estimateNavigationBarHeight();
    
    console.log('🤖 SafeArea: Android detection - StatusBar:', statusBarHeight + 'px', 'NavBar:', navBarHeight + 'px');
    
    // Apply Android-specific safe areas
    const root = document.documentElement;
    root.style.setProperty('--android-status-bar-height', statusBarHeight + 'px');
    root.style.setProperty('--android-navigation-bar-height', navBarHeight + 'px');
  }

  // Estimate Android status bar height
  estimateStatusBarHeight() {
    const userAgent = navigator.userAgent;
    const screenHeight = window.screen.height;
    
    // Common Android status bar heights based on device characteristics
    if (screenHeight >= 2400) {
      return 48; // High-res devices with notches/punch holes
    } else if (screenHeight >= 1920) {
      return 36; // Standard high-res devices
    } else {
      return 24; // Lower resolution devices
    }
  }

  // Estimate Android navigation bar height
  estimateNavigationBarHeight() {
    const screenHeight = window.screen.height;
    const innerHeight = window.innerHeight;
    const availHeight = window.screen.availHeight;
    
    // If using gesture navigation, it's typically smaller
    if (this.isGestureNavigation()) {
      return 24; // Gesture navigation indicator
    }
    
    // Traditional navigation buttons
    return 48;
  }

  // Detect if device uses gesture navigation
  isGestureNavigation() {
    // Gesture navigation typically results in smaller difference between screen and available height
    const heightDiff = window.screen.height - window.screen.availHeight;
    return heightDiff <= 50; // Rough estimation
  }

  // Apply calculated safe areas
  applySafeAreas() {
    const root = document.documentElement;
    const computedTop = getComputedStyle(root).getPropertyValue('--safe-area-inset-top').trim();
    const computedBottom = getComputedStyle(root).getPropertyValue('--safe-area-inset-bottom').trim();
    
    console.log('🎨 SafeArea: Applied safe areas - Top:', computedTop, 'Bottom:', computedBottom);
    
    // Force repaint
    document.body.style.transform = 'translateZ(0)';
    setTimeout(() => {
      document.body.style.transform = '';
    }, 10);
  }

  // Setup proper viewport meta tag
  setupViewport() {
    let viewport = document.querySelector('meta[name="viewport"]');
    
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    
    // Enhanced viewport for mobile apps
    viewport.content = 'width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no';
    
    console.log('📱 SafeArea: Updated viewport meta tag');
  }

  // Listen for orientation changes
  setupOrientationListener() {
    const handleOrientationChange = () => {
      console.log('🔄 SafeArea: Orientation changed, recalculating safe areas');
      setTimeout(() => this.detectSafeAreas(), 200);
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    
    console.log('🔄 SafeArea: Orientation listeners set up');
  }

  // Get current safe area values
  getSafeAreas() {
    const root = document.documentElement;
    const style = getComputedStyle(root);
    
    return {
      top: style.getPropertyValue('--safe-area-inset-top'),
      bottom: style.getPropertyValue('--safe-area-inset-bottom'),
      left: style.getPropertyValue('--safe-area-inset-left'),
      right: style.getPropertyValue('--safe-area-inset-right')
    };
  }
}

// Create singleton instance
const safeAreaManager = new SafeAreaManager();

// Export for use in React components
export default safeAreaManager;

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  // Initialize immediately
  safeAreaManager.init();
  
  // Also initialize on DOMContentLoaded as backup
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => safeAreaManager.init());
  }
  
  // Debug helper
  window.safeAreaManager = safeAreaManager;
}