# Inspiraus Flow

An open-source AI chatbot app powered by Model Context Protocol (MCP), built with Next.js and the AI SDK by Vercel.

<p align="center">
  <a href="#features"><strong>Features</strong></a> •
  <a href="#mcp-server-configuration"><strong>MCP Configuration</strong></a> •
  <a href="#license"><strong>License</strong></a>
</p>
<br/>

## Features

- Streaming text responses powered by the [AI SDK by Vercel](https://sdk.vercel.ai/docs), allowing multiple AI providers to be used interchangeably with just a few lines of code.
- Full integration with [Model Context Protocol (MCP)](https://modelcontextprotocol.io) servers to expand available tools and capabilities.
- HTTP and SSE transport types for connecting to various MCP tool providers.
- Built-in tool integration for extending AI capabilities.
- Reasoning model support.
- [shadcn/ui](https://ui.shadcn.com/) components for a modern, responsive UI powered by [Tailwind CSS](https://tailwindcss.com).
- Built with the latest [Next.js](https://nextjs.org) App Router.

## MCP Server Configuration

This application supports connecting to Model Context Protocol (MCP) servers to access their tools. You can add and manage MCP servers through the settings icon in the chat interface.

### Adding an MCP Server

1. Click the settings icon (⚙️) next to the model selector in the chat interface.
2. Enter a name for your MCP server.
3. Select the transport type:
   - **HTTP**: For HTTP-based remote servers
   - **SSE (Server-Sent Events)**: For SSE-based remote servers

#### HTTP or SSE Configuration

1. Enter the server URL (e.g., `https://mcp.example.com/mcp` or `https://mcp.example.com/token/sse`)
2. Click "Add Server"
3. Click "Enable Server" to activate the server for the current chat session.

### Available MCP Servers

You can use any MCP-compatible server with this application. Here are some examples:

## OpenPlatform Integration

This app implements a minimal OpenPlatform application pattern (no sidecar service).

Key pieces:
1. `public/openplatform.json` – static metadata (name, icon, color, url, permissions).
2. `app/api/openplatform-verify/route.ts` – accepts `?openplatform=<encoded verifyUrl~signature>` and:
  - Parses the token into `verifyUrl` + `signature`.
  - (Optionally) computes `expectedSignature = md5(verifyUrl + REQUEST_TOKEN)` if `NEXT_PUBLIC_OPENPLATFORM_REQUEST_TOKEN` is set (diagnostic only; mismatch does not block).
  - Performs fetch to `verifyUrl` with `x-token = md5(signature + RESPONSE_TOKEN)` when `NEXT_PUBLIC_OPENPLATFORM_RESPONSE_TOKEN` is set.
  - Retries without headers on 400/401 to aid debugging.
  - Returns JSON: `{ success?, profile, signature, expectedSignature, attempt, retry, durationMs }`.
3. `lib/hooks/use-openplatform-user.ts` – client hook that reads `?openplatform=` from the URL and retrieves the profile via the API route.

Environment variables:
```
NEXT_PUBLIC_OPENPLATFORM_REQUEST_TOKEN=... (optional, for signature diagnostics)
NEXT_PUBLIC_OPENPLATFORM_RESPONSE_TOKEN=... (optional, for x-token header signing)
```

How to test locally:
1. Launch the app (pnpm dev).
2. Open it inside your OpenPlatform instance after registering the application with the same URL as in `public/openplatform.json`.
3. Observe network call to `/api/openplatform-verify` – verify `profile` object appears.
4. If 400/401, compare `signature` vs `expectedSignature` in response to identify token/sign mismatch.

Removed legacy: the previous `openplatform-application` Total.js template and sidecar client were eliminated to avoid duplication and confusion.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.