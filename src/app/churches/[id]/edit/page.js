"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";

export default function EditChurchPage({ params }) {
  const [church, setChurch] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contact_info: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const router = useRouter();
  const { id: churchId } = React.use(params);

  // 교회 정보 불러오기
  useEffect(() => {
    const fetchChurch = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/churches/${churchId}`);
        setChurch(data);
        setFormData({
          name: data.name || "",
          address: data.address || "",
          contact_info: data.contact_info || ""
        });
      } catch (error) {
        console.error("교회 정보를 불러오는데 실패했습니다:", error);
        toast.error("교회 정보를 불러오는데 실패했습니다.");
        router.push("/churches");
      } finally {
        setLoading(false);
      }
    };

    fetchChurch();
  }, [churchId, router]);

  // 입력 필드 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("교회 이름은 필수 입력 항목입니다.");
      return;
    }

    try {
      setSaving(true);
      await api.put(`/churches/${churchId}`, formData);
      toast.success("교회 정보가 성공적으로 수정되었습니다.");
      router.push(`/churches/${churchId}`);
    } catch (error) {
      console.error("교회 정보 수정 중 오류 발생:", error);
      toast.error(error.response?.data?.detail || "교회 정보 수정 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
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
          onClick={() => router.push(`/churches/${churchId}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> 교회 상세 페이지로 돌아가기
        </Button>

        <h1 className="text-3xl font-bold">교회 정보 수정</h1>
        <p className="text-gray-500 mt-1">구분값: {church.church_code}</p>

        <Separator className="my-6" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>교회 정보 수정</CardTitle>
          <CardDescription>
            교회의 기본 정보를 수정할 수 있습니다. 교회 이름은 필수 입력 항목입니다.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">교회 이름*</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">주소</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_info">연락처</Label>
              <Input
                id="contact_info"
                name="contact_info"
                value={formData.contact_info}
                onChange={handleChange}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/churches/${churchId}`)}
            >
              취소
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> 저장
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}