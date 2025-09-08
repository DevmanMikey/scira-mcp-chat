
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const openplatform = request.nextUrl.searchParams.get('openplatform');

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // If no openplatform param, restrict access
  if (!openplatform) {
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Access Restricted</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 10px;
              backdrop-filter: blur(10px);
            }
            h1 { margin-bottom: 1rem; }
            p { margin-bottom: 2rem; opacity: 0.9; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🔒 Access Restricted</h1>
            <p>This application is only available through OpenPlatform.</p>
            <p>Please access it through your OpenPlatform dashboard.</p>
          </div>
        </body>
      </html>
      `,
      {
        status: 403,
        headers: {
          'Content-Type': 'text/html',
          'X-Frame-Options': 'DENY',
          'Content-Security-Policy': "frame-ancestors 'none';",
        },
      }
    );
  }

  // If openplatform param is present, allow request (sidecar will handle validation)
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
