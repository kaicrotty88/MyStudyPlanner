import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { buildGoogleAuthUrl } from "@/lib/googleCalendar";
export async function GET(){ const {userId}=await auth(); if(!userId) return NextResponse.redirect(new URL("/sign-in",process.env.NEXT_PUBLIC_APP_URL)); return NextResponse.redirect(buildGoogleAuthUrl(userId)); }