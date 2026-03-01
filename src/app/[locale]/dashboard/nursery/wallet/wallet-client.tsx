"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, Cell } from "recharts";
import { DateRange } from "react-day-picker";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { walletService } from "@/services/walletService";
import { DataTable } from "@/components/tables/DataTable";
import {
  useWalletBalanceHistoryColumns,
  BalanceHistoryItem,
} from "@/components/tables/data/wallet-balance-history";
import {
  useWalletWithdrawRequestsColumns,
  WithdrawRequest,
  WithdrawStatus,
} from "@/components/tables/data/wallet-withdraw-requests";
import { toastSuccess, toastError } from "@/lib/toast";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

// Tab types
type TableTab = "balanceHistory" | "withdrawRequests";
type WithdrawFilter = "all" | "accepted" | "pending" | "rejected";

export function WalletPageClient() {
  const t = useTranslations("wallet");
  const queryClient = useQueryClient();

  // Calendar State - restricted to 7 days
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: addDays(new Date(), -6),
    to: new Date(),
  });

  const [balanceTableDateRange, setBalanceTableDateRange] = React.useState<
    DateRange | undefined
  >({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  // Table state
  const [activeTab, setActiveTab] = React.useState<TableTab>("balanceHistory");
  const [withdrawFilter, setWithdrawFilter] =
    React.useState<WithdrawFilter>("all");

  // Fetch available balance
  const { data: balanceData, isLoading: isBalanceLoading } = useQuery({
    queryKey: ["walletBalance"],
    queryFn: walletService.getAvailableBalance,
  });

  // Fetch balance history
  const { data: balanceHistoryData, isLoading: isBalanceHistoryLoading } =
    useQuery({
      queryKey: ["walletBalanceHistory"],
      queryFn: walletService.getBalanceHistory,
    });

  // Fetch withdraw requests
  const { data: withdrawRequestsData, isLoading: isWithdrawRequestsLoading } =
    useQuery({
      queryKey: ["walletWithdrawRequests"],
      queryFn: walletService.getRequestRecords,
    });

  // Fetch daily income for chart
  const { data: dailyIncomeData, isLoading: isDailyIncomeLoading } = useQuery({
    queryKey: [
      "walletDailyIncome",
      dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : null,
      dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : null,
    ],
    queryFn: () =>
      walletService.getDailyBalance({
        from: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "",
        to: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "",
      }),
    enabled: !!dateRange?.from && !!dateRange?.to,
  });

  // Withdraw request mutation
  const withdrawMutation = useMutation({
    mutationFn: walletService.sendWithdrawRequest,
    onSuccess: () => {
      toastSuccess(t("success.withdrawSent"));
      queryClient.invalidateQueries({ queryKey: ["walletWithdrawRequests"] });
      queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
    },
    onError: (error: any) => {
      if (error?.message?.includes("No available balance")) {
        toastError(t("errors.noBalance"));
      } else {
        toastError(t("errors.withdrawFailed"));
      }
    },
  });

  // Compute cumulative balance from the last item in balance history
  const cumulativeBalance = React.useMemo(() => {
    const historyData = balanceHistoryData?.data as BalanceHistoryItem[];
    if (historyData && historyData.length > 0) {
      return historyData[historyData.length - 1].balance_after;
    }
    return 0;
  }, [balanceHistoryData]);

  // Process chart data from API response
  const chartData = React.useMemo(() => {
    if (!dailyIncomeData?.data?.days) return [];

    return dailyIncomeData.data.days.map((day: any) => {
      const amount = day.total_income;
      let fill = "var(--color-primary-green-600)";
      let bgFill = "var(--color-primary-green-50)";

      if (amount < 100) {
        fill = "var(--color-danger-600)";
        bgFill = "var(--color-danger-50)";
      } else if (amount < 150) {
        fill = "var(--color-warning-600)";
        bgFill = "var(--color-warning-50)";
      }

      return {
        day: format(new Date(day.date), "d MMMM", { locale: ar }),
        originalDate: day.date,
        amount,
        fill,
        bgFill,
      };
    });
  }, [dailyIncomeData]);

  // Get table columns
  const balanceHistoryColumns = useWalletBalanceHistoryColumns();
  const withdrawRequestsColumns = useWalletWithdrawRequestsColumns();

  // Filter withdraw requests
  const filteredWithdrawRequests = React.useMemo(() => {
    const requests = (withdrawRequestsData?.data || []) as WithdrawRequest[];
    if (withdrawFilter === "all") return requests;
    return requests.filter((r) => r.status === withdrawFilter);
  }, [withdrawRequestsData, withdrawFilter]);

  // Filter balance history client-side based on date range
  const filteredBalanceHistory = React.useMemo(() => {
    const history = (balanceHistoryData?.data || []) as BalanceHistoryItem[];
    if (!balanceTableDateRange?.from) return history;

    return history.filter((item) => {
      const paymentDateStr =
        item.payments?.[item.payments.length - 1]?.paid_at ||
        item.enrollment_date;
      if (!paymentDateStr) return false;
      const paymentDate = new Date(paymentDateStr);

      const from = balanceTableDateRange.from!;
      const to = balanceTableDateRange.to || from; // If to is undefined, use from (single day)

      // Reset times for accurate date comparison
      const checkDate = new Date(
        paymentDate.getFullYear(),
        paymentDate.getMonth(),
        paymentDate.getDate(),
      );
      const fromDate = new Date(
        from.getFullYear(),
        from.getMonth(),
        from.getDate(),
      );
      const toDate = new Date(to.getFullYear(), to.getMonth(), to.getDate());

      return checkDate >= fromDate && checkDate <= toDate;
    });
  }, [balanceHistoryData, balanceTableDateRange]);

  const toggleView = () => {
    setActiveTab((prev) =>
      prev === "balanceHistory" ? "withdrawRequests" : "balanceHistory",
    );
  };

  const handleWithdrawRequest = () => {
    withdrawMutation.mutate();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[264px]">
        {/* Info Cards Column */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-4 h-full justify-start">
          {/* Total Balance Card */}
          <Card className="flex flex-1 justify-between items-center p-6 bg-white border shadow-none relative overflow-hidden">
            <div className=" z-10">
              <h3 className="text-base text-gray font-bold mb-2">
                {t("availableBalance")}
              </h3>
              <p className="text-sm text-info mt-2 cursor-pointer">
                {t("canWithdraw")}
              </p>
            </div>
            <div className="text-3xl lg:text-5xl font-bold text-primary flex items-center justify-center gap-1">
              {isBalanceLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <>
                  <span>{balanceData?.available_balance || 0}</span>
                  <span className="sar">$</span>
                </>
              )}
            </div>
          </Card>

          {/* Cumulative Balance Card */}
          <Card className="flex flex-col flex-1 justify-center p-6 bg-primary text-primary-foreground shadow-none border-none relative overflow-hidden">
            <h3 className="relative z-60 text-lg font-medium mb-2 opacity-90">
              {t("cumulativeBalance")}
            </h3>
            <div className="text-3xl lg:text-5xl font-bold flex items-center gap-1">
              {isBalanceHistoryLoading ? (
                <Skeleton className="h-10 w-24 bg-white/20" />
              ) : (
                <>
                  <span>{cumulativeBalance}</span>
                  <span className="sar">$</span>
                </>
              )}
            </div>

            <div className="z-50 absolute rtl:left-0 ltr:right-0 ltr:rotate-y-180 top-1/2 -translate-y-1/2">
              <Image
                src="/assets/illustrations/safe-money.png"
                alt="wallet"
                width={144}
                height={124}
              />
            </div>

            <div className="z-40 absolute w-full aspect-square rtl:right-[60%] ltr:left-[50%] ltr:rotate-y-180 top-1/2 -translate-y-1/2">
              <div className="rotate-90 absolute w-full h-full rounded-full blue-gradient" />
              <div className="rotate-45 absolute w-full h-full rounded-full blue-gradient -translate-x-[15px]" />
              <div className="absolute w-full h-full rounded-full blue-gradient -translate-x-[30px]" />
            </div>
          </Card>
        </div>

        {/* Chart Section */}
        <div className="lg:col-span-2 h-full">
          <Card className="h-full border-none shadow-none flex flex-col">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-lg font-medium">
                {t("dailyChanges")}
              </CardTitle>
              <div className="relative">
                <WalletDateRangePicker
                  date={dateRange}
                  setDate={setDateRange}
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 ">
              {isDailyIncomeLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Skeleton className="h-40 w-full" />
                </div>
              ) : (
                <WalletChart data={chartData} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Table Section */}
      <div className="mt-4">
        <Card className="border-none shadow-none">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Left Side: Buttons (Toggle View & Request Withdraw) */}
              <div className="flex items-center gap-2">
                {/* Withdraw Request Button */}
                <Button
                  onClick={handleWithdrawRequest}
                  disabled={
                    withdrawMutation.isPending ||
                    (balanceData?.available_balance || 0) <= 0
                  }
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  {withdrawMutation.isPending ? "..." : t("requestWithdraw")}
                </Button>

                {/* Toggle View Button */}
                <Button
                  variant="outline"
                  onClick={toggleView}
                  className="border-light-gray! hover:bg-gray-50! text-mid-gray!"
                >
                  {activeTab === "balanceHistory"
                    ? t("showWithdrawHistory")
                    : t("showBalanceHistory")}
                </Button>
              </div>

              {/* Right Side: Filters or Date Picker */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {activeTab === "withdrawRequests" ? (
                  // Withdraw Filters
                  <div className="flex flex-wrap items-center gap-2">
                    {(["all", "accepted", "pending", "rejected"] as const).map(
                      (filter) => (
                        <Button
                          key={filter}
                          variant={
                            withdrawFilter === filter ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setWithdrawFilter(filter)}
                          className={cn(
                            "text-xs rounded-full px-4 h-8",
                            withdrawFilter === filter
                              ? filter === "all"
                                ? "bg-primary text-white"
                                : filter === "accepted"
                                  ? "bg-success text-white"
                                  : filter === "pending"
                                    ? "bg-warning text-white"
                                    : "bg-danger text-white"
                              : "border-gray-200 text-gray-500 hover:text-gray-700",
                          )}
                        >
                          {t(`filters.${filter}`)}
                        </Button>
                      ),
                    )}
                  </div>
                ) : (
                  // Balance History Date Picker
                  <WalletDateRangePicker
                    date={balanceTableDateRange}
                    setDate={setBalanceTableDateRange}
                    allowUnrestricted={true}
                  />
                )}
              </div>
            </div>
          </CardHeader>
          <div>
            {activeTab === "balanceHistory" ? (
              <DataTable
                columns={balanceHistoryColumns}
                data={filteredBalanceHistory}
                isLoading={isBalanceHistoryLoading}
                pagination
              />
            ) : (
              <DataTable
                columns={withdrawRequestsColumns}
                data={filteredWithdrawRequests}
                isLoading={isWithdrawRequestsLoading}
                pagination
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

const chartConfig = {
  amount: {
    label: "الرصيد",
    color: "var(--color-primary-blue)",
  },
} satisfies ChartConfig;

function WalletChart({ data }: { data: any[] }) {
  return (
    <ChartContainer
      config={chartConfig}
      className="h-52 lg:h-full w-full aspect-auto!"
    >
      <BarChart accessibilityLayer data={data} margin={{ top: 20 }}>
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          stroke="#e5e7eb"
        />
        <XAxis
          dataKey="day"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value}
        />
        <ChartTooltip cursor={false} content={<CustomWalletTooltip />} />
        <Bar
          dataKey="amount"
          radius={[8, 8, 0, 0]}
          barSize={36}
          background={(props: any) => {
            return (
              <rect
                x={props.x}
                y={props.y}
                width={props.width}
                vertOriginY={0}
                height={"76%"}
                fill={data[props.index]?.bgFill || "#f3f4f6"}
                rx={8}
                ry={8}
              />
            );
          }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

const CustomWalletTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-sm px-1 py-0.5 mb-1">
        <p className="text-primary font-bold text-lg flex items-center justify-center gap-1">
          {payload[0].value} <span className="sar text-sm font-medium">$</span>
        </p>
      </div>
    );
  }
  return null;
};

export function WalletDateRangePicker({
  date,
  setDate,
  allowUnrestricted = false,
}: {
  date: DateRange | undefined;
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  allowUnrestricted?: boolean;
}) {
  const handleSelect = (range: DateRange | undefined) => {
    if (allowUnrestricted) {
      setDate(range);
      return;
    }
    // Strictly enforce 7 days from the selected start date
    if (range?.from) {
      const from = range.from;
      const to = addDays(from, 6);
      setDate({ from, to });
    } else {
      setDate(range);
    }
  };

  return (
    <div className={cn("grid gap-2")}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className="font-normal text-light-gray border-light-gray! hover:bg-gray-50!"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
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
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
