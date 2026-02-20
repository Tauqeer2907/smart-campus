import React from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  CalendarDays,
  ArrowUpRight
} from 'lucide-react';
import { mockAttendanceData, AttendanceData } from '@/lib/index';
import { AttendanceCard } from '@/components/AttendanceCard';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemFadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Attendance() {
  // Mock data for heatmap (Feb 2026)
  const daysInMonth = 28;
  const attendanceLog = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    status: i % 7 === 0 || i % 7 === 6 ? 'holiday' : (Math.random() > 0.15 ? 'present' : 'absent'),
  }));

  const overallPercentage = Math.round(
    mockAttendanceData.reduce((acc, curr) => acc + curr.percentage, 0) / mockAttendanceData.length
  );

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3"
          >
            <CalendarDays className="w-8 h-8 text-primary" />
            Attendance Analytics
          </motion.h1>
          <p className="text-muted-foreground mt-1">Real-time tracking and AI-driven predictions for Semester 2, 2026.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card/50 backdrop-blur-xl border border-primary/20 rounded-2xl p-4 flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-full border-4 border-primary flex items-center justify-center font-bold text-lg">
            {overallPercentage}%
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Overall Attendance</div>
            <div className="text-xs text-green-500 flex items-center gap-1 font-medium">
              <ArrowUpRight className="w-3 h-3" /> +2.4% from last month
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[ 
          { label: 'Total Classes', value: '116', icon: Calendar, color: 'text-blue-500' },
          { label: 'Attended', value: '95', icon: CheckCircle2, color: 'text-green-500' },
          { label: 'Leaves Taken', value: '21', icon: Info, color: 'text-amber-500' },
          { label: 'Critical Subjects', value: '1', icon: AlertTriangle, color: 'text-destructive' },
        ].map((stat, idx) => (
          <motion.div 
            key={idx}
            variants={itemFadeIn}
            initial="hidden"
            animate="show"
            transition={{ delay: idx * 0.1 }}
            className="bg-card/40 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center gap-4"
          >
            <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{stat.label}</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Subject Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Subject Health Cards</h2>
        </div>
        
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {mockAttendanceData.map((subject: AttendanceData) => (
            <motion.div key={subject.subject} variants={itemFadeIn} className="group relative">
              <AttendanceCard 
                subject={subject.subject}
                percentage={subject.percentage}
                attended={subject.attended}
                total={subject.total}
              />
              
              {/* AI Prediction Chip - Positioned below the card with a glow effect */}
              <div className="mt-3 bg-primary/10 border border-primary/20 backdrop-blur-sm rounded-lg p-3 relative overflow-hidden group-hover:border-primary/40 transition-colors">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5 animate-pulse" />
                  <p className="text-xs font-medium leading-relaxed">
                    <span className="text-primary font-bold">AI Insights:</span> {subject.prediction}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Monthly Heatmap Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Attendance Heatmap</h2>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-green-500" /> Present</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-destructive" /> Absent</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-muted" /> Holiday</div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="text-center text-xs font-bold text-muted-foreground pb-2">{day}</div>
            ))}
            {/* Empty slots for starting the month on a specific day (Feb 2026 starts on Sunday) */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {attendanceLog.map((log) => (
              <motion.div
                key={log.day}
                whileHover={{ scale: 1.1 }}
                className={`
                  aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all cursor-default
                  ${log.status === 'present' ? 'bg-green-500/20 text-green-500 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : ''}
                  ${log.status === 'absent' ? 'bg-destructive/20 text-destructive border border-destructive/30 shadow-[0_0_10px_rgba(239,68,68,0.1)] animate-pulse' : ''}
                  ${log.status === 'holiday' ? 'bg-muted/30 text-muted-foreground border border-white/5' : ''}
                `}
              >
                {log.day}
              </motion.div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-400 shrink-0" />
            <p className="text-sm text-muted-foreground">
              Feb 2026 shows <span className="text-foreground font-semibold">92% consistency</span> in weekday attendance. 
              Your highest streak was <span className="text-green-400 font-bold">12 days</span>.
            </p>
          </div>
        </motion.div>

        {/* AI Prediction Summary Side Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              Smart Forecast
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">End-Semester Goal</span>
                  <span className="font-bold">85%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[85%] shadow-[0_0_8px_var(--primary)]" />
                </div>
              </div>

              <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                <p className="text-xs text-muted-foreground mb-1 italic">AI Recommendation:</p>
                <p className="text-sm font-medium leading-snug text-foreground">
                  Based on your current trajectory, you will finish the semester with <span className="text-primary">82.4%</span> overall attendance.
                </p>
              </div>
              
              <button className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold transition-all hover:shadow-[0_0_15px_rgba(var(--primary),0.4)] flex items-center justify-center gap-2">
                Optimize My Schedule
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-card/40 border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              At-Risk Alert
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                <div>
                  <p className="text-sm font-bold">Digital Logic</p>
                  <p className="text-xs text-muted-foreground">70% Current</p>
                </div>
                <div className="text-xs font-bold text-destructive px-2 py-1 bg-destructive/20 rounded-md uppercase tracking-tighter">
                  Urgent
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Attend the next 5 sessions to clear the 75% threshold.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
