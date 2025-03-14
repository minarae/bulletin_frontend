"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/api';
import BulletinEditor from '@/components/bulletin/BulletinEditor';
import { Loader2 } from 'lucide-react';

export default function EditBulletinPage({ params }) {
  // React.use()를 사용하여 params 언래핑
  const unwrappedParams = React.use(params);
  const churchId = unwrappedParams.id;
  const bulletinId = unwrappedParams.bulletinId;

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bulletin, setBulletin] = useState(null);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    fetchBulletin();
  }, [churchId, bulletinId]);

  const fetchBulletin = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/bulletins/${churchId}/${bulletinId}`);
      setBulletin(response);
      setTemplateName(response.template_name || '알 수 없음');
    } catch (error) {
      console.error('주보 조회 오류:', error);
      toast.error('주보 정보를 불러오는 중 오류가 발생했습니다.');
      router.push(`/churches/${churchId}/?tab=bulletins`);



    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      setSaving(true);
      await api.put(`/bulletins/${churchId}/${bulletinId}`, data);
      toast.success('주보가 성공적으로 수정되었습니다.');
      router.push(`/bulletins/${churchId}/`);
    } catch (error) {
      console.error('주보 수정 오류:', error);
      toast.error('주보 수정 중 오류가 발생했습니다.');
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
      mode="bulletin-edit"
      churchId={churchId}
      itemId={bulletinId}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      initialData={bulletin}
      templateName={templateName}
      isSaving={saving}
    />
  );
}