"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, Plus, MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';
import api from '@/lib/api';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function BulletinsPage({ params }) {
  // React.use()를 사용하여 params 언래핑
  const unwrappedParams = React.use(params);
  const churchId = unwrappedParams.id;

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bulletins, setBulletins] = useState([]);
  const [deleteBulletinId, setDeleteBulletinId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBulletins();
  }, [churchId]);

  const fetchBulletins = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/bulletins/${churchId}/`);
      setBulletins(response.data);
    } catch (error) {
      console.error('주보 목록 조회 오류:', error);
      toast.error('주보 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (bulletinId) => {
    setDeleteBulletinId(bulletinId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteBulletinId) return;

    try {
      setIsDeleting(true);
      await api.delete(`/bulletins/${churchId}/${deleteBulletinId}`);
      toast.success('주보가 성공적으로 삭제되었습니다.');
      fetchBulletins();
    } catch (error) {
      console.error('주보 삭제 오류:', error);
      toast.error('주보 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
      setDeleteBulletinId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteBulletinId(null);
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

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">주보 관리</h1>
        <Button asChild>
          <Link href={`/churches/${churchId}/bulletins/new`}>
            <Plus className="h-4 w-4 mr-2" /> 새 주보
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>주보 목록</CardTitle>
          <CardDescription>
            교회에서 생성한 주보 목록입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bulletins.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">등록된 주보가 없습니다.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>날짜</TableHead>
                  <TableHead>템플릿</TableHead>
                  <TableHead>제목</TableHead>
                  <TableHead className="w-[100px]">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bulletins.map((bulletin) => (
                  <TableRow key={bulletin.id}>
                    <TableCell>{formatDate(bulletin.date)}</TableCell>
                    <TableCell>{bulletin.template_name}</TableCell>
                    <TableCell className="font-medium">{bulletin.content.title}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/churches/${churchId}/bulletins/${bulletin.id}`}>
                              <Eye className="h-4 w-4 mr-2" /> 보기
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/churches/${churchId}/bulletins/${bulletin.id}/edit`}>
                              <Pencil className="h-4 w-4 mr-2" /> 수정
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(bulletin.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> 삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={!!deleteBulletinId} onOpenChange={handleCancelDelete}>
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
    </div>
  );
}