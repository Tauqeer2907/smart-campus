import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  TrendingUp,
  Users,
  Lock,
  CheckCircle2,
  Clock,
  Trophy,
  ArrowRight,
  Search,
  Building2,
  Calendar,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { 
  PlacementDrive, 
  mockUsers, 
  formatCampusDate 
} from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';

const MOCK_DRIVES: PlacementDrive[] = [
  {
    id: 'd1',
    company: 'Google',
    role: 'Software Engineer - ML',
    ctc: '45 LPA',
    cutoffCgpa: 8.5,
    deadline: '2026-03-15T23:59:59',
    applicants: 1240,
    status: 'open',
  },
  {
    id: 'd2',
    company: 'Microsoft',
    role: 'Product Manager Intern',
    ctc: '32 LPA',
    cutoffCgpa: 8.0,
    deadline: '2026-03-10T23:59:59',
    applicants: 850,
    status: 'shortlisted',
  },
  {
    id: 'd3',
    company: 'NVIDIA',
    role: 'Hardware Design Engineer',
    ctc: '38 LPA',
    cutoffCgpa: 9.0,
    deadline: '2026-03-20T23:59:59',
    applicants: 420,
    status: 'open',
  },
  {
    id: 'd4',
    company: 'Atlassian',
    role: 'SRE Intern',
    ctc: '28 LPA',
    cutoffCgpa: 7.5,
    deadline: '2026-02-28T23:59:59',
    applicants: 600,
    status: 'interview',
  },
  {
    id: 'd5',
    company: 'Jane Street',
    role: 'Quantitative Researcher',
    ctc: '120 LPA',
    cutoffCgpa: 9.5,
    deadline: '2026-03-05T23:59:59',
    applicants: 150,
    status: 'open',
  },
];

const STAGES = ['Applied', 'Shortlisted', 'Interview', 'Offer'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function Placements() {
  const currentUser = mockUsers[0]; // Aryan Sharma (CGPA 9.2)
  const [drives, setDrives] = useState<PlacementDrive[]>(MOCK_DRIVES);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedDrives, setAppliedDrives] = useState<string[]>(['d2', 'd4']);

  const filteredDrives = drives.filter(drive => 
    drive.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drive.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApply = (drive: PlacementDrive) => {
    if (currentUser.cgpa! < drive.cutoffCgpa) {
      toast({
        title: "Eligibility Error",
        description: `Your CGPA (${currentUser.cgpa}) is below the required ${drive.cutoffCgpa} for this drive.`,
        variant: "destructive",
      });
      return;
    }

    setAppliedDrives(prev => [...prev, drive.id]);
    toast({
      title: "Application Successful",
      description: `You have successfully applied for ${drive.company} - ${drive.role}.`,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10 space-y-10">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-10 bg-gradient-to-br from-primary/20 via-background to-accent/10 border border-primary/20 shadow-2xl shadow-primary/5"
      >
        <div className="relative z-10 max-w-3xl">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 px-3 py-1">
            Placement Season 2026
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Elevate Your <span className="text-primary">Career Orbit</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Access premium opportunities from top-tier organizations. Your academic excellence meets the industry's highest standards.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-card/50 backdrop-blur-md border border-white/5 px-4 py-2 rounded-xl">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Avg. CTC: 24.5 LPA</span>
            </div>
            <div className="flex items-center gap-2 bg-card/50 backdrop-blur-md border border-white/5 px-4 py-2 rounded-xl">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium">Highest: 1.2 Cr</span>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl -ml-20 -mb-20" />
      </motion.div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[ 
          { label: 'Active Drives', value: '42', icon: <Briefcase className="w-4 h-4" /> },
          { label: 'Applied', value: appliedDrives.length.toString(), icon: <CheckCircle2 className="w-4 h-4" /> },
          { label: 'Upcoming', value: '15', icon: <Calendar className="w-4 h-4" /> },
          { label: 'My Offers', value: '0', icon: <Trophy className="w-4 h-4" /> }
        ].map((stat, i) => (
          <Card key={i} className="bg-card/40 backdrop-blur-md border-white/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                {stat.icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search companies or roles..."
            className="pl-10 bg-card/40 border-white/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="border-white/10">All Drives</Button>
          <Button variant="outline" className="border-white/10">Shortlisted</Button>
          <Button variant="outline" className="border-white/10">Eligible</Button>
        </div>
      </div>

      {/* Drives Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredDrives.map((drive) => {
          const isApplied = appliedDrives.includes(drive.id);
          const isEligible = currentUser.cgpa! >= drive.cutoffCgpa;
          
          return (
            <motion.div key={drive.id} variants={itemVariants}>
              <Card className="group bg-card/40 backdrop-blur-md border-white/5 hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                      <Building2 className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <Badge variant={drive.status === 'open' ? 'default' : 'secondary'} className="capitalize">
                      {drive.status}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <CardTitle className="text-xl">{drive.role}</CardTitle>
                    <CardDescription className="text-foreground/80 font-medium flex items-center gap-1 mt-1">
                      {drive.company} <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-grow">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Package</p>
                      <p className="text-sm font-semibold text-primary">{drive.ctc}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Min. CGPA</p>
                      <p className="text-sm font-semibold">{drive.cutoffCgpa}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" /> {drive.applicants} Applied
                      </span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatCampusDate(drive.deadline).split(',')[0]}
                      </span>
                    </div>
                    <Progress value={(drive.applicants / 2000) * 100} className="h-1 bg-white/5" />
                  </div>

                  {/* Application Tracker if Applied */}
                  {isApplied && (
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter mb-3">Track Status</p>
                      <div className="flex justify-between items-center">
                        {STAGES.map((stage, idx) => {
                          const isPast = idx < STAGES.indexOf(drive.status === 'open' ? 'Applied' : drive.status.charAt(0).toUpperCase() + drive.status.slice(1));
                          const isCurrent = STAGES.indexOf(drive.status === 'open' ? 'Applied' : drive.status.charAt(0).toUpperCase() + drive.status.slice(1)) === idx;
                          
                          return (
                            <div key={stage} className="flex flex-col items-center gap-1 relative flex-1">
                              <div className={`w-2.5 h-2.5 rounded-full z-10 ${isPast || isCurrent ? 'bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]' : 'bg-muted'}`} />
                              {idx < STAGES.length - 1 && (
                                <div className={`absolute top-1.25 left-[50%] w-full h-[1px] ${isPast ? 'bg-primary' : 'bg-muted'}`} />
                              )}
                              <span className={`text-[8px] font-medium ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                                {stage}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  {isApplied ? (
                    <Button className="w-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20" disabled>
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Application Sent
                    </Button>
                  ) : (
                    <Button 
                      className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300 border border-primary/20"
                      disabled={!isEligible}
                      onClick={() => handleApply(drive)}
                    >
                      {isEligible ? (
                        <><Briefcase className="w-4 h-4 mr-2" /> One-Click Apply</>
                      ) : (
                        <><Lock className="w-4 h-4 mr-2" /> CGPA Locked</>
                      )}
                    </Button>
                  )}
                </CardFooter>
                {!isEligible && (
                  <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <AlertCircle className="w-8 h-8 text-destructive mb-2" />
                    <p className="text-center text-sm font-semibold">Below Cutoff</p>
                    <p className="text-center text-xs text-muted-foreground">Requires {drive.cutoffCgpa} CGPA</p>
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Bottom Floating Tip */}
      <AnimatePresence>
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-card/80 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full shadow-2xl flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="text-sm font-medium">3 new high-priority drives matching your profile added today</p>
            <ArrowRight className="w-4 h-4 text-primary cursor-pointer" />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
