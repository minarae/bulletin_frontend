"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, ArrowLeft, Pencil, Trash2, Printer } from 'lucide-react';
import api from '@/lib/api';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function BulletinDetailPage({ params }) {
  // React.use()를 사용하여 params 언래핑
  const unwrappedParams = React.use(params);
  const churchId = unwrappedParams.id;
  const bulletinId = unwrappedParams.bulletinId;

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bulletin, setBulletin] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBulletin();
  }, [churchId, bulletinId]);

  const fetchBulletin = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/bulletins/${churchId}/${bulletinId}`);
      setBulletin(response);
    } catch (error) {
      console.error('주보 조회 오류:', error);
      toast.error('주보 정보를 불러오는 중 오류가 발생했습니다.');
      router.push(`/churches/${churchId}/?tab=bulletins`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await api.delete(`/bulletins/${churchId}/${bulletinId}`);
      toast.success('주보가 성공적으로 삭제되었습니다.');
      router.push(`/churches/${churchId}/?tab=bulletins`);
    } catch (error) {
      console.error('주보 삭제 오류:', error);
      toast.error('주보 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, 'yyyy년 MM월 dd일', { locale: ko });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!bulletin) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-muted-foreground">주보를 찾을 수 없습니다.</p>
              <Button asChild className="mt-4">
                <Link href={`/churches/${churchId}/?tab=bulletins`}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> 주보 목록으로 돌아가기
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { content } = bulletin;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <Button variant="outline" asChild>
          <Link href={`/churches/${churchId}/?tab=bulletins`}>
            <ArrowLeft className="h-4 w-4 mr-2" /> 주보 목록
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" /> 인쇄
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/churches/${churchId}/bulletins/${bulletinId}/edit`}>
              <Pencil className="h-4 w-4 mr-2" /> 수정
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDeleteClick}>
            <Trash2 className="h-4 w-4 mr-2" /> 삭제
          </Button>
        </div>
      </div>

      <Card className="print:shadow-none print:border-none">
        <CardHeader className="text-center">
          <div className="text-sm text-muted-foreground mb-2">
            {formatDate(bulletin.date)} | {bulletin.template_name}
          </div>
          <CardTitle className="text-3xl">{content.title}</CardTitle>
          {content.subtitle && (
            <CardDescription className="text-lg mt-2">{content.subtitle}</CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {content.sections.map((section, index) => (
            <div key={index} className="space-y-3">
              <h3 className="text-xl font-semibold">{section.title}</h3>
              <Separator />
              <ul className="space-y-2 pl-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="leading-relaxed">
                    {item.content}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>

        <CardFooter className="flex justify-center text-sm text-muted-foreground print:mt-8">
          <p>생성일: {formatDate(bulletin.created_at)}</p>
        </CardFooter>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>주보 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 주보를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  삭제 중...
                </>
              ) : (
                '삭제'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          .container {
            max-width: 100%;
            padding: 0;
          }
          .print\\:hidden {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}