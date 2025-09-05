import { NextResponse } from "next/server";
import { getChatById, deleteChat } from "@/lib/chat-store";
import { checkBotId } from "botid/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    // Get user ID from OpenPlatform cookie
    let userId: string | null = null;
    const cookies = request.headers.get('cookie');
    if (cookies) {
      const openplatformUserCookie = cookies.split(';').find(c => c.trim().startsWith('openplatform_user='));
      if (openplatformUserCookie) {
        try {
          const userData = JSON.parse(decodeURIComponent(openplatformUserCookie.split('=')[1]));
          userId = userData.openplatformid;
        } catch (error) {
          console.error('Failed to parse OpenPlatform user data:', error);
        }
      }
    }

    // For development/testing, allow fallback to a default user ID
    if (!userId) {
      // Check if this is a direct access (not through OpenPlatform)
      const referer = request.headers.get('referer');
      const userAgent = request.headers.get('user-agent');

      // Allow access for testing purposes if coming from the same domain
      if (referer && (referer.includes('inspirausflow') || referer.includes('localhost'))) {
        userId = 'test-user';
      } else if (process.env.NODE_ENV === 'development') {
        userId = 'dev-user';
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "User authentication required" }, { status: 401 });
    }

    const { id } = await context.params;
    const chat = await getChatById(id, userId);

    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    // Get user ID from OpenPlatform cookie
    let userId: string | null = null;
    const cookies = request.headers.get('cookie');
    if (cookies) {
      const openplatformUserCookie = cookies.split(';').find(c => c.trim().startsWith('openplatform_user='));
      if (openplatformUserCookie) {
        try {
          const userData = JSON.parse(decodeURIComponent(openplatformUserCookie.split('=')[1]));
          userId = userData.openplatformid;
        } catch (error) {
          console.error('Failed to parse OpenPlatform user data:', error);
        }
      }
    }

    // For development/testing, allow fallback to a default user ID
    if (!userId) {
      // Check if this is a direct access (not through OpenPlatform)
      const referer = request.headers.get('referer');
      const userAgent = request.headers.get('user-agent');

      // Allow access for testing purposes if coming from the same domain
      if (referer && (referer.includes('inspirausflow') || referer.includes('localhost'))) {
        userId = 'test-user';
      } else if (process.env.NODE_ENV === 'development') {
        userId = 'dev-user';
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "User authentication required" }, { status: 401 });
    }

    const { id } = await context.params;
    await deleteChat(id, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 }
    );
  }
} 