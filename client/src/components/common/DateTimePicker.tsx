import React, { useState, useEffect } from "react";
import { Calendar, Clock, X, Sparkles, Check, Plus } from "lucide-react";

interface DateTimePickerProps {
  label: string;
  value: string; // ISO string e.g. "2026-08-31T10:30" or ""
  onChange: (isoString: string) => void;
  helperText?: string;
  onSyncWithStart?: () => void;
  syncButtonLabel?: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  label,
  value,
  onChange,
  helperText,
  onSyncWithStart,
  syncButtonLabel,
}) => {
  // Parse value into date (YYYY-MM-DD), hour (1-12), minute (00-59), ampm ("AM"|"PM")
  const parseDateTime = (val: string) => {
    if (!val) {
      return { date: "", hour: "10", minute: "00", ampm: "AM" };
    }
    try {
      // Prefer string splitting to prevent timezone offsets
      if (val.includes("T")) {
        const [dPart, tPart] = val.split("T");
        const timeClean = (tPart || "").replace("Z", "");
        const [hRaw, mRaw] = timeClean.split(":");
        let rawH = parseInt(hRaw, 10);
        if (isNaN(rawH)) rawH = 10;
        const ampmVal = rawH >= 12 ? "PM" : "AM";
        const h12 = rawH % 12 || 12;
        const hourStr = String(h12).padStart(2, "0");
        const minStr = String(parseInt(mRaw, 10) || 0).padStart(2, "0");
        return { date: dPart, hour: hourStr, minute: minStr, ampm: ampmVal };
      }

      const d = new Date(val);
      if (isNaN(d.getTime())) {
        return { date: "", hour: "10", minute: "00", ampm: "AM" };
      }
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;

      let rawH = d.getHours();
      const ampmVal = rawH >= 12 ? "PM" : "AM";
      rawH = rawH % 12 || 12;
      const hourStr = String(rawH).padStart(2, "0");
      const minStr = String(d.getMinutes()).padStart(2, "0");

      return { date: dateStr, hour: hourStr, minute: minStr, ampm: ampmVal };
    } catch {
      return { date: "", hour: "10", minute: "00", ampm: "AM" };
    }
  };

  const [datePart, setDatePart] = useState<string>(() => parseDateTime(value).date);
  const [hourPart, setHourPart] = useState<string>(() => parseDateTime(value).hour);
  const [minutePart, setMinutePart] = useState<string>(() => parseDateTime(value).minute);
  const [ampmPart, setAmpmPart] = useState<string>(() => parseDateTime(value).ampm);

  useEffect(() => {
    const parsed = parseDateTime(value);
    setDatePart(parsed.date);
    setHourPart(parsed.hour);
    setMinutePart(parsed.minute);
    setAmpmPart(parsed.ampm);
  }, [value]);

  const updateFullIso = (d: string, h: string, m: string, ap: string) => {
    if (!d) {
      onChange("");
      return;
    }
    let hourNum = parseInt(h, 10) || 12;
    if (ap === "PM" && hourNum < 12) hourNum += 12;
    if (ap === "AM" && hourNum === 12) hourNum = 0;

    const hourStr24 = String(hourNum).padStart(2, "0");
    const minStr = String(m || "00").padStart(2, "0");
    onChange(`${d}T${hourStr24}:${minStr}`);
  };

  const handleDateChange = (newDate: string) => {
    setDatePart(newDate);
    updateFullIso(newDate, hourPart, minutePart, ampmPart);
  };

  const handleHourChange = (newHour: string) => {
    setHourPart(newHour);
    updateFullIso(datePart, newHour, minutePart, ampmPart);
  };

  const handleMinuteChange = (newMin: string) => {
    setMinutePart(newMin);
    updateFullIso(datePart, hourPart, newMin, ampmPart);
  };

  const handleAmpmChange = (newAmpm: string) => {
    setAmpmPart(newAmpm);
    updateFullIso(datePart, hourPart, minutePart, newAmpm);
  };

  // Quick Preset Handlers
  const handleSetNow = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const dStr = `${yyyy}-${mm}-${dd}`;

    let h = now.getHours();
    const ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    const hStr = String(h).padStart(2, "0");
    const mStr = String(now.getMinutes()).padStart(2, "0");

    setDatePart(dStr);
    setHourPart(hStr);
    setMinutePart(mStr);
    setAmpmPart(ap);
    updateFullIso(dStr, hStr, mStr, ap);
  };

  const handleAddMinutes = (mins: number) => {
    let baseDate: Date;
    if (datePart) {
      let hourNum = parseInt(hourPart, 10) || 12;
      if (ampmPart === "PM" && hourNum < 12) hourNum += 12;
      if (ampmPart === "AM" && hourNum === 12) hourNum = 0;
      const minNum = parseInt(minutePart, 10) || 0;
      const [y, m, d] = datePart.split("-").map((n) => parseInt(n, 10));
      baseDate = new Date(y, m - 1, d, hourNum, minNum, 0);
    } else if (value) {
      baseDate = new Date(value);
    } else {
      baseDate = new Date();
    }

    if (isNaN(baseDate.getTime())) {
      baseDate = new Date();
    }

    const next = new Date(baseDate.getTime() + mins * 60000);
    const yyyy = next.getFullYear();
    const mm = String(next.getMonth() + 1).padStart(2, "0");
    const dd = String(next.getDate()).padStart(2, "0");
    const dStr = `${yyyy}-${mm}-${dd}`;

    let h = next.getHours();
    const ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    const hStr = String(h).padStart(2, "0");
    const mStr = String(next.getMinutes()).padStart(2, "0");

    setDatePart(dStr);
    setHourPart(hStr);
    setMinutePart(mStr);
    setAmpmPart(ap);
    updateFullIso(dStr, hStr, mStr, ap);
  };

  const handleClear = () => {
    setDatePart("");
    onChange("");
  };

  const hoursList = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutesList = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

  return (
    <div className="space-y-2.5 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-xs">
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          <span>{label}</span>
        </label>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[10px] text-slate-500 hover:text-rose-400 flex items-center gap-0.5 transition"
          >
            <X className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Date & Clock Pickers Row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
        {/* Calendar Date Picker (6 cols) */}
        <div className="sm:col-span-6 relative">
          <input
            type="date"
            value={datePart}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        {/* Clock Time Selectors (6 cols) */}
        <div className="sm:col-span-6 flex items-center gap-1">
          {/* Hour Select */}
          <select
            value={hourPart}
            disabled={!datePart}
            onChange={(e) => handleHourChange(e.target.value)}
            className="flex-1 px-1.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono text-center disabled:opacity-40"
          >
            {hoursList.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>

          <span className="font-bold text-slate-500">:</span>

          {/* Minute Select (00-59) */}
          <select
            value={minutePart}
            disabled={!datePart}
            onChange={(e) => handleMinuteChange(e.target.value)}
            className="flex-1 px-1.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono text-center disabled:opacity-40"
          >
            {minutesList.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* AM / PM Toggle */}
          <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-0.5 shrink-0">
            <button
              type="button"
              disabled={!datePart}
              onClick={() => handleAmpmChange("AM")}
              className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition ${
                ampmPart === "AM" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              AM
            </button>
            <button
              type="button"
              disabled={!datePart}
              onClick={() => handleAmpmChange("PM")}
              className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition ${
                ampmPart === "PM" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              PM
            </button>
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <button
          type="button"
          onClick={handleSetNow}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-[10px] text-emerald-400 font-semibold transition"
        >
          Set to Now
        </button>
        <button
          type="button"
          onClick={() => handleAddMinutes(15)}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-[10px] text-slate-300 hover:text-white font-semibold transition"
        >
          +15 Mins
        </button>
        <button
          type="button"
          onClick={() => handleAddMinutes(30)}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-[10px] text-slate-300 hover:text-white font-semibold transition"
        >
          +30 Mins
        </button>
        <button
          type="button"
          onClick={() => handleAddMinutes(60)}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-[10px] text-slate-300 hover:text-white font-semibold transition"
        >
          +1 Hour
        </button>
        {onSyncWithStart && (
          <button
            type="button"
            onClick={onSyncWithStart}
            className="px-2.5 py-1 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 rounded-lg text-[10px] font-semibold transition"
          >
            {syncButtonLabel || "Sync with Start + Duration"}
          </button>
        )}
      </div>

      {helperText && <p className="text-[10px] text-slate-500">{helperText}</p>}
    </div>
  );
};
