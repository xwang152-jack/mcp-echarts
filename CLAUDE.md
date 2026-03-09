# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCP ECharts is a Model Context Protocol (MCP) server that generates visual charts using Apache ECharts. It provides 18+ chart generation tools as MCP tools that can be called by AI assistants to create PNG, SVG, or validated ECharts option JSON outputs.

## Development Commands

```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript (output: build/ directory)
npm run build

# Run tests
npm test

# Start MCP server with inspector for testing
npm run start

# Format and lint code (runs via lint-staged on commit)
biome check --write
biome format --write
biome lint
```

## Transport Types

The server supports three MCP transport protocols:

- **stdio** (default): For desktop apps (Claude, VSCode, Cline)
- **sse**: Server-Sent Events - HTTP endpoint at `/sse` with `/messages` for POST
- **streamable**: HTTP with streaming - endpoint at `/mcp`

CLI options:
```bash
mcp-echarts -t sse -p 3033        # SSE transport on port 3033
mcp-echarts -t streamable -e /mcp # Streamable transport
mcp-echarts -t stdio              # stdio (default)
```

## Architecture

### Tool Registration Pattern

All chart generation tools are defined in `src/tools/` and follow this pattern:

1. **Tool Definition**: Each file exports a tool object with:
   - `name`: MCP tool name (e.g., `generate_line_chart`)
   - `description`: Help text for AI models
   - `inputSchema`: Zod schema defining parameters
   - `run`: Async function that generates the chart

2. **Tool Export**: `src/tools/index.ts` collects all tools into an array for registration

3. **Server Registration**: `src/index.ts` iterates over tools and registers them with the MCP server using `server.tool()`

### Chart Generation Pipeline

```
Tool (src/tools/*.ts)
  └─> generateChartImage() (utils/imageHandler.ts)
       ├─> renderECharts() (utils/render.ts) - uses @napi-rs/canvas
       └─> MinIO storage (utils/minio.ts) - optional, falls back to Base64
```

- **renderECharts**: Pure function rendering ECharts to Buffer (PNG) or string (SVG/option)
- **generateChartImage**: Orchestrates rendering and output (Base64 image, text URL, or text content)
- **MinIO Integration**: Optional - if configured via env vars, stores images and returns URLs; otherwise returns Base64 data

### Zod Schema Pattern

Reusable schemas in `src/utils/schema.ts`:
- `WidthSchema`, `HeightSchema`: Chart dimensions (default: 800x600)
- `ThemeSchema`: ECharts theme ("default" | "dark")
- `OutputTypeSchema`: Output format ("png" | "svg" | "option")
- `AxisXTitleSchema`, `AxisYTitleSchema`: Axis labels
- `zodToJsonSchema()`: Converts Zod schemas to JSON Schema for MCP protocol

Special helper: `createHierarchicalSchema()` generates nested schemas for tree-like data structures (sunburst, treemap) with explicit nesting to avoid unresolvable `$ref` issues with strict JSON Schema clients like PydanticAI.

### MinIO Configuration

Optional object storage via environment variables (see `.env.example`):
- `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_USE_SSL`
- `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`
- `MINIO_BUCKET_NAME`

If not configured or unavailable, falls back to Base64 image data in MCP responses.

### Debug Mode

Set `DEBUG_MCP_ECHARTS=true` to enable debug logging to stderr (doesn't interfere with MCP protocol).

## Code Conventions

- **TypeScript**: Strict mode enabled, CommonJS modules
- **Linter/Formatter**: Biome (not ESLint/Prettier)
  - Double quotes for JavaScript/TypeScript
  - 2-space indentation
  - `lint-staged` runs on pre-commit via Husky
- **Font**: Uses AlibabaPuHuiTi-3-55-Regular.otf for Chinese character support (registered via `@napi-rs/canvas`)
- **Error Handling**: Tool errors thrown as `Error` objects; MinIO failures gracefully fall back to Base64

## Adding New Chart Tools

1. Create new file in `src/tools/` (e.g., `mychart.ts`)
2. Import utilities: `generateChartImage`, schemas from `../utils/schema`
3. Define Zod input schema with descriptive `.describe()` calls for AI guidance
4. Export tool object with `name`, `description`, `inputSchema`, `run`
5. Import and add to tools array in `src/tools/index.ts`
6. Build and test: `npm run build && npm run start`

## Font Path

The font file is at `fonts/AlibabaPuHuiTi-3-55-Regular.otf` (relative to project root). The build output includes the `fonts` directory for distribution.
