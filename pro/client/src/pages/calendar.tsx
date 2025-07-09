import { useState } from "react";
import DashboardHeader from "@/components/layout/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useQuery } from "@tanstack/react-query";
import { format, isToday, isSameDay, startOfMonth, addDays, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus
} from "lucide-react";

interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  start: string;
  end: string;
  allDay: boolean;
  projectId: number;
  type: string;
  color: string;
}

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newEventDialogOpen, setNewEventDialogOpen] = useState(false);
  const [eventDetailsDialogOpen, setEventDetailsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const { data: events = [] } = useQuery({
    queryKey: ["/api/events"],
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
  });

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setNewEventDialogOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventDetailsDialogOpen(true);
  };

  // Create a map of events by date
  const eventsByDate = events.reduce((acc: Record<string, CalendarEvent[]>, event: CalendarEvent) => {
    const date = new Date(event.start).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {});

  // Get events for the selected date
  const eventsForSelectedDate = events.filter((event: CalendarEvent) => 
    isSameDay(new Date(event.start), selectedDate)
  );

  // Calendar grid generation
  const generateCalendarGrid = () => {
    const firstDay = startOfMonth(currentMonth);
    const startingDayOfWeek = getDay(firstDay) || 7; // Convert Sunday (0) to 7 for European calendar
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    
    // Array of week days
    const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    
    // Calculate empty cells before the 1st day of the month
    const emptyCellsBeforeMonth = Array(startingDayOfWeek === 1 ? 0 : startingDayOfWeek - 1).fill(null);
    
    // Generate days of the month
    const daysOfMonth = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
      return date;
    });
    
    // Combine empty cells and days of the month
    const totalCells = [...emptyCellsBeforeMonth, ...daysOfMonth];
    
    // Chunk into weeks
    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < totalCells.length; i += 7) {
      weeks.push(totalCells.slice(i, i + 7));
    }
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Week days header */}
        {weekDays.map((day, i) => (
          <div key={i} className="text-center py-2 font-medium text-slate-500">
            {day}
          </div>
        ))}
        
        {/* Calendar cells */}
        {weeks.flatMap((week, weekIndex) => 
          week.map((day, dayIndex) => {
            if (!day) {
              return (
                <div 
                  key={`empty-${weekIndex}-${dayIndex}`} 
                  className="h-24 border border-slate-200 bg-slate-50"
                />
              );
            }
            
            const dateKey = day.toISOString().split('T')[0];
            const dayEvents = eventsByDate[dateKey] || [];
            
            return (
              <div 
                key={`day-${day.getDate()}`}
                onClick={() => handleDateClick(day)}
                className={cn(
                  "h-24 p-1 border border-slate-200 overflow-hidden",
                  isToday(day) && "bg-primary-50",
                  "hover:bg-slate-50 cursor-pointer"
                )}
              >
                <div className="flex justify-between items-start">
                  <span 
                    className={cn(
                      "text-sm font-medium p-1 h-6 w-6 flex items-center justify-center rounded-full",
                      isToday(day) && "bg-primary text-white"
                    )}
                  >
                    {day.getDate()}
                  </span>
                </div>
                <div className="space-y-1 mt-1">
                  {dayEvents.slice(0, 3).map((event, i) => (
                    <div 
                      key={`event-${event.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }}
                      className={cn(
                        "px-2 py-1 text-xs rounded truncate",
                        event.color === "red" ? "bg-red-100 text-red-800" :
                        event.color === "amber" ? "bg-amber-100 text-amber-800" :
                        "bg-blue-100 text-blue-800"
                      )}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-center text-slate-500">
                      +{dayEvents.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <>
      <DashboardHeader title="Calendario" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6 pb-20 md:pb-6">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-bold">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </h2>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
              Hoy
            </Button>
          </div>
          <Button onClick={() => setNewEventDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Evento
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0 overflow-hidden">
                {generateCalendarGrid()}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Próximos Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events
                    .filter((event: CalendarEvent) => new Date(event.start) >= new Date())
                    .sort((a: CalendarEvent, b: CalendarEvent) => 
                      new Date(a.start).getTime() - new Date(b.start).getTime()
                    )
                    .slice(0, 5)
                    .map((event: CalendarEvent) => {
                      const project = projects.find((p: any) => p.id === event.projectId);
                      return (
                        <div key={event.id} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer"
                          onClick={() => handleEventClick(event)}>
                          <div className={cn(
                            "w-2 h-10 rounded-full flex-shrink-0",
                            event.color === "red" ? "bg-red-500" :
                            event.color === "amber" ? "bg-amber-500" : 
                            "bg-primary"
                          )}></div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-slate-900">{event.title}</h4>
                            <p className="text-xs text-slate-500">
                              {format(new Date(event.start), "EEE, d MMM • HH:mm", { locale: es })}
                            </p>
                            {project && (
                              <p className="text-xs text-slate-500 mt-1">
                                {project.name}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  
                  {events.length === 0 && (
                    <div className="text-center py-6 text-slate-500">
                      No hay eventos próximos
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Calendario Pequeño</CardTitle>
              </CardHeader>
              <CardContent>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* New Event Dialog */}
      <Dialog open={newEventDialogOpen} onOpenChange={setNewEventDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear nuevo evento</DialogTitle>
            <DialogDescription>
              Agrega un nuevo evento para el {format(selectedDate, "dd MMMM, yyyy", { locale: es })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="text-center">
              <CalendarIcon className="mx-auto h-12 w-12 text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">
                Funcionalidad de creación de eventos en desarrollo
              </p>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setNewEventDialogOpen(false)}>Cerrar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={eventDetailsDialogOpen} onOpenChange={setEventDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Detalles del evento</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="py-4">
              <h3 className="text-lg font-medium mb-2">{selectedEvent.title}</h3>
              <p className="text-slate-500 mb-4">{selectedEvent.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-slate-500" />
                  <span>
                    {format(new Date(selectedEvent.start), "EEEE, d MMMM, yyyy • HH:mm", { locale: es })}
                  </span>
                </div>
                {selectedEvent.end && (
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4"></span>
                    <span>
                      {format(new Date(selectedEvent.end), "EEEE, d MMMM, yyyy • HH:mm", { locale: es })}
                    </span>
                  </div>
                )}
                {selectedEvent.projectId && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="h-4 w-4"></span>
                    <span>
                      Proyecto: {projects.find((p: any) => p.id === selectedEvent?.projectId)?.name || "Desconocido"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
