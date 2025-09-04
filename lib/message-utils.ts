import { type Message as DBMessage } from "./db/schema";

export type AIMessage = {
  role: string;
  content: string | any[];
  id?: string;
  parts?: any[];
};

export type UIMessage = {
  id: string;
  role: string;
  content: string;
  parts: any[];
  createdAt?: Date;
};

// Convert DB messages to UI format
export function convertToUIMessages(dbMessages: Array<DBMessage>): Array<UIMessage> {
  return dbMessages.map((message) => ({
    id: message.id,
    parts: message.parts as any[],
    role: message.role as string,
    content: getTextContent(message), // For backward compatibility
    createdAt: message.createdAt,
  }));
}

// Helper to get just the text content for display
export function getTextContent(message: DBMessage): string {
  try {
    const parts = message.parts as any[];
    return parts
      .filter(part => part.type === 'text' && part.text)
      .map(part => part.text)
      .join('\n');
  } catch (e) {
    // If parsing fails, return empty string
    return '';
  }
}
