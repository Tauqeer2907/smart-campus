import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CalendarDays,
    MapPin,
    Clock,
    CheckCircle2,
    Tag,
    Loader2,
    Search,
    CalendarCheck,
    Bell,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications, CampusEvent } from '@/hooks/useNotifications';
import { toast } from 'sonner';

const TYPE_COLORS: Record<CampusEvent['type'], string> = {
    academic: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    cultural: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    sports: 'bg-green-500/20 text-green-400 border-green-500/30',
    placement: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    general: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const TYPE_ICONS: Record<CampusEvent['type'], string> = {
    academic: '📘',
    cultural: '🎭',
    sports: '⚽',
    placement: '💼',
    general: '📢',
};

const FILTERS: Array<{ label: string; value: CampusEvent['type'] | 'all' }> = [
    { label: 'All', value: 'all' },
    { label: 'Academic', value: 'academic' },
    { label: 'Cultural', value: 'cultural' },
    { label: 'Sports', value: 'sports' },
    { label: 'Placement', value: 'placement' },
    { label: 'General', value: 'general' },
];

export default function StudentEvents() {
    const { user } = useAuth();
    const { events, registeredIds, registerForEvent, unregisterFromEvent, markRead } = useNotifications(user?.id);

    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState<CampusEvent['type'] | 'all'>('all');
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const filtered = events.filter(e => {
        const matchType = activeFilter === 'all' || e.type === activeFilter;
        const matchSearch =
            e.title.toLowerCase().includes(search.toLowerCase()) ||
            e.description?.toLowerCase().includes(search.toLowerCase()) ||
            e.venue.toLowerCase().includes(search.toLowerCase());
        return matchType && matchSearch;
    });

    const myRegistrations = events.filter(e => registeredIds.includes(e.id));

    const handleRegister = async (event: CampusEvent) => {
        setLoadingId(event.id);
        await new Promise(r => setTimeout(r, 600));
        registerForEvent(event.id);
        markRead(event.id);
        toast.success(`Registered for "${event.title}"!`, {
            description: `📍 ${event.venue} · ${new Date(event.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}`,
            icon: <CalendarCheck className="h-4 w-4 text-primary" />,
        });
        setLoadingId(null);
    };

    const handleUnregister = async (eventId: string, title: string) => {
        setLoadingId(eventId);
        await new Promise(r => setTimeout(r, 400));
        unregisterFromEvent(eventId);
        toast.info(`Unregistered from "${title}".`);
        setLoadingId(null);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Campus Events
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Discover and register for events announced by your faculty.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge className="bg-primary/20 text-primary border-primary/30 gap-1 px-3 py-1 text-sm">
                        <CalendarCheck className="h-3.5 w-3.5" />
                        {myRegistrations.length} Registered
                    </Badge>
                    <Badge className="bg-card border-white/10 gap-1 px-3 py-1 text-sm">
                        <Bell className="h-3.5 w-3.5" />
                        {events.length} Total Events
                    </Badge>
                </div>
            </div>

            {/* My Registrations Strip */}
            {myRegistrations.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                        <CalendarCheck className="h-4 w-4" /> My Registered Events
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {myRegistrations.map(e => (
                            <Badge key={e.id} className="bg-primary/20 text-primary border-primary/30 px-3 py-1">
                                {TYPE_ICONS[e.type]} {e.title}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search events by name, venue..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-10 bg-card/40 border-white/10"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {FILTERS.map(f => (
                        <Button
                            key={f.value}
                            variant={activeFilter === f.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveFilter(f.value)}
                            className={activeFilter === f.value ? '' : 'border-white/10 text-muted-foreground'}
                        >
                            {f.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Events Grid */}
            {filtered.length === 0 ? (
                <Card className="bg-card/20 border-white/5 border-dashed">
                    <CardContent className="py-20 flex flex-col items-center gap-3 text-center">
                        <CalendarDays className="h-14 w-14 text-muted-foreground/20" />
                        <p className="text-muted-foreground font-medium">No events found matching your search.</p>
                        <p className="text-xs text-muted-foreground/60">
                            Events posted by faculty will appear here. Check back soon!
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <AnimatePresence mode="popLayout">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map(event => {
                            const isRegistered = registeredIds.includes(event.id);
                            const isLoading = loadingId === event.id;
                            const isPast = new Date(event.date) < new Date();

                            return (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    layout
                                >
                                    <Card className={`group h-full flex flex-col bg-card/40 backdrop-blur-xl transition-all duration-300 border ${isRegistered
                                            ? 'border-primary/40 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]'
                                            : 'border-white/10 hover:border-white/20'
                                        }`}>
                                        <CardContent className="p-5 flex flex-col gap-4 h-full">
                                            {/* Top row */}
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
                                                    {TYPE_ICONS[event.type]}
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <Badge className={`${TYPE_COLORS[event.type]} border text-xs capitalize`}>
                                                        <Tag className="h-3 w-3 mr-1" />
                                                        {event.type}
                                                    </Badge>
                                                    {isPast && (
                                                        <Badge variant="secondary" className="text-[10px] px-2">
                                                            Completed
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 space-y-2">
                                                <h3 className="font-bold text-lg leading-tight">{event.title}</h3>
                                                {event.description && (
                                                    <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                                                )}
                                            </div>

                                            {/* Meta */}
                                            <div className="space-y-1.5 text-xs text-muted-foreground border-t border-white/5 pt-3">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3.5 w-3.5 shrink-0" />
                                                    <span>{new Date(event.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                    <span>{event.venue}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-3.5 w-3.5 shrink-0" />
                                                    <span>Organized by {event.createdBy}</span>
                                                </div>
                                            </div>

                                            {/* CTA */}
                                            {isRegistered ? (
                                                <div className="space-y-2">
                                                    <Button
                                                        className="w-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 gap-2"
                                                        variant="outline"
                                                        disabled
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        Registered
                                                    </Button>
                                                    <Button
                                                        className="w-full text-xs h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleUnregister(event.id, event.title)}
                                                        disabled={isLoading}
                                                    >
                                                        {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Cancel Registration'}
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    className="w-full gap-2"
                                                    onClick={() => handleRegister(event)}
                                                    disabled={isLoading || isPast}
                                                >
                                                    {isLoading ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <CalendarCheck className="h-4 w-4" />
                                                    )}
                                                    {isPast ? 'Event Ended' : 'Register Now'}
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </AnimatePresence>
            )}
        </div>
    );
}
