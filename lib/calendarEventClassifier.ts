import type { ImportedCalendarEvent, ImportedCalendarKind, Subject } from "@/components/models";

const COLORS = ["#5F7F68","#6B7FA3","#8B6FA8","#B7795B","#4F8C8D","#8A6F5A","#7B879D","#9A6F82"];
const CLASS_WORDS = ["class","lesson","lecture","tutorial","seminar","workshop","period","lab","laboratory"];
const NON_CLASS_WORDS = ["exam","test","assessment","assignment","deadline","due","appointment","meeting","game","training","practice","match","event","birthday","holiday"];
const ALIASES: Record<string,string[]> = {
  mathematics:["math","maths","mathematics","calculus","algebra","geometry"],
  english:["english","literature","writing"],
  physics:["physics"], chemistry:["chemistry","chem"], biology:["biology","bio"],
  economics:["economics","economy","econ"], history:["history"],
  engineering:["engineering"], business:["business studies","business"], legal:["legal studies","legal"],
};
const normalise=(v:string)=>v.toLowerCase().replace(/[^a-z0-9]+/g," ").replace(/\s+/g," ").trim();
const hash=(v:string)=>{let n=0;for(let i=0;i<v.length;i+=1)n=(n*31+v.charCodeAt(i))>>>0;return n;};
export const stableImportedColor=(seed:string)=>COLORS[hash(seed||"calendar")%COLORS.length];

export function matchImportedSubject(event:Pick<ImportedCalendarEvent,"title"|"description"|"calendarName">,subjects:Subject[]){
  if(!subjects.length)return undefined;
  const haystack=normalise([event.title,event.description,event.calendarName].filter(Boolean).join(" "));
  return subjects.map(subject=>{
    const name=normalise(subject.name);
    const aliases=Object.entries(ALIASES).find(([key,list])=>name.includes(key)||list.some(alias=>name.includes(alias)))?.[1]??[];
    const terms=[name,...aliases].filter(term=>term.length>=3);
    return {subject,score:terms.reduce((total,term)=>total+(haystack.includes(term)?term.length:0),0)};
  }).sort((a,b)=>b.score-a.score).find(result=>result.score>0)?.subject;
}

export function detectImportedKind(event:Pick<ImportedCalendarEvent,"title"|"description"|"calendarName"|"start"|"end"|"allDay"|"recurring">,matchedSubject?:Subject):ImportedCalendarKind{
  if(event.allDay)return "event";
  const text=normalise([event.title,event.description,event.calendarName].filter(Boolean).join(" "));
  if(NON_CLASS_WORDS.some(word=>text.includes(word)))return "event";
  const duration=Math.max(0,Math.round((event.end.getTime()-event.start.getTime())/60000));
  const weekday=event.start.getDay();
  const schoolHours=weekday>=1&&weekday<=5&&event.start.getHours()>=7&&event.start.getHours()<=18;
  const classLength=duration>=25&&duration<=180;
  if(CLASS_WORDS.some(word=>text.includes(word))||(Boolean(event.recurring)&&schoolHours&&classLength))return "class";
  return "event";
}

export function classifyImportedEvent(event:ImportedCalendarEvent,subjects:Subject[]):ImportedCalendarEvent{
  const matched=matchImportedSubject(event,subjects);
  const kind=event.kind??detectImportedKind(event,matched);
  const seed=matched?.name||event.calendarName||event.externalCalendarId||event.title||event.source;
  return {...event,kind,subjectId:event.subjectId??matched?.id,subjectName:event.subjectName??matched?.name,color:event.color||matched?.color||stableImportedColor(seed),autoClassified:event.autoClassified??true};
}
export const classifyImportedEvents=(events:ImportedCalendarEvent[],subjects:Subject[])=>events.map(event=>classifyImportedEvent(event,subjects));