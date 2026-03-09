import type { EChartsOption, SeriesOption } from "echarts";
import { z } from "zod";
import {
  applyCommonStyles,
  generateChartImage,
  getAnimationConfig,
  getColorPalette,
} from "../utils";
import {
  HeightSchema,
  OutputTypeSchema,
  ThemeSchema,
  TitleSchema,
  WidthSchema,
} from "../utils/schema";

// Funnel chart data schema
const data = z.object({
  category: z
    .string()
    .describe("Stage category name, such as 'Browse Website'."),
  value: z.number().describe("Value at this stage, such as 50000."),
});

export const generateFunnelChartTool = {
  name: "generate_funnel_chart",
  description:
    "Generate a funnel chart to visualize the progressive reduction of data as it passes through stages, such as, the conversion rates of users from visiting a website to completing a purchase.",
  inputSchema: z.object({
    data: z
      .array(data)
      .describe(
        "Data for funnel chart, such as, [{ category: 'Browse Website', value: 50000 }, { category: 'Add to Cart', value: 35000 }, { category: 'Generate Order', value: 25000 }].",
      )
      .nonempty({ message: "Funnel chart data cannot be empty." }),
    height: HeightSchema,
    theme: ThemeSchema,
    title: TitleSchema,
    width: WidthSchema,
    outputType: OutputTypeSchema,
  }),
  run: async (params: {
    data: Array<{ category: string; value: number }>;
    height: number;
    theme?: "default" | "dark";
    title?: string;
    width: number;
    outputType?: "png" | "svg" | "option";
  }) => {
    const { data, height, theme, title, width, outputType } = params;

    // Transform data for ECharts funnel chart
    const funnelData = data.map((item) => ({
      name: item.category,
      value: item.value,
    }));

    const colors = getColorPalette(theme);

    const series: Array<SeriesOption> = [
      {
        type: "funnel",
        data: funnelData,
        left: "10%",
        top: 60,
        width: "80%",
        height: "80%",
        min: 0,
        max: Math.max(...data.map((item) => item.value)),
        minSize: "0%",
        maxSize: "100%",
        sort: "descending",
        gap: 4,
        label: {
          show: true,
          position: "inside",
          fontSize: 13,
          color: "#fff",
          fontWeight: "bold",
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: "solid" as const,
          },
        },
        itemStyle: {
          borderColor: "#fff",
          borderWidth: 2,
        },
        emphasis: {
          label: {
            fontSize: 16,
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.2)",
          },
        },
      },
    ];

    const echartsOption: EChartsOption = {
      color: colors,
      series,
      title: {
        text: title,
      },
      tooltip: {
        trigger: "item",
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
      legend: {
        left: "center",
        orient: "horizontal",
        bottom: 10,
        data: funnelData.map((item) => item.name),
        icon: "circle",
        itemGap: 16,
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
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
      "generate_funnel_chart",
    );
  },
};
