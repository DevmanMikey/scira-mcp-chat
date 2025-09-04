import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Helper function to get user ID from OpenPlatform cookie
function getUserIdFromCookie(request: NextRequest): string | null {
  const cookies = request.headers.get('cookie');
  if (cookies) {
    const openplatformUserCookie = cookies.split(';').find(c => c.trim().startsWith('openplatform_user='));
    if (openplatformUserCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(openplatformUserCookie.split('=')[1]));
        return userData.openplatformid;
      } catch (error) {
        console.error('Failed to parse OpenPlatform user data:', error);
      }
    }
  }
  return null;
}

// GET /api/mcp-config/[userId] - Get user's MCP configuration
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const configPath = path.join(process.cwd(), 'public', 'mcp-configs', `${userId}.json`);

    try {
      const configData = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configData);
      return NextResponse.json(config);
    } catch (error) {
      // If user config doesn't exist, return sample config
      const samplePath = path.join(process.cwd(), 'public', 'mcp-configs', 'sample.json');
      try {
        const sampleData = await fs.readFile(samplePath, 'utf-8');
        const sampleConfig = JSON.parse(sampleData);
        return NextResponse.json(sampleConfig);
      } catch (sampleError) {
        // Return empty config if sample doesn't exist
        return NextResponse.json({
          servers: [],
          selectedServers: []
        });
      }
    }
  } catch (error) {
    console.error('Error reading MCP config:', error);
    return NextResponse.json(
      { error: 'Failed to read MCP configuration' },
      { status: 500 }
    );
  }
}

// POST /api/mcp-config/[userId] - Save user's MCP configuration
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Verify the user ID matches the authenticated user
    const authenticatedUserId = getUserIdFromCookie(request);
    if (!authenticatedUserId || authenticatedUserId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const configData = await request.json();
    const configPath = path.join(process.cwd(), 'public', 'mcp-configs', `${userId}.json`);

    // Ensure the directory exists
    const configDir = path.dirname(configPath);
    await fs.mkdir(configDir, { recursive: true });

    // Save the configuration
    await fs.writeFile(configPath, JSON.stringify(configData, null, 2), 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving MCP config:', error);
    return NextResponse.json(
      { error: 'Failed to save MCP configuration' },
      { status: 500 }
    );
  }
}
