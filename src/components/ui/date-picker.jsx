import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { ko } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePicker({ date, setDate, disabledDates, availableDates }) {
  // Popover 상태 관리
  const [open, setOpen] = React.useState(false);

  // 날짜 비활성화 함수
  const disabledDaysFilter = React.useCallback((day) => {
    if (disabledDates) {
      return disabledDates(day);
    }
    return false;
  }, [disabledDates]);

  // 사용 가능한 날짜 강조 표시
  const modifiers = React.useMemo(() => {
    return {
      available: availableDates || [],
    };
  }, [availableDates]);

  // 사용 가능한 날짜 스타일
  const modifiersStyles = React.useMemo(() => {
    return {
      available: {
        fontWeight: 'bold',
        border: '1px solid #4f46e5',
      },
    };
  }, []);

  // 날짜 선택 핸들러
  const handleSelect = (newDate) => {
    setDate(newDate);
    setOpen(false); // 날짜 선택 시 팝오버 닫기
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: ko }) : "날짜를 선택하세요"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          locale={ko}
          disabled={disabledDaysFilter}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          footer={
            <div className="px-4 pb-3 pt-0 text-center text-sm text-muted-foreground">
              <span className="inline-block w-3 h-3 mr-1 border border-indigo-500"></span>
              <span>주보가 등록된 날짜</span>
            </div>
          }
        />
      </PopoverContent>
    </Popover>
  );
}