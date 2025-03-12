"use client";

import { useState, useMemo, useEffect } from "react";
import { format, parse } from "date-fns";
import { ko } from "date-fns/locale";

import { DatePicker } from "@/components/ui/date-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { churchData } from "@/lib/sample-data";

// 찬송가 컴포넌트
const HymnViewer = ({ hymnNumber, onClose }) => {
  return (
    <div className="ml-0 sm:ml-11 mt-2 mb-4 bg-white shadow-md rounded-lg overflow-hidden border w-full">
      <div className="flex justify-between items-center p-3 border-b bg-gray-50">
        <h3 className="font-bold text-sm sm:text-base">찬송가 {hymnNumber}장</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
          aria-label="닫기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <div className="flex flex-col sm:flex-row sm:items-center mb-1">
              <span className="inline-flex justify-center items-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 text-gray-700 mr-2 sm:mr-3 flex-shrink-0 text-xs sm:text-sm mb-1 sm:mb-0">
                {item.order}
              </span>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 items-start sm:items-center">
                <div className="font-bold text-gray-800 text-sm sm:text-base">{item.name}</div>
                <div className="text-left sm:text-center text-gray-700 text-sm sm:text-base">
                  {hymnNumber ? (
                    <button
                      onClick={() => setActiveHymnItem(isActive ? null : item.order)}
                      className="text-left sm:text-center hover:bg-gray-50 p-1 rounded transition-colors underline text-sm sm:text-base"
                    >
                      {content}
                    </button>
                  ) : (
                    content
                  )}
                </div>
                <div className="text-left sm:text-right text-gray-600 text-xs sm:text-sm">{person}</div>
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
              <div className="ml-0 sm:ml-11 text-xs sm:text-sm text-gray-600 italic border-l-2 border-gray-200 pl-2 sm:pl-3 mt-2 overflow-x-auto">
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
          <div className="font-medium text-gray-800 mb-2">다음 주 순서 담당</div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.nextWeekDuty.map((duty, index) => (
              <li key={index} className="flex justify-between bg-gray-50 p-2 rounded">
                <span className="font-medium">{duty.name}</span>
                <span className="text-gray-600">{duty.person}</span>
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
          <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
          <p className="text-gray-600">{item.content}</p>
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
        <h3 className="text-xl font-bold mb-1">{data.name}</h3>
        <p className="text-gray-600">{data.address}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">연락처</h4>
          <p className="text-gray-600">전화: {data.tel}</p>
          <p className="text-gray-600">이메일: {data.email}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">담임 목사</h4>
          <p className="text-gray-600">{data.pastor}</p>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="font-medium mb-3">예배 시간</h4>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {data.services.map((service, index) => (
            <li key={index} className="flex justify-between bg-gray-50 p-3 rounded">
              <span className="font-medium">{service.name}</span>
              <span className="text-gray-600">{service.time}</span>
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
        <p className="text-amber-800 font-medium italic">
          {data.mainVerse}
        </p>
      </div>

      <div className="mt-4">
        <h3 className="font-medium mb-3">이번 주 묵상 말씀</h3>
        <ul className="space-y-3">
          {data.verses.map((verse, index) => (
            <li key={index} className="border-l-4 border-gray-200 pl-4 py-1">
              <div className="font-medium">{verse.day} - {verse.reference}</div>
              <p className="text-gray-600 mt-1">{verse.text}</p>
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
    <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4 max-w-4xl">
      <header className="mb-6 sm:mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">온라인 주보</h1>
        <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">사랑의 교회 온라인 주보 서비스</p>

        <div className="max-w-xs mx-auto mb-6 sm:mb-8">
          <DatePicker
            date={date}
            setDate={handleDateSelect}
            disabledDates={isDateDisabled}
            availableDates={availableDates}
          />
        </div>

        {selectedBulletin ? (
          <div className="mb-3 sm:mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold">{selectedBulletin.title}</h2>
          </div>
        ) : (
          <Card className="max-w-md mx-auto bg-amber-50">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6 py-3 sm:py-4">
              <p className="text-center text-amber-800 text-sm sm:text-base">
                선택하신 날짜({format(date, "yyyy년 MM월 dd일", { locale: ko })})에 해당하는 주보가 없습니다.
              </p>
            </CardContent>
          </Card>
        )}
      </header>

      {selectedBulletin && sections.length > 0 && (
        <main>
          <Tabs value={activeTab || defaultTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto pb-2">
              <TabsList className={`grid min-w-max w-full ${
                sections.length === 1 ? 'grid-cols-1' :
                sections.length === 2 ? 'grid-cols-2' :
                sections.length === 3 ? 'grid-cols-3' :
                sections.length === 4 ? 'grid-cols-4' :
                sections.length === 5 ? 'grid-cols-5' :
                sections.length >= 6 ? 'grid-cols-6' :
                'grid-cols-3'
              }`}>
                {sections.map(section => (
                  <TabsTrigger
                    key={section.key}
                    value={section.key}
                    className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                  >
                    {section.title}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {sections.map(section => (
              <TabsContent key={section.key} value={section.key} className="mt-4 sm:mt-6">
                <Card>
                  <CardHeader className="py-3 sm:py-6">
                    <CardTitle className="text-lg sm:text-xl">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm sm:text-base">
                    {renderSectionContent(section.key, selectedBulletin[section.key])}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </main>
      )}

      <footer className="mt-8 sm:mt-12 text-center text-gray-500 text-xs sm:text-sm">
        <p>© 2024 사랑의 교회 온라인 주보</p>
      </footer>
    </div>
  );
}
