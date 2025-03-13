import axios from 'axios';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';

// 토큰 저장소 키
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8008';

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      // CORS 요청에서 쿠키를 포함하도록 설정
      withCredentials: true,
    });

    // 요청 인터셉터 설정 - 토큰이 있으면 헤더에 추가
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 응답 인터셉터 설정 - 401 에러 처리
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // 토큰 만료로 인한 401 에러이고, 재시도하지 않은 요청인 경우
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // 리프레시 토큰으로 새 토큰 발급 시도
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              if (response) {
                // 새 토큰으로 원래 요청 재시도
                return this.client(originalRequest);
              }
            }
          } catch (refreshError) {
            console.error('토큰 갱신 실패:', refreshError);
            // 리프레시 토큰도 만료된 경우 로그아웃 처리
            this.logout();
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // 토큰 관리 메서드 (쿠키 사용)
  setToken(token) {
    setCookie(TOKEN_KEY, token, {
      maxAge: 60 * 60 * 24, // 1일
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // CORS 요청에서 쿠키 전송을 허용
    });
  }

  getToken() {
    return getCookie(TOKEN_KEY);
  }

  setRefreshToken(token) {
    setCookie(REFRESH_TOKEN_KEY, token, {
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // CORS 요청에서 쿠키 전송을 허용
    });
  }

  getRefreshToken() {
    return getCookie(REFRESH_TOKEN_KEY);
  }

  removeTokens() {
    deleteCookie(TOKEN_KEY);
    deleteCookie(REFRESH_TOKEN_KEY);
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  // API 요청 메서드
  async get(url, config) {
    try {
      const response = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      console.error(`GET ${url} 요청 실패:`, error);
      throw error;
    }
  }

  async post(url, data, config) {
    try {
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`POST ${url} 요청 실패:`, error);
      throw error;
    }
  }

  async put(url, data, config) {
    try {
      const response = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`PUT ${url} 요청 실패:`, error);
      throw error;
    }
  }

  async delete(url, config) {
    try {
      const response = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      console.error(`DELETE ${url} 요청 실패:`, error);
      throw error;
    }
  }

  // 인증 관련 메서드
  async login(email, password) {
    try {
      // FormData 형식으로 변환 (FastAPI OAuth2PasswordRequestForm 호환)
      const formData = new URLSearchParams();
      formData.append('username', email); // FastAPI는 username 필드 사용
      formData.append('password', password);

      console.log('로그인 시도:', email);

      const response = await this.client.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log('로그인 응답:', response.data);

      const { access_token, refresh_token } = response.data;
      this.setToken(access_token);
      this.setRefreshToken(refresh_token);
      return true;
    } catch (error) {
      console.error('로그인 실패:', error.response?.data || error.message);
      return false;
    }
  }

  async register(userData) {
    try {
      console.log('회원가입 시도:', userData.email);
      const response = await this.post('/auth/register', userData);
      console.log('회원가입 응답:', response);
      return true;
    } catch (error) {
      console.error('회원가입 실패:', error.response?.data || error.message);
      return false;
    }
  }

  async refreshToken(refreshToken) {
    try {
      const response = await this.client.post('/auth/refresh', {
        refresh_token: refreshToken,
      });

      const { access_token, refresh_token } = response.data;
      this.setToken(access_token);
      this.setRefreshToken(refresh_token);
      return true;
    } catch (error) {
      console.error('토큰 갱신 실패:', error.response?.data || error.message);
      return false;
    }
  }

  logout() {
    this.removeTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  async getCurrentUser() {
    return this.get('/users/me');
  }

  // 비밀번호 재설정 관련 메서드
  async checkResetEligibility(email, fullName) {
    try {
      const response = await this.post('/auth/check-reset-eligibility', {
        email,
        full_name: fullName,
      });
      return response;
    } catch (error) {
      console.error('비밀번호 재설정 자격 확인 실패:', error.response?.data || error.message);
      throw error;
    }
  }

  async resetPassword(email, fullName, newPassword) {
    try {
      const response = await this.post('/auth/reset-password', {
        email,
        full_name: fullName,
        new_password: newPassword,
      });
      return response;
    } catch (error) {
      console.error('비밀번호 재설정 실패:', error.response?.data || error.message);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성
const api = new ApiClient();

export default api;