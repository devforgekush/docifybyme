// Performance monitoring utilities

interface PerformanceMetrics {
  pageLoadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
  timeToInteractive: number
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {}
  private observers: PerformanceObserver[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers()
      this.capturePageLoadMetrics()
    }
  }

  private initializeObservers() {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          this.metrics.largestContentfulPaint = lastEntry.startTime
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.push(lcpObserver)
      } catch (error) {
        console.warn('LCP observer failed:', error)
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
                  const firstEntry = entries[0] as PerformanceEntry & { processingStart: number }
        this.metrics.firstInputDelay = firstEntry.processingStart - firstEntry.startTime
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
        this.observers.push(fidObserver)
      } catch (error) {
        console.warn('FID observer failed:', error)
      }

      // Cumulative Layout Shift
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0
                  for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput: boolean; value: number }
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value
          }
        }
          this.metrics.cumulativeLayoutShift = clsValue
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.push(clsObserver)
      } catch (error) {
        console.warn('CLS observer failed:', error)
      }
    }
  }

  private capturePageLoadMetrics() {
    window.addEventListener('load', () => {
      // Page load time
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigationEntry) {
        this.metrics.pageLoadTime = navigationEntry.loadEventEnd - navigationEntry.loadEventStart
      }

      // First Contentful Paint
      const paintEntries = performance.getEntriesByType('paint')
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
      if (fcpEntry) {
        this.metrics.firstContentfulPaint = fcpEntry.startTime
      }

      // Time to Interactive (approximation)
      this.metrics.timeToInteractive = performance.now()

      // Log metrics in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Performance Metrics:', this.metrics)
      }

      // Send to analytics in production
      if (process.env.NODE_ENV === 'production') {
        this.sendMetricsToAnalytics()
      }
    })
  }

  private sendMetricsToAnalytics() {
    // Send metrics to your analytics service
    // Example: Google Analytics, Sentry, or custom endpoint
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metrics: this.metrics,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
    }).catch(error => {
      console.warn('Failed to send performance metrics:', error)
    })
  }

  // Manual metric tracking
  trackEvent(eventName: string, data?: Record<string, unknown>) {
    const event = {
      name: eventName,
      data,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : ''
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Event:', event)
    }

    if (process.env.NODE_ENV === 'production') {
      // Send to analytics
      fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }).catch(error => {
        console.warn('Failed to send performance event:', error)
      })
    }
  }

  // Get current metrics
  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics }
  }

  // Cleanup observers
  destroy() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Hook for React components
export function usePerformanceTracking() {
  const trackEvent = (eventName: string, data?: Record<string, unknown>) => {
    performanceMonitor.trackEvent(eventName, data)
  }

  const getMetrics = () => performanceMonitor.getMetrics()

  return { trackEvent, getMetrics }
}

// Utility functions
export function measureTime<T>(fn: () => T, name: string): T {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  
  performanceMonitor.trackEvent(`measure:${name}`, {
    duration: end - start
  })
  
  return result
}

export async function measureAsyncTime<T>(
  fn: () => Promise<T>, 
  name: string
): Promise<T> {
  const start = performance.now()
  const result = await fn()
  const end = performance.now()
  
  performanceMonitor.trackEvent(`measure:${name}`, {
    duration: end - start
  })
  
  return result
}
