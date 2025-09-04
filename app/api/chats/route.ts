import { NextResponse } from "next/server";
import { getChats } from "@/lib/chat-store";
import { checkBotId } from "botid/server";

export async function GET(request: Request) {
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

    if (!userId) {
      return NextResponse.json({ error: "User authentication required" }, { status: 401 });
    }

    const chats = await getChats(userId);
    return NextResponse.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
} 