import { API_ENDPOINTS } from "@/common/constants/apiEndpoints";
import { API_METHODS } from "@/common/constants/apiMethods";
import { apiRequest } from "@/common/utils/apiClient";
import { IQR } from "@/types/qr.types";
import {
    DailyRangedRevenueType,
    DateRangeType,
    GeneralStatisticsType,
    OrderData,
    PeriodicRevenueType,
} from "@/types/statistics.types";
import { parse, format, isLastDayOfMonth } from "date-fns";

export const generalStatistics = async () => {
    try {
        const res = await apiRequest<GeneralStatisticsType>(API_METHODS.GET, API_ENDPOINTS.generalStatistics);
        return res as GeneralStatisticsType;
    } catch (error) {
        console.error("Error in the check qr validation", error);
        throw error;
    }
};

export const rangeRevenue = async (dateRange: DateRangeType) => {
    try {
        const res = await apiRequest<DailyRangedRevenueType>(
            API_METHODS.POST,
            API_ENDPOINTS.dailyRangedRevenue,
            dateRange
        );
        return res as DailyRangedRevenueType;
    } catch (error) {
        console.error("Error in the check qr validation", error);
        throw error;
    }
};

export const weeklyRevenue = async (dateRange: DateRangeType) => {
    try {
        const res = await apiRequest<PeriodicRevenueType>(API_METHODS.POST, API_ENDPOINTS.weeklyRevenue, dateRange);
        return res as PeriodicRevenueType;
    } catch (error) {
        console.error("Error in the check qr validation", error);
    }
};
export const monthlyRevenue = async (dateRange: DateRangeType) => {
    try {
        const res = await apiRequest<PeriodicRevenueType>(API_METHODS.POST, API_ENDPOINTS.monthlyRevenue, dateRange);
        return res as PeriodicRevenueType;
    } catch (error) {
        console.error("Error in the check qr validation", error);
    }
};

export const formatChartDateRangeLabel = (range: string) => {
    const [start, end] = range.split(" - ");
    const startDate = parse(start, "dd-MM-yyyy", new Date());
    const endDate = parse(end, "dd-MM-yyyy", new Date());

    return isLastDayOfMonth(endDate) ? format(startDate, "MMM ''yy") : format(startDate, "d MMM");
};

export const fetchOrders = async (search: string) => {
    try {
        const res = await apiRequest<{ data: OrderData[] }>(API_METHODS.POST, API_ENDPOINTS.fetchOrders, {
            search: search,
        });
        return res?.data as OrderData[];
    } catch (error) {
        console.error("Error in the check qr validation", error);
    }
};

export const updateOrder = async (orderData: Partial<OrderData>) => {
    try {
        const res = await apiRequest<IQR>(API_METHODS.PUT, API_ENDPOINTS.updateOrder, orderData);
        return res as IQR;
    } catch (error) {
        console.error("Error in the check qr validation", error);
    }
};
