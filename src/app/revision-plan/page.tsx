"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import {
  CalendarCheck,
  Zap,
} from "lucide-react";
import { RevisionPlan } from "@/lib/types";

export default function RevisionPlanPage() {
  const [plan, setPlan] = useState<RevisionPlan | null>(null);
  const [examDate, setExamDate] = useState<string>("");
  const [dailyHours, setDailyHours] = useState<number>(2);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const target = new Date();
    target.setDate(target.getDate() + 14);
    const dateStr = target.toISOString().split("T")[0];
    setExamDate(dateStr);

    fetch("/api/revision-plan")
      .then((res) => res.json())
      .then((data) => {
        if (data.plan) {
          setPlan(data.plan);
          if (data.plan.examDate) setExamDate(data.plan.examDate);
          if (data.plan.dailyHoursAvailable) setDailyHours(data.plan.dailyHoursAvailable);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await fetch("/api/revision-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examDate,
          dailyHoursAvailable: dailyHours,
        }),
      });

      const data = await res.json();
      if (data.plan) setPlan(data.plan);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    if (!plan) return;

    // Optimistic UI update
    const updatedSchedules = plan.dailySchedules.map((schedule) => ({
      ...schedule,
      tasks: schedule.tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ),
    }));

    setPlan({
      ...plan,
      dailySchedules: updatedSchedules,
    });

    try {
      await fetch("/api/revision-plan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const allTasks = plan?.dailySchedules.flatMap((s) => s.tasks) || [];
  const completedTasksCount = allTasks.filter((t) => t.completed).length;
  const progressPct = allTasks.length > 0 ? Math.round((completedTasksCount / allTasks.length) * 100) : 0;

  return (
    <div className="flex-1 pb-16 bg-ivory-50 dark:bg-pine-950 transition-colors duration-200">
      <Header
        title="Adaptive Revision Schedule & Spaced Repetition"
        subtitle="Deterministic timeline allocating 50% study time to weak topics (<60%), 35% to medium, and 15% to maintenance."
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 space-y-8">
        {/* Plan Configuration Box */}
        <div className="bg-white dark:bg-pine-900 rounded-2xl p-6 border border-ivory-200 dark:border-pine-800 shadow-paper space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-forest-950 dark:text-ivory-50 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-coral-500" />
              <span>Target Parameters & Daily Allocation</span>
            </h2>
            <span className="text-xs text-forest-500 dark:text-forest-400 font-medium">Deterministic Spaced Repetition</span>
          </div>

          <form onSubmit={handleGeneratePlan} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-forest-800 dark:text-forest-200 mb-1.5">
                Target Exam Date
              </label>
              <input
                type="date"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-200 dark:border-pine-800 bg-white dark:bg-pine-850 text-forest-950 dark:text-ivory-50 text-xs focus:ring-2 focus:ring-coral-500 outline-none font-medium shadow-paper"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-forest-800 dark:text-forest-200 mb-1.5">
                Daily Available Study Time: <strong className="text-coral-600 dark:text-coral-400">{dailyHours} hours/day</strong>
              </label>
              <input
                type="range"
                min={0.5}
                max={8}
                step={0.5}
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full accent-coral-500 mt-2"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={generating}
                className="w-full py-2.5 px-4 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold shadow-coral transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Recalculating Schedule...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Recalculate Revision Plan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {plan && (
          <>
            {/* Overview Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white dark:bg-pine-900 rounded-2xl p-5 border border-ivory-200 dark:border-pine-800 shadow-paper transition-colors">
                <span className="text-[11px] font-bold text-forest-500 dark:text-forest-400 uppercase tracking-wider">Days Until Exam</span>
                <div className="mt-2 text-3xl font-extrabold text-forest-950 dark:text-ivory-50 tracking-tight">{plan.daysRemaining} Days</div>
                <p className="text-[11px] text-forest-500 dark:text-forest-400 mt-1 font-medium">Exam on {plan.examDate}</p>
              </div>

              <div className="bg-white dark:bg-pine-900 rounded-2xl p-5 border border-ivory-200 dark:border-pine-800 shadow-paper transition-colors">
                <span className="text-[11px] font-bold text-forest-500 dark:text-forest-400 uppercase tracking-wider">Total Study Capacity</span>
                <div className="mt-2 text-3xl font-extrabold text-forest-900 dark:text-ivory-50 tracking-tight">{plan.totalStudyHoursAvailable} Hours</div>
                <p className="text-[11px] text-forest-500 dark:text-forest-400 mt-1 font-medium">At {plan.dailyHoursAvailable}h / day</p>
              </div>

              <div className="bg-white dark:bg-pine-900 rounded-2xl p-5 border border-coral-200 dark:border-coral-900/60 shadow-paper transition-colors">
                <span className="text-[11px] font-bold text-coral-600 dark:text-coral-400 uppercase tracking-wider">Weak Topic Allocation</span>
                <div className="mt-2 text-3xl font-extrabold text-coral-600 dark:text-coral-400 tracking-tight">{plan.weakTopicHours} Hours</div>
                <p className="text-[11px] text-forest-500 dark:text-forest-400 mt-1 font-medium">50% high-priority focus</p>
              </div>

              <div className="bg-white dark:bg-pine-900 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-900/60 shadow-paper transition-colors">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Tasks Completed</span>
                <div className="mt-2 text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight">
                  {completedTasksCount} / {allTasks.length} ({progressPct}%)
                </div>
                <div className="w-full h-1.5 bg-ivory-200 dark:bg-pine-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Strategy Summary Banner */}
            <div className="p-4 rounded-2xl bg-white dark:bg-pine-900 border border-ivory-200 dark:border-pine-800 text-xs text-forest-900 dark:text-forest-100 leading-relaxed font-medium shadow-paper">
              <strong className="text-coral-600 dark:text-coral-400 font-bold">Algorithm Strategy:</strong> {plan.strategySummary}
            </div>

            {/* Daily Schedules Timeline */}
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-forest-950 dark:text-ivory-50">
                Day-by-Day Spaced Repetition Schedule ({plan.dailySchedules.length} Days)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plan.dailySchedules.map((day) => (
                  <div
                    key={day.dayNumber}
                    className="bg-white dark:bg-pine-900 rounded-2xl p-5 border border-ivory-200 dark:border-pine-800 shadow-paper space-y-4 flex flex-col justify-between transition-colors"
                  >
                    <div>
                      {/* Day Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-ivory-150 dark:border-pine-800">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-forest-900 dark:bg-forest-800 text-ivory-50 font-bold text-xs flex items-center justify-center">
                            D{day.dayNumber}
                          </span>
                          <span className="text-xs font-bold text-forest-950 dark:text-ivory-50">
                            {day.dayOfWeek}, {day.date}
                          </span>
                        </div>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-ivory-100 dark:bg-pine-850 text-forest-700 dark:text-forest-300 font-bold border border-ivory-200 dark:border-pine-800">
                          {day.totalAllocatedMinutes} mins
                        </span>
                      </div>

                      {/* Focus Topic */}
                      <div className="mt-3">
                        <span className="text-[10px] text-forest-500 dark:text-forest-400 uppercase font-bold block">
                          Daily Focus
                        </span>
                        <span className="text-xs font-bold text-coral-600 dark:text-coral-400 block truncate">
                          {day.focusTopic}
                        </span>
                      </div>

                      {/* Tasks List */}
                      <div className="mt-3 space-y-2.5">
                        {day.tasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => handleToggleTask(task.id)}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                              task.completed
                                ? "bg-ivory-100/60 dark:bg-pine-950/40 border-ivory-200 dark:border-pine-800 opacity-60 line-through"
                                : "bg-white dark:bg-pine-850 border-ivory-200 dark:border-pine-800 hover:border-coral-300 dark:hover:border-pine-700 shadow-paper"
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => {}}
                                className="mt-0.5 rounded text-coral-500 accent-coral-500 cursor-pointer"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-xs font-bold text-forest-950 dark:text-ivory-50 truncate">
                                    {task.title}
                                  </span>
                                  <span className="text-[10px] text-forest-500 dark:text-forest-400 shrink-0 font-medium">
                                    {task.estimatedMinutes}m
                                  </span>
                                </div>
                                <p className="text-[11px] text-forest-600 dark:text-forest-400 mt-1 line-clamp-2">
                                  {task.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
