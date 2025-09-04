import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// OpenPlatform configuration
const REQUEST_TOKEN = 'gi23t9nzgxgp59xr4q1ynjhqvqtejgfriwqclgem2';
const RESPONSE_TOKEN = '9a3mg723udpj16uyqdpc2fph4022ruy4ewg3wf8pu';

// Allowed OpenPlatform domains
const ALLOWED_DOMAINS = [
  'openplatform.com',
  'flowchat.inspiraus.work',
  'localhost', // For development
  '127.0.0.1', // For development
  '*' // Allow all domains for iframe embedding
];

function md5(data: string): string {
  return crypto.createHash('md5').update(data).digest('hex');
}

async function verifyOpenPlatformToken(openplatform: string): Promise<any | null> {
  try {
    const data = openplatform.split('~');

    if (data.length !== 2) {
      return null;
    }

    const [url, signature] = data;

    // Verify that the request is properly signed
    if (md5(url + REQUEST_TOKEN) !== signature) {
      return null;
    }

    // The request signature must be signed again with the response token
    const responseSignature = md5(signature + RESPONSE_TOKEN);

    // Make request to OpenPlatform to get user profile
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-token': responseSignature,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const userProfile = await response.json();
    return userProfile;
  } catch (error) {
    console.error('OpenPlatform verification error:', error);
    return null;
  }
}

function isAllowedDomain(referer: string | null): boolean {
  if (!referer) return true; // Allow requests without referer

  try {
    const url = new URL(referer);
    // Allow all domains for iframe embedding
    return true;
  } catch {
    return true; // Allow if URL parsing fails
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const openplatform = request.nextUrl.searchParams.get('openplatform');
  const referer = request.headers.get('referer');

  // Skip middleware for static files and API routes that need to be accessible
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Check if this is an OpenPlatform request
  if (openplatform) {
    try {
      const userProfile = await verifyOpenPlatformToken(openplatform);

      if (userProfile) {
        // Create response with user profile in headers
        const response = NextResponse.next();

        // Store user profile in a cookie for client-side access
        response.cookies.set('openplatform_user', JSON.stringify(userProfile), {
          httpOnly: false, // Allow client-side access
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24, // 24 hours
        });

        return response;
      }
    } catch (error) {
      console.error('OpenPlatform authentication failed:', error);
    }
  }

  // Check if request is coming from allowed domain
  if (isAllowedDomain(referer)) {
    return NextResponse.next();
  }

  // If no valid OpenPlatform token and not from allowed domain, block access
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

  // If OpenPlatform token exists but verification failed
  return new NextResponse(
    `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Authentication Failed</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
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
          <h1>❌ Authentication Failed</h1>
          <p>Unable to verify OpenPlatform credentials.</p>
          <p>Please try again or contact your administrator.</p>
        </div>
      </body>
    </html>
    `,
    {
      status: 401,
      headers: {
        'Content-Type': 'text/html',
        'X-Frame-Options': 'DENY',
        'Content-Security-Policy': "frame-ancestors 'none';",
      },
    }
  );
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
