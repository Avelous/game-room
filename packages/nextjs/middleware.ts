import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes that don't require authentication
  const publicRoutes = ["/api/host/create", "/api/player/join"];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  const token = request.headers.get("authorization");

  if (!token) {
    return new NextResponse(JSON.stringify({ verified: false, message: "Access Denied" }), { status: 403 });
  }

  let jwtToken = token;
  if (jwtToken.startsWith("Bearer ")) {
    jwtToken = jwtToken.slice(7, jwtToken.length).trimStart();
  }

  try {
    const verified = jwt.verify(jwtToken, JWT_SECRET);
    // If verified, continue to the next API route
    return NextResponse.next();
  } catch (error) {
    return new NextResponse(JSON.stringify({ verified: false, error: "Invalid Token" }), { status: 403 });
  }
}

export const config = {
  matcher: "/api/:path*",
};
