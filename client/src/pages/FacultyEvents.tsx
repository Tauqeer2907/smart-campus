import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CalendarDays,
    Plus,
    Trash2,
    MapPin,
    Clock,
    Send,
    Tag,
    Bell,
    Users,
    Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications, CampusEvent } from '@/hooks/useNotifications';
import { toast } from 'sonner';

const TYPE_COLORS: Record<CampusEvent['type'], string> = {
    academic: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    cultural: 'bg-purple-500/20 text-purpleted-400 border-purple-500/30',
    sports: 'bg-green-500/20 text-green-400 border-green-500/30',
    placement: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    general: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

export default function FacultyEvents() {
    const { user } = useAuth();
    const { events, createEvent, deleteEvent } = useNotifications(user?.id);

    const [form, setForm] = useState({
        title: '',
        description: '',
        date: '',
        venue: '',
        type: 'general' as CampusEvent['type'],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (field: keyof typeof form, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.date || !form.venue) {
            toast.error('Please fill in all required fields.');
            return;
        }

        setIsSubmitting(true);
        await new Promise(r => setTimeout(r, 600)); // simulate save

        createEvent({ ...form, createdBy: user?.name ?? 'Faculty' });

        toast.success('Event published! All students have been notified.', {
            description: `"${form.title}" is now visible to all students.`,
            icon: <Bell className="h-4 w-4 text-primary" />,
        });

        setForm({ title: '', description: '', date: '', venue: '', type: 'general' });
        setIsSubmitting(false);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Campus Events
                </h1>
                <p className="text-muted-foreground mt-1">
                    Create an event — it will instantly notify all students.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Creation Form */}
                <Card className="lg:col-span-2 bg-card/40 backdrop-blur-xl border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-primary" />
                            New Event
                        </CardTitle>
                        <CardDescription>Broadcasts as a notification to all students</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Event Title *</label>
                                <Input
                                    placeholder="e.g. Annual Tech Fest 2026"
                                    value={form.title}
                                    onChange={e => handleChange('title', e.target.value)}
                                    className="bg-background/50 border-white/10"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Description</label>
                                <textarea
                                    rows={3}
                                    placeholder="Describe the event..."
                                    value={form.description}
                                    onChange={e => handleChange('description', e.target.value)}
                                    className="w-full rounded-md bg-background/50 border border-white/10 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Date *</label>
                                    <Input
                                        type="date"
                                        value={form.date}
                                        onChange={e => handleChange('date', e.target.value)}
                                        className="bg-background/50 border-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Venue *</label>
                                    <Input
                                        placeholder="e.g. Auditorium"
                                        value={form.venue}
                                        onChange={e => handleChange('venue', e.target.value)}
                                        className="bg-background/50 border-white/10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Event Type</label>
                                <Select value={form.type} onValueChange={v => handleChange('type', v)}>
                                    <SelectTrigger className="bg-background/50 border-white/10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">General</SelectItem>
                                        <SelectItem value="academic">Academic</SelectItem>
                                        <SelectItem value="cultural">Cultural</SelectItem>
                                        <SelectItem value="sports">Sports</SelectItem>
                                        <SelectItem value="placement">Placement</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2"
                            >
                                {isSubmitting ? (
                                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }}>
                                        <Sparkles className="h-4 w-4" />
                                    </motion.div>
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                                {isSubmitting ? 'Publishing...' : 'Publish Event'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Events Feed */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Published Events</h2>
                        <Badge variant="secondary" className="gap-1">
                            <Users className="h-3 w-3" />
                            {events.length} events
                        </Badge>
                    </div>

                    {events.length === 0 ? (
                        <Card className="bg-card/20 border-white/5 border-dashed">
                            <CardContent className="py-16 flex flex-col items-center gap-3 text-center">
                                <CalendarDays className="h-12 w-12 text-muted-foreground/30" />
                                <p className="text-muted-foreground text-sm">No events yet. Create your first campus event!</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <AnimatePresence>
                            {events.map(event => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <Card className="bg-card/40 backdrop-blur-xl border-white/10 hover:border-primary/30 transition-colors">
                                        <CardContent className="p-5">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Badge className={`${TYPE_COLORS[event.type]} border text-xs capitalize`}>
                                                            <Tag className="h-3 w-3 mr-1" />
                                                            {event.type}
                                                        </Badge>
                                                    </div>
                                                    <h3 className="font-semibold text-lg">{event.title}</h3>
                                                    {event.description && (
                                                        <p className="text-sm text-muted-foreground">{event.description}</p>
                                                    )}
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {new Date(event.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {event.venue}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground/60">
                                                        Posted by {event.createdBy} · {new Date(event.createdAt).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        deleteEvent(event.id);
                                                        toast.info('Event removed.');
                                                    }}
                                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}
