import React, { createContext, useContext, useState, useEffect } from 'react';


interface AuthContextType {
  user: any | null;
  token: string | null;
  login: (token: string, adminId: string, role: string, referralCode?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    // Simple check: if token exists, we differentiate "authenticated".
    // In a real app, we might validate the token with /auth/profile endpoint.
    const savedRole = localStorage.getItem('role');
    const savedAdminId = localStorage.getItem('adminId');
    const savedReferralCode = localStorage.getItem('referralCode');
    if (token && savedRole && savedAdminId) {
        setUser({ role: savedRole, adminId: savedAdminId, referralCode: savedReferralCode });
    }
  }, [token]);

  const login = (newToken: string, adminId: string, role: string, referralCode?: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', role);
    localStorage.setItem('adminId', adminId);
    if (referralCode) localStorage.setItem('referralCode', referralCode);
    setToken(newToken);
    setUser({ role, adminId, referralCode });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('adminId');
    localStorage.removeItem('referralCode');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
