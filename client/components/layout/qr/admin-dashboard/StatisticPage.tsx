"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRange } from "react-day-picker";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  LabelList,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useQueries } from "@tanstack/react-query";
import {
  formatChartDateRangeLabel,
  generalStatistics,
  monthlyRevenue,
  rangeRevenue,
  weeklyRevenue,
} from "@/lib/api/analytics/analyticsData";
import { CalendarDateRangePicker } from "@/components/custom-componets/date-range-picker/DateRangePicker";
import {
  PeriodicRevenueType,
  SalesPersonDataType,
} from "@/types/statistics.types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  IndianRupee,
  XCircle,
  QrCode,
  ShoppingCart,
  TrendingUp,
  Activity,
} from "lucide-react";
import { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { subDays, subYears, format } from "date-fns";
import OrderManagement from "./OrderManagement";
import BulkGenerationForm from "./bulkgene";
import { useRouter } from "next/navigation";

export default function StatisticsPage() {
  const [activeFilter, setActiveFilter] = useState<"weekly" | "monthly">(
    "weekly"
  );
  const router = useRouter();
  const [date, setDate] = useState<DateRange>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [weeklyDate, setWeeklyDate] = useState<DateRange>({
    from: subDays(new Date(), 42),
    to: new Date(),
  });
  const [monthlyDate, setMonthlyDate] = useState<DateRange>({
    from: subYears(new Date(), 1),
    to: new Date(),
  });

  const getRange = (date: DateRange) => ({
    startDateStr: format(date?.from || Date.now(), "dd/MM/yyyy"),
    endDateStr: format(date?.to || Date.now(), "dd/MM/yyyy"),
  });

  const result = useQueries({
    queries: [
      { queryKey: ["generalStatistics"], queryFn: generalStatistics },
      {
        queryKey: ["dailyRevenue", date],
        queryFn: () => rangeRevenue(getRange(date)),
      },
      {
        queryKey: ["monthlyRevenue", monthlyDate],
        queryFn: () => monthlyRevenue(getRange(monthlyDate)),
      },
      {
        queryKey: ["weeklyRevenue", weeklyDate],
        queryFn: () => weeklyRevenue(getRange(weeklyDate)),
      },
    ],
  });

  const [
    { data: generalStatisticsData },
    { data: dailyRevenueStatisticData },
    { data: monthlyRevenueStatisticData },
    { data: weeklyRevenueStatisticData },
  ] = result;

  const isLoading = result.some((res) => res.isLoading);

  if (isLoading) return <DashboardSkeleton />;

  type ChartDataPoint = {
    range: string;
    revenue: number;
  };

  const chartConfig = {
    revenue: { label: "Revenue Generated" },
  } satisfies ChartConfig;

  const periodicChartConfig = {
    weekly: { label: "Weekly Revenue ", color: "#3b82f6" },
    monthly: { label: "Monthly Revenue ", color: "#10b981" },
  } satisfies ChartConfig;

  const qrPerformanceChartConfig = {
    qr: { label: "Total Generated QR", color: "#8b5cf6" },
  } satisfies ChartConfig;

  function transformData(data: PeriodicRevenueType): ChartDataPoint[] {
    return Object.entries(data).map(([range, revenue]) => ({ range, revenue }));
  }

  const periodicChartData =
    activeFilter === "monthly"
      ? transformData(monthlyRevenueStatisticData!)
      : transformData(weeklyRevenueStatisticData!);

  const totalActiveQRs = generalStatisticsData?.statusCounts.filter(
    (sc) => sc.qrStatus === "ACTIVE"
  )[0]?.count;
  const totalInactiveQRs = generalStatisticsData?.statusCounts.filter(
    (sc) => sc.qrStatus === "INACTIVE"
  )[0]?.count;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="flex-1 space-y-6 p-6 pt-8 md:p-8">
        <div className="flex items-center justify-between mt-10">
          <div>
            <h1 className="bg-gradient-to-r from-blue-600 to-blue-600  bg-clip-text text-4xl font-bold text-transparent">
              Analytics Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Monitor performance and insights
            </p>
          </div>
        </div>

        <Tabs defaultValue="statistics" className="space-y-6">
          <TabsList className="gird w-2/3">
            <TabsTrigger
              value="statistics"
              className="data-[state=active]:bg-primary rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-gray-200"
            >
              Statistics
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-primary rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-gray-200"
            >
              Orders
            </TabsTrigger>
            {/* <TabsTrigger
              value="activation"
              className="data-[state=active]:bg-primary rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-gray-200"
            >
              QR Logs
            </TabsTrigger> */}
            {/* <TabsTrigger
              value="customers"
              className="data-[state=active]:bg-primary rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-gray-200"
            >
              Customers
            </TabsTrigger> */}
            <TabsTrigger
              value="qr-types"
              className="data-[state=active]:bg-primary rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-gray-200"
              onClick={()=>router.push("/qr/type_create")}

            >
              QR Types
            </TabsTrigger>
            <TabsTrigger
              value="bulk"
              className="data-[state=active]:bg-primary rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-gray-200"
            >
              Bulk QR
            </TabsTrigger>
            {/* <TabsTrigger
              value="new"
              className="data-[state=active]:bg-primary rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-gray-200"
            >
              Create QR
            </TabsTrigger> */}
          </TabsList>

          <TabsContent value="statistics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                        <ShoppingCart className="h-5 w-5 text-blue-600" />
                        QR Type Orders
                      </CardTitle>
                      <CardDescription className="mt-1 text-gray-600">
                        Distribution by delivery type
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {generalStatisticsData?.deliveryTypeResult?.map(
                      (type, index) => (
                        <div
                          key={type.deliveryType}
                          className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                index % 3 === 0
                                  ? "bg-blue-100 text-blue-600"
                                  : index % 3 === 1
                                    ? "bg-green-100 text-green-600"
                                    : "bg-purple-100 text-purple-600"
                              }`}
                            >
                              <QrCode className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {type.deliveryType?.replace(
                                  /(^\w|_\w)/g,
                                  (match) =>
                                    match.replace("_", " ").toUpperCase()
                                ) || 'Unknown'}
                              </div>
                              <div className="text-sm text-gray-500">
                                Delivery Type
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              <CountUp end={type.count} duration={2.5} />
                            </div>
                            <div className="text-sm text-gray-500">Orders</div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-white to-blue-50/50 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                    <Activity className="h-5 w-5 text-green-600" />
                    QR Status Overview
                  </CardTitle>
                  <CardDescription className="mt-1 text-gray-600">
                    Active vs Inactive QR codes
                  </CardDescription>
                </CardHeader>
                {totalActiveQRs && totalInactiveQRs && (
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-700">
                              Active QRs
                            </p>
                            <p className="mt-2 text-3xl font-bold text-green-800">
                              <CountUp end={totalActiveQRs} duration={2.5} />
                            </p>
                          </div>
                          <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="mt-4 flex items-center">
                          <TrendingUp className="mr-1 h-4 w-4 text-green-600" />
                          <p className="text-sm text-green-700">
                            {Math.round(
                              (totalActiveQRs /
                                (totalActiveQRs + totalInactiveQRs)) *
                                100
                            )}
                            % of total
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-red-700">
                              Inactive QRs
                            </p>
                            <p className="mt-2 text-3xl font-bold text-red-800">
                              <CountUp
                                end={totalInactiveQRs || 0}
                                duration={2.5}
                              />
                            </p>
                          </div>
                          <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <div className="mt-4 flex items-center">
                          <TrendingUp className="mr-1 h-4 w-4 rotate-180 text-red-600" />
                          <p className="text-sm text-red-700">
                            {Math.round(
                              (totalInactiveQRs /
                                (totalActiveQRs + totalInactiveQRs)) *
                                100
                            )}
                            % of total
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Activation Rate
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          <CountUp
                            end={Math.round(
                              (totalActiveQRs /
                                (totalActiveQRs + totalInactiveQRs)) *
                                100
                            )}
                            duration={2.5}
                            suffix="%"
                          />
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-1000 ease-out"
                          style={{
                            width: `${Math.round((totalActiveQRs / (totalActiveQRs + totalInactiveQRs)) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="col-span-2 border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-lg">
                <CardHeader className="flex flex-col items-stretch space-y-0 border-b border-gray-100 p-0 sm:flex-row">
                  <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-5 w-5 text-green-600" />
                      <span className="text-lg font-semibold text-gray-800">
                        Total Revenue: ₹
                        <CountUp
                          end={
                            dailyRevenueStatisticData?.accumulatedRevenue || 0
                          }
                          duration={2.5}
                          separator=","
                        />
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Daily revenue trend for selected period
                    </p>
                  </div>
                  <div className="px-6 py-5 sm:py-6">
                    <CalendarDateRangePicker date={date} setDate={setDate} />
                  </div>
                </CardHeader>
                <CardContent className="px-2 sm:p-6">
                  <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[280px] w-full"
                  >
                    <LineChart
                      accessibilityLayer
                      data={dailyRevenueStatisticData?.dailyRevenueData}
                      margin={{ left: 12, right: 12 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        minTickGap={32}
                        tickFormatter={(value) => value}
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            className="w-[200px] border border-gray-200 bg-white shadow-lg"
                            nameKey="revenue"
                            labelFormatter={(value) => value}
                            formatter={(value, name) => (
                              <>
                                <div
                                  className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-(--color-bg)"
                                  style={
                                    {
                                      "--color-bg": `var(--chart-1)`,
                                    } as React.CSSProperties
                                  }
                                />
                                {chartConfig["revenue"]?.label || name}
                                <div className="text-foreground ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums">
                                  {value}
                                  <span className="text-muted-foreground font-normal">
                                    ₹
                                  </span>
                                </div>
                              </>
                            )}
                          />
                        }
                      />
                      <Line
                        dataKey="dailyRevenue"
                        type="monotone"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-white to-purple-50/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <QrCode className="h-5 w-5 text-purple-600" />
                    QR Performance
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Generated QR by type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={qrPerformanceChartConfig}>
                    <BarChart
                      accessibilityLayer
                      data={generalStatisticsData?.qrTypePerformance}
                      margin={{ top: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="qrName"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => value}
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            className="w-[150px] border border-gray-200 bg-white shadow-lg"
                            nameKey="qr"
                            labelFormatter={(value) => value}
                          />
                        }
                      />
                      <Bar
                        dataKey="totalGenerated"
                        barSize={45}
                        fill="#8b5cf6"
                        radius={[8, 8, 0, 0]}
                      >
                        <LabelList
                          position="top"
                          offset={12}
                          className="fill-gray-600"
                          fontSize={12}
                        />
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="col-span-1">
                <Tabs
                  value={activeFilter}
                  onValueChange={(v) =>
                    setActiveFilter(v as "weekly" | "monthly")
                  }
                >
                  <TabsContent value={activeFilter}>
                    <Card className="border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-lg">
                      <CardHeader>
                        <div className="mb-4 flex items-center justify-between">
                          <TabsList className="border bg-white shadow-sm">
                            <TabsTrigger
                              value="weekly"
                              className="data-[state=active]:bg-primary data-[state=active]:text-white"
                            >
                              Weekly
                            </TabsTrigger>
                            <TabsTrigger
                              value="monthly"
                              className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                            >
                              Monthly
                            </TabsTrigger>
                          </TabsList>
                          <div className="flex items-center gap-2">
                            {activeFilter === "weekly" ? (
                              <CalendarDateRangePicker
                                date={weeklyDate}
                                setDate={setWeeklyDate}
                              />
                            ) : (
                              <CalendarDateRangePicker
                                date={monthlyDate}
                                setDate={setMonthlyDate}
                              />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <ChartContainer
                          config={periodicChartConfig}
                          className="aspect-auto h-[280px] w-full"
                        >
                          <BarChart
                            accessibilityLayer
                            data={periodicChartData}
                            margin={{ left: 12, right: 12 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#f0f0f0"
                            />
                            <XAxis
                              dataKey="range"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              minTickGap={3}
                              tickFormatter={(value) =>
                                formatChartDateRangeLabel(value)
                              }
                              tick={{ fill: "#6b7280", fontSize: 12 }}
                            />
                            <ChartTooltip
                              cursor={false}
                              content={
                                <ChartTooltipContent
                                  nameKey={activeFilter}
                                  className="w-[180px] border border-gray-200 bg-white shadow-lg"
                                  formatter={(value, name) => (
                                    <>
                                      <div
                                        className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-(--color-bg)"
                                        style={
                                          {
                                            "--color-bg":
                                              periodicChartConfig[activeFilter]
                                                ?.color || "#3b82f6",
                                          } as React.CSSProperties
                                        }
                                      />
                                      {periodicChartConfig[activeFilter]
                                        ?.label || name}
                                      <div className="text-foreground ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums">
                                        {value}
                                        <span className="text-muted-foreground font-normal">
                                          ₹
                                        </span>
                                      </div>
                                    </>
                                  )}
                                />
                              }
                            />
                            <Bar
                              dataKey="revenue"
                              barSize={50}
                              radius={[8, 8, 0, 0]}
                              maxBarSize={60}
                              fill={
                                activeFilter === "weekly"
                                  ? "#3b82f6"
                                  : "#10b981"
                              }
                            />
                          </BarChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              <Card className="border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                        <Activity className="h-5 w-5 text-blue-600" />
                        Sales Team Performance
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        Track QR generation and activation performance
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-gray-50/80">
                      <TableRow className="border-0">
                        <TableHead className="pl-6 font-semibold text-gray-700">
                          Sales Person
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Status
                        </TableHead>
                        <TableHead className="text-right font-semibold text-gray-700">
                          Generated QRs
                        </TableHead>
                        <TableHead className="pr-6 text-right font-semibold text-gray-700">
                          Active/Inactive
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generalStatisticsData?.salesPersonData?.map(
                        (person: SalesPersonDataType) => (
                          <TableRow
                            key={person.userId}
                            className="border-t border-gray-100 transition-colors hover:bg-gray-50/50"
                          >
                            <TableCell className="pl-6">
                              <div className="flex items-center space-x-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md">
                                  <span className="text-sm font-semibold">
                                    {person.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">
                                    {person.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {person.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {person.activeCount > person.inactiveCount ? (
                                <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 shadow-sm ring-1 ring-green-600/20 ring-inset">
                                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                  Performing
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 shadow-sm ring-1 ring-red-600/20 ring-inset">
                                  <XCircle className="mr-1.5 h-3.5 w-3.5" />
                                  Needs Attention
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="text-lg font-semibold text-gray-900">
                                <CountUp
                                  end={person.totalGenerated}
                                  duration={2}
                                />
                              </div>
                              <div className="text-xs text-gray-500">
                                Total Generated
                              </div>
                            </TableCell>
                            <TableCell className="pr-6 text-right">
                              <div className="mb-1 flex justify-end space-x-2">
                                <span className="font-semibold text-green-600">
                                  <CountUp
                                    end={person.activeCount}
                                    duration={2}
                                  />
                                </span>
                                <span className="text-gray-400">/</span>
                                <span className="font-semibold text-red-500">
                                  <CountUp
                                    end={person.inactiveCount}
                                    duration={2}
                                  />
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                <CountUp
                                  end={Math.round(
                                    (person.activeCount /
                                      (person.activeCount +
                                        person.inactiveCount)) *
                                      100
                                  )}
                                  duration={2}
                                  suffix="% active"
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bulk">
            <BulkGenerationForm />
          </TabsContent>

          <TabsContent value="orders">
            <OrderManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="flex-1 space-y-6 p-6 pt-8 md:p-8">
        <Skeleton className="h-12 w-[300px]" />

        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[200px] rounded-xl" />
          <Skeleton className="h-[200px] rounded-xl" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="col-span-2 h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function CountUp({
  end,
  duration = 2,
  suffix = "",
  separator = "",
}: {
  end: number;
  duration: number;
  suffix?: string;
  separator?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const start = 0;
    const totalFrames = duration * 60;
    const increment = end / totalFrames;
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      const currentCount = Math.min(start + increment * frame, end);
      setCount(currentCount);

      if (frame >= totalFrames) {
        clearInterval(counter);
      }
    }, 1000 / 60);

    return () => clearInterval(counter);
  }, [end, duration]);

  const formatNumber = (value: number) => {
    const rounded = Math.round(value);
    if (separator) {
      return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    }
    return rounded;
  };

  return (
    <span>
      {formatNumber(count)}
      {suffix}
    </span>
  );
}
