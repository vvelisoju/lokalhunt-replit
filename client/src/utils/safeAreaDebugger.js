/**
 * Safe Area Debugger - Helps debug safe area values on Android devices
 * This utility helps verify that native Android safe area injection is working
 */

class SafeAreaDebugger {
  constructor() {
    this.isAndroidApp = window.Capacitor?.isNativePlatform() && window.Capacitor?.getPlatform() === 'android';
    this.debugElement = null;
    
    if (process.env.NODE_ENV === 'development') {
      this.init();
    }
  }

  init() {
    // Monitor safe area changes
    this.monitorSafeAreaChanges();
    
    // Log current safe area values
    this.logSafeAreaValues();
    
    // Set up periodic checking
    setInterval(() => {
      this.logSafeAreaValues();
    }, 2000);
  }

  monitorSafeAreaChanges() {
    // Watch for changes in CSS custom properties
    const observer = new MutationObserver(() => {
      this.logSafeAreaValues();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style']
    });
  }

  getSafeAreaValues() {
    const computedStyle = getComputedStyle(document.documentElement);
    
    return {
      // Native Android values (highest priority)
      native: {
        top: computedStyle.getPropertyValue('--safe-area-inset-top').trim() || 'not set',
        bottom: computedStyle.getPropertyValue('--safe-area-inset-bottom').trim() || 'not set',
        left: computedStyle.getPropertyValue('--safe-area-inset-left').trim() || 'not set',
        right: computedStyle.getPropertyValue('--safe-area-inset-right').trim() || 'not set'
      },
      // CSS env() values (fallback)
      cssEnv: {
        top: computedStyle.getPropertyValue('env(safe-area-inset-top)') || 'not supported',
        bottom: computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || 'not supported',
        left: computedStyle.getPropertyValue('env(safe-area-inset-left)') || 'not supported',
        right: computedStyle.getPropertyValue('env(safe-area-inset-right)') || 'not supported'
      },
      // Final computed values
      computed: {
        top: computedStyle.getPropertyValue('--safe-area-inset-top') || 
             computedStyle.getPropertyValue('env(safe-area-inset-top)') || '24px',
        bottom: computedStyle.getPropertyValue('--safe-area-inset-bottom') || 
               computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '24px',
        left: computedStyle.getPropertyValue('--safe-area-inset-left') || 
             computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0px',
        right: computedStyle.getPropertyValue('--safe-area-inset-right') || 
              computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0px'
      }
    };
  }

  logSafeAreaValues() {
    const values = this.getSafeAreaValues();
    
    console.group('🔍 Safe Area Debug - LokalHunt');
    console.log('📱 Platform:', this.isAndroidApp ? 'Android App' : 'Web Browser');
    console.log('🔧 Native Android Values:', values.native);
    console.log('🌐 CSS env() Values:', values.cssEnv);
    console.log('✅ Final Computed Values:', values.computed);
    
    if (this.isAndroidApp && values.native.top !== 'not set') {
      console.log('✅ SUCCESS: Native Android safe area injection is working!');
    } else if (this.isAndroidApp) {
      console.log('⚠️ WARNING: Native Android safe area values not found. Check MainActivity.java implementation.');
    }
    
    console.groupEnd();
  }

  createDebugOverlay() {
    if (this.debugElement) return;
    
    this.debugElement = document.createElement('div');
    this.debugElement.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px;
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
      z-index: 9999;
      max-width: 200px;
    `;
    
    document.body.appendChild(this.debugElement);
    this.updateDebugOverlay();
  }

  updateDebugOverlay() {
    if (!this.debugElement) return;
    
    const values = this.getSafeAreaValues();
    this.debugElement.innerHTML = `
      <strong>Safe Area Debug</strong><br>
      Native Top: ${values.native.top}<br>
      CSS env() Top: ${values.cssEnv.top}<br>
      Final Top: ${values.computed.top}
    `;
  }

  removeDebugOverlay() {
    if (this.debugElement) {
      this.debugElement.remove();
      this.debugElement = null;
    }
  }

  // Public method to toggle debug overlay
  toggleDebugOverlay() {
    if (this.debugElement) {
      this.removeDebugOverlay();
    } else {
      this.createDebugOverlay();
      setInterval(() => this.updateDebugOverlay(), 1000);
    }
  }
}

// Create global instance for debugging
if (typeof window !== 'undefined') {
  window.safeAreaDebugger = new SafeAreaDebugger();
  
  // Expose toggle function globally for easy debugging
  window.toggleSafeAreaDebug = () => {
    window.safeAreaDebugger.toggleDebugOverlay();
  };
}

export default SafeAreaDebugger;