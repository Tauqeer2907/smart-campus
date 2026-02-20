import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Tag,
  Search,
  Plus,
  X,
  Check
} from 'lucide-react';
import { Assignment } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const mockAssignments: Assignment[] = [
  {
    id: 'asgn_01',
    title: 'Database Normalization Lab',
    subject: 'Database Systems',
    dueDate: '2026-02-25',
    status: 'pending',
    branch: 'COMP',
    module: 'Module 3',
    timestamp: '2026-02-20T10:00:00Z',
  },
  {
    id: 'asgn_02',
    title: 'Kernel Synchronization Project',
    subject: 'Operating Systems',
    dueDate: '2026-02-18',
    status: 'submitted',
    branch: 'COMP',
    module: 'Module 4',
    timestamp: '2026-02-17T14:30:00Z',
  },
  {
    id: 'asgn_03',
    title: 'Dijkstra Algorithm Implementation',
    subject: 'Data Structures',
    dueDate: '2026-02-15',
    status: 'graded',
    grade: 'A+',
    branch: 'COMP',
    module: 'Module 2',
    timestamp: '2026-02-14T09:15:00Z',
  },
  {
    id: 'asgn_04',
    title: 'TCP/IP Header Analysis',
    subject: 'Computer Networks',
    dueDate: '2026-02-28',
    status: 'pending',
    branch: 'COMP',
    module: 'Module 5',
    timestamp: '2026-02-19T16:45:00Z',
  }
];

export default function Assignments() {
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      toast({
        title: "File Detected",
        description: `Preparing to upload ${files[0].name}...`,
      });
      // Simulate upload
      setTimeout(() => {
        toast({
          title: "Upload Successful",
          description: "Assignment submitted and tagged automatically.",
          variant: "default",
        });
      }, 1500);
    }
  }, [toast]);

  const getStatusColor = (status: Assignment['status']) => {
    switch (status) {
      case 'submitted': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'graded': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: Assignment['status']) => {
    switch (status) {
      case 'submitted': return <CheckCircle2 className="w-3 h-3" />;
      case 'graded': return <Check className="w-3 h-3" />;
      case 'pending': return <Clock className="w-3 h-3" />;
    }
  };

  const filteredAssignments = assignments.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Assignments Hub
          </h1>
          <p className="text-muted-foreground mt-1">Track, submit, and manage your academic tasks</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search assignments..." 
            className="pl-10 bg-card/50 border-white/10 focus:ring-primary/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group"
      >
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 p-12
            flex flex-col items-center justify-center text-center space-y-4 cursor-pointer
            ${isDragging 
              ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgba(var(--primary),0.2)]' 
              : 'border-white/10 bg-card/30 hover:border-primary/50 hover:bg-card/50'}
          `}
        >
          <div className="p-4 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Drag and drop your files here</h3>
            <p className="text-sm text-muted-foreground">PDF, ZIP, or DOCX (Max 25MB)</p>
          </div>
          <Button variant="secondary" className="mt-4">
            Select Files
          </Button>
          
          {/* Animated Background Pulse */}
          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none"
              >
                <div className="absolute inset-0 bg-primary/5 animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode='popLayout'>
          {filteredAssignments.map((asgn, idx) => (
            <motion.div
              key={asgn.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              layout
            >
              <Card className="bg-card/40 border-white/5 backdrop-blur-md hover:border-primary/30 transition-all group h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className={`flex items-center gap-1.5 px-2 py-0.5 ${getStatusColor(asgn.status)}`}>
                      {getStatusIcon(asgn.status)}
                      <span className="capitalize">{asgn.status}</span>
                    </Badge>
                    {asgn.status === 'graded' && (
                      <span className="text-xl font-mono font-bold text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]">
                        {asgn.grade}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors mt-2">
                    {asgn.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{asgn.subject}</p>
                </CardHeader>
                <CardContent className="pt-4 space-y-4 flex-grow flex flex-col justify-end">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-white/5 border-white/10 text-[10px] uppercase tracking-wider">
                      <Tag className="w-3 h-3 mr-1 opacity-70" />
                      {asgn.branch}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/5 border-white/10 text-[10px] uppercase tracking-wider">
                      {asgn.module}
                    </Badge>
                  </div>
                  
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <AlertCircle className="w-3 h-3 mr-1.5 text-destructive" />
                      Due: {new Date(asgn.dueDate).toLocaleDateString()}
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 text-xs hover:bg-primary/10 hover:text-primary">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredAssignments.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-center opacity-50">
          <FileText className="w-16 h-16 mb-4" />
          <h3 className="text-xl font-medium">No assignments found</h3>
          <p className="text-muted-foreground">Try adjusting your search query</p>
        </div>
      )}
    </div>
  );
}
