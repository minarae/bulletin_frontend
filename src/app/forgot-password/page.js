'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: 이메일/이름 입력, 2: 새 비밀번호 입력
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    new_password: '',
    confirm_password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckEligibility = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 비밀번호 재설정 자격 확인 API 호출
      const response = await api.checkResetEligibility(formData.email, formData.full_name);

      if (response.eligible) {
        // 자격 확인 성공, 다음 단계로 이동
        setStep(2);
      } else {
        setError('사용자 정보를 찾을 수 없습니다.');
      }
    } catch (err) {
      console.error('비밀번호 찾기 오류:', err);
      if (err.response?.status === 404) {
        setError('등록된 이메일을 찾을 수 없습니다.');
      } else if (err.response?.status === 400) {
        setError('이름이 일치하지 않습니다.');
      } else {
        setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // 비밀번호 확인
    if (formData.new_password !== formData.confirm_password) {
      setError('비밀번호가 일치하지 않습니다.');
      setIsLoading(false);
      return;
    }

    if (formData.new_password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      setIsLoading(false);
      return;
    }

    try {
      // 비밀번호 재설정 API 호출
      const response = await api.resetPassword(
        formData.email,
        formData.full_name,
        formData.new_password
      );

      if (response.success) {
        setSuccess(true);
        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError('비밀번호 재설정에 실패했습니다.');
      }
    } catch (err) {
      console.error('비밀번호 재설정 오류:', err);
      setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">비밀번호 찾기</CardTitle>
          <CardDescription className="text-center">
            {step === 1
              ? '계정 정보를 입력하여 비밀번호를 재설정하세요'
              : '새로운 비밀번호를 입력하세요'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleCheckEligibility} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">이름</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="홍길동"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? '확인 중...' : '다음'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <AlertDescription>
                    비밀번호가 성공적으로 재설정되었습니다. 로그인 페이지로 이동합니다.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="new_password">새 비밀번호</Label>
                <Input
                  id="new_password"
                  name="new_password"
                  type="password"
                  value={formData.new_password}
                  onChange={handleChange}
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500">비밀번호는 8자 이상이어야 합니다.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">비밀번호 확인</Label>
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                >
                  이전
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? '처리 중...' : '비밀번호 재설정'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              로그인 페이지로 돌아가기
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}