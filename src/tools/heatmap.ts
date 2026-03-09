import type { EChartsOption, SeriesOption } from "echarts";
import { z } from "zod";
import {
  applyCommonStyles,
  generateChartImage,
  getAnimationConfig,
} from "../utils";
import {
  AxisXTitleSchema,
  AxisYTitleSchema,
  HeightSchema,
  OutputTypeSchema,
  ThemeSchema,
  TitleSchema,
  WidthSchema,
} from "../utils/schema";

// Heatmap chart data schema
const data = z.object({
  x: z
    .union([z.string(), z.number()])
    .describe("X axis value, such as 'Mon' or 0."),
  y: z
    .union([z.string(), z.number()])
    .describe("Y axis value, such as 'AM' or 0."),
  value: z.number().describe("Heat value at this position, such as 5."),
});

export const generateHeatmapChartTool = {
  name: "generate_heatmap_chart",
  description:
    "Generate a heatmap chart to display data density or intensity distribution, such as, user activity patterns by time and day, or correlation matrix.",
  inputSchema: z.object({
    axisXTitle: AxisXTitleSchema,
    axisYTitle: AxisYTitleSchema,
    data: z
      .array(data)
      .describe(
        "Data for heatmap chart, such as, [{ x: 'Mon', y: '12AM', value: 5 }, { x: 'Tue', y: '1AM', value: 3 }].",
      )
      .nonempty({ message: "Heatmap chart data cannot be empty." }),
    height: HeightSchema,
    theme: ThemeSchema,
    title: TitleSchema,
    width: WidthSchema,
    outputType: OutputTypeSchema,
  }),
  run: async (params: {
    axisXTitle?: string;
    axisYTitle?: string;
    data: Array<{ x: string | number; y: string | number; value: number }>;
    height: number;
    theme?: "default" | "dark";
    title?: string;
    width: number;
    outputType?: "png" | "svg" | "option";
  }) => {
    const {
      axisXTitle,
      axisYTitle,
      data,
      height,
      theme,
      title,
      width,
      outputType,
    } = params;

    // Extract unique x and y values
    const xValues = Array.from(new Set(data.map((item) => item.x))).sort();
    const yValues = Array.from(new Set(data.map((item) => item.y))).sort();

    // Create data map for quick lookup
    const dataMap = new Map();
    for (const item of data) {
      dataMap.set(`${item.x}_${item.y}`, item.value);
    }

    // Transform data for ECharts heatmap
    const heatmapData = [];
    for (let i = 0; i < xValues.length; i++) {
      for (let j = 0; j < yValues.length; j++) {
        const value = dataMap.get(`${xValues[i]}_${yValues[j]}`) || 0;
        heatmapData.push([i, j, value]);
      }
    }

    // Calculate value range for visual map
    const values = data.map((item) => item.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    const series: Array<SeriesOption> = [
      {
        type: "heatmap",
        data: heatmapData,
        label: {
          show: true,
          fontSize: 10,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ];

    const echartsOption: EChartsOption = {
      grid: {
        height: "60%",
        top: "15%",
        right: "15%",
        bottom: "10%",
      },
      series,
      title: {
        text: title,
      },
      tooltip: {
        position: "top",
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
      visualMap: {
        min: minValue,
        max: maxValue,
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: "15%",
        inRange: {
          color: [
            "#A8E6CF",
            "#88D8B0",
            "#6BCF7F",
            "#4ECDC4",
            "#5ECECE",
            "#45B7AF",
            "#3BA99A",
          ],
        },
        textStyle: {
          color: "#666",
          fontSize: 12,
        },
      },
      xAxis: {
        type: "category",
        data: xValues,
        name: axisXTitle,
        splitArea: {
          show: true,
        },
        axisLine: {
          lineStyle: {
            color: "#E8E8E8",
          },
        },
        axisLabel: {
          color: "#666",
          fontSize: 12,
        },
      },
      yAxis: {
        type: "category",
        data: yValues,
        name: axisYTitle,
        splitArea: {
          show: true,
        },
        axisLine: {
          lineStyle: {
            color: "#E8E8E8",
          },
        },
        axisLabel: {
          color: "#666",
          fontSize: 12,
        },
      },
      ...getAnimationConfig(),
    };

    // 应用通用样式
    const styledOption = applyCommonStyles(echartsOption, theme);

    return await generateChartImage(
      styledOption,
      width,
      height,
      theme,
      outputType,
      "generate_heatmap_chart",
    );
  },
};
