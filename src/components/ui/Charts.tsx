"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

// ApexCharts touches window on import, so it stays out of the server bundle.
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <div className="h-[320px] animate-pulse rounded-xl bg-gray-200" />,
});

const AXIS = {
  style: {
    fontSize: "12px",
    fontWeight: 400,
    colors: "#919EAB",
    fontFamily: "var(--font-dm-sans)",
  },
};

export function RevenueChart({
  categories,
  series,
}: {
  categories: string[];
  series: { name: string; data: number[] }[];
}) {
  const options: ApexOptions = {
    colors: ["#00a858", "#f88838"],
    chart: { type: "area", height: 320, zoom: { enabled: false }, toolbar: { show: false } },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.28, opacityTo: 0.02, stops: [0, 90, 100] },
    },
    grid: { borderColor: "#919EAB3D", strokeDashArray: 3 },
    xaxis: { categories, labels: AXIS, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: {
      labels: {
        ...AXIS,
        formatter: (v: number) =>
          v >= 1_000_000 ? `₦${(v / 1_000_000).toFixed(0)}m` : `₦${(v / 1000).toFixed(0)}k`,
      },
    },
    tooltip: { y: { formatter: (v: number) => `₦${v.toLocaleString()}` } },
    legend: { show: true, position: "top", horizontalAlign: "right", fontFamily: "var(--font-dm-sans)" },
  };

  return <ReactApexChart options={options} series={series} type="area" height={320} />;
}

export function OrderMixChart({
  labels,
  series,
}: {
  labels: string[];
  series: number[];
}) {
  const options: ApexOptions = {
    chart: { type: "donut", height: 292 },
    labels,
    colors: ["#00a858", "#f88838", "#1890ff", "#5fd69b"],
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    legend: {
      position: "bottom",
      fontFamily: "var(--font-dm-sans)",
      markers: { size: 6 },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Orders",
              fontFamily: "var(--font-urbanist)",
              fontWeight: 700,
              color: "#212529",
            },
          },
        },
      },
    },
    responsive: [{ breakpoint: 480, options: { chart: { height: 250 } } }],
  };

  return <ReactApexChart options={options} series={series} type="donut" height={292} />;
}
