import { NextResponse } from 'next/server';

// 인증이 필요한 경로 목록
const protectedRoutes = ['/'];
// 인증된 사용자가 접근할 수 없는 경로 목록 (로그인, 회원가입 등)
const authRoutes = ['/login', '/register', '/forgot-password'];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // 토큰 확인
  const token = request.cookies.get('auth_token')?.value;
  const isAuthenticated = !!token;

  console.log('미들웨어 실행:', pathname, '인증 상태:', isAuthenticated);

  // 인증이 필요한 경로에 인증되지 않은 사용자가 접근하는 경우
  if (protectedRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`)) && !isAuthenticated) {
    console.log('인증되지 않은 사용자가 보호된 경로에 접근:', pathname);
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  // 인증된 사용자가 로그인/회원가입 페이지에 접근하는 경우
  if (authRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`)) && isAuthenticated) {
    console.log('인증된 사용자가 인증 페이지에 접근:', pathname);
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// 미들웨어가 적용될 경로 설정
export const config = {
  matcher: [
    /*
     * 다음 경로에는 미들웨어를 적용하지 않음:
     * - api (API 경로)
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화 API)
     * - favicon.ico (파비콘)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};