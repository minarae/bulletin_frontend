"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Trash2, GripVertical, ArrowUp, ArrowDown, Calendar as CalendarIcon, Code, Image as ImageIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import JSONEditor from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';

// 한국어 로케일 정의
const koLocale = {
  format: '{reason} 위치 {line}:{column}',
  symbols: {
    colon: '콜론',
    comma: '쉼표',
    semicolon: '세미콜론',
    slash: '슬래시',
    backslash: '역슬래시',
    brackets: {
      round: '괄호',
      square: '대괄호',
      curly: '중괄호',
      angle: '화살괄호'
    },
    period: '마침표',
    quotes: {
      single: '작은따옴표',
      double: '큰따옴표',
      grave: '백틱'
    },
    space: '공백',
    ampersand: '앰퍼샌드',
    asterisk: '별표',
    at: '골뱅이',
    equals: '등호',
    hash: '해시',
    percent: '퍼센트',
    plus: '더하기',
    minus: '빼기',
    dash: '대시',
    hyphen: '하이픈',
    tilde: '물결',
    underscore: '밑줄',
    bar: '세로 막대'
  },
  types: {
    key: '키',
    value: '값',
    number: '숫자',
    string: '문자열',
    primitive: '원시 값',
    boolean: '불리언',
    character: '문자',
    integer: '정수',
    array: '배열',
    float: '실수'
  },
  invalidToken: {
    tokenSequence: {
      prohibited: "'{firstToken}' 토큰 뒤에 '{secondToken}' 토큰이 올 수 없습니다",
      permitted: "'{firstToken}' 토큰 뒤에는 '{secondToken}' 토큰만 올 수 있습니다"
    },
    termSequence: {
      prohibited: "'{firstTerm}' 뒤에 {secondTerm}이(가) 올 수 없습니다",
      permitted: "'{firstTerm}' 뒤에는 {secondTerm}만 올 수 있습니다"
    },
    double: "'{token}' 토큰이 두 번 연속으로 나타날 수 없습니다",
    useInstead: "'{badToken}' 대신 '{goodToken}'을(를) 사용하세요",
    unexpected: "예상치 못한 '{token}' 토큰"
  },
  brace: {
    curly: {
      missingOpen: "'{' 중괄호가 누락되었습니다",
      missingClose: "'}' 중괄호가 누락되었습니다",
      cannotWrap: "'{token}' 토큰은 중괄호로 감쌀 수 없습니다"
    },
    square: {
      missingOpen: "'[' 대괄호가 누락되었습니다",
      missingClose: "']' 대괄호가 누락되었습니다",
      cannotWrap: "'{token}' 토큰은 대괄호로 감쌀 수 없습니다"
    }
  },
  string: {
    missingOpen: "문자열 시작 부분의 '{quote}' 따옴표가 누락되었습니다",
    missingClose: "문자열 끝 부분의 '{quote}' 따옴표가 누락되었습니다",
    mustBeWrappedByQuotes: "문자열은 따옴표로 감싸야 합니다",
    nonAlphanumeric: "따옴표로 감싸지 않은 비 영숫자 토큰 '{token}'은 허용되지 않습니다",
    unexpectedKey: "문자열 위치에 키가 발견되었습니다"
  },
  key: {
    numberAndLetterMissingQuotes: "따옴표로 감싸지 않은 키 '{key}'는 숫자와 문자를 모두 포함할 수 없습니다",
    spaceMissingQuotes: "공백을 포함하는 키는 따옴표로 감싸야 합니다",
    unexpectedString: "키 위치에 문자열이 발견되었습니다"
  },
  noTrailingOrLeadingComma: "배열이나 객체에 후행 또는 선행 쉼표가 있을 수 없습니다"
};

// 섹션 타입 정의
const SECTION_TYPES = [
  { value: 'worship', label: '예배 순서' },
  { value: 'announcement', label: '공지사항' },
  { value: 'news', label: '교회 소식' },
  { value: 'info', label: '교회 정보' },
  { value: 'event', label: '행사 안내' },
  { value: 'weeklyVerse', label: '주간 말씀' },
  { value: 'custom', label: '사용자 정의' }
];

// 드래그 가능한 섹션 컴포넌트
const SortableSection = ({ section, index, onUpdate, onDelete, onMoveItem, isTemplate }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `section-${index}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  // 섹션 타입에 따른 추가 필드 렌더링
  const renderAdditionalFields = () => {
    if (!isTemplate) return null;

    switch (section.type) {
      case 'worship':
        return (
          <div className="mt-4 border-t pt-4">
            <h4 className="font-medium mb-2">다음 주 담당</h4>
            {section.nextWeekDuty ? (
              section.nextWeekDuty.map((duty, dutyIndex) => (
                <div key={dutyIndex} className="grid grid-cols-2 gap-2 mb-2">
                  <Input
                    value={duty.name || ''}
                    onChange={(e) => {
                      const newDuty = [...(section.nextWeekDuty || [])];
                      newDuty[dutyIndex] = { ...newDuty[dutyIndex], name: e.target.value };
                      onUpdate(index, { ...section, nextWeekDuty: newDuty });
                    }}
                    placeholder="역할"
                  />
                  <Input
                    value={duty.person || ''}
                    onChange={(e) => {
                      const newDuty = [...(section.nextWeekDuty || [])];
                      newDuty[dutyIndex] = { ...newDuty[dutyIndex], person: e.target.value };
                      onUpdate(index, { ...section, nextWeekDuty: newDuty });
                    }}
                    placeholder="담당자"
                  />
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">다음 주 담당자가 없습니다.</div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDuty = [...(section.nextWeekDuty || []), { name: '', person: '' }];
                onUpdate(index, { ...section, nextWeekDuty: newDuty });
              }}
              className="mt-2 w-full"
            >
              <Plus className="h-4 w-4 mr-2" /> 담당자 추가
            </Button>
          </div>
        );
      case 'info':
        return (
          <div className="mt-4 border-t pt-4">
            <h4 className="font-medium mb-2">교회 정보</h4>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>교회 이름</Label>
                  <Input
                    value={section.name || ''}
                    onChange={(e) => onUpdate(index, { ...section, name: e.target.value })}
                    placeholder="교회 이름"
                  />
                </div>
                <div>
                  <Label>담임 목사</Label>
                  <Input
                    value={section.pastor || ''}
                    onChange={(e) => onUpdate(index, { ...section, pastor: e.target.value })}
                    placeholder="담임 목사"
                  />
                </div>
              </div>
              <div>
                <Label>주소</Label>
                <Input
                  value={section.address || ''}
                  onChange={(e) => onUpdate(index, { ...section, address: e.target.value })}
                  placeholder="교회 주소"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>전화번호</Label>
                  <Input
                    value={section.tel || ''}
                    onChange={(e) => onUpdate(index, { ...section, tel: e.target.value })}
                    placeholder="전화번호"
                  />
                </div>
                <div>
                  <Label>이메일</Label>
                  <Input
                    value={section.email || ''}
                    onChange={(e) => onUpdate(index, { ...section, email: e.target.value })}
                    placeholder="이메일"
                  />
                </div>
              </div>
              <div>
                <h5 className="font-medium mb-2">예배 시간</h5>
                {section.services ? (
                  section.services.map((service, serviceIndex) => (
                    <div key={serviceIndex} className="grid grid-cols-2 gap-2 mb-2">
                      <Input
                        value={service.name || ''}
                        onChange={(e) => {
                          const newServices = [...(section.services || [])];
                          newServices[serviceIndex] = { ...newServices[serviceIndex], name: e.target.value };
                          onUpdate(index, { ...section, services: newServices });
                        }}
                        placeholder="예배 이름"
                      />
                      <Input
                        value={service.time || ''}
                        onChange={(e) => {
                          const newServices = [...(section.services || [])];
                          newServices[serviceIndex] = { ...newServices[serviceIndex], time: e.target.value };
                          onUpdate(index, { ...section, services: newServices });
                        }}
                        placeholder="예배 시간"
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">예배 시간이 없습니다.</div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newServices = [...(section.services || []), { name: '', time: '' }];
                    onUpdate(index, { ...section, services: newServices });
                  }}
                  className="mt-2 w-full"
                >
                  <Plus className="h-4 w-4 mr-2" /> 예배 시간 추가
                </Button>
              </div>
            </div>
          </div>
        );
      case 'weeklyVerse':
        return (
          <div className="mt-4 border-t pt-4">
            <h4 className="font-medium mb-2">주간 말씀</h4>
            <div className="space-y-2">
              <div>
                <Label>주 말씀</Label>
                <Input
                  value={section.mainVerse || ''}
                  onChange={(e) => onUpdate(index, { ...section, mainVerse: e.target.value })}
                  placeholder="주 말씀"
                />
              </div>
              <h5 className="font-medium mb-2">일일 말씀</h5>
              {section.verses ? (
                section.verses.map((verse, verseIndex) => (
                  <div key={verseIndex} className="space-y-2 mb-3 p-2 border rounded">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>요일</Label>
                        <Input
                          value={verse.day || ''}
                          onChange={(e) => {
                            const newVerses = [...(section.verses || [])];
                            newVerses[verseIndex] = { ...newVerses[verseIndex], day: e.target.value };
                            onUpdate(index, { ...section, verses: newVerses });
                          }}
                          placeholder="요일"
                        />
                      </div>
                      <div>
                        <Label>성경 구절</Label>
                        <Input
                          value={verse.reference || ''}
                          onChange={(e) => {
                            const newVerses = [...(section.verses || [])];
                            newVerses[verseIndex] = { ...newVerses[verseIndex], reference: e.target.value };
                            onUpdate(index, { ...section, verses: newVerses });
                          }}
                          placeholder="성경 구절"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>말씀 내용</Label>
                      <Input
                        value={verse.text || ''}
                        onChange={(e) => {
                          const newVerses = [...(section.verses || [])];
                          newVerses[verseIndex] = { ...newVerses[verseIndex], text: e.target.value };
                          onUpdate(index, { ...section, verses: newVerses });
                        }}
                        placeholder="말씀 내용"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newVerses = [...(section.verses || [])];
                        newVerses.splice(verseIndex, 1);
                        onUpdate(index, { ...section, verses: newVerses });
                      }}
                      className="text-destructive w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> 삭제
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">일일 말씀이 없습니다.</div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newVerses = [...(section.verses || []), { day: '', reference: '', text: '' }];
                  onUpdate(index, { ...section, verses: newVerses });
                }}
                className="mt-2 w-full"
              >
                <Plus className="h-4 w-4 mr-2" /> 일일 말씀 추가
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-md p-4 mb-4 bg-white"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          <div {...attributes} {...listeners} className="cursor-grab">
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex-1">
            <Input
              value={section.title}
              onChange={(e) => onUpdate(index, { ...section, title: e.target.value })}
              placeholder="섹션 제목"
              className="font-semibold"
            />
          </div>
          {isTemplate && (
            <div className="w-40">
              <Select
                value={section.type || 'custom'}
                onValueChange={(value) => onUpdate(index, { ...section, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="섹션 유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  {SECTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(index)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 mt-4">
        {section.items.map((item, itemIndex) => (
          <div key={itemIndex} className="flex items-center gap-2">
            <div className="flex-1">
              {item.type === 'image' ? (
                <div className="relative">
                  <img
                    src={item.content}
                    alt="업로드된 이미지"
                    className="w-full h-auto rounded-md max-h-64 object-contain"
                  />
                  <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newItems = [...section.items];
                        newItems.splice(itemIndex, 1);
                        onUpdate(index, { ...section, items: newItems });
                      }}
                      className="h-6 w-6 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Input
                  value={item.content}
                  onChange={(e) =>
                    onUpdate(index, {
                      ...section,
                      items: section.items.map((i, idx) =>
                        idx === itemIndex ? { ...i, content: e.target.value } : i
                      ),
                    })
                  }
                  placeholder="항목 내용"
                />
              )}
            </div>
            {item.type !== 'image' && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onMoveItem(index, itemIndex, 'up')}
                  disabled={itemIndex === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onMoveItem(index, itemIndex, 'down')}
                  disabled={itemIndex === section.items.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newItems = [...section.items];
                    newItems.splice(itemIndex, 1);
                    onUpdate(index, { ...section, items: newItems });
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const newItems = [...section.items, { type: 'text', content: '' }];
            onUpdate(index, { ...section, items: newItems });
          }}
          className="mt-2 w-full"
        >
          <Plus className="h-4 w-4 mr-2" /> 항목 추가
        </Button>
      </div>

      {renderAdditionalFields()}
    </div>
  );
};

// 일반 섹션 컴포넌트 (주보 편집용)
const BulletinSection = ({ section, index, onUpdate, onMoveItem }) => {
  return (
    <div className="border rounded-md p-4 mb-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg">{section.title}</h3>
      </div>

      <div className="space-y-2 mt-4">
        {section.items.map((item, itemIndex) => (
          <div key={itemIndex} className="flex items-center gap-2">
            <div className="flex-1">
              {item.type === 'image' ? (
                <div className="relative">
                  <img
                    src={item.content}
                    alt="업로드된 이미지"
                    className="w-full h-auto rounded-md max-h-64 object-contain"
                  />
                  <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newItems = [...section.items];
                        newItems.splice(itemIndex, 1);
                        onUpdate(index, { ...section, items: newItems });
                      }}
                      className="h-6 w-6 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Input
                  value={item.content}
                  onChange={(e) =>
                    onUpdate(index, {
                      ...section,
                      items: section.items.map((i, idx) =>
                        idx === itemIndex ? { ...i, content: e.target.value } : i
                      ),
                    })
                  }
                  placeholder="항목 내용"
                />
              )}
            </div>
            {item.type !== 'image' && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onMoveItem(index, itemIndex, 'up')}
                  disabled={itemIndex === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onMoveItem(index, itemIndex, 'down')}
                  disabled={itemIndex === section.items.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newItems = [...section.items];
                    newItems.splice(itemIndex, 1);
                    onUpdate(index, { ...section, items: newItems });
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const newItems = [...section.items, { type: 'text', content: '' }];
            onUpdate(index, { ...section, items: newItems });
          }}
          className="mt-2 w-full"
        >
          <Plus className="h-4 w-4 mr-2" /> 항목 추가
        </Button>
      </div>
    </div>
  );
};

// 이미지 업로드 컴포넌트
const ImageUploader = ({ onImageUpload, churchId }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("이미지 크기는 5MB 이하여야 합니다.");
      return;
    }

    // 이미지 파일 타입 확인
    if (!file.type.startsWith('image/')) {
      toast.error("이미지 파일만 업로드 가능합니다.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // 교회 ID가 있는 경우 추가
      if (churchId) {
        formData.append('church_id', churchId);
      }

      const response = await fetch('/api/uploads/image', {
        method: 'POST',
        body: formData,
        credentials: 'include', // 인증 쿠키 포함
      });

      if (!response.ok) {
        throw new Error('이미지 업로드에 실패했습니다.');
      }

      const data = await response.json();
      onImageUpload(data.url);

      toast.success("이미지가 성공적으로 업로드되었습니다.");
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      toast.error(error.message || "이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mt-4">
      <Label htmlFor="image-upload">이미지 업로드</Label>
      <div className="flex items-center gap-2 mt-1">
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        최대 5MB 크기의 이미지 파일을 업로드할 수 있습니다.
      </p>
    </div>
  );
};

export default function BulletinEditor({
  mode, // 'template-new', 'template-edit', 'bulletin-new', 'bulletin-edit'
  churchId,
  itemId, // templateId 또는 bulletinId
  onSubmit,
  onCancel,
  initialData = null,
  templates = [],
  selectedTemplateId = '',
  onTemplateChange = null,
  templateName = '',
  isLoading = false,
  isSaving = false,
}) {
  // 상태 관리
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [sections, setSections] = useState([]);
  const [name, setName] = useState(''); // 템플릿 이름
  const [date, setDate] = useState(new Date());
  const [isJsonMode, setIsJsonMode] = useState(false); // JSON 에디터 모드 상태
  const [jsonData, setJsonData] = useState(''); // JSON 데이터

  // DnD 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 초기 데이터 로드
  useEffect(() => {
    if (initialData) {
      if (mode.startsWith('template')) {
        setName(initialData.name || '');
        const templateData = initialData.template_data || {};
        setTitle(templateData.title || '');
        setSubtitle(templateData.subtitle || '');
        setSections(templateData.sections || []);
      } else {
        setDate(new Date(initialData.date));
        const content = initialData.content || {};
        setTitle(content.title || '');
        setSubtitle(content.subtitle || '');
        setSections(content.sections || []);
      }
    }
  }, [initialData, mode]);

  // JSON 데이터 업데이트
  useEffect(() => {
    if (isJsonMode) {
      // 일반 모드에서 JSON 모드로 전환할 때 항상 최신 데이터로 업데이트
      const data = getDefaultJsonData();
      setJsonData(JSON.stringify(data, null, 2));
    }
  }, [isJsonMode, title, subtitle, sections, name, date, mode, selectedTemplateId]);

  // JSON 데이터 변경 시 상태 업데이트
  const handleJsonChange = (data) => {
    if (data.jsObject) {
      try {
        const jsonData = data.jsObject;
        setJsonData(JSON.stringify(jsonData, null, 2));

        if (mode.startsWith('template')) {
          if (jsonData.name !== undefined) setName(jsonData.name);
          if (jsonData.template_data) {
            const templateData = jsonData.template_data;
            if (templateData.title !== undefined) setTitle(templateData.title);
            if (templateData.subtitle !== undefined) setSubtitle(templateData.subtitle);
            if (templateData.sections !== undefined) setSections(templateData.sections);
          }
        } else {
          if (jsonData.date) setDate(new Date(jsonData.date));
          if (jsonData.template_id !== undefined && mode === 'bulletin-new') {
            onTemplateChange && onTemplateChange(jsonData.template_id);
          }
          if (jsonData.content) {
            const content = jsonData.content;
            if (content.title !== undefined) setTitle(content.title);
            if (content.subtitle !== undefined) setSubtitle(content.subtitle);
            if (content.sections !== undefined) setSections(content.sections);
          }
        }
      } catch (error) {
        console.error('JSON 파싱 오류:', error);
      }
    } else if (data.error) {
      // JSON 형식 오류가 있는 경우
      console.error('JSON 형식 오류:', data.error);
    }
  };

  // JSON 데이터 객체 생성
  const getJsonObject = () => {
    if (!jsonData || jsonData.trim() === '') {
      return {};
    }

    try {
      return JSON.parse(jsonData);
    } catch (error) {
      console.error('JSON 파싱 오류:', error);
      return {};
    }
  };

  // 기본 JSON 데이터 생성
  const getDefaultJsonData = () => {
    if (mode.startsWith('template')) {
      return {
        name: name || '',
        template_data: {
          title: title || '',
          subtitle: subtitle || '',
          date: '',
          sections: sections || []
        }
      };
    } else {
      const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
      const formattedDisplayDate = date ? format(date, 'yyyy년 MM월 dd일', { locale: ko }) : '';

      const data = {
        date: formattedDate,
        content: {
          title: title || '',
          subtitle: subtitle || '',
          date: formattedDisplayDate,
          sections: sections || []
        }
      };

      if (mode === 'bulletin-new' && selectedTemplateId) {
        data.template_id = selectedTemplateId;
      }

      return data;
    }
  };

  // 모드 전환 함수
  const toggleMode = () => {
    if (!isJsonMode) {
      // 일반 모드에서 JSON 모드로 전환할 때 최신 데이터로 업데이트
      const data = getDefaultJsonData();
      setJsonData(JSON.stringify(data, null, 2));
    } else {
      // JSON 모드에서 일반 모드로 전환할 때 JSON 데이터를 파싱하여 상태 업데이트
      try {
        const data = getJsonObject();

        if (mode.startsWith('template')) {
          if (data.name !== undefined) setName(data.name);
          if (data.template_data) {
            const templateData = data.template_data;
            if (templateData.title !== undefined) setTitle(templateData.title);
            if (templateData.subtitle !== undefined) setSubtitle(templateData.subtitle);
            if (templateData.sections !== undefined) setSections(templateData.sections);
          }
        } else {
          if (data.date) setDate(new Date(data.date));
          if (data.template_id !== undefined && mode === 'bulletin-new') {
            onTemplateChange && onTemplateChange(data.template_id);
          }
          if (data.content) {
            const content = data.content;
            if (content.title !== undefined) setTitle(content.title);
            if (content.subtitle !== undefined) setSubtitle(content.subtitle);
            if (content.sections !== undefined) setSections(content.sections);
          }
        }
      } catch (error) {
        console.error('JSON 파싱 오류:', error);
        toast.error("JSON 형식이 올바르지 않아 변경사항이 적용되지 않았습니다.");
      }
    }

    setIsJsonMode(!isJsonMode);
  };

  // 날짜 변경 시 제목 업데이트
  const updateDateInTitle = () => {
    if (mode.startsWith('bulletin')) {
      const formattedDate = format(date, 'yyyy년 MM월 dd일', { locale: ko });
      setTitle((prevTitle) => {
        if (prevTitle.includes('년') && prevTitle.includes('월') && prevTitle.includes('일')) {
          const parts = prevTitle.split(' ');
          const nonDateParts = parts.filter(part =>
            !part.includes('년') && !part.includes('월') && !part.includes('일')
          );
          return [...nonDateParts, formattedDate].join(' ');
        }
        return prevTitle;
      });
    }
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    updateDateInTitle();
  };

  // 섹션 관리 함수
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const activeIndex = parseInt(active.id.split('-')[1]);
      const overIndex = parseInt(over.id.split('-')[1]);

      setSections((sections) => {
        return arrayMove(sections, activeIndex, overIndex);
      });
    }
  };

  const updateSection = (index, updatedSection) => {
    const newSections = [...sections];
    newSections[index] = updatedSection;
    setSections(newSections);
  };

  const deleteSection = (index) => {
    const newSections = [...sections];
    newSections.splice(index, 1);
    setSections(newSections);
  };

  const moveItem = (sectionIndex, itemIndex, direction) => {
    const newSections = [...sections];
    const section = { ...newSections[sectionIndex] };
    const items = [...section.items];

    if (direction === 'up' && itemIndex > 0) {
      [items[itemIndex], items[itemIndex - 1]] = [items[itemIndex - 1], items[itemIndex]];
    } else if (direction === 'down' && itemIndex < items.length - 1) {
      [items[itemIndex], items[itemIndex + 1]] = [items[itemIndex + 1], items[itemIndex]];
    }

    section.items = items;
    newSections[sectionIndex] = section;
    setSections(newSections);
  };

  const addSection = () => {
    const newSection = {
      title: '새 섹션',
      type: 'custom',
      items: [{ type: 'text', content: '새 항목' }]
    };
    setSections([...sections, newSection]);
  };

  // 이미지 업로드 처리
  const handleImageUpload = (imageUrl) => {
    // 이미지 URL을 섹션 아이템으로 추가
    if (sections.length > 0) {
      const lastSectionIndex = sections.length - 1;
      const lastSection = sections[lastSectionIndex];
      const newItems = [...lastSection.items, { type: 'image', content: imageUrl }];
      updateSection(lastSectionIndex, { ...lastSection, items: newItems });
    } else {
      // 섹션이 없는 경우 새 섹션 생성
      const newSection = {
        title: '이미지',
        type: 'custom',
        items: [{ type: 'image', content: imageUrl }]
      };
      setSections([newSection]);
    }
  };

  // 폼 제출 처리
  const handleSubmit = (e) => {
    e.preventDefault();

    let data = {};

    if (isJsonMode) {
      try {
        data = getJsonObject();
        if (Object.keys(data).length === 0) {
          // JSON 데이터가 비어있는 경우 기본 데이터 사용
          data = getDefaultJsonData();
        }
      } catch (error) {
        toast.error("유효하지 않은 JSON 형식입니다. 다시 확인해주세요.");
        return;
      }
    } else {
      if (mode.startsWith('template')) {
        // 템플릿 데이터 생성
        const templateData = {
          title,
          subtitle,
          date: '',
          sections
        };

        data = {
          name,
          template_data: templateData
        };
      } else {
        // 주보 데이터 생성
        const formattedDate = format(date, 'yyyy-MM-dd');
        const content = {
          title,
          subtitle,
          date: format(date, 'yyyy년 MM월 dd일', { locale: ko }),
          sections
        };

        data = {
          date: formattedDate,
          content
        };

        if (mode === 'bulletin-new') {
          data.template_id = selectedTemplateId;
        }
      }
    }

    onSubmit(data);
  };

  // 템플릿 선택 필드 렌더링
  const renderTemplateSelect = () => {
    if (mode !== 'bulletin-new') return null;

    return (
      <div className="space-y-2">
        <Label htmlFor="template">템플릿 선택</Label>
        <Select
          value={selectedTemplateId}
          onValueChange={onTemplateChange}
          disabled={templates.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="템플릿을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {templates.length === 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            사용 가능한 템플릿이 없습니다. 먼저 템플릿을 생성해주세요.
          </p>
        )}
      </div>
    );
  };

  // 템플릿 이름 필드 렌더링
  const renderTemplateNameField = () => {
    if (!mode.startsWith('template')) return null;

    return (
      <div className="space-y-2">
        <Label htmlFor="templateName">템플릿 이름</Label>
        <Input
          id="templateName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="템플릿 이름을 입력하세요"
          required
        />
      </div>
    );
  };

  // 템플릿 정보 표시 (주보 수정 시)
  const renderTemplateInfo = () => {
    if (mode !== 'bulletin-edit') return null;

    return (
      <div className="space-y-2">
        <Label>템플릿</Label>
        <div className="p-2 border rounded-md bg-muted">
          {templateName}
        </div>
        <p className="text-sm text-muted-foreground">
          템플릿은 변경할 수 없습니다.
        </p>
      </div>
    );
  };

  // 날짜 선택 필드 렌더링
  const renderDateField = () => {
    if (!mode.startsWith('bulletin')) return null;

    return (
      <div className="space-y-2">
        <Label>주보 날짜</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP', { locale: ko }) : <span>날짜 선택</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateChange}
              initialFocus
              locale={ko}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // 제목 설정
  const getTitle = () => {
    switch (mode) {
      case 'template-new': return '새 템플릿 생성';
      case 'template-edit': return '템플릿 수정';
      case 'bulletin-new': return '새 주보 생성';
      case 'bulletin-edit': return '주보 수정';
      default: return '';
    }
  };

  // 설명 설정
  const getDescription = () => {
    switch (mode) {
      case 'template-new':
      case 'template-edit':
        return '주보 템플릿의 기본 정보와 내용을 입력하세요.';
      case 'bulletin-new':
      case 'bulletin-edit':
        return '주보의 기본 정보와 내용을 입력하세요.';
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{getTitle()}</h1>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={toggleMode}
          >
            {isJsonMode ? (
              <>일반 모드로 전환</>
            ) : (
              <><Code className="mr-2 h-4 w-4" /> JSON 모드로 전환</>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{mode.startsWith('template') ? '템플릿 정보' : '주보 정보'}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {isJsonMode ? (
              <div className="space-y-4">
                <Label htmlFor="json-editor">JSON 데이터</Label>
                <div className="border rounded-md overflow-hidden">
                  <JSONEditor
                    id="json-editor"
                    placeholder={jsonData && jsonData.trim() !== '' ? getJsonObject() : getDefaultJsonData()}
                    locale={koLocale}
                    height="500px"
                    width="100%"
                    onChange={handleJsonChange}
                    colors={{
                      background: '#ffffff',
                      default: '#1e293b',
                      keys: '#2563eb',
                      string: '#16a34a',
                      number: '#9333ea',
                      boolean: '#ea580c',
                      null: '#dc2626',
                      background_warning: '#fff8e6',
                      background_error: '#ffecec',
                    }}
                    style={{
                      body: {
                        fontSize: '14px',
                        fontFamily: 'monospace',
                      }
                    }}
                    confirmGood={false}
                    waitAfterKeyPress={800}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  JSON 형식으로 데이터를 직접 편집할 수 있습니다. 유효한 JSON 형식이어야 합니다.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderTemplateNameField()}
                  {renderTemplateSelect()}
                  {renderTemplateInfo()}
                  {renderDateField()}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">주보 헤더 정보</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">주보 제목</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="주보 제목을 입력하세요"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subtitle">주보 부제목</Label>
                      <Input
                        id="subtitle"
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        placeholder="주보 부제목을 입력하세요"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">주보 섹션</h3>
                    <Button type="button" variant="outline" onClick={addSection}>
                      <Plus className="h-4 w-4 mr-2" /> 새 섹션 추가
                    </Button>
                  </div>

                  {mode.startsWith('template') ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={sections.map((_, index) => `section-${index}`)}
                        strategy={verticalListSortingStrategy}
                      >
                        {sections.map((section, index) => (
                          <SortableSection
                            key={`section-${index}`}
                            section={section}
                            index={index}
                            onUpdate={updateSection}
                            onDelete={deleteSection}
                            onMoveItem={moveItem}
                            isTemplate={true}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  ) : (
                    sections.map((section, index) => (
                      <BulletinSection
                        key={`section-${index}`}
                        section={section}
                        index={index}
                        onUpdate={updateSection}
                        onMoveItem={moveItem}
                      />
                    ))
                  )}
                </div>

                <ImageUploader onImageUpload={handleImageUpload} churchId={churchId} />
              </>
            )}
          </CardContent>

          <CardFooter className="flex justify-between mt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSaving || (mode === 'bulletin-new' && !isJsonMode && (templates.length === 0 || !selectedTemplateId))}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                mode.startsWith('template') ? '템플릿 저장' : '주보 저장'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}