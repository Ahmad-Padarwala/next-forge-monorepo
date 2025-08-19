"use client";

import React, { JSX, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type EventItem = {
  id: string;
  name: string;
  date: string;
};

type EventsState = {
  events: EventItem[];
  search: string;
  setSearch: (q: string) => void;
  addEvent: (payload: { name: string; date: string }) => void;
  deleteEvent: (id: string) => void;
};

const LOCAL_STORAGE_KEY = "mini-event-manager:events";

// id generator
function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return (crypto as unknown as { randomUUID: () => string }).randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// Zustand store with persistence only for 'events'
const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      events: [],
      search: "",
      setSearch: (q) => set({ search: q }),
      addEvent: ({ name, date }) =>
        set((state) => ({
          events: [...state.events, { id: generateId(), name: name.trim(), date }],
        })),
      deleteEvent: (id) =>
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        })),
    }),
    {
      name: LOCAL_STORAGE_KEY,
      // only persist events, not search
      partialize: (state) => ({ events: state.events }),
      version: 1,
    }
  )
);

// RHF form schema
type FormValues = {
  name: string;
  date: string;
};

export default function EventsPage(): JSX.Element {
  const { events, search, setSearch, addEvent, deleteEvent } = useEventsStore();

  // react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    defaultValues: { name: "", date: "" },
    mode: "onChange",
  });

  // Derived filtered + sorted events (stable)
  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = [...events].sort((a, b) => a.date.localeCompare(b.date));
    if (!q) return base;
    return base.filter((e) => e.name.toLowerCase().includes(q));
  }, [events, search]);

  // Submit handler
  const onSubmit = (data: FormValues) => {
    const trimmed = data.name.trim();
    if (!trimmed || !data.date) return;
    addEvent({ name: trimmed, date: data.date });
    reset(); // clears both fields
  };

  // For disabling submit button based on current form values
  const nameVal = watch("name");
  const dateVal = watch("date");
  const canSubmit = Boolean(nameVal?.trim() && dateVal) && !isSubmitting;

  // Ensure client-only behavior is stable
  useEffect(() => {
    // No-op, but keeps the component client-hydrated cleanly
  }, []);

  return (
    <div className="min-h-dvh bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Subtle grid background pattern */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px]"
      />
      {/* Glow accent */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 [mask-image:radial-gradient(60%_60%_at_50%_30%,black,transparent)]"
      >
        <div className="absolute left-1/2 top-20 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-600/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 py-12">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500">
            Mini Event Manager
          </h1>
          <p className="mt-3 text-gray-300">
            Add events and manage them locally in your browser.
          </p>
        </header>

        {/* Form (React Hook Form) */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 sm:p-6 transition"
          noValidate
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="eventName" className="mb-1.5 block text-sm font-medium text-gray-200">
                Event Name<span className="text-pink-400"> *</span>
              </label>
              <input
                id="eventName"
                type="text"
                placeholder="e.g. Team Meeting"
                className="block w-full rounded-md border border-white/10 bg-white/5 px-3 py-2.5 text-gray-100 placeholder:text-gray-400 outline-none transition focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/30"
                {...register("name", {
                  required: "Event name is required",
                  validate: (v) => (v?.trim().length ? true : "Event name cannot be empty"),
                  maxLength: { value: 200, message: "Max 200 characters" },
                })}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-pink-400">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="eventDate" className="mb-1.5 block text-sm font-medium text-gray-200">
                Date<span className="text-pink-400"> *</span>
              </label>
              <input
                id="eventDate"
                type="date"
                className="block w-full rounded-md border border-white/10 bg-white/5 px-3 py-2.5 text-gray-100 placeholder:text-gray-400 outline-none transition focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/30"
                {...register("date", {
                  required: "Date is required",
                  validate: (v) => (isValidISODate(v) ? true : "Invalid date"),
                })}
              />
              {errors.date && (
                <p className="mt-1 text-xs text-pink-400">{errors.date.message}</p>
              )}
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={!canSubmit}
                className="cursor-pointer inline-flex h-11 items-center justify-center rounded-md bg-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition active:scale-[0.98] hover:bg-indigo-700 hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Adding..." : "Add Event"}
              </button>
            </div>
          </div>
        </form>

        {/* List */}
        <section className="mt-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-white">Events</h2>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="w-full sm:w-64 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-400 outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/30"
            />
          </div>

          <ul className="mt-4 divide-y divide-white/5">
            {filteredEvents.length === 0 ? (
              <li className="py-10 text-center text-sm text-gray-400">No events yet.</li>
            ) : (
              filteredEvents.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-3 px-2 rounded-md hover:bg-white/5 transition"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{item.name}</p>
                    <p className="text-xs text-gray-400">{formatDate(item.date)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteEvent(item.id)}
                    className="cursor-pointer inline-flex h-8 items-center justify-center rounded-md border border-white/10 bg-white/5 px-3 text-xs font-medium text-gray-200 hover:bg-white/10 hover:text-white transition"
                  >
                    Delete
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

function isValidISODate(v: string): boolean {
  // expecting yyyy-mm-dd
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(v);
  return !Number.isNaN(d.getTime());
}

function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return isoDate;
  }
}
