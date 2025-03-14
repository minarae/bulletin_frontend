"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  ArrowLeft
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";

export default function ChurchDetailPage({ params }) {
  const [church, setChurch] = useState(null);
  const [bulletins, setBulletins] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bulletins");

  const router = useRouter();
  const { id: churchId } = React.use(params);

  // 교회 정보 불러오기
  useEffect(() => {
    const fetchChurchData = async () => {
      try {
        setLoading(true);
        const churchData = await api.get(`/churches/${churchId}`);
        setChurch(churchData);

        // 주보 목록 불러오기
        const bulletinsData = await api.get(`/bulletins/${churchId}/`);
        setBulletins(bulletinsData);

        // 템플릿 목록 불러오기
        const templatesData = await api.get(`/templates/${churchId}/`);
        setTemplates(templatesData);
      } catch (error) {
        console.error("교회 정보를 불러오는데 실패했습니다:", error);
        toast.error("교회 정보를 불러오는데 실패했습니다.");
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
            <h1 className="text-3xl font-bold">{church.name}</h1>
            <p className="text-gray-500 mt-1">구분값: {church.church_code}</p>
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
            <Button onClick={() => router.push(`/churches/${churchId}/bulletins/new`)}>
              <Plus className="mr-2 h-4 w-4" /> 새 주보 작성
            </Button>
          </div>

          {bulletins.length > 0 ? (
            <div className="grid gap-4">
              {bulletins.map((bulletin) => (
                <Card key={bulletin.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{formatDate(bulletin.date)}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-500">
                          작성일: {new Date(bulletin.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/churches/${churchId}/bulletins/${bulletin.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteBulletin(bulletin.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="ghost"
                      className="w-full justify-between"
                      onClick={() => router.push(`/churches/${churchId}/bulletins/${bulletin.id}`)}
                    >
                      <span>주보 보기</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">템플릿 목록</h2>
            <Button onClick={() => router.push(`/churches/${churchId}/templates/new`)}>
              <Plus className="mr-2 h-4 w-4" /> 새 템플릿 추가
            </Button>
          </div>

          {templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>{template.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-40 bg-gray-100 rounded-md flex items-center justify-center">
                      <Layout className="h-10 w-10 text-gray-400" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/churches/${churchId}/templates/${template.id}`)}
                    >
                      미리보기
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push(`/churches/${churchId}/templates/${template.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
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