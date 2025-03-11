"use client";

import { useState, useMemo } from "react";
import { format, parse } from "date-fns";
import { ko } from "date-fns/locale";

import { DatePicker } from "@/components/ui/date-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { bulletinData } from "@/lib/sample-data";

// 탭 메뉴에 표시할 섹션 이름 매핑
const sectionTitles = {
  worship: "예배 순서",
  announcements: "교회 소식",
  churchInfo: "교회 정보",
  weeklyVerse: "주간 말씀"
};

export default function Home() {
  const [date, setDate] = useState(new Date());
  const formattedDate = format(date, "yyyy-MM-dd");
  const selectedBulletin = bulletinData[formattedDate] || null;

  // 선택된 주보에서 사용 가능한 섹션 키를 추출
  const availableSections = useMemo(() => {
    if (!selectedBulletin) return [];

    // 주보 데이터에서 title 속성이 있는 객체 키만 필터링
    return Object.keys(selectedBulletin).filter(key =>
      selectedBulletin[key] &&
      typeof selectedBulletin[key] === 'object' &&
      selectedBulletin[key].title
    );
  }, [selectedBulletin]);

  // 첫 번째 탭을 기본값으로 설정
  const defaultTab = availableSections.length > 0 ? availableSections[0] : "";

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">온라인 주보</h1>
        <p className="text-gray-500 mb-6">사랑의 교회 온라인 주보 서비스</p>

        <div className="max-w-xs mx-auto mb-8">
          <DatePicker date={date} setDate={setDate} />
        </div>

        {selectedBulletin ? (
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">{selectedBulletin.title}</h2>
          </div>
        ) : (
          <Card className="max-w-md mx-auto bg-amber-50">
            <CardContent className="pt-6">
              <p className="text-center text-amber-800">
                선택하신 날짜({format(date, "yyyy년 MM월 dd일", { locale: ko })})에 해당하는 주보가 없습니다.
              </p>
            </CardContent>
          </Card>
        )}
      </header>

      {selectedBulletin && availableSections.length > 0 && (
        <main>
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className={`grid w-full ${
              availableSections.length === 1 ? 'grid-cols-1' :
              availableSections.length === 2 ? 'grid-cols-2' :
              availableSections.length === 3 ? 'grid-cols-3' :
              availableSections.length === 4 ? 'grid-cols-4' :
              availableSections.length === 5 ? 'grid-cols-5' :
              'grid-cols-3'
            }`}>
              {availableSections.map(section => (
                <TabsTrigger key={section} value={section}>
                  {selectedBulletin[section].title || sectionTitles[section] || section}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* 예배 순서 탭 */}
            {availableSections.includes('worship') && (
              <TabsContent value="worship" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedBulletin.worship.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {selectedBulletin.worship.items.map((item) => (
                        <li key={item.order} className="flex items-start">
                          <span className="inline-flex justify-center items-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 mr-3">
                            {item.order}
                          </span>
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-gray-600">{item.description}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* 교회 소식 탭 */}
            {availableSections.includes('announcements') && (
              <TabsContent value="announcements" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedBulletin.announcements.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-6">
                      {selectedBulletin.announcements.items.map((item) => (
                        <li key={item.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                          <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                          <p className="text-gray-600">{item.content}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* 교회 정보 탭 */}
            {availableSections.includes('churchInfo') && (
              <TabsContent value="churchInfo" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedBulletin.churchInfo.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold mb-1">{selectedBulletin.churchInfo.name}</h3>
                        <p className="text-gray-600">{selectedBulletin.churchInfo.address}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">연락처</h4>
                          <p className="text-gray-600">전화: {selectedBulletin.churchInfo.tel}</p>
                          <p className="text-gray-600">이메일: {selectedBulletin.churchInfo.email}</p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">담임 목사</h4>
                          <p className="text-gray-600">{selectedBulletin.churchInfo.pastor}</p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h4 className="font-medium mb-3">예배 시간</h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {selectedBulletin.churchInfo.services.map((service, index) => (
                            <li key={index} className="flex justify-between bg-gray-50 p-3 rounded">
                              <span className="font-medium">{service.name}</span>
                              <span className="text-gray-600">{service.time}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* 주간 말씀 탭 */}
            {availableSections.includes('weeklyVerse') && (
              <TabsContent value="weeklyVerse" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedBulletin.weeklyVerse.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="bg-amber-50 p-4 rounded-lg text-center">
                        <p className="text-amber-800 font-medium italic">
                          {selectedBulletin.weeklyVerse.mainVerse}
                        </p>
                      </div>

                      <div className="mt-4">
                        <h3 className="font-medium mb-3">이번 주 묵상 말씀</h3>
                        <ul className="space-y-3">
                          {selectedBulletin.weeklyVerse.verses.map((verse, index) => (
                            <li key={index} className="border-l-4 border-gray-200 pl-4 py-1">
                              <div className="font-medium">{verse.day} - {verse.reference}</div>
                              <p className="text-gray-600 mt-1">{verse.text}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </main>
      )}

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>© 2024 사랑의 교회 온라인 주보</p>
      </footer>
    </div>
  );
}
