'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from './api';

// 인증 컨텍스트 생성
const AuthContext = createContext({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
  register: async () => {},
});

// 인증 제공자 컴포넌트
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 사용자 정보 로드
  const loadUserInfo = async () => {
    if (!api.isAuthenticated()) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('사용자 정보 로드 시도');
      const userData = await api.getCurrentUser();
      console.log('사용자 정보 로드 성공:', userData);
      setUser(userData);
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error.response?.data || error.message);
      // 토큰이 유효하지 않은 경우 로그아웃 처리
      if (error.response?.status === 401) {
        api.logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 사용자 정보 로드
  useEffect(() => {
    loadUserInfo();
  }, []);

  // 로그인 함수
  const login = async (email, password) => {
    try {
      console.log('로그인 함수 호출:', email);
      const success = await api.login(email, password);
      console.log('로그인 API 응답:', success);

      if (success) {
        await loadUserInfo();
      }

      return success;
    } catch (error) {
      console.error('로그인 함수 오류:', error);
      return false;
    }
  };

  // 로그아웃 함수
  const logout = () => {
    api.logout();
    setUser(null);
    router.push('/login');
  };

  // 회원가입 함수
  const register = async (userData) => {
    try {
      await api.register(userData);
      return true;
    } catch (error) {
      console.error('회원가입 실패:', error.response?.data || error.message);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 인증 컨텍스트 사용 훅
export function useAuth() {
  return useContext(AuthContext);
}