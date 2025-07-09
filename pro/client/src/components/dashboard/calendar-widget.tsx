import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, isSameDay } from "date-fns";
import { es } from "date-fns/locale";

interface CalendarEvent {
  id: number;
  title: string;
  start: string;
  color: string;
}

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const { data: events = [] } = useQuery({
    queryKey: ["/api/events"],
  });

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Get days for the current month view
  const getDaysForCalendarView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  // Map of event dates
  const eventDateMap = events.reduce((acc: Record<string, CalendarEvent[]>, event: any) => {
    const dateKey = new Date(event.start).toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {});

  // Get top 3 upcoming events
  const upcomingEvents = events
    .filter((event: any) => new Date(event.start) >= new Date())
    .sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 3);

  const days = getDaysForCalendarView();
  const weekDays = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">Calendario</CardTitle>
          <Link href="/calendar">
            <Button variant="link" className="text-sm text-primary font-medium hover:text-primary-600 flex items-center">
              Ver calendario <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-5 w-5 text-slate-500" />
          </Button>
          <h4 className="text-base font-medium text-slate-800">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h4>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-5 w-5 text-slate-500" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-xs font-medium text-slate-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {days.map((day, dayIndex) => {
            const dateKey = day.toISOString().split('T')[0];
            const hasEvents = eventDateMap[dateKey]?.length > 0;
            
            return (
              <div
                key={dayIndex}
                className={cn(
                  "text-xs p-2",
                  isSameMonth(day, currentDate)
                    ? "text-slate-800"
                    : "text-slate-400",
                  isToday(day) && "rounded bg-slate-100",
                  hasEvents && 
                    (eventDateMap[dateKey][0].color === "red"
                      ? "rounded bg-red-100 font-medium text-red-900"
                      : eventDateMap[dateKey][0].color === "amber"
                      ? "rounded bg-amber-100 font-medium text-amber-900"
                      : "rounded bg-primary-100 font-medium text-primary-900")
                )}
              >
                {format(day, 'd')}
              </div>
            );
          })}
        </div>
      </CardContent>
      <div className="p-6 border-t border-slate-200">
        <h4 className="text-sm font-medium text-slate-800 mb-3">Próximos Eventos</h4>
        <div className="space-y-3">
          {upcomingEvents.map((event: any) => (
            <div key={event.id} className="flex items-center p-2 hover:bg-slate-50 rounded-lg">
              <div 
                className={cn(
                  "w-2 h-8 rounded-full mr-3",
                  event.color === "red" ? "bg-red-500" :
                  event.color === "amber" ? "bg-amber-500" : 
                  "bg-primary-500"
                )}
              />
              <div className="flex-1">
                <h5 className="text-sm font-medium text-slate-800">{event.title}</h5>
                <p className="text-xs text-slate-500">
                  {format(new Date(event.start), "EEE, d MMM • HH:mm", { locale: es })}
                </p>
              </div>
            </div>
          ))}
          
          {upcomingEvents.length === 0 && (
            <div className="text-sm text-slate-500 text-center py-2">
              No hay eventos próximos
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
