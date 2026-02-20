import { useState, useEffect, useCallback } from 'react';
import { User, UserRole, parseStudentId } from '@/lib/index';

/**
 * UniCampus Authentication Hook
 * Manages session persistence and role-based access.
 * Auth is dynamic — no hardcoded mock users.
 */

const SESSION_STORAGE_KEY = 'unicampus_session_2026';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * login: Dynamically generates a user profile from identifier + role.
   * For demo/localStorage mode — no backend call here.
   * Real backend login should call api.auth.login() and then call this.
   */
  const login = useCallback((identifier: string, role: UserRole, overrides?: Partial<User>) => {
    const realisticNames = [
      'Rahul Verma', 'Priya Singh', 'Amit Patel', 'Sneha Gupta', 'Vikram Rao',
      'Anjali Kumar', 'Rohan Das', 'Kavita Reddy', 'Arjun Nair', 'Meera Iyer',
      'Siddharth Malhotra', 'Nisha Joshi', 'Aditya Chopra', 'Pooja Mehta', 'Karan Shah',
    ];
    const idSum = identifier.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const parsedDetails = role === 'student' ? parseStudentId(identifier) : null;

    const generatedUser: User = {
      id: overrides?.id ?? `gen_${Date.now()}`,
      name: overrides?.name ?? realisticNames[idSum % realisticNames.length],
      email: overrides?.email ?? `${identifier.toLowerCase()}@nit.edu`,
      role,
      branch: overrides?.branch ?? parsedDetails?.branch ?? 'CORE',
      year: overrides?.year ?? parsedDetails?.year ?? 1,
      studentId: role === 'student' ? identifier.toUpperCase() : undefined,
      facultyId: role === 'faculty' ? identifier.toUpperCase() : undefined,
      avatar: overrides?.avatar ?? `https://api.dicebear.com/7.x/bottts/svg?seed=${identifier}`,
      cgpa: role === 'student' ? (overrides?.cgpa ?? 8.5) : undefined,
      ...overrides,
    };

    setUser(generatedUser);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(generatedUser));
    return generatedUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }, []);

  const switchRole = useCallback((newRole: UserRole) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, role: newRole };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateProfile = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    switchRole,
    updateProfile,
  };
};