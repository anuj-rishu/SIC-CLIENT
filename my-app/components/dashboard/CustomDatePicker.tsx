"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isAfter,
  isBefore,
  startOfDay
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  minDate?: Date;
}

export default function CustomDatePicker({ value, onChange, label, minDate }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
  const [openUp, setOpenUp] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  // Close on click outside and detect space
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 350) { // Height of calendar approx 320px
        setOpenUp(true);
      } else {
        setOpenUp(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const onDateClick = (day: Date) => {
    onChange(format(day, "yyyy-MM-dd"));
    setIsOpen(false);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <button
          onClick={(e) => { e.preventDefault(); prevMonth(); }}
          className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground/40 hover:text-white transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-black uppercase tracking-[0.2em] text-white">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <button
          onClick={(e) => { e.preventDefault(); nextMonth(); }}
          className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground/40 hover:text-white transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["S", "M", "T", "W", "T", "F", "S"];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map((day, i) => (
          <div key={i} className="text-center text-[10px] font-black text-muted-foreground/20 py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const selectedDate = value ? startOfDay(new Date(value)) : null;

    return (
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());
          const isPast = minDate && isBefore(startOfDay(day), startOfDay(minDate));

          return (
            <button
              key={i}
              disabled={isPast}
              onClick={(e) => { e.preventDefault(); onDateClick(day); }}
              className={`
                h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all relative
                ${!isCurrentMonth ? "text-muted-foreground/10" : "text-white/60"}
                ${isSelected ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-white/5"}
                ${isToday && !isSelected ? "text-primary border border-primary/20" : ""}
                ${isPast ? "opacity-20 cursor-not-allowed grayscale" : "cursor-pointer"}
              `}
            >
              {format(day, "d")}
              {isToday && !isSelected && (
                <span className="absolute bottom-1 w-1 h-1 bg-primary rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      {label && (
        <label className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center justify-between w-full bg-white/[0.03] border border-white/5 rounded-xl py-3 px-4 text-white cursor-pointer hover:border-primary/50 transition-all active:scale-[0.99]"
      >
        <span className={value ? "text-white font-medium text-sm" : "text-muted-foreground/40 font-medium text-sm"}>
          {value ? format(new Date(value), "PPP") : "Select date..."}
        </span>
        <CalendarIcon className={`w-3.5 h-3.5 transition-colors ${isOpen ? "text-primary" : "text-muted-foreground/30 group-hover:text-primary/60"}`} />
      </div>

      {isOpen && (
        <div className={`absolute left-0 mt-2 z-[100] w-[280px] bg-card/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-2 animate-in fade-in duration-200 ${openUp ? 'bottom-full origin-bottom mb-4 translate-y-[-10px]' : 'top-full origin-top mt-2 zoom-in-95'}`}>
          {renderHeader()}
          <div className="p-2">
            {renderDays()}
            {renderCells()}
          </div>
          <div className="mt-2 p-2 border-t border-white/5 flex items-center justify-between">
            <button 
              onClick={(e) => { e.preventDefault(); onDateClick(new Date()); }}
              className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-blue-400 transition-colors px-2 py-1"
            >
              Today
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); setIsOpen(false); }}
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-white transition-colors px-2 py-1"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
