// Minimal client for Total.js sidecar endpoints
// Adjust SIDE_CAR_URL as needed (localhost:4000 for dev)
const SIDE_CAR_URL = process.env.NEXT_PUBLIC_SIDECAR_URL || 'http://localhost:4000';

export async function verifyOpenPlatform(verifyUrl: string, xToken: string) {
  const res = await fetch(`${SIDE_CAR_URL}/sidecar/openplatform-verify?verifyUrl=${encodeURIComponent(verifyUrl)}`, {
    headers: { 'x-token': xToken },
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getUserProfile(userId?: string) {
  const url = userId ? `${SIDE_CAR_URL}/sidecar/user-profile?userId=${encodeURIComponent(userId)}` : `${SIDE_CAR_URL}/sidecar/user-profile`;
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getMessages(chatId: string) {
  const res = await fetch(`${SIDE_CAR_URL}/sidecar/messages?chatId=${encodeURIComponent(chatId)}`, { credentials: 'include' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function postMessage(chatId: string, message: string) {
  const res = await fetch(`${SIDE_CAR_URL}/sidecar/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
