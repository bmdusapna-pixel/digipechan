"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dispatch, SetStateAction, useState } from "react";
import { PopoverClose } from "@radix-ui/react-popover";

type CalendarDateRangePickerPropsType = {
    className?: string;
    setDate: Dispatch<SetStateAction<DateRange>>;
    date: DateRange | undefined;
};

export function CalendarDateRangePicker({ className, setDate, date }: CalendarDateRangePickerPropsType) {
    const [tempDate, setTempDate] = useState<DateRange | undefined>(date);

    const handleApply = () => {
        if (tempDate) {
            setDate(tempDate);
        }
    };

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[260px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        mode="range"
                        defaultMonth={tempDate?.to}
                        selected={tempDate}
                        onSelect={setTempDate}
                        numberOfMonths={2}
                    />
                    <div className="flex justify-end border-t p-2">
                        <PopoverClose asChild>
                            <Button onClick={handleApply} size="sm">
                                Apply Filter
                            </Button>
                        </PopoverClose>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
