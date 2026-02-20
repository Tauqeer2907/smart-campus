import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Book,
  Clock,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Info,
  CalendarCheck,
  Filter,
  Bookmark
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Mock Data for Library Catalog
const LIBRARY_CATALOG = [
  { id: '1', title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell', category: 'Computer Science', available: 3, isbn: '978-0136042594' },
  { id: '2', title: 'Clean Code: A Handbook of Agile Software Craftsmanship', author: 'Robert C. Martin', category: 'Software Engineering', available: 0, isbn: '978-0132350884' },
  { id: '3', title: 'Design Patterns: Elements of Reusable Object-Oriented Software', author: 'Erich Gamma', category: 'Software Engineering', available: 5, isbn: '978-0201633610' },
  { id: '4', title: 'The Pragmatic Programmer', author: 'Andrew Hunt', category: 'Professional Development', available: 2, isbn: '978-0135957059' },
  { id: '5', title: 'Discrete Mathematics and Its Applications', author: 'Kenneth Rosen', category: 'Mathematics', available: 8, isbn: '978-0073383095' },
  { id: '6', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', category: 'Computer Science', available: 1, isbn: '978-0262033848' },
];

// Mock Data for Currently Borrowed
const BORROWED_BOOKS = [
  {
    id: 'b1',
    title: 'Modern Operating Systems',
    author: 'Andrew S. Tanenbaum',
    dueDate: '2026-03-05',
    status: 'borrowed',
    aiSuggestion: 'Renew before Feb 28 to avoid peak rush points.',
    progress: 45,
  },
  {
    id: 'b2',
    title: 'Deep Learning',
    author: 'Ian Goodfellow',
    dueDate: '2026-02-18', // Overdue relative to 2026-02-20
    status: 'overdue',
    aiSuggestion: 'Urgent: High demand for this title. Return by 6 PM to avoid suspension.',
    progress: 100,
  },
];

export default function Library() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<typeof LIBRARY_CATALOG[0] | null>(null);
  const [isReserved, setIsReserved] = useState(false);

  const filteredCatalog = useMemo(() => {
    return LIBRARY_CATALOG.filter((book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleReserve = (book: typeof LIBRARY_CATALOG[0]) => {
    setSelectedBook(book);
  };

  const confirmReservation = () => {
    toast.success(`Successfully reserved "${selectedBook?.title}"! You'll be notified when it's ready for pickup.`);
    setSelectedBook(null);
  };

  const handleRenew = (title: string) => {
    toast.success(`Renewal request submitted for "${title}". AI Analysis: Approval likely.`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10 min-h-screen bg-background text-foreground">
      {/* Hero Section with Search */}
      <section className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-primary/10 via-background to-accent/5 border border-primary/20 shadow-2xl shadow-primary/5">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Book className="w-48 h-48 rotate-12" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Digital Library Nexus
            </h1>
            <p className="text-muted-foreground max-w-lg">
              Access over 50,000 technical journals, academic papers, and textbooks powered by UniCampus AI.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by title, author, or ISBN..."
                className="pl-10 h-12 bg-background/50 backdrop-blur-md border-primary/20 focus:border-primary transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button size="lg" className="h-12 px-8 font-semibold">
              Find Resources
            </Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Currently Borrowed Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-primary" />
              Active Borrows
            </h2>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              {BORROWED_BOOKS.length} Items
            </Badge>
          </div>

          <div className="space-y-4">
            {BORROWED_BOOKS.map((book) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ y: -4 }}
                className={`group relative overflow-hidden rounded-xl border p-5 bg-card/50 backdrop-blur-xl transition-all shadow-sm ${book.status === 'overdue' ? 'border-destructive/30' : 'border-white/10'}`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{book.author}</p>
                    </div>
                    {book.status === 'overdue' && (
                      <Badge variant="destructive" className="animate-pulse">
                        Overdue
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" /> Due: {book.dueDate}
                      </span>
                      <span className="font-mono">{book.status === 'overdue' ? 'Critical' : 'Safe'}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${book.progress}%` }}
                        className={`h-full ${book.status === 'overdue' ? 'bg-destructive' : 'bg-primary'}`}
                      />
                    </div>
                  </div>

                  {/* AI Suggestion Chip */}
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 flex gap-2 items-start">
                    <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed text-accent-foreground font-medium">
                      {book.aiSuggestion}
                    </p>
                  </div>

                  <Button
                    variant={book.status === 'overdue' ? 'destructive' : 'outline'}
                    className="w-full text-xs h-9"
                    onClick={() => handleRenew(book.title)}
                    disabled={book.status === 'overdue'}
                  >
                    <RefreshCw className="w-3 h-3 mr-2" />
                    Renew Book
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Catalog Grid Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              Library Catalog
            </h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-xs">Recent</Button>
              <Button variant="ghost" size="sm" className="text-xs">Popular</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode='popLayout'>
              {filteredCatalog.map((book) => (
                <motion.div
                  key={book.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <Card className="h-full bg-card/40 backdrop-blur-md border-white/5 hover:border-primary/30 transition-all cursor-pointer overflow-hidden group">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-muted-foreground border-white/10">
                          {book.category}
                        </Badge>
                        <span className={`text-[10px] font-bold ${book.available > 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                          {book.available > 0 ? `${book.available} Available` : 'Waitlisted'}
                        </span>
                      </div>
                      <CardTitle className="text-base font-bold mt-2 group-hover:text-primary transition-colors">
                        {book.title}
                      </CardTitle>
                      <CardDescription className="text-xs">{book.author}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                        <Info className="w-3 h-3" /> ISBN: {book.isbn}
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="secondary"
                            className="w-full text-xs bg-primary/5 hover:bg-primary/20 text-primary border border-primary/10"
                            onClick={() => handleReserve(book)}
                          >
                            <CalendarCheck className="w-3 h-3 mr-2" />
                            Reserve Item
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card/95 backdrop-blur-2xl border-white/10 sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-primary">
                              <CheckCircle2 className="w-5 h-5" />
                              Confirm Reservation
                            </DialogTitle>
                            <DialogDescription>
                              You are requesting to reserve "{selectedBook?.title}".
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4 space-y-4">
                            <div className="rounded-lg bg-muted/50 p-4 border border-white/5 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Collection Point</span>
                                <span className="font-medium">Central Library Wing B</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Hold Period</span>
                                <span className="font-medium">48 Hours</span>
                              </div>
                            </div>
                            <div className="flex gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                              <AlertCircle className="w-4 h-4 text-primary shrink-0" />
                              <p className="text-xs text-primary/80">
                                AI Insight: This book is frequently returned early. You might get it sooner than estimated.
                              </p>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="ghost" onClick={() => setSelectedBook(null)}>Cancel</Button>
                            <Button onClick={confirmReservation}>Confirm Request</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredCatalog.length === 0 && (
              <div className="col-span-full py-20 text-center space-y-4">
                <Search className="w-12 h-12 text-muted-foreground mx-auto opacity-20" />
                <p className="text-muted-foreground">No books found matching "{searchQuery}"</p>
                <Button variant="link" onClick={() => setSearchQuery('')} className="text-primary">
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
