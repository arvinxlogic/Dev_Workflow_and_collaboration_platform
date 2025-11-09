'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      // Get user from localStorage
      const userStr = localStorage.getItem('user');
      
      if (!userStr) {
        console.log('No user found, redirecting to login');
        router.push('/login');
        return;
      }

      const user = JSON.parse(userStr);
      
      // Check if user is admin
      if (user.role !== 'admin') {
        console.log('User is not admin, redirecting to dashboard');
        alert('Access denied. This area is for administrators only.');
        router.push('/dashboard');
        return;
      }

      console.log('Admin access granted:', user);
      setAuthorized(true);
      setLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    }
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Only render children if authorized
  if (!authorized) {
    return null;
  }

  // Render the admin page
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
