// lib/navigation.ts

export const getDashboardRoute = (): string => {
  if (typeof window === 'undefined') return '/dashboard';
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return '/login';
  
  const user = JSON.parse(userStr);
  return user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
};
