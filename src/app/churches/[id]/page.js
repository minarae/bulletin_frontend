"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  FileText,
  Settings,
  Layout,
  ChevronRight,
  Calendar,
  Edit,
  Trash2,
  Plus,
  ArrowLeft,
  Copy,
  Loader2
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import api from "@/lib/api";

export default function ChurchDetailPage({ params }) {
  const [church, setChurch] = useState(null);
  const [bulletins, setBulletins] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bulletins");
  const [deleteTemplateId, setDeleteTemplateId] = useState(null);
  const [copyTemplateId, setCopyTemplateId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { id: churchId } = React.use(params);

  // URL 쿼리 파라미터에서 탭 정보 가져오기
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['bulletins', 'templates', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // 교회 정보 불러오기
  useEffect(() => {
    const fetchChurchData = async () => {
      try {
        setLoading(true);
        const churchResponse = await api.get(`/churches/${churchId}`);
        setChurch(churchResponse);

        // 주보 목록 불러오기
        const bulletinsResponse = await api.get(`/bulletins/${churchId}/`);
        setBulletins(bulletinsResponse);

        // 템플릿 목록 불러오기
        const templatesResponse = await api.get(`/templates/${churchId}/`);
        setTemplates(templatesResponse);
      } catch (error) {
        console.error("교회 정보 불러오기 오류:", error);
        toast.error("교회 정보를 불러오는 중 오류가 발생했습니다.");
        router.push("/churches");
      } finally {
        setLoading(false);
      }
    };

    fetchChurchData();
  }, [churchId, router]);

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  // 템플릿 복사 처리
  const handleCopyTemplate = (templateId) => {
    setCopyTemplateId(templateId);
  };

  const handleCopyConfirm = async () => {
    if (!copyTemplateId) return;

    try {
      setIsCopying(true);
      await api.post(`/templates/${churchId}/${copyTemplateId}/copy`);
      toast.success('템플릿이 성공적으로 복사되었습니다.');

      // 템플릿 목록 다시 불러오기
      const templatesResponse = await api.get(`/templates/${churchId}/`);
      setTemplates(templatesResponse);
    } catch (error) {
      console.error('템플릿 복사 오류:', error);
      toast.error('템플릿 복사 중 오류가 발생했습니다.');
    } finally {
      setIsCopying(false);
      setCopyTemplateId(null);
    }
  };

  const handleCancelCopy = () => {
    setCopyTemplateId(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/churches")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> 교회 목록으로 돌아가기
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">{church?.name}</h1>
            <p className="text-gray-500 mt-1">구분값: {church?.church_code}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push(`/churches/${churchId}/edit`)}
          >
            <Settings className="mr-2 h-4 w-4" /> 교회 설정
          </Button>
        </div>

        <Separator className="my-6" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bulletins">
            <FileText className="mr-2 h-4 w-4" /> 주보 관리
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Layout className="mr-2 h-4 w-4" /> 템플릿 관리
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" /> 교회 정보
          </TabsTrigger>
        </TabsList>

        {/* 주보 관리 탭 */}
        <TabsContent value="bulletins" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">주보 목록</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/churches/${churchId}/bulletins`)}
              >
                <FileText className="mr-2 h-4 w-4" /> 전체 주보 목록
              </Button>
              <Button onClick={() => router.push(`/churches/${churchId}/bulletins/new`)}>
                <Plus className="mr-2 h-4 w-4" /> 새 주보 작성
              </Button>
            </div>
          </div>

          {bulletins.length > 0 ? (
            <Card>
              <CardContent className="px-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>날짜</TableHead>
                      <TableHead>작성일</TableHead>
                      <TableHead className="text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bulletins.map((bulletin) => (
                      <TableRow key={bulletin.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/churches/${churchId}/bulletins/${bulletin.id}`)}>
                        <TableCell className="font-medium">{formatDate(bulletin.date)}</TableCell>
                        <TableCell>{new Date(bulletin.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/churches/${churchId}/bulletins/${bulletin.id}/edit`);
                              }}
                              title="주보 수정"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBulletin(bulletin.id);
                              }}
                              title="주보 삭제"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>주보가 없습니다</CardTitle>
                <CardDescription>
                  아직 등록된 주보가 없습니다. 새 주보를 작성해보세요.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  onClick={() => router.push(`/churches/${churchId}/bulletins/new`)}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" /> 새 주보 작성
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        {/* 템플릿 관리 탭 */}
        <TabsContent value="templates" className="mt-6">
          <div className="flex justify-end items-center mb-6">
            {/* <h2 className="text-xl font-semibold">템플릿 목록</h2> */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/churches/${churchId}/templates`)}
              >
                <Layout className="mr-2 h-4 w-4" /> 전체 템플릿 목록
              </Button>
              <Button onClick={() => router.push(`/churches/${churchId}/templates/new`)}>
                <Plus className="mr-2 h-4 w-4" /> 새 템플릿 생성
              </Button>
            </div>
          </div>

          {templates.length > 0 ? (
            <Card>
              <CardContent className="px-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">템플릿 이름</TableHead>
                      <TableHead className="text-center">생성일</TableHead>
                      <TableHead className="text-center">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/churches/${churchId}/templates/${template.id}/edit`)}>
                        <TableCell className="font-medium text-center">{template.name}</TableCell>
                        <TableCell className="text-center">{new Date(template.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/churches/${churchId}/templates/${template.id}/edit`);
                              }}
                              title="템플릿 수정"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyTemplate(template.id);
                              }}
                              title="템플릿 복사"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/churches/${churchId}/bulletins/new?template=${template.id}`);
                              }}
                              title="이 템플릿으로 주보 생성"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTemplate(template.id);
                              }}
                              title="템플릿 삭제"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>템플릿이 없습니다</CardTitle>
                <CardDescription>
                  아직 등록된 템플릿이 없습니다. 새 템플릿을 추가해보세요.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  onClick={() => router.push(`/churches/${churchId}/templates/new`)}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" /> 새 템플릿 추가
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        {/* 교회 정보 탭 */}
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>교회 정보</CardTitle>
              <CardDescription>
                교회의 기본 정보를 확인하고 관리할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">교회 이름</h3>
                <p className="text-lg">{church.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">교회 구분값</h3>
                <p className="text-lg">{church.church_code}</p>
              </div>
              {church.address && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">주소</h3>
                  <p className="text-lg">{church.address}</p>
                </div>
              )}
              {church.contact_info && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">연락처</h3>
                  <p className="text-lg">{church.contact_info}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-gray-500">생성일</h3>
                <p className="text-lg">{new Date(church.created_at).toLocaleDateString()}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => router.push(`/churches/${churchId}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" /> 정보 수정
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm("정말로 이 교회를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
                    handleDeleteChurch();
                  }
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> 교회 삭제
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 템플릿 복사 확인 다이얼로그 */}
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

  // 교회 삭제 함수
  async function handleDeleteChurch() {
    try {
      await api.delete(`/churches/${churchId}`);
      toast.success("교회가 성공적으로 삭제되었습니다.");
      router.push("/churches");
    } catch (error) {
      console.error("교회 삭제 중 오류 발생:", error);
      toast.error("교회 삭제 중 오류가 발생했습니다.");
    }
  }

  // 주보 삭제 함수
  async function handleDeleteBulletin(bulletinId) {
    if (!confirm("정말로 이 주보를 삭제하시겠습니까?")) {
      return;
    }

    try {
      await api.delete(`/churches/${churchId}/bulletins/${bulletinId}`);
      setBulletins(bulletins.filter(bulletin => bulletin.id !== bulletinId));
      toast.success("주보가 성공적으로 삭제되었습니다.");
    } catch (error) {
      console.error("주보 삭제 중 오류 발생:", error);
      toast.error("주보 삭제 중 오류가 발생했습니다.");
    }
  }

  // 템플릿 삭제 함수
  async function handleDeleteTemplate(templateId) {
    if (!confirm("정말로 이 템플릿을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await api.delete(`/churches/${churchId}/templates/${templateId}`);
      setTemplates(templates.filter(template => template.id !== templateId));
      toast.success("템플릿이 성공적으로 삭제되었습니다.");
    } catch (error) {
      console.error("템플릿 삭제 중 오류 발생:", error);
      toast.error("템플릿 삭제 중 오류가 발생했습니다.");
    }
  }
}