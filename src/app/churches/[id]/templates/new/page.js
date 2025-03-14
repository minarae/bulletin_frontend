"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/api';
import BulletinEditor from '@/components/bulletin/BulletinEditor';

export default function NewTemplatePage({ params }) {
  // React.use()를 사용하여 params 언래핑
  const unwrappedParams = React.use(params);
  const churchId = unwrappedParams.id;

  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (data) => {
    try {
      setSaving(true);
      await api.post(`/templates/${churchId}/`, data);
      toast.success('템플릿이 성공적으로 생성되었습니다.');
      router.push(`/churches/${churchId}?tab=templates`);
    } catch (error) {
      console.error('템플릿 생성 오류:', error);
      toast.error('템플릿 생성 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/churches/${churchId}?tab=templates`);
  };

  // 초기 템플릿 데이터 설정
  const initialData = {
    name: '',
    template_data: {
      title: '',
      subtitle: '',
      sections: [
        {
          title: '예배 순서',
          type: 'worship',
          items: [
            { type: 'text', content: '1. 예배의 부름' },
            { type: 'text', content: '2. 찬양' },
            { type: 'text', content: '3. 대표기도' },
            { type: 'text', content: '4. 성경봉독' },
            { type: 'text', content: '5. 설교' },
            { type: 'text', content: '6. 봉헌' },
            { type: 'text', content: '7. 축도' }
          ]
        },
        {
          title: '공지사항',
          type: 'announcement',
          items: [
            { type: 'text', content: '공지사항 1' },
            { type: 'text', content: '공지사항 2' },
            { type: 'text', content: '공지사항 3' }
          ]
        },
        {
          title: '교회 소식',
          type: 'news',
          items: [
            { type: 'text', content: '소식 1' },
            { type: 'text', content: '소식 2' }
          ]
        }
      ]
    }
  };

  return (
    <BulletinEditor
      mode="template-new"
      churchId={churchId}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      initialData={initialData}
      isSaving={saving}
    />
  );
}