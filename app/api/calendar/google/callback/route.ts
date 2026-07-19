import { NextResponse } from "next/server";
import { saveGoogleIntegration } from "@/lib/calendarIntegrationStorage";
import { exchangeGoogleCode, verifyOAuthState } from "@/lib/googleCalendar";

const destination=(appUrl:string,status:string)=>`${appUrl}/app?calendar=${encodeURIComponent(status)}#calendar-imports`;

export async function GET(request:Request){
  const url=new URL(request.url);
  const code=url.searchParams.get("code");
  const state=url.searchParams.get("state");
  const error=url.searchParams.get("error");
  const appUrl=process.env.NEXT_PUBLIC_APP_URL||"https://mystudyplanner.co";
  if(error||!code||!state)return NextResponse.redirect(destination(appUrl,"error"));
  const verified=verifyOAuthState(state);
  if(!verified)return NextResponse.redirect(destination(appUrl,"invalid-state"));
  try{
    const tokens=await exchangeGoogleCode(code);
    await saveGoogleIntegration(verified.userId,tokens);
    return NextResponse.redirect(destination(appUrl,"connected"));
  }catch(caughtError){
    console.error(caughtError);
    return NextResponse.redirect(destination(appUrl,"error"));
  }
}