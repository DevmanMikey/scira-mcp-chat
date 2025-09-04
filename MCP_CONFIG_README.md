# MCP Per-User Configuration - MVP Solution

## Overview

This MVP implementation provides per-user MCP server configurations using JSON files stored in the `/public/mcp-configs/` directory.

## How It Works

### 1. File Structure
```
public/
  mcp-configs/
    sample.json          # Default template
    user123.json         # User-specific config
    {userId}.json        # Dynamic user configs
```

### 2. Configuration Format
Each user's config file contains:
```json
{
  "servers": [
    {
      "id": "unique-server-id",
      "name": "Server Display Name",
      "url": "https://mcp-server.example.com/sse",
      "type": "sse",
      "description": "Optional description",
      "status": "disconnected",
      "headers": [{"key": "Auth", "value": "token"}],
      "env": [{"key": "API_KEY", "value": "secret"}]
    }
  ],
  "selectedServers": ["server-id-1", "server-id-2"],
  "lastUpdated": "2025-09-04T16:30:00.000Z"
}
```

### 3. API Endpoints

#### GET `/api/mcp-config/{userId}`
- Loads user's MCP configuration
- Falls back to `sample.json` if user config doesn't exist
- Returns empty config if neither exists

#### POST `/api/mcp-config/{userId}`
- Saves user's MCP configuration
- Requires authentication (OpenPlatform user ID match)
- Creates user config file if it doesn't exist

### 4. User Experience

1. **Login**: When user logs in via OpenPlatform, their config is automatically loaded
2. **Configuration**: Users can add/edit MCP servers through the UI
3. **Persistence**: Changes are automatically saved (debounced, 1-second delay)
4. **Fallback**: If API fails, configs fall back to localStorage

## Benefits

✅ **Per-User Isolation**: Each user has their own MCP server configurations
✅ **Simple Storage**: JSON files are easy to manage and backup
✅ **Fast Loading**: Direct file access for configurations
✅ **Fallback Support**: Graceful degradation to localStorage
✅ **Security**: API validates user authentication before saving

## Future Improvements

- Database storage for better scalability
- Configuration sharing between users
- Version control for configurations
- Backup/restore functionality
- Configuration templates per organization

## Usage

Users can manage their MCP servers through the sidebar MCP Server Manager. Configurations are automatically saved and loaded based on their OpenPlatform user ID.
