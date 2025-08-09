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
    // Always use sandbox configuration
    const snapUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-gMyrpl3ZFmLE0wJG';
    
    console.log('Midtrans Sandbox Configuration:');
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