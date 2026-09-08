"use client";

import { todayISODate } from "@/lib/bookkeeping/format";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"] as const;

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function toISO(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function parseISO(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
    return null;
  }

  return { year, month, day };
}

function formatDisplay(value: string): string {
  const parsed = parseISO(value);
  if (!parsed) return "";
  return `${parsed.year}/${pad2(parsed.month)}/${pad2(parsed.day)}`;
}

function formatMonthHeader(year: number, month: number): string {
  return `${year}/${pad2(month)}`;
}

function buildCalendarDays(year: number, month: number) {
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate();
  const cells: Array<{ day: number; month: number; year: number; inMonth: boolean }> = [];

  for (let index = firstWeekday - 1; index >= 0; index -= 1) {
    const day = daysInPrevMonth - index;
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    cells.push({ day, month: prevMonth, year: prevYear, inMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day, month, year, inMonth: true });
  }

  let nextDay = 1;
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    cells.push({ day: nextDay, month: nextMonth, year: nextYear, inMonth: false });
    nextDay += 1;
    if (cells.length >= 42) break;
  }

  return cells;
}

export function BkDateInput({
  value,
  onChange,
  className = "",
  "aria-label": ariaLabel,
  placeholder = "選日期",
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  "aria-label"?: string;
  placeholder?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<{ top: number; left: number } | null>(null);

  const selected = parseISO(value);
  const today = parseISO(todayISODate())!;
  const [viewYear, setViewYear] = useState(selected?.year ?? today.year);
  const [viewMonth, setViewMonth] = useState(selected?.month ?? today.month);

  useEffect(() => {
    if (selected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- keep calendar view in sync with controlled value
      setViewYear(selected.year);
      setViewMonth(selected.month);
    }
    // selected is derived from value; depending on the object would rerun every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      setPopoverStyle({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    function onDocumentClick(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || popoverRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onDocumentClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", onDocumentClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function prevMonth() {
    if (viewMonth === 1) {
      setViewYear((current) => current - 1);
      setViewMonth(12);
      return;
    }
    setViewMonth((current) => current - 1);
  }

  function nextMonth() {
    if (viewMonth === 12) {
      setViewYear((current) => current + 1);
      setViewMonth(1);
      return;
    }
    setViewMonth((current) => current + 1);
  }

  function selectDay(year: number, month: number, day: number) {
    onChange(toISO(year, month, day));
    setOpen(false);
  }

  const cells = buildCalendarDays(viewYear, viewMonth);
  const popover =
    open && popoverStyle ? (
      <div
        ref={popoverRef}
        className="bk-date-popover is-fixed"
        role="dialog"
        aria-label={ariaLabel ?? "選擇日期"}
        style={{ top: popoverStyle.top, left: popoverStyle.left }}
      >
        <div className="bk-date-popover-head">
          <button type="button" className="bk-date-nav" onClick={prevMonth} aria-label="上個月">
            ‹
          </button>
          <span className="bk-date-month-label">{formatMonthHeader(viewYear, viewMonth)}</span>
          <button type="button" className="bk-date-nav" onClick={nextMonth} aria-label="下個月">
            ›
          </button>
        </div>
        <div className="bk-date-weekdays" aria-hidden="true">
          {WEEKDAYS.map((weekday) => (
            <span key={weekday}>{weekday}</span>
          ))}
        </div>
        <div className="bk-date-grid">
          {cells.map((cell, index) => {
            const iso = toISO(cell.year, cell.month, cell.day);
            const isSelected = value === iso;
            const isToday =
              today.year === cell.year && today.month === cell.month && today.day === cell.day;

            return (
              <button
                key={`${iso}-${index}`}
                type="button"
                className={[
                  "bk-date-day",
                  !cell.inMonth ? "is-outside" : "",
                  isSelected ? "is-selected" : "",
                  isToday ? "is-today" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => selectDay(cell.year, cell.month, cell.day)}
              >
                {cell.day}
              </button>
            );
          })}
        </div>
        <div className="bk-date-popover-foot">
          <button
            type="button"
            className="bk-date-foot-btn"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            清除
          </button>
          <button
            type="button"
            className="bk-date-foot-btn"
            onClick={() => {
              onChange(todayISODate());
              setOpen(false);
            }}
          >
            今天
          </button>
        </div>
      </div>
    ) : null;

  return (
    <div className={`bk-date-input${open ? " is-open" : ""}`} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`bk-date-input-trigger${className ? ` ${className}` : ""}`}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((current) => !current)}
      >
        <span className={value ? undefined : "bk-date-input-placeholder"}>
          {value ? formatDisplay(value) : placeholder}
        </span>
      </button>
      {typeof document !== "undefined" && popover ? createPortal(popover, document.body) : null}
    </div>
  );
}
