import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  AlertTriangle, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  BookOpen, 
  Clock,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { mockAttendanceData, ROUTE_PATHS } from '@/lib/index';
import { AttendanceCard } from '@/components/AttendanceCard';
import { TimelineCard } from '@/components/TimelineCard';
import { AILeaveAdvisor } from '@/components/AILeaveAdvisor';
import { QuickStatsBar } from '@/components/StatsCards';
import { springPresets, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';
import { IMAGES } from '@/assets/images';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [greetingText, setGreetingText] = useState('');
  const fullGreeting = `Good morning, ${user?.name?.split(' ')[0] || 'Scholar'} 👋`;

  // Typewriter effect for greeting
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setGreetingText(fullGreeting.slice(0, i));
      i++;
      if (i > fullGreeting.length) clearInterval(timer);
    }, 100);
    return () => clearInterval(timer);
  }, [fullGreeting]);

  // Filter for high alert subjects (below 75%)
  const lowAttendanceSubjects = mockAttendanceData.filter(s => s.percentage < 75);

  return (
    <motion.div 
      className="relative min-h-screen p-4 md:p-8 space-y-8"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Background Glows */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] rounded-full bg-accent/10 blur-[100px]" />
      </div>

      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div variants={fadeInUp} className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-mono text-sm tracking-wider uppercase">
            <Sparkles className="w-4 h-4 animate-pulse" />
            Academic Pulse • 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            {greetingText}<span className="animate-pulse text-primary">|</span>
          </h1>
          <p className="text-muted-foreground max-w-lg">
            Your neural link to campus life is synchronized. Here's what requires your focus today.
          </p>
        </motion.div>

        <motion.div variants={fadeInUp} className="hidden lg:block">
          <div className="flex items-center gap-4 bg-card/40 backdrop-blur-xl border border-border/50 p-4 rounded-2xl">
            <img 
              src={IMAGES.STUDENTS_TECH_6} 
              alt="Campus"
              className="w-12 h-12 rounded-xl object-cover ring-2 ring-primary/20 shadow-lg"
            />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Current Session</p>
              <p className="font-semibold">Spring Semester '26</p>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Quick Stats Bar */}
      <motion.section variants={fadeInUp}>
        <QuickStatsBar />
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Attendance & Timeline */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Attendance Health Section */}
          <motion.section variants={staggerContainer} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Attendance Health</h2>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm text-primary flex items-center gap-1 hover:underline font-medium"
              >
                Detailed View <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Low Attendance Alert Banner */}
            <AnimatePresence>
              {lowAttendanceSubjects.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-center gap-4 text-destructive"
                >
                  <div className="bg-destructive/20 p-2 rounded-lg animate-bounce">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm uppercase tracking-wider">⚠️ HIGH ALERT</p>
                    <p className="text-xs opacity-80">
                      Attendance in {lowAttendanceSubjects.length} subjects is below the 75% threshold. Take immediate action.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar -mx-2 px-2">
              {mockAttendanceData.map((data, index) => (
                <motion.div key={data.subject} variants={staggerItem}>
                  <AttendanceCard 
                    subject={data.subject}
                    percentage={data.percentage}
                    attended={data.attended}
                    total={data.total}
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Timeline Feed */}
          <motion.section variants={fadeInUp} className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Today's Timeline</h2>
            </div>
            <div className="space-y-4">
              <TimelineCard 
                type="class" 
                title="Advanced Data Structures (L-401)" 
                time="09:00 AM - 10:30 AM" 
              />
              <TimelineCard 
                type="assignment" 
                title="Machine Learning Lab Submission" 
                time="Due by 11:59 PM" 
                urgent={true}
              />
              <TimelineCard 
                type="library" 
                title="'Neural Networks' Book Return" 
                time="Before 04:00 PM"
                urgent={true}
              />
              <TimelineCard 
                type="event" 
                title="Google Cloud Student Meetup" 
                time="05:30 PM - Auditorium A"
              />
            </div>
          </motion.section>
        </div>

        {/* Right Column: Contextual Cards */}
        <aside className="lg:col-span-4 space-y-8">
          {/* Campus Hero Card */}
          <motion.div 
            variants={fadeInUp}
            className="relative h-64 rounded-3xl overflow-hidden group border border-white/10 shadow-2xl shadow-primary/5"
          >
            <img 
              src={IMAGES.CAMPUS_HERO_2} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              alt="Campus Hero"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            <div className="absolute bottom-0 p-6">
              <p className="text-xs font-mono text-primary-foreground/70 uppercase tracking-widest">Campus Spotlight</p>
              <h3 className="text-xl font-bold text-white">NIT Tech Symposium 2026</h3>
              <p className="text-sm text-white/60 line-clamp-2 mt-1">
                Join industry leaders for the biggest technological leap in the region. Registrations open now.
              </p>
            </div>
          </motion.div>

          {/* Quick Tasks / Shortcuts */}
          <motion.div 
            variants={fadeInUp}
            className="bg-card/30 backdrop-blur-xl border border-border/50 p-6 rounded-3xl space-y-4"
          >
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent" />
              Neural Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {['Exams', 'Clubs', 'Maps', 'Store'].map((item) => (
                <motion.button
                  key={item}
                  whileHover={{ y: -4, backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-muted/30 border border-border/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 mb-2 flex items-center justify-center">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium uppercase tracking-tighter">{item}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Announcement Card */}
          <motion.div 
            variants={fadeInUp}
            className="bg-primary/5 border border-primary/20 p-6 rounded-3xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <h4 className="font-bold">Hostel Mess Update</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Special menu scheduled for Friday night. Please confirm your presence on the Hostel module for headcount.
            </p>
            <button className="mt-4 w-full py-2 bg-primary/20 hover:bg-primary/30 text-primary text-xs font-bold rounded-xl transition-all">
              VIEW DETAILS
            </button>
          </motion.div>
        </aside>
      </div>

      {/* AI Leave Advisor Floating Widget */}
      <AILeaveAdvisor />
    </motion.div>
  );
};

export default StudentDashboard;
