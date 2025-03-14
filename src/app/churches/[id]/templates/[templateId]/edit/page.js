"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/api';
import BulletinEditor from '@/components/bulletin/BulletinEditor';
import { Loader2 } from 'lucide-react';

export default function EditTemplatePage({ params }) {
  // React.use()를 사용하여 params 언래핑
  const unwrappedParams = React.use(params);
  const churchId = unwrappedParams.id;
  const templateId = unwrappedParams.templateId;

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [template, setTemplate] = useState(null);

  useEffect(() => {
    fetchTemplate();
  }, [churchId, templateId]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/templates/${churchId}/${templateId}`);
      setTemplate(response);
    } catch (error) {
      console.error('템플릿 조회 오류:', error);
      toast.error('템플릿 정보를 불러오는 중 오류가 발생했습니다.');
      router.push(`/churches/${churchId}/templates`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      setSaving(true);
      await api.put(`/templates/${churchId}/${templateId}`, data);
      toast.success('템플릿이 성공적으로 수정되었습니다.');
      router.push(`/churches/${churchId}?tab=templates`);
    } catch (error) {
      console.error('템플릿 수정 오류:', error);
      toast.error('템플릿 수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/churches/${churchId}?tab=templates`);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <BulletinEditor
      mode="template-edit"
      churchId={churchId}
      itemId={templateId}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      initialData={template}
      isSaving={saving}
    />
  );
}