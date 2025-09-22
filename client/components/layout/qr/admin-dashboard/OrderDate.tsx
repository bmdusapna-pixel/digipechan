import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ControllerRenderProps } from "react-hook-form";
import { OrderManagementSchema } from "@/types/statistics.types";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";

type OrderFormData = z.infer<typeof OrderManagementSchema>;
interface Props {
    isEditMode: boolean;
    form: UseFormReturn<OrderFormData>;
}

export const OrderDateField = ({ isEditMode, form }: Props) => {
    return (
        <FormField
            control={form.control}
            name="orderDate"
            render={({ field }: { field: ControllerRenderProps<OrderFormData, "orderDate"> }) => (
                <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Order Date</FormLabel>
                    <FormControl>
                        {isEditMode ? (
                            <div className="mt-1">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${
                                                !field.value ? "text-muted-foreground" : ""
                                            }`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.value ? field.value : "Pick a date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={
                                                field.value
                                                    ? (() => {
                                                          const [dd, mm, yyyy] = field.value.split("/");
                                                          return new Date(+yyyy, +mm - 1, +dd);
                                                      })()
                                                    : undefined
                                            }
                                            onSelect={(date) => {
                                                if (date) {
                                                    const formatted = format(date, "dd/MM/yyyy");
                                                    field.onChange(formatted);
                                                } else {
                                                    field.onChange("");
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        ) : (
                            <div className="mt-1 rounded border bg-gray-50 p-2 text-sm">{field.value}</div>
                        )}
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};
