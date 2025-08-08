'use client';

import { useEffect } from 'react';

// Extend Window interface to include snap
declare global {
  interface Window {
    snap: any;
  }
}

const MidtransScript = () => {
  useEffect(() => {
    // Determine environment
    const isProduction = process.env.NODE_ENV === 'production' || 
                        window.location.hostname.includes('amplifyapp.com') ||
                        window.location.hostname.includes('learning.kinabaruservice.info');
    
    // Set Midtrans configuration based on environment
    const snapUrl = isProduction 
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
    
    const clientKey = isProduction
      ? process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-gMyrpl3ZFmLE0wJG'
      : 'SB-Mid-client-gMyrpl3ZFmLE0wJG';
    
    console.log('Midtrans Environment Detection:');
    console.log('- Is Production:', isProduction);
    console.log('- Hostname:', window.location.hostname);
    console.log('- Snap URL:', snapUrl);
    console.log('- Client Key:', clientKey);
    
    // Remove existing Midtrans script if any
    const existingScript = document.querySelector('script[src*="snap.js"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Create and load Midtrans Snap script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = snapUrl;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;
    
    script.onload = () => {
      console.log('Midtrans Snap script loaded successfully');
      console.log('window.snap available:', typeof window.snap !== 'undefined');
    };
    
    script.onerror = () => {
      console.error('Failed to load Midtrans Snap script');
    };
    
    document.head.appendChild(script);
    
    // Cleanup function
    return () => {
      const scriptToRemove = document.querySelector('script[src*="snap.js"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);
  
  return null;
};

export default MidtransScript;