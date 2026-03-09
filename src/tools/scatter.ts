import type { EChartsOption, SeriesOption } from "echarts";
import { z } from "zod";
import {
  applyCommonStyles,
  generateChartImage,
  getAnimationConfig,
  getColorPalette,
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

// Scatter chart data schema
const data = z.object({
  x: z.number().describe("X coordinate value of the data point."),
  y: z.number().describe("Y coordinate value of the data point."),
});

export const generateScatterChartTool = {
  name: "generate_scatter_chart",
  description:
    "Generate a scatter chart to show the relationship between two variables, helps discover their relationship or trends, such as, the strength of correlation, data distribution patterns.",
  inputSchema: z.object({
    axisXTitle: AxisXTitleSchema,
    axisYTitle: AxisYTitleSchema,
    data: z
      .array(data)
      .describe(
        "Data for scatter chart, such as, [{ x: 10, y: 15 }, { x: 20, y: 25 }].",
      )
      .nonempty({ message: "Scatter chart data cannot be empty." }),
    height: HeightSchema,
    theme: ThemeSchema,
    title: TitleSchema,
    width: WidthSchema,
    outputType: OutputTypeSchema,
  }),
  run: async (params: {
    axisXTitle?: string;
    axisYTitle?: string;
    data: Array<{ x: number; y: number }>;
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

    // Transform data for ECharts scatter chart
    const scatterData = data.map((item) => [item.x, item.y]);
    const colors = getColorPalette(theme);

    const series: Array<SeriesOption> = [
      {
        data: scatterData,
        type: "scatter",
        symbolSize: 10,
        itemStyle: {
          color: colors[0],
          borderColor: "#fff",
          borderWidth: 2,
        },
        emphasis: {
          focus: "series",
          itemStyle: {
            shadowBlur: 15,
            shadowOffsetX: 0,
            shadowColor: colors[0],
            borderColor: colors[0],
            borderWidth: 2,
          },
        },
      },
    ];

    const echartsOption: EChartsOption = {
      series,
      title: {
        text: title,
      },
      tooltip: {
        trigger: "item",
      },
      xAxis: {
        name: axisXTitle,
        type: "value",
        scale: true,
      },
      yAxis: {
        name: axisYTitle,
        type: "value",
        scale: true,
      },
      ...getAnimationConfig(),
    };

    // 应用清新简约风格样式
    const styledOption = applyCommonStyles(echartsOption, theme);

    return await generateChartImage(
      styledOption,
      width,
      height,
      theme,
      outputType,
      "generate_scatter_chart",
    );
  },
};
