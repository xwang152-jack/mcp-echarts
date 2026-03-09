import type { EChartsOption } from "echarts";

/**
 * 清新简约风格配色方案
 * Soft, modern color palette for clean and simple design
 */
export const COLOR_PALETTES = {
  // 主色调 - 清新的蓝绿色系
  primary: [
    "#5ECECE", // 青色
    "#4ECDC4", // 薄荷绿
    "#45B7AF", // 深青
    "#3BA99A", // 深绿青
    "#88D8B0", // 浅绿
    "#6BCF7F", // 草绿
    "#A8E6CF", // 极浅绿
    "#FFD93D", // 柔和黄
    "#FFB347", // 柔和橙
    "#FF8B94", // 柔和红
  ],

  // 渐变色 - 用于面积图、柱状图等
  gradients: [
    ["#5ECECE", "#4ECDC4"],
    ["#45B7AF", "#3BA99A"],
    ["#88D8B0", "#6BCF7F"],
    ["#FFD93D", "#FFB347"],
    ["#FF8B94", "#FF6B6B"],
  ],

  // 深色主题配色
  dark: [
    "#64E3D3",
    "#4FD1C5",
    "#38B2AC",
    "#319795",
    "#81E6D9",
    "#4FD1C5",
    "#B2F5EA",
    "#FAF089",
    "#FBD38D",
    "#FC8181",
  ],
};

/**
 * 通用样式配置
 */
export const COMMON_STYLES = {
  // 网格样式
  grid: {
    left: "5%",
    right: "5%",
    top: "15%",
    bottom: "15%",
    containLabel: true,
  },

  // 坐标轴样式
  axisLine: {
    lineStyle: {
      color: "#E8E8E8",
      width: 1,
    },
  },

  // 分隔线样式
  splitLine: {
    lineStyle: {
      color: "#F0F0F0",
      width: 1,
      type: "dashed" as const,
    },
  },

  // 坐标轴标签样式
  axisLabel: {
    color: "#666",
    fontSize: 12,
  },

  // 坐标轴名称样式
  axisName: {
    color: "#999",
    fontSize: 13,
    padding: [0, 0, 0, 0],
  },

  // Tooltip 样式
  tooltip: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderColor: "#E8E8E8",
    borderWidth: 1,
    textStyle: {
      color: "#333",
      fontSize: 13,
    },
    extraCssText:
      "box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border-radius: 8px;",
  },

  // 图例样式
  legend: {
    textStyle: {
      color: "#666",
      fontSize: 12,
    },
    icon: "circle" as const,
    itemGap: 16,
    itemWidth: 10,
    itemHeight: 10,
  },

  // 标题样式
  title: {
    textStyle: {
      color: "#333",
      fontSize: 18,
      fontWeight: 600,
    },
    left: "center",
    top: "3%",
  },
};

/**
 * 获取配色方案
 */
export function getColorPalette(
  theme: "default" | "dark" = "default",
): string[] {
  return theme === "dark" ? COLOR_PALETTES.dark : COLOR_PALETTES.primary;
}

/**
 * 创建渐变色配置
 */
export function createGradientColor(
  colors: [string, string],
  index: number,
): {
  type: "linear";
  x: number;
  y: number;
  x2: number;
  y2: number;
  colorStops: Array<{ offset: number; color: string }>;
} {
  return {
    type: "linear" as const,
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: colors[0] },
      { offset: 1, color: colors[1] },
    ],
  };
}

/**
 * 应用通用样式到 ECharts 配置
 */
export function applyCommonStyles(
  option: EChartsOption,
  theme: "default" | "dark" = "default",
): EChartsOption {
  const colors = getColorPalette(theme);

  return {
    color: colors,
    ...option,
    grid: option.grid
      ? { ...COMMON_STYLES.grid, ...option.grid }
      : COMMON_STYLES.grid,
    xAxis: option.xAxis
      ? Array.isArray(option.xAxis)
        ? option.xAxis.map((axis) => ({
            ...COMMON_STYLES.axisLine,
            ...COMMON_STYLES.splitLine,
            ...COMMON_STYLES.axisLabel,
            ...COMMON_STYLES.axisName,
            ...axis,
          }))
        : {
            ...COMMON_STYLES.axisLine,
            ...COMMON_STYLES.splitLine,
            ...COMMON_STYLES.axisLabel,
            ...COMMON_STYLES.axisName,
            ...option.xAxis,
          }
      : undefined,
    yAxis: option.yAxis
      ? Array.isArray(option.yAxis)
        ? option.yAxis.map((axis) => ({
            ...COMMON_STYLES.axisLine,
            ...COMMON_STYLES.splitLine,
            ...COMMON_STYLES.axisLabel,
            ...COMMON_STYLES.axisName,
            ...axis,
          }))
        : {
            ...COMMON_STYLES.axisLine,
            ...COMMON_STYLES.splitLine,
            ...COMMON_STYLES.axisLabel,
            ...COMMON_STYLES.axisName,
            ...option.yAxis,
          }
      : undefined,
    tooltip: option.tooltip
      ? { ...COMMON_STYLES.tooltip, ...option.tooltip }
      : COMMON_STYLES.tooltip,
    legend: option.legend
      ? { ...COMMON_STYLES.legend, ...option.legend }
      : undefined,
    title: option.title
      ? { ...COMMON_STYLES.title, ...option.title }
      : undefined,
  };
}

/**
 * 添加动画配置
 */
export function getAnimationConfig() {
  return {
    animation: true,
    animationDuration: 1000,
    animationEasing: "cubicOut" as const,
    animationDelay: (idx: number) => idx * 50,
  };
}
