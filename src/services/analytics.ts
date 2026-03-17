/**
 * Analytics Service
 * Google Analytics 4 tracking for conversion funnel and user behavior
 */

// Google Analytics 4 Measurement ID
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

// Initialize Google Analytics
export function initializeAnalytics() {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') {
    console.warn('[Analytics] GA_MEASUREMENT_ID not configured');
    return;
  }

  // Initialize dataLayer and gtag function
  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(args);
  }
  (window as any).gtag = gtag;

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;

  // Configure GA after script loads
  script.onload = () => {
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: true,
    });
    console.log('[Analytics] Google Analytics initialized and configured');
  };

  document.head.appendChild(script);
  console.log('[Analytics] Google Analytics loading...');
}

// Track custom events
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, any>
) {
  if (typeof window === 'undefined' || !(window as any).gtag) {
    console.log('[Analytics] Event (not tracked):', eventName, eventParams);
    return;
  }

  (window as any).gtag('event', eventName, eventParams);
  console.log('[Analytics] Event tracked:', eventName, eventParams);
}

// Acquisition Events
export function trackSignUp(method: 'email' | 'google' | 'referral', referralCode?: string) {
  trackEvent('sign_up', {
    method,
    referral_code: referralCode || 'none',
  });
}

export function trackResumeUploaded(format: string, fileSize: number) {
  trackEvent('resume_uploaded', {
    format,
    file_size_kb: Math.round(fileSize / 1024),
  });
}

export function trackJobDescriptionAdded(method: 'paste' | 'url', length: number) {
  trackEvent('job_description_added', {
    method,
    character_count: length,
  });
}

// Activation Events
export function trackOptimizationStarted(jobTitle?: string) {
  trackEvent('optimization_started', {
    job_title: jobTitle || 'unknown',
  });
}

export function trackOptimizationCompleted(data: {
  bulletsChanged: number;
  keywordsAdded: number;
  templateId: string;
  durationSeconds: number;
}) {
  trackEvent('optimization_completed', {
    bullets_changed: data.bulletsChanged,
    keywords_added: data.keywordsAdded,
    template_id: data.templateId,
    duration_seconds: data.durationSeconds,
  });
}

export function trackTemplateChanged(oldTemplateId: string, newTemplateId: string) {
  trackEvent('template_changed', {
    from_template: oldTemplateId,
    to_template: newTemplateId,
  });
}

// Revenue Events
export function trackUpgradeViewed(fromFeature: string) {
  trackEvent('upgrade_viewed', {
    trigger: fromFeature,
  });
}

export function trackPaymentStarted(plan: string, price: number) {
  trackEvent('begin_checkout', {
    currency: 'USD',
    value: price,
    items: [{ item_name: plan, price }],
  });
}

export function trackPaymentCompleted(plan: string, price: number) {
  trackEvent('purchase', {
    currency: 'USD',
    value: price,
    transaction_id: Date.now().toString(),
    items: [{ item_name: plan, price }],
  });
}

// Retention Events
export function trackReturnVisit(daysSinceLastVisit: number) {
  trackEvent('return_visit', {
    days_since_last_visit: daysSinceLastVisit,
  });
}

export function trackSecondOptimization() {
  trackEvent('second_optimization', {});
}

export function trackReferralShared(method: 'copy' | 'email' | 'social') {
  trackEvent('referral_shared', {
    share_method: method,
  });
}

// Product Usage Events
export function trackExport(format: 'pdf' | 'docx', templateId: string) {
  trackEvent('export_resume', {
    format,
    template_id: templateId,
  });
}

export function trackFeatureUsed(feature: string) {
  trackEvent('feature_used', {
    feature_name: feature,
  });
}

// Funnel tracking
export function trackFunnelStep(step: string, stepNumber: number) {
  trackEvent('funnel_progress', {
    step_name: step,
    step_number: stepNumber,
  });
}

// Error tracking
export function trackError(errorType: string, errorMessage: string) {
  trackEvent('error_occurred', {
    error_type: errorType,
    error_message: errorMessage,
  });
}

// Page views (for SPAs)
export function trackPageView(pagePath: string, pageTitle: string) {
  if (typeof window === 'undefined' || !(window as any).gtag) {
    return;
  }

  (window as any).gtag('config', GA_MEASUREMENT_ID, {
    page_path: pagePath,
    page_title: pageTitle,
  });
}
