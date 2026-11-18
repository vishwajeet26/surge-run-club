import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [member, setMember] = useState(null);
  const [stats, setStats] = useState({ runs_attended: 0, upcoming_registered: 0, badge: { title: 'Rookie Runner', tier: 'Rookie', icon: '🏃' } });
  const [token, setToken] = useState(() => localStorage.getItem('surge_token'));
  const [loading, setLoading] = useState(true);

  // Authenticated fetch wrapper
  const apiFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      logout();
    }
    return res;
  };

  const refreshUser = async () => {
    if (!token) {
      setUser(null);
      setMember(null);
      setLoading(false);
      return;
    }
    try {
      const res = await apiFetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setMember(data.member);
        setStats(data.stats);
      } else {
        logout();
      }
    } catch (e) {
      console.error('Failed to load user', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('surge_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setMember(data.member);
    setStats(data.stats);
    return data;
  };

  const register = async (formData) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Registration failed');
    }
    const data = await res.json();
    localStorage.setItem('surge_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setMember(data.member);
    setStats(data.stats);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('surge_token');
    setToken(null);
    setUser(null);
    setMember(null);
    setStats({ runs_attended: 0, upcoming_registered: 0, badge: { title: 'Rookie Runner', tier: 'Rookie', icon: '🏃' } });
  };

  const updateMember = async (updateData) => {
    const res = await apiFetch('/api/members/me', {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to update member profile');
    }
    const updated = await res.json();
    setMember(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        member,
        stats,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        updateMember,
        apiFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
