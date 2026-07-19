import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { disconnectGoogle } from "@/lib/calendarIntegrationStorage";
export async function POST(){const {userId}=await auth();if(!userId)return NextResponse.json({error:"Unauthorized"},{status:401});await disconnectGoogle(userId);return NextResponse.json({ok:true});}