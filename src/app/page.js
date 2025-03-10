import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  // 샘플 게시글 데이터
  const posts = [
    {
      id: 1,
      title: "첫 번째 게시글",
      content: "이것은 첫 번째 게시글의 내용입니다.",
      author: "사용자1",
      date: "2024-03-10",
    },
    {
      id: 2,
      title: "두 번째 게시글",
      content: "이것은 두 번째 게시글의 내용입니다. 조금 더 긴 내용을 가지고 있습니다.",
      author: "사용자2",
      date: "2024-03-09",
    },
    {
      id: 3,
      title: "세 번째 게시글",
      content: "이것은 세 번째 게시글의 내용입니다. 가장 최근에 작성된 게시글입니다.",
      author: "사용자3",
      date: "2024-03-08",
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">게시판</h1>
        <div className="flex justify-between items-center">
          <p className="text-gray-500">최신 게시글을 확인하세요</p>
          <Button>새 게시글 작성</Button>
        </div>
      </header>

      <main className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
              <CardDescription>
                작성자: {post.author} | 날짜: {post.date}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>{post.content}</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" size="sm">자세히 보기</Button>
              <Button variant="secondary" size="sm">수정</Button>
            </CardFooter>
          </Card>
        ))}
      </main>

      <footer className="mt-12 text-center text-gray-500">
        <p>© 2024 게시판 애플리케이션</p>
      </footer>
    </div>
  );
}
