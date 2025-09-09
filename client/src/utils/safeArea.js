
// Safe Area utility for Capacitor apps
// Uses native CSS env() variables and applies them only when actually needed

class SafeAreaManager {
  constructor() {
    this.isCapacitor = false;
    this.safeAreas = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    };
    this.hasSafeAreasSupport = false;
    this.isInitialized = false;
    this.nativeInsetsReceived = false;
    
    // Expose globally for native bridge
    window.SafeAreaManager = this;
  }

  async init() {
    try {
      // Check if we're running in Capacitor
      if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        this.isCapacitor = true;
        console.log('Running in Capacitor environment');
        
        const platform = window.Capacitor.getPlatform();
        console.log('Platform:', platform);
        
        if (platform === 'android') {
          // For Android, wait for native insets (with timeout fallback)
          console.log('🤖 Android detected - waiting for native insets...');
          
          // Wait up to 2 seconds for native insets
          const timeout = new Promise(resolve => setTimeout(resolve, 2000));
          const nativeInsets = new Promise(resolve => {
            const checkForInsets = () => {
              if (this.nativeInsetsReceived || window.androidSafeAreaInsets) {
                resolve(true);
              } else {
                setTimeout(checkForInsets, 100);
              }
            };
            checkForInsets();
          });
          
          await Promise.race([nativeInsets, timeout]);
          
          if (!this.nativeInsetsReceived && window.androidSafeAreaInsets) {
            // Fallback: use any existing Android insets
            this.updateFromNative(window.androidSafeAreaInsets);
          }
          
          if (!this.nativeInsetsReceived) {
            console.log('⚠️ No native Android insets received, falling back to CSS detection');
            await this.detectSafeAreaSupport();
            this.applySafeAreaStyles();
          }
        } else {
          // For iOS and other platforms, use CSS detection
          await this.detectSafeAreaSupport();
          if (this.hasSafeAreasSupport) {
            await this.updateSafeAreas();
          } else {
            this.applySafeAreaStyles(); // Apply zero values
          }
        }
        
        // Listen for orientation changes
        window.addEventListener('orientationchange', () => {
          setTimeout(() => this.handleOrientationChange(), 300);
        });
      } else {
        console.log('Running in web environment - checking for safe area support');
        await this.detectSafeAreaSupport();
        this.applySafeAreaStyles();
      }

      this.isInitialized = true;
      console.log('Safe area manager initialization completed', {
        hasSafeAreasSupport: this.hasSafeAreasSupport,
        safeAreas: this.safeAreas,
        nativeInsetsReceived: this.nativeInsetsReceived
      });
      
    } catch (error) {
      console.warn('SafeArea initialization error:', error);
    }
  }

  async detectSafeAreaSupport() {
    return new Promise((resolve) => {
      // Create a test element to check actual env() values
      const testDiv = document.createElement('div');
      testDiv.style.position = 'absolute';
      testDiv.style.visibility = 'hidden';
      testDiv.style.pointerEvents = 'none';
      testDiv.style.paddingTop = 'env(safe-area-inset-top, 0px)';
      testDiv.style.paddingBottom = 'env(safe-area-inset-bottom, 0px)';
      testDiv.style.paddingLeft = 'env(safe-area-inset-left, 0px)';
      testDiv.style.paddingRight = 'env(safe-area-inset-right, 0px)';
      
      document.body.appendChild(testDiv);
      
      // Wait for next frame to ensure styles are computed
      requestAnimationFrame(() => {
        const computedStyle = getComputedStyle(testDiv);
        const topInset = parseFloat(computedStyle.paddingTop) || 0;
        const bottomInset = parseFloat(computedStyle.paddingBottom) || 0;
        const leftInset = parseFloat(computedStyle.paddingLeft) || 0;
        const rightInset = parseFloat(computedStyle.paddingRight) || 0;
        
        document.body.removeChild(testDiv);

        // Device has safe areas if any env() value is > 0
        this.hasSafeAreasSupport = topInset > 0 || bottomInset > 0 || leftInset > 0 || rightInset > 0;
        
        if (this.hasSafeAreasSupport) {
          this.safeAreas = {
            top: topInset,
            bottom: bottomInset,
            left: leftInset,
            right: rightInset
          };
          console.log('✅ Device has safe areas:', this.safeAreas);
        } else {
          console.log('ℹ️ Device does not have safe areas - will use zero values');
          this.safeAreas = { top: 0, bottom: 0, left: 0, right: 0 };
        }
        
        resolve();
      });
    });
  }

  async handleOrientationChange() {
    console.log('🔄 SafeArea: Orientation changed, rechecking safe areas');
    await this.detectSafeAreaSupport();
    this.applySafeAreaStyles();
  }

  async updateSafeAreas() {
    try {
      if (!this.hasSafeAreasSupport) {
        console.log('Device does not need safe areas');
        return;
      }

      // Re-detect safe areas (they might change on orientation)
      await this.detectSafeAreaSupport();
      
      // Apply the safe area values to CSS custom properties
      this.applySafeAreaStyles();
      
    } catch (error) {
      console.warn('Failed to update safe area insets:', error);
    }
  }

  applySafeAreaStyles() {
    const root = document.documentElement;
    
    if (this.hasSafeAreasSupport) {
      // Device has safe areas - use env() values with detected fallbacks
      root.style.setProperty('--safe-area-inset-top', `max(${this.safeAreas.top}px, env(safe-area-inset-top, 0px))`);
      root.style.setProperty('--safe-area-inset-bottom', `max(${this.safeAreas.bottom}px, env(safe-area-inset-bottom, 0px))`);
      root.style.setProperty('--safe-area-inset-left', `max(${this.safeAreas.left}px, env(safe-area-inset-left, 0px))`);
      root.style.setProperty('--safe-area-inset-right', `max(${this.safeAreas.right}px, env(safe-area-inset-right, 0px))`);
      
      console.log('📏 Applied safe area styles for device with safe areas:', this.safeAreas);
    } else {
      // Device doesn't have safe areas - aggressively override ALL CSS with zero values
      root.style.setProperty('--safe-area-inset-top', '0px', 'important');
      root.style.setProperty('--safe-area-inset-bottom', '0px', 'important');
      root.style.setProperty('--safe-area-inset-left', '0px', 'important');
      root.style.setProperty('--safe-area-inset-right', '0px', 'important');
      
      // Override Android-specific fallbacks too
      root.style.setProperty('--android-status-bar-height', '0px', 'important');
      root.style.setProperty('--android-navigation-bar-height', '0px', 'important');
      
      // Remove body classes that could trigger CSS fallbacks
      document.body.classList.remove('capacitor-mobile', 'capacitor-android', 'capacitor-ios');
      
      // Add a class to explicitly mark as no-safe-areas device
      document.body.classList.add('no-safe-areas-device');
      
      console.log('📏 Applied zero safe area styles for regular device - NO fallbacks');
    }

    // Set fallback custom properties for backwards compatibility
    root.style.setProperty('--safe-area-top-fallback', this.safeAreas.top + 'px');
    root.style.setProperty('--safe-area-bottom-fallback', this.safeAreas.bottom + 'px');
    root.style.setProperty('--safe-area-left-fallback', this.safeAreas.left + 'px');
    root.style.setProperty('--safe-area-right-fallback', this.safeAreas.right + 'px');
  }

  // Get current safe area values
  getSafeAreas() {
    return { ...this.safeAreas };
  }

  // Check if device has safe areas
  hasSafeAreas() {
    return this.hasSafeAreasSupport;
  }

  // Get safe area aware viewport height
  getViewportHeight() {
    if (this.hasSafeAreasSupport) {
      return window.innerHeight - this.safeAreas.top - this.safeAreas.bottom;
    }
    return window.innerHeight;
  }

  // Method called by native Android to update insets
  updateFromNative(insets) {
    console.log('🤖 Received native Android insets:', insets);
    
    if (insets && typeof insets === 'object') {
      this.nativeInsetsReceived = true;
      this.hasSafeAreasSupport = insets.hasInsets || false;
      
      if (this.hasSafeAreasSupport) {
        this.safeAreas = {
          top: insets.top || 0,
          bottom: insets.bottom || 0,
          left: insets.left || 0,
          right: insets.right || 0
        };
        console.log('✅ Native Android safe areas detected:', this.safeAreas);
      } else {
        this.safeAreas = { top: 0, bottom: 0, left: 0, right: 0 };
        console.log('ℹ️ Native Android reports no safe areas needed');
      }
      
      // Apply the native values
      this.applySafeAreaStyles();
    }
  }

  // Manual refresh method for testing
  async refresh() {
    await this.detectSafeAreaSupport();
    this.applySafeAreaStyles();
  }
}

// Create and export singleton instance
const safeAreaManager = new SafeAreaManager();

export default safeAreaManager;

// Export utility functions
export const getSafeAreas = () => safeAreaManager.getSafeAreas();
export const hasSafeAreas = () => safeAreaManager.hasSafeAreas();
export const getViewportHeight = () => safeAreaManager.getViewportHeight();
export const refreshSafeAreas = () => safeAreaManager.refresh();
