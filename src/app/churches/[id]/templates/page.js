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
import { Loader2, Plus, MoreHorizontal, Pencil, Trash2, Copy } from 'lucide-react';
import api from '@/lib/api';

export default function TemplatesPage({ params }) {
  // React.use()를 사용하여 params 언래핑
  const unwrappedParams = React.use(params);
  const churchId = unwrappedParams.id;

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [deleteTemplateId, setDeleteTemplateId] = useState(null);
  const [copyTemplateId, setCopyTemplateId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [churchId]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/templates/${churchId}/`);
      setTemplates(response);
    } catch (error) {
      console.error('템플릿 목록 조회 오류:', error);
      toast.error('템플릿 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (templateId) => {
    setDeleteTemplateId(templateId);
  };

  const handleCopyClick = (templateId) => {
    setCopyTemplateId(templateId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTemplateId) return;

    try {
      setIsDeleting(true);
      await api.delete(`/templates/${churchId}//${deleteTemplateId}`);
      toast.success('템플릿이 성공적으로 삭제되었습니다.');
      fetchTemplates();
    } catch (error) {
      console.error('템플릿 삭제 오류:', error);
      toast.error('템플릿 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
      setDeleteTemplateId(null);
    }
  };

  const handleCopyConfirm = async () => {
    if (!copyTemplateId) return;

    try {
      setIsCopying(true);

      // 새로운 복사 API 엔드포인트 사용
      await api.post(`/templates/${churchId}/${copyTemplateId}/copy`);

      toast.success('템플릿이 성공적으로 복사되었습니다.');
      fetchTemplates();
    } catch (error) {
      console.error('템플릿 복사 오류:', error);
      toast.error('템플릿 복사 중 오류가 발생했습니다.');
    } finally {
      setIsCopying(false);
      setCopyTemplateId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteTemplateId(null);
  };

  const handleCancelCopy = () => {
    setCopyTemplateId(null);
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
        <h1 className="text-2xl font-bold">템플릿 관리</h1>
        <Button asChild>
          <Link href={`/churches/${churchId}/templates/new`}>
            <Plus className="h-4 w-4 mr-2" /> 새 템플릿
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>템플릿 목록</CardTitle>
          <CardDescription>
            교회에서 사용 가능한 주보 템플릿 목록입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">등록된 템플릿이 없습니다.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>생성일</TableHead>
                  <TableHead className="w-[100px] text-center">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{new Date(template.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/churches/${churchId}/templates/${template.id}/edit`}>
                              <Pencil className="h-4 w-4 mr-2" /> 수정
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyClick(template.id)}>
                            <Copy className="h-4 w-4 mr-2" /> 복사
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(template.id)}
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
      <AlertDialog open={!!deleteTemplateId} onOpenChange={handleCancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>템플릿 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 템플릿을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
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

      {/* 복사 확인 다이얼로그 */}
      <AlertDialog open={!!copyTemplateId} onOpenChange={handleCancelCopy}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>템플릿 복사</AlertDialogTitle>
            <AlertDialogDescription>
              이 템플릿을 복사하여 새 템플릿을 만드시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCopyConfirm}
              disabled={isCopying}
            >
              {isCopying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  복사 중...
                </>
              ) : (
                '복사'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}