"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Trash2, Church, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";

export default function ChurchesPage() {
  const [churches, setChurches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newChurch, setNewChurch] = useState({
    church_code: "",
    name: "",
    address: "",
    contact_info: ""
  });
  const [codeAvailable, setCodeAvailable] = useState(null);
  const [codeCheckMessage, setCodeCheckMessage] = useState("");
  const [codeCheckLoading, setCodeCheckLoading] = useState(false);

  const router = useRouter();

  // 교회 목록 불러오기
  useEffect(() => {
    const fetchChurches = async () => {
      try {
        setLoading(true);
        const data = await api.get('/churches');
        setChurches(data);
      } catch (error) {
        console.error("교회 목록을 불러오는데 실패했습니다:", error);
        toast.error("교회 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchChurches();
  }, []);

  // 교회 코드 중복 확인
  const checkChurchCode = async () => {
    if (!newChurch.church_code) {
      setCodeAvailable(false);
      setCodeCheckMessage("교회 구분값을 입력해주세요.");
      return;
    }

    try {
      setCodeCheckLoading(true);
      const response = await api.get(`/churches/check-code/${newChurch.church_code}`);
      setCodeAvailable(response.available);
      setCodeCheckMessage(response.message);
    } catch (error) {
      console.error("교회 코드 확인 중 오류 발생:", error);
      setCodeAvailable(false);
      setCodeCheckMessage("교회 구분값 확인 중 오류가 발생했습니다.");
    } finally {
      setCodeCheckLoading(false);
    }
  };

  // 교회 생성
  const handleCreateChurch = async () => {
    if (!newChurch.church_code || !newChurch.name) {
      toast.error("교회 구분값과 이름은 필수 입력 항목입니다.");
      return;
    }

    if (codeAvailable !== true) {
      toast.error("사용 가능한 교회 구분값인지 확인해주세요.");
      return;
    }

    try {
      const createdChurch = await api.post('/churches', newChurch);
      setChurches([...churches, createdChurch]);
      setNewChurch({
        church_code: "",
        name: "",
        address: "",
        contact_info: ""
      });
      setCodeAvailable(null);
      setCodeCheckMessage("");

      toast.success("새 교회가 성공적으로 생성되었습니다.");
    } catch (error) {
      console.error("교회 생성 중 오류 발생:", error);
      toast.error(error.response?.data?.detail || "교회 생성 중 오류가 발생했습니다.");
    }
  };

  // 교회 삭제
  const handleDeleteChurch = async (id) => {
    try {
      await api.delete(`/churches/${id}`);
      setChurches(churches.filter(church => church.id !== id));
      toast.success("교회가 성공적으로 삭제되었습니다.");
    } catch (error) {
      console.error("교회 삭제 중 오류 발생:", error);
      toast.error("교회 삭제 중 오류가 발생했습니다.");
    }
  };

  // 검색 필터링
  const filteredChurches = churches.filter(church =>
    church.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    church.church_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">교회 관리</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> 교회 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>새 교회 추가</DialogTitle>
              <DialogDescription>
                새로운 교회 정보를 입력해주세요. 교회 구분값과 이름은 필수 입력 항목입니다.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="church_code" className="text-right">
                  교회 구분값*
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    id="church_code"
                    value={newChurch.church_code}
                    onChange={(e) => {
                      setNewChurch({ ...newChurch, church_code: e.target.value });
                      setCodeAvailable(null);
                      setCodeCheckMessage("");
                    }}
                    placeholder="영문, 숫자, 하이픈, 언더스코어만 사용 가능"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={checkChurchCode}
                    disabled={codeCheckLoading}
                  >
                    확인
                  </Button>
                </div>
              </div>
              {codeCheckMessage && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <div></div>
                  <div className={`col-span-3 text-sm ${codeAvailable ? 'text-green-600' : 'text-red-600'}`}>
                    {codeCheckMessage}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  교회 이름*
                </Label>
                <Input
                  id="name"
                  value={newChurch.name}
                  onChange={(e) => setNewChurch({ ...newChurch, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  주소
                </Label>
                <Input
                  id="address"
                  value={newChurch.address}
                  onChange={(e) => setNewChurch({ ...newChurch, address: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contact_info" className="text-right">
                  연락처
                </Label>
                <Input
                  id="contact_info"
                  value={newChurch.contact_info}
                  onChange={(e) => setNewChurch({ ...newChurch, contact_info: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">취소</Button>
              </DialogClose>
              <Button onClick={handleCreateChurch}>추가</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <Input
          placeholder="교회 이름 또는 구분값으로 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : filteredChurches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChurches.map((church) => (
            <Card key={church.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <CardTitle className="flex justify-between items-center">
                  <span className="truncate">{church.name}</span>
                  <span className="text-sm font-normal text-gray-500">{church.church_code}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  {church.address && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">주소:</span> {church.address}
                    </p>
                  )}
                  {church.contact_info && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">연락처:</span> {church.contact_info}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/churches/${church.id}`)}
                >
                  <Church className="mr-2 h-4 w-4" /> 관리
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/churches/${church.id}/edit`)}
                  >
                    <Edit className="mr-2 h-4 w-4" /> 수정
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" /> 삭제
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>교회 삭제</AlertDialogTitle>
                        <AlertDialogDescription>
                          정말로 "{church.name}" 교회를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteChurch(church.id)}>
                          삭제
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <AlertCircle className="h-10 w-10 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">교회가 없습니다</h3>
          <p className="text-sm text-gray-500 mt-2 mb-4 text-center max-w-md">
            {searchTerm
              ? "검색 조건에 맞는 교회가 없습니다. 다른 검색어를 입력해보세요."
              : "아직 등록된 교회가 없습니다. 새 교회를 추가해보세요."}
          </p>
          {!searchTerm && (
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> 교회 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                {/* 교회 추가 다이얼로그 내용 (위와 동일) */}
                <DialogHeader>
                  <DialogTitle>새 교회 추가</DialogTitle>
                  <DialogDescription>
                    새로운 교회 정보를 입력해주세요. 교회 구분값과 이름은 필수 입력 항목입니다.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="church_code_empty" className="text-right">
                      교회 구분값*
                    </Label>
                    <div className="col-span-3 flex gap-2">
                      <Input
                        id="church_code_empty"
                        value={newChurch.church_code}
                        onChange={(e) => {
                          setNewChurch({ ...newChurch, church_code: e.target.value });
                          setCodeAvailable(null);
                          setCodeCheckMessage("");
                        }}
                        placeholder="영문, 숫자, 하이픈, 언더스코어만 사용 가능"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={checkChurchCode}
                        disabled={codeCheckLoading}
                      >
                        확인
                      </Button>
                    </div>
                  </div>
                  {codeCheckMessage && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <div></div>
                      <div className={`col-span-3 text-sm ${codeAvailable ? 'text-green-600' : 'text-red-600'}`}>
                        {codeCheckMessage}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name_empty" className="text-right">
                      교회 이름*
                    </Label>
                    <Input
                      id="name_empty"
                      value={newChurch.name}
                      onChange={(e) => setNewChurch({ ...newChurch, name: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="address_empty" className="text-right">
                      주소
                    </Label>
                    <Input
                      id="address_empty"
                      value={newChurch.address}
                      onChange={(e) => setNewChurch({ ...newChurch, address: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="contact_info_empty" className="text-right">
                      연락처
                    </Label>
                    <Input
                      id="contact_info_empty"
                      value={newChurch.contact_info}
                      onChange={(e) => setNewChurch({ ...newChurch, contact_info: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">취소</Button>
                  </DialogClose>
                  <Button onClick={handleCreateChurch}>추가</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}
    </div>
  );
}