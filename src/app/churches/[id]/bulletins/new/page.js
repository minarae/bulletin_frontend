"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/api';
import BulletinEditor from '@/components/bulletin/BulletinEditor';
import { Loader2 } from 'lucide-react';

export default function NewBulletinPage({ params }) {
  // React.use()를 사용하여 params 언래핑
  const unwrappedParams = React.use(params);
  const churchId = unwrappedParams.id;

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, [churchId]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/templates/${churchId}/`);
      setTemplates(response);

      if (response.length > 0) {
        setSelectedTemplateId(response[0].id);
        await loadTemplateContent(response[0].id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('템플릿 목록 조회 오류:', error);
      toast.error('템플릿 목록을 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  const loadTemplateContent = async (templateId) => {
    if (!templateId) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(`/templates/${churchId}/${templateId}`);
      const template = response;
      const templateData = template.template_data;

      // 초기 데이터 설정
      setInitialData({
        date: new Date(),
        content: {
          title: templateData.title || '',
          subtitle: templateData.subtitle || '',
          sections: JSON.parse(JSON.stringify(templateData.sections || [])) // 깊은 복사
        }
      });
    } catch (error) {
      console.error('템플릿 조회 오류:', error);
      toast.error('템플릿 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = async (value) => {
    setSelectedTemplateId(value);
    setLoading(true);
    await loadTemplateContent(value);
  };

  const handleSubmit = async (data) => {
    try {
      setSaving(true);

      // 템플릿 ID 추가
      data.template_id = selectedTemplateId;

      await api.post(`/bulletins/${churchId}/`, data);
      toast.success('주보가 성공적으로 생성되었습니다.');
      router.push(`/churches/${churchId}/?tab=bulletins`);
    } catch (error) {
      console.error('주보 생성 오류:', error);
      toast.error('주보 생성 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/churches/${churchId}/?tab=bulletins`);
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
      mode="bulletin-new"
      churchId={churchId}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      initialData={initialData}
      templates={templates}
      selectedTemplateId={selectedTemplateId}
      onTemplateChange={handleTemplateChange}
      isSaving={saving}
      isLoading={loading}
    />
  );
}