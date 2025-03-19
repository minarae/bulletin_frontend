'use client';

import { useState } from 'react';
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function EditorSamplePage() {
  // 각 탭별 에디터 내용을 관리하는 상태
  const [tabContents, setTabContents] = useState({
    main: '<p>안녕하세요! 이 에디터에서 내용을 <strong>자유롭게</strong> 편집해보세요.</p>',
    announcement: '<h2>공지사항</h2><p>이 곳에 <span style="color: #FF0000;">공지사항</span>을 입력하세요.</p>',
    sermon: '<h1>설교</h1><ul><li>첫 번째 포인트</li><li>두 번째 포인트</li><li>세 번째 포인트</li></ul>',
    info: '<blockquote><p>교회 정보를 이곳에 입력하세요.</p></blockquote>'
  });

  // 현재 선택된 탭
  const [activeTab, setActiveTab] = useState('main');

  // 저장된 HTML 내용
  const [savedContents, setSavedContents] = useState({
    main: '',
    announcement: '',
    sermon: '',
    info: ''
  });

  // 에디터 내용 업데이트 핸들러
  const handleEditorUpdate = (tab, html) => {
    setTabContents(prev => ({
      ...prev,
      [tab]: html
    }));
  };

  // 현재 탭 내용 저장 핸들러
  const handleSave = () => {
    setSavedContents(prev => ({
      ...prev,
      [activeTab]: tabContents[activeTab]
    }));
    alert(`${getTabName(activeTab)} 내용이 저장되었습니다!`);
  };

  // 탭 이름 반환 함수
  const getTabName = (tab) => {
    switch(tab) {
      case 'main': return '메인';
      case 'announcement': return '공지사항';
      case 'sermon': return '설교';
      case 'info': return '정보';
      default: return tab;
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">TipTap 에디터 샘플</h1>

      <Tabs
        defaultValue="main"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-8"
      >
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="main">메인</TabsTrigger>
          <TabsTrigger value="announcement">공지사항</TabsTrigger>
          <TabsTrigger value="sermon">설교</TabsTrigger>
          <TabsTrigger value="info">정보</TabsTrigger>
        </TabsList>

        {Object.keys(tabContents).map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardHeader>
                <CardTitle>{getTabName(tab)} 에디터</CardTitle>
                <CardDescription>아래 에디터에서 {getTabName(tab)} 내용을 자유롭게 편집해보세요.</CardDescription>
              </CardHeader>
              <CardContent>
                <TiptapEditor
                  content={tabContents[tab]}
                  onUpdate={(html) => handleEditorUpdate(tab, html)}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setTabContents(prev => ({
                    ...prev,
                    [tab]: `<p>${getTabName(tab)} 내용이 초기화되었습니다.</p>`
                  }))}
                >
                  초기화
                </Button>
                <Button onClick={handleSave}>저장</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>현재 에디터 HTML</CardTitle>
            <CardDescription>현재 작성 중인 HTML 코드입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">HTML 코드:</h3>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm whitespace-pre-wrap break-all">
                {tabContents[activeTab]}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>저장된 HTML 렌더링 결과</CardTitle>
            <CardDescription>저장 버튼을 클릭하면 여기에 결과가 표시됩니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <h3 className="text-lg font-medium mb-2">렌더링 결과:</h3>
              <div
                className="bg-white border rounded-md p-4 min-h-[200px] prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: savedContents[activeTab] || '<p class="text-gray-400 italic">저장된 내용이 없습니다. 저장 버튼을 클릭해주세요.</p>'
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">사용 방법</h2>
        <div className="prose max-w-none">
          <p>
            TipTap 에디터는 ProseMirror 기반의 확장 가능한 WYSIWYG 에디터입니다.
            다음과 같은 기능들을 제공합니다:
          </p>
          <ul>
            <li>텍스트 서식 (굵게, 기울임, 밑줄, 코드)</li>
            <li>제목 스타일 (H1, H2, H3)</li>
            <li>목록 (순서 있는 목록, 순서 없는 목록)</li>
            <li>인용구</li>
            <li>실행 취소/다시 실행</li>
            <li>텍스트 색상 변경</li>
            <li>폰트 변경</li>
            <li>이미지 삽입 (URL 주소, 파일 선택, 드래그 앤 드롭)</li>
            <li>HTML 직접 편집</li>
            <li>이미지 크기 및 속성 조정</li>
          </ul>
          <p>
            이 에디터를 사용하여 게시물이나 이메일 등의 풍부한 텍스트 콘텐츠를 쉽게 만들 수 있습니다.
          </p>

          <h3 className="text-xl font-bold mt-6 mb-3">이미지 삽입 및 편집 방법</h3>
          <p>이미지 작업에는 여러 기능이 있습니다:</p>
          <ol>
            <li>
              <strong>이미지 삽입:</strong>
              <ul className="list-disc ml-6 mt-1">
                <li><strong>URL 주소:</strong> 이미지 URL을 입력하고 '삽입' 버튼을 클릭</li>
                <li><strong>파일 선택:</strong> '컴퓨터에서 이미지 선택' 버튼을 클릭하여 이미지 파일 선택</li>
                <li><strong>드래그 앤 드롭:</strong> 이미지 파일을 점선 영역에 직접 끌어다 놓기</li>
              </ul>
            </li>
            <li className="mt-2">
              <strong>이미지 편집:</strong>
              <ul className="list-disc ml-6 mt-1">
                <li><strong>이미지 선택:</strong> 편집하려는 이미지를 클릭하여 선택합니다.</li>
                <li><strong>빠른 크기 조정:</strong> 이미지 선택 시 나타나는 크기 버튼('원본 크기', '너비 100%', '너비 50%')으로 빠르게 크기 조정</li>
                <li><strong>상세 설정:</strong> 이미지 선택 후 설정 아이콘을 클릭하여 너비, 높이, 대체 텍스트, 제목 등 상세 설정 변경</li>
              </ul>
            </li>
          </ol>
          <p className="text-sm text-gray-600 mt-2">
            참고: 이미지는 Base64 형식으로 에디터에 삽입되며, 실제 서비스에서는 서버 업로드 기능을 구현하는 것이 권장됩니다.
            대용량 이미지를 많이 사용하면 HTML 크기가 커져 성능에 영향을 줄 수 있습니다.
          </p>

          <h3 className="text-xl font-bold mt-6 mb-3">HTML 직접 편집</h3>
          <p>
            툴바의 코드 아이콘(<code>&lt;/&gt;</code>)을 클릭하면 현재 에디터 내용의 HTML을 직접 편집할 수 있는 대화상자가 열립니다.
            이 기능을 사용하면 에디터 UI로 쉽게 구현하기 어려운 복잡한 HTML 구조를 직접 편집하거나 다른 곳에서 작성된
            HTML 코드를 붙여넣을 수 있습니다.
          </p>
          <p className="text-sm text-red-600 mt-1">
            주의: HTML을 직접 편집할 때는 올바른 HTML 구조를 유지해야 합니다.
            잘못된 HTML은 에디터의 정상 작동에 영향을 줄 수 있습니다.
          </p>

          <p>
            <strong>React 및 Next.js에서의 사용 방법:</strong>
          </p>
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
{`// 에디터 컴포넌트 사용 예시
import { TiptapEditor } from '@/components/ui/tiptap-editor';

function MyComponent() {
  const [content, setContent] = useState('<p>초기 내용</p>');

  return (
    <TiptapEditor
      content={content}
      onUpdate={(html) => setContent(html)}
    />
  );
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}