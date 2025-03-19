'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Image from '@tiptap/extension-image';
import ResizableImage from 'tiptap-extension-resize-image';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Code,
  Quote,
  Palette,
  ImageIcon,
  Upload,
  Code2,
  ArrowsMaximize,
  Settings2
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8008';

// 색상 선택 옵션
const colors = [
  '#000000', // 검정
  '#FF0000', // 빨강
  '#00FF00', // 초록
  '#0000FF', // 파랑
  '#FFFF00', // 노랑
  '#FF00FF', // 마젠타
  '#00FFFF', // 시안
  '#808080', // 회색
];

// 폰트 선택 옵션
const fonts = [
  { name: '기본', value: 'sans-serif' },
  { name: '세리프', value: 'serif' },
  { name: '모노스페이스', value: 'monospace' },
  { name: '커시브', value: 'cursive' },
];

export function TiptapEditor({ content = '', onUpdate, editable = true }) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [isHtmlDialogOpen, setIsHtmlDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageSettingsOpen, setIsImageSettingsOpen] = useState(false);
  const [imageSettings, setImageSettings] = useState({
    width: '',
    height: '',
    alt: '',
    title: '',
  });

  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      FontFamily,
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'tiptap-image',
        },
      }),
      ResizableImage.configure({
        handleStyles: {
          backgroundColor: '#4f46e5',
          border: '2px solid #4f46e5',
          borderRadius: '4px',
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (onUpdate) {
        onUpdate(html);
      }
    },
    onSelectionUpdate: ({ editor }) => {
      // 선택된 노드가 이미지인지 확인
      const { from, to } = editor.state.selection;
      editor.state.doc.nodesBetween(from, to, (node, pos) => {
        if (node.type.name === 'image') {
          setSelectedImage({
            node,
            pos,
            attrs: { ...node.attrs }
          });
          return false; // 첫 번째 이미지를 찾으면 중단
        }
      });
    },
    onFocus: ({ editor }) => {
      // 포커스가 변경되면 선택된 이미지 초기화
      setSelectedImage(null);
    },
  });

  // HTML 편집 대화상자가 열릴 때 현재 HTML 내용 가져오기
  useEffect(() => {
    if (isHtmlDialogOpen && editor) {
      setHtmlContent(editor.getHTML());
    }
  }, [isHtmlDialogOpen, editor]);

  // 이미지 설정 대화상자가 열릴 때 현재 이미지 속성 가져오기
  useEffect(() => {
    if (isImageSettingsOpen && selectedImage) {
      const { width, height, alt, title } = selectedImage.attrs;
      setImageSettings({
        width: width || '',
        height: height || '',
        alt: alt || '',
        title: title || '',
      });
    }
  }, [isImageSettingsOpen, selectedImage]);

  if (!editor) {
    return null;
  }

  const toggleHeading = (level) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const toggleTextStyle = (style) => {
    if (style === 'bold') editor.chain().focus().toggleBold().run();
    if (style === 'italic') editor.chain().focus().toggleItalic().run();
    if (style === 'underline') editor.chain().focus().toggleUnderline().run();
    if (style === 'code') editor.chain().focus().toggleCode().run();
  };

  const toggleList = (type) => {
    if (type === 'bullet') editor.chain().focus().toggleBulletList().run();
    if (type === 'ordered') editor.chain().focus().toggleOrderedList().run();
  };

  const toggleBlockquote = () => {
    editor.chain().focus().toggleBlockquote().run();
  };

  const undoRedo = (action) => {
    if (action === 'undo') editor.chain().focus().undo().run();
    if (action === 'redo') editor.chain().focus().redo().run();
  };

  const setColor = (color) => {
    editor.chain().focus().setColor(color).run();
    setShowColorPicker(false);
  };

  const setFontFamily = (font) => {
    editor.chain().focus().setFontFamily(font).run();
  };

  // HTML 직접 편집 적용
  const applyHtmlChanges = () => {
    if (editor && htmlContent) {
      editor.commands.setContent(htmlContent);
      setIsHtmlDialogOpen(false);
    }
  };

  // 이미지 설정 적용
  const applyImageSettings = () => {
    if (editor && selectedImage) {
      const { pos } = selectedImage;
      const attrs = { ...selectedImage.attrs };

      // 숫자값 처리 - 빈 문자열은 undefined로
      const width = imageSettings.width ? parseInt(imageSettings.width, 10) : undefined;
      const height = imageSettings.height ? parseInt(imageSettings.height, 10) : undefined;

      // 속성 업데이트
      editor
        .chain()
        .focus()
        .setNodeSelection(pos)
        .updateAttributes('image', {
          width,
          height,
          alt: imageSettings.alt || undefined,
          title: imageSettings.title || undefined,
        })
        .run();

      setIsImageSettingsOpen(false);
    }
  };

  // 이미지 URL로 삽입
  const insertImageByUrl = () => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageDialog(false);
    }
  };

  // 파일을 이미지로 처리하는 공통 함수
  const processImageFile = (file) => {
    if (file && editor) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageDataUrl = event.target.result;
        editor.chain().focus().setImage({ src: imageDataUrl }).run();
        // 이미지 업로드 성공 시 팝업 닫기
        setShowImageDialog(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // 파일 선택 후 Base64로 이미지 삽입
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processImageFile(file);

    // 파일 선택 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 이미지 버튼 클릭 시 파일 선택 창 열기
  const handleImageButtonClick = () => {
    setShowImageDialog(!showImageDialog);
  };

  // 파일 선택 버튼 클릭
  const handleSelectFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 드래그 앤 드롭 이벤트 핸들러
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      // 이미지 파일인지 확인
      if (file.type.startsWith('image/')) {
        processImageFile(file);
      }
    }
  };

  // 현재 활성화된 스타일 확인
  const isActive = {
    bold: editor.isActive('bold'),
    italic: editor.isActive('italic'),
    underline: editor.isActive('underline'),
    h1: editor.isActive('heading', { level: 1 }),
    h2: editor.isActive('heading', { level: 2 }),
    h3: editor.isActive('heading', { level: 3 }),
    bulletList: editor.isActive('bulletList'),
    orderedList: editor.isActive('orderedList'),
    blockquote: editor.isActive('blockquote'),
    code: editor.isActive('code'),
  };

  return (
    <div className="border rounded-md">
      {editable && (
        <div className="p-2 border-b flex flex-wrap gap-1 bg-gray-50">
          {/* 서식 버튼 */}
          <Button
            variant={isActive.bold ? "default" : "outline"}
            size="icon"
            onClick={() => toggleTextStyle('bold')}
            className="h-8 w-8"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={isActive.italic ? "default" : "outline"}
            size="icon"
            onClick={() => toggleTextStyle('italic')}
            className="h-8 w-8"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant={isActive.underline ? "default" : "outline"}
            size="icon"
            onClick={() => toggleTextStyle('underline')}
            className="h-8 w-8"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={isActive.code ? "default" : "outline"}
            size="icon"
            onClick={() => toggleTextStyle('code')}
            className="h-8 w-8"
          >
            <Code className="h-4 w-4" />
          </Button>

          <div className="w-px h-8 bg-gray-300 mx-1"></div>

          {/* 제목 버튼 */}
          <Button
            variant={isActive.h1 ? "default" : "outline"}
            size="icon"
            onClick={() => toggleHeading(1)}
            className="h-8 w-8"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant={isActive.h2 ? "default" : "outline"}
            size="icon"
            onClick={() => toggleHeading(2)}
            className="h-8 w-8"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant={isActive.h3 ? "default" : "outline"}
            size="icon"
            onClick={() => toggleHeading(3)}
            className="h-8 w-8"
          >
            <Heading3 className="h-4 w-4" />
          </Button>

          <div className="w-px h-8 bg-gray-300 mx-1"></div>

          {/* 리스트 버튼 */}
          <Button
            variant={isActive.bulletList ? "default" : "outline"}
            size="icon"
            onClick={() => toggleList('bullet')}
            className="h-8 w-8"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={isActive.orderedList ? "default" : "outline"}
            size="icon"
            onClick={() => toggleList('ordered')}
            className="h-8 w-8"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <div className="w-px h-8 bg-gray-300 mx-1"></div>

          {/* 인용구 버튼 */}
          <Button
            variant={isActive.blockquote ? "default" : "outline"}
            size="icon"
            onClick={toggleBlockquote}
            className="h-8 w-8"
          >
            <Quote className="h-4 w-4" />
          </Button>

          <div className="w-px h-8 bg-gray-300 mx-1"></div>

          {/* 실행 취소/다시 실행 버튼 */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => undoRedo('undo')}
            className="h-8 w-8"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => undoRedo('redo')}
            className="h-8 w-8"
          >
            <Redo className="h-4 w-4" />
          </Button>

          <div className="w-px h-8 bg-gray-300 mx-1"></div>

          {/* 색상 선택 버튼 */}
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="h-8 w-8"
            >
              <Palette className="h-4 w-4" />
            </Button>

            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white p-2 border rounded-md shadow-md z-10 flex flex-wrap gap-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    className="w-5 h-5 rounded-sm border border-gray-300"
                    style={{ backgroundColor: color }}
                    onClick={() => setColor(color)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 이미지 삽입 버튼 */}
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={handleImageButtonClick}
              className="h-8 w-8"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>

            {showImageDialog && (
              <div className="absolute top-full left-0 mt-1 bg-white p-3 border rounded-md shadow-md z-10 w-80">
                <h3 className="text-sm font-medium mb-2">이미지 삽입</h3>

                {/* URL로 이미지 삽입 */}
                <div className="mb-4">
                  <div className="text-xs mb-1 font-medium">URL 주소로 이미지 삽입</div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 p-1 text-sm border rounded"
                    />
                    <Button
                      size="sm"
                      onClick={insertImageByUrl}
                      className="h-7 text-xs"
                    >
                      삽입
                    </Button>
                  </div>
                </div>

                {/* 로컬 파일 업로드 */}
                <div>
                  <div className="text-xs mb-2 font-medium">파일에서 이미지 선택</div>

                  {/* 숨겨진 파일 입력 */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* 파일 선택 버튼 */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectFileClick}
                    className="w-full flex items-center justify-center gap-2 h-9 mb-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>컴퓨터에서 이미지 선택</span>
                  </Button>

                  {/* 드래그 앤 드롭 영역 */}
                  <div
                    ref={dropAreaRef}
                    className={`border-2 border-dashed rounded-md p-4 text-center transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-300'}`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <p className="text-xs text-gray-600">
                      또는 이미지를 여기에 끌어다 놓으세요
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* HTML 편집 버튼 */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsHtmlDialogOpen(true)}
            className="h-8 w-8"
            title="HTML 직접 편집"
          >
            <Code2 className="h-4 w-4" />
          </Button>

          {/* 선택된 이미지가 있을 때만 이미지 설정 버튼 표시 */}
          {selectedImage && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsImageSettingsOpen(true)}
              className="h-8 w-8"
              title="이미지 설정"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          )}

          {/* 폰트 선택 */}
          <select
            onChange={(e) => setFontFamily(e.target.value)}
            className="h-8 px-2 text-sm border rounded-md"
          >
            <option value="">폰트 선택</option>
            {fonts.map((font) => (
              <option key={font.value} value={font.value}>
                {font.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 에디터 컨텐츠 영역 */}
      <EditorContent
        editor={editor}
        className="prose max-w-none p-4 min-h-[200px]"
      />

      {/* HTML 편집 대화상자 */}
      <Dialog open={isHtmlDialogOpen} onOpenChange={setIsHtmlDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>HTML 직접 편집</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              placeholder="HTML 코드를 직접 편집하세요..."
            />
            <p className="text-xs text-gray-500">
              주의: HTML을 직접 편집하면 에디터의 정상 작동에 영향을 줄 수 있습니다.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHtmlDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={applyHtmlChanges}>
              변경사항 적용
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 이미지 설정 대화상자 */}
      <Dialog open={isImageSettingsOpen} onOpenChange={setIsImageSettingsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>이미지 설정</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="image-width">너비 (px)</Label>
                <Input
                  id="image-width"
                  type="number"
                  value={imageSettings.width}
                  onChange={(e) => setImageSettings(prev => ({ ...prev, width: e.target.value }))}
                  placeholder="자동"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image-height">높이 (px)</Label>
                <Input
                  id="image-height"
                  type="number"
                  value={imageSettings.height}
                  onChange={(e) => setImageSettings(prev => ({ ...prev, height: e.target.value }))}
                  placeholder="자동"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-alt">대체 텍스트 (alt)</Label>
              <Input
                id="image-alt"
                value={imageSettings.alt}
                onChange={(e) => setImageSettings(prev => ({ ...prev, alt: e.target.value }))}
                placeholder="이미지에 대한 설명을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-title">제목 (title)</Label>
              <Input
                id="image-title"
                value={imageSettings.title}
                onChange={(e) => setImageSettings(prev => ({ ...prev, title: e.target.value }))}
                placeholder="마우스를 올렸을 때 표시할 제목"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImageSettingsOpen(false)}>
              취소
            </Button>
            <Button onClick={applyImageSettings}>
              적용
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 에디터 스타일 */}
      <style jsx global>{`
        .ProseMirror {
          outline: none !important;
        }
        .ProseMirror p {
          margin: 1em 0;
        }
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin-top: 0.67em;
          margin-bottom: 0.67em;
        }
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 0.83em;
          margin-bottom: 0.83em;
        }
        .ProseMirror h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 1em;
        }
        .ProseMirror blockquote {
          border-left: 4px solid #ccc;
          margin-left: 0;
          margin-right: 0;
          padding-left: 1em;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5em;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5em;
        }
        .ProseMirror code {
          background-color: rgba(97, 97, 97, 0.1);
          color: #616161;
          padding: 0.15em 0.25em;
          border-radius: 0.25em;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          margin: 1em 0;
          border-radius: 0.25em;
        }
        .ProseMirror img.tiptap-image {
          display: inline-block;
          cursor: pointer;
        }
        .ProseMirror img.tiptap-image.ProseMirror-selectednode {
          outline: 2px solid #4f46e5;
          outline-offset: 2px;
        }
        /* 이미지 리사이즈 핸들 스타일 */
        .resize-handle {
          position: absolute;
          width: 8px;
          height: 8px;
          background-color: #4f46e5;
          border: 2px solid #4f46e5;
          border-radius: 4px;
          z-index: 10;
        }
        .resize-handle.nw { top: -4px; left: -4px; cursor: nw-resize; }
        .resize-handle.ne { top: -4px; right: -4px; cursor: ne-resize; }
        .resize-handle.sw { bottom: -4px; left: -4px; cursor: sw-resize; }
        .resize-handle.se { bottom: -4px; right: -4px; cursor: se-resize; }
      `}</style>
    </div>
  );
}