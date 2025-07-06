// Simple script to reset rate limit during development
// Run this in the browser console when you get rate limited

const resetRateLimit = async () => {
  try {
    const response = await fetch('https://taskgo-be.onrender.com/api/auth/reset-rate-limit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Rate limit reset successfully:', data.message);
    } else {
      console.log('❌ Failed to reset rate limit:', data.message);
    }
  } catch (error) {
    console.error('❌ Error resetting rate limit:', error);
  }
};

// Execute the reset
resetRateLimit(); 