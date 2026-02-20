import { useState, useEffect, useCallback } from 'react';
import { User, UserRole, mockUsers, parseStudentId } from '@/lib/index';

/**
 * UniCampus Authentication Hook
 * Manages session persistence, role-based access, and smart login parsing.
 * Version: 2026.1.0
 */

const SESSION_STORAGE_KEY = 'unicampus_session_2026';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate user session from localStorage on initial mount
  useEffect(() => {
    const hydrateSession = () => {
      try {
        const storedUser = localStorage.getItem(SESSION_STORAGE_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('[Auth] Failed to restore session:', error);
        localStorage.removeItem(SESSION_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    hydrateSession();
  }, []);

  /**
   * login: Handles smart identification parsing and session creation
   * @param identifier - Student ID (e.g., COMP_101) or Faculty ID
   * @param role - Selected login role
   */
  const login = useCallback((identifier: string, role: UserRole) => {
    // 1. Attempt to find existing mock user for standard demo cases (Case Insensitive)
    let authenticatedUser = mockUsers.find(
      (u) =>
        (u.studentId?.toLowerCase() === identifier.toLowerCase() ||
          u.facultyId?.toLowerCase() === identifier.toLowerCase() ||
          u.email.toLowerCase() === identifier.toLowerCase()) &&
        u.role === role
    );

    // 2. Dynamic profile generation if not in mocks (enables testing any ID format)
    if (!authenticatedUser) {
      const parsedDetails = role === 'student' ? parseStudentId(identifier) : null;
      // Deterministically pick a realistic name based on the ID
      const realisticNames = [
        "Rahul Verma", "Priya Singh", "Amit Patel", "Sneha Gupta", "Vikram Rao",
        "Anjali Kumar", "Rohan Das", "Kavita Reddy", "Arjun Nair", "Meera Iyer",
        "Siddharth Malhotra", "Nisha Joshi", "Aditya Chopra", "Pooja Mehta", "Karan Johar"
      ];

      // Simple hash function to pick a name
      const idSum = identifier.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const nameIndex = idSum % realisticNames.length;
      const formattedName = realisticNames[nameIndex];

      authenticatedUser = {
        id: `gen_${Date.now()}`,
        name: formattedName, // Changed from just the prefix to be more descriptive
        email: `${identifier.toLowerCase()}@nit.edu`,
        role: role,
        branch: parsedDetails?.branch || 'CORE',
        year: parsedDetails?.year || 1,
        studentId: role === 'student' ? identifier.toUpperCase() : undefined,
        facultyId: role === 'faculty' ? identifier.toUpperCase() : undefined,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${identifier}`,
        cgpa: role === 'student' ? 8.5 : undefined, // Default demo CGPA
      };
    }

    setUser(authenticatedUser);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authenticatedUser));
    return authenticatedUser;
  }, []);

  /**
   * logout: Destroys session and clears storage
   */
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }, []);

  /**
   * switchRole: Allows quick role toggling for demo/testing purposes without re-login
   */
  const switchRole = useCallback((newRole: UserRole) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, role: newRole };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  /**
   * updateProfile: Helper to update user details in current session
   */
  const updateProfile = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
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