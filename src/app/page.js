"use client";

import { useState, useMemo, useEffect } from "react";
import { format, parse } from "date-fns";
import { ko } from "date-fns/locale";

import { DatePicker } from "@/components/ui/date-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { churchData } from "@/lib/sample-data";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Calendar } from '@/components/ui/calendar';
import { TiptapEditor } from '@/components/ui/tiptap-editor';

// 찬송가 컴포넌트
const HymnViewer = ({ hymnNumber, onClose }) => {
  return (
    <div className="ml-0 mt-2 mb-4 bg-white shadow-md rounded-lg overflow-hidden border w-full">
      <div className="flex justify-between items-center p-3 border-b bg-gray-50">
        <h3 className="font-bold text-base sm:text-lg">찬송가 {hymnNumber}장</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
          aria-label="닫기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div className="p-0">
        <iframe
          src={`/hymns/${hymnNumber}.html`}
          className="w-full border-0"
          style={{ height: '250px', minHeight: '200px', maxHeight: '50vh' }}
          title={`찬송가 ${hymnNumber}장`}
        />
      </div>
    </div>
  );
};

// 예배 순서 컴포넌트
const WorshipSection = ({ data }) => {
  const [activeHymnItem, setActiveHymnItem] = useState(null);

  return (
    <ul className="space-y-4">
      {data.items.map((item) => {
        // 설명에서 담당자와 내용 분리
        let content = "";
        let person = item.description;

        // 설명에 '-'가 있으면 앞부분은 내용, 뒷부분은 담당자로 간주
        if (item.description.includes(" - ")) {
          const parts = item.description.split(" - ");
          content = parts[0];
          person = parts[1];
        } else if (item.description.includes("찬송가")) {
          content = item.description;
          person = "";
        }

        // 찬송가 번호 추출
        let hymnNumber = null;
        if (content.includes("찬송가")) {
          const match = content.match(/찬송가\s+(\d+)장/);
          if (match && match[1]) {
            hymnNumber = match[1];
          }
        }

        // 성경 구절이 있는지 확인 (성경봉독 항목인 경우)
        const hasBibleVerse = item.name === "성경봉독" && item.verse;

        // 성경 구절을 절별로 분리
        let verseLines = [];
        if (hasBibleVerse) {
          // 줄바꿈으로 구분된 경우
          if (item.verse.includes('\n')) {
            verseLines = item.verse.split('\n').filter(line => line.trim() !== '');
          }
          // 절 번호로 구분된 경우 (예: (16절), (17절) 등)
          else if (item.verse.includes('절)')) {
            // 절 번호를 포함하여 분리
            const matches = item.verse.match(/\(\d+절\)[^(]*/g) || [];
            if (matches.length > 0) {
              verseLines = matches.map(match => match.trim());
            } else {
              verseLines = [item.verse];
            }
          }
          // 그 외의 경우 그대로 사용
          else {
            verseLines = [item.verse];
          }
        }

        const isActive = activeHymnItem === item.order;

        return (
          <li key={item.order} className="flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center mb-2">
              <span className="inline-flex justify-center items-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 text-gray-700 mr-2 sm:mr-3 flex-shrink-0 text-sm sm:text-base mb-1 sm:mb-0">
                {item.order}
              </span>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 items-start sm:items-center">
                <div className="font-bold text-gray-800 text-base sm:text-lg">{item.name}</div>
                <div className="text-left sm:text-center text-gray-700 text-base sm:text-lg">
                  {hymnNumber ? (
                    <button
                      onClick={() => setActiveHymnItem(isActive ? null : item.order)}
                      className="text-left sm:text-center hover:bg-gray-50 p-1 rounded transition-colors underline text-base sm:text-lg"
                    >
                      {content}
                    </button>
                  ) : (
                    content
                  )}
                </div>
                <div className="text-left sm:text-right text-gray-600 text-sm sm:text-base">{person}</div>
              </div>
            </div>

            {/* 찬송가 뷰어 - 해당 항목 바로 아래에 표시 */}
            {isActive && hymnNumber && (
              <HymnViewer
                hymnNumber={hymnNumber}
                onClose={() => setActiveHymnItem(null)}
              />
            )}

            {hasBibleVerse && (
              <div className="ml-0 sm:ml-11 text-sm sm:text-base text-gray-600 italic border-l-2 border-gray-200 pl-3 sm:pl-4 mt-2 overflow-x-auto">
                <ul className="list-none space-y-1">
                  {verseLines.map((line, i) => {
                    // 줄바꿈으로 구분된 경우 앞에 있는 숫자가 절 번호
                    let verseText = line;
                    let verseNum = "";

                    // 줄 시작이 숫자로 시작하는 경우 (예: "25 예수께서...")
                    if (/^\d+\s/.test(line)) {
                      const parts = line.match(/^(\d+)\s(.+)$/);
                      if (parts) {
                        verseNum = parts[1];
                        verseText = parts[2];
                      }
                    }
                    // 절 번호가 괄호 안에 있는 경우 (예: "...(16절)")
                    else if (line.includes('절)')) {
                      const parts = line.match(/\((\d+)절\)\s*(.+)/);
                      if (parts) {
                        verseNum = parts[1];
                        verseText = parts[2];
                      }
                    }

                    return (
                      <li key={i} className="flex">
                        {verseNum && (
                          <span className="font-semibold mr-1 text-gray-700 min-w-[1.5rem]">{verseNum}</span>
                        )}
                        <span>{verseText}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </li>
        );
      })}

      {/* 다음 주 순서 담당자 예고 */}
      {data.nextWeekDuty && (
        <li className="mt-6 pt-4 border-t border-gray-200">
          <div className="font-medium text-gray-800 mb-2 text-base sm:text-lg">다음 주 순서 담당</div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.nextWeekDuty.map((duty, index) => (
              <li key={index} className="flex justify-between bg-gray-50 p-3 rounded">
                <span className="font-medium text-base">{duty.name}</span>
                <span className="text-gray-600 text-base">{duty.person}</span>
              </li>
            ))}
          </ul>
        </li>
      )}
    </ul>
  );
};

// 공지사항 컴포넌트
const AnnouncementsSection = ({ data }) => {
  return (
    <ul className="space-y-6">
      {data.items.map((item) => (
        <li key={item.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
          <h3 className="font-semibold text-lg sm:text-xl mb-1">{item.title}</h3>
          <p className="text-gray-600 text-base sm:text-lg">{item.content}</p>
        </li>
      ))}
    </ul>
  );
};

// 교회 정보 컴포넌트
const ChurchInfoSection = ({ data }) => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl sm:text-2xl font-bold mb-1">{data.name}</h3>
        <p className="text-gray-600 text-base sm:text-lg">{data.address}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2 text-lg">연락처</h4>
          <p className="text-gray-600 text-base">전화: {data.tel}</p>
          <p className="text-gray-600 text-base">이메일: {data.email}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2 text-lg">담임 목사</h4>
          <p className="text-gray-600 text-base">{data.pastor}</p>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="font-medium mb-3 text-lg">예배 시간</h4>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {data.services.map((service, index) => (
            <li key={index} className="flex justify-between bg-gray-50 p-3 rounded">
              <span className="font-medium text-base">{service.name}</span>
              <span className="text-gray-600 text-base">{service.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// 주간 말씀 컴포넌트
const WeeklyVerseSection = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 p-4 rounded-lg text-center">
        <p className="text-amber-800 font-medium italic text-base sm:text-lg">
          {data.mainVerse}
        </p>
      </div>

      <div className="mt-4">
        <h3 className="font-medium mb-3 text-lg">이번 주 묵상 말씀</h3>
        <ul className="space-y-3">
          {data.verses.map((verse, index) => (
            <li key={index} className="border-l-4 border-gray-200 pl-4 py-1">
              <div className="font-medium text-base">{verse.day} - {verse.reference}</div>
              <p className="text-gray-600 mt-1 text-base">{verse.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// 섹션 타입별 컴포넌트 렌더링 함수
const renderSectionContent = (section, data) => {
  switch (data.type) {
    case "worship":
      return <WorshipSection data={data} />;
    case "announcements":
      return <AnnouncementsSection data={data} />;
    case "churchInfo":
      return <ChurchInfoSection data={data} />;
    case "weeklyVerse":
      return <WeeklyVerseSection data={data} />;
    default:
      // 저녁 예배도 worship 타입과 동일하게 처리
      if (section === "eveningWorship") {
        return <WorshipSection data={data} />;
      }
      return <p>지원되지 않는 섹션 타입입니다.</p>;
  }
};

// 모바일 메뉴 컴포넌트
const MobileMenu = ({ sections, activeTab, setActiveTab }) => {
  const [open, setOpen] = useState(false);

  const handleMenuItemClick = (key) => {
    setActiveTab(key);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="메뉴 열기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[80%] max-w-sm pt-6">
        <div className="flex justify-between items-center border-b pb-2 mb-6">
          <SheetTitle className="text-lg font-bold text-gray-800">메뉴</SheetTitle>
          <SheetClose className="rounded-full p-1 hover:bg-gray-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span className="sr-only">닫기</span>
          </SheetClose>
        </div>
        <nav className="flex flex-col space-y-2">
          {sections.map(section => (
            <button
              key={section.key}
              onClick={() => handleMenuItemClick(section.key)}
              className={`p-4 text-left rounded-md text-base transition-all ${
                activeTab === section.key
                  ? 'bg-gray-100 font-medium border-l-4 border-gray-500 pl-3'
                  : 'hover:bg-gray-50 border-l-4 border-transparent pl-3'
              }`}
            >
              {section.title}
            </button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default function Home() {
  const [date, setDate] = useState(new Date());
  const formattedDate = format(date, "yyyy-MM-dd");
  const selectedBulletin = churchData[formattedDate] || null;

  // 현재 선택된 탭 상태 관리
  const [activeTab, setActiveTab] = useState("");

  // 주보가 등록된 날짜 목록 생성
  const availableDates = useMemo(() => {
    return Object.keys(churchData).map(dateStr => {
      // yyyy-MM-dd 형식의 문자열을 Date 객체로 변환
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day); // 월은 0부터 시작하므로 -1
    });
  }, []);

  // 날짜 선택 함수
  const handleDateSelect = (newDate) => {
    if (newDate) {
      setDate(newDate);
      // 날짜가 변경되면 첫 번째 탭으로 리셋
      setActiveTab("");
    }
  };

  // 날짜 비활성화 함수 (주보가 없는 날짜는 비활성화)
  const isDateDisabled = (date) => {
    // 날짜를 yyyy-MM-dd 형식으로 변환
    const dateStr = format(date, "yyyy-MM-dd");
    // 해당 날짜에 주보가 없으면 true 반환 (비활성화)
    return !churchData[dateStr];
  };

  // 선택된 주보에서 사용 가능한 섹션 키를 추출
  const sections = useMemo(() => {
    if (!selectedBulletin) return [];

    // 주보 데이터에서 title 속성이 있는 객체 키만 필터링
    return Object.entries(selectedBulletin)
      .filter(([key, value]) =>
        value &&
        typeof value === 'object' &&
        value.title &&
        value.type
      )
      .map(([key, value]) => ({
        key,
        title: value.title,
        type: value.type
      }));
  }, [selectedBulletin]);

  // 첫 번째 탭을 기본값으로 설정
  const defaultTab = useMemo(() => {
    return sections.length > 0 ? sections[0].key : "";
  }, [sections]);

  // 탭이 변경될 때마다 activeTab 상태 업데이트
  useEffect(() => {
    if (defaultTab && !activeTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab, activeTab]);

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">주보 시스템</h1>
        <Sheet>
          <SheetTrigger asChild>
            <button className="md:hidden bg-primary text-white px-3 py-2 rounded-md text-sm">
              메뉴
            </button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetTitle className="text-lg font-semibold mb-4">섹션 메뉴</SheetTitle>
            <MobileMenu
              sections={sections}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* 날짜 선택 UI */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="w-full md:w-auto">
            <DatePicker
              date={date}
              setDate={setDate}
              disabledDates={isDateDisabled}
              availableDates={availableDates}
            />
          </div>
          <div className="text-lg font-semibold flex-1">
            {formattedDate && (
              <div>
                <span className="hidden md:inline">선택한 날짜: </span>
                {format(date, "yyyy년 MM월 dd일 (EEEE)", { locale: ko })}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedBulletin ? (
        <div className="flex flex-col md:flex-row gap-6">
          {/* 좌측 메뉴 영역 (태블릿/데스크탑) */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
              <h2 className="font-semibold text-lg mb-3">섹션 메뉴</h2>
              <ul className="space-y-1">
                {sections.map(section => (
                  <li key={section.key}>
                    <button
                      onClick={() => setActiveTab(section.key)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${activeTab === section.key ? 'bg-primary text-white' : 'hover:bg-gray-200'
                        }`}
                    >
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 주보 내용 영역 */}
          <div className="flex-1">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="mb-4 overflow-x-auto flex flex-nowrap w-full md:hidden">
                {sections.map(section => (
                  <TabsTrigger
                    key={section.key}
                    value={section.key}
                    className="whitespace-nowrap"
                  >
                    {section.title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {sections.map(section => (
                <TabsContent key={section.key} value={section.key} className="pt-2">
                  {renderSectionContent(section, selectedBulletin[section.key])}
                </TabsContent>
              ))}

              {activeTab === "" && sections.length > 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-500">왼쪽 메뉴에서 섹션을 선택해주세요</p>
                </div>
              )}
            </Tabs>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            해당 날짜의 주보가 없습니다
          </h2>
          <p className="text-gray-500">
            다른 날짜를 선택하시거나 관리자에게 문의해주세요
          </p>
        </div>
      )}

      {/* TipTap 에디터 샘플 페이지 링크 */}
      <div className="mt-16 text-center">
        <a
          href="/editor-sample"
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          TipTap 에디터 샘플 페이지 가기
        </a>
        <p className="mt-2 text-sm text-gray-500">
          HTML 에디터를 사용해보고 싶으시면 위 링크를 클릭해주세요.
        </p>
      </div>
    </div>
  );
}
