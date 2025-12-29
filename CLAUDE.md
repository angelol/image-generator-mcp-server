# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An MCP (Model Context Protocol) server that provides image generation capabilities using OpenAI's GPT Image model (gpt-image-1.5), with optional high-resolution upscaling via Topaz Labs API.

## Commands

```bash
npm run build      # Compile TypeScript to build/
npm run watch      # Compile in watch mode
npm run lint       # Run ESLint on src/
npm run lint:fix   # Run ESLint with auto-fix
npm run format     # Format with Prettier
npm run inspector  # Debug with MCP Inspector (note: 10s timeout, image generation may timeout)
npm link           # Link globally for testing
```

## Development Workflow

After making changes:
1. `npm run build`
2. `npm link`
3. Restart the MCP host application (Cursor, Claude Desktop, etc.) - MCP servers only connect at startup
4. Test changes

## Architecture

The server exposes three MCP tools:
- **generate_image**: Text-to-image generation via OpenAI API
- **edit_image**: Image editing (style transfer, removal, compositing, background removal)
- **upscale_image**: Standalone upscaling (only available when TOPAZ_API_KEY is set)

Key source files:
- `src/index.ts` - MCP server setup, tool/resource handlers, embedded prompting guide
- `src/image-generator.ts` - OpenAI Image API wrapper (generates and edits images)
- `src/topaz-upscaler.ts` - Topaz Labs Enhance API integration
- `src/file-saver.ts` - File system utilities for saving images
- `src/types.ts` - TypeScript interfaces and validation type guards

## Prompting Guide Guardrail

The server enforces that the `image-generator://prompting-guide` resource is read before `generate_image` or `edit_image` can be used. This is tracked via the `promptingGuideRead` flag in index.ts. If not read, tools return an error with the guide content.

## Environment Variables

- `OPENAI_API_KEY` (required) - OpenAI API key for image generation
- `TOPAZ_API_KEY` (optional) - Enables upscaling features; when absent, upscale_image tool and upscale parameters are hidden from tool definitions

# Context7 for Documentation

When working with libraries, frameworks, or APIs, ALWAYS proactively use the context7 MCP tools (`resolve-library-id` then `query-docs`) to fetch up-to-date documentation. Do this automatically without waiting for the user to ask. This ensures you have the latest API information rather than relying on potentially outdated training data.