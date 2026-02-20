import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CalendarDays,
    Users,
    MapPin,
    Clock,
    Tag,
    ChevronDown,
    ChevronUp,
    Search,
    Shield,
    CheckCircle2,
    CalendarCheck,
    Trash2,
    TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CampusEvent, getAllRegistrations } from '@/hooks/useNotifications';

const EVENTS_KEY = 'unicampus_events_2026';
const REGISTRATIONS_KEY = 'unicampus_event_registrations_2026';

function loadEvents(): CampusEvent[] {
    try { return JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]'); }
    catch { return []; }
}

const TYPE_COLORS: Record<CampusEvent['type'], string> = {
    academic: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    cultural: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    sports: 'bg-green-500/20 text-green-400 border-green-500/30',
    placement: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    general: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const TYPE_ICONS: Record<CampusEvent['type'], string> = {
    academic: '📘', cultural: '🎭', sports: '⚽', placement: '💼', general: '📢',
};

export default function AdminEvents() {
    const [events, setEvents] = useState<CampusEvent[]>(loadEvents);
    const [registrations, setRegistrations] = useState<Record<string, string[]>>(getAllRegistrations);
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Refresh when localStorage changes
    useEffect(() => {
        const handler = () => {
            setEvents(loadEvents());
            setRegistrations(getAllRegistrations());
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, []);

    // For each event: collect which userIds have registered
    const getRegistrantsForEvent = (eventId: string) => {
        return Object.entries(registrations)
            .filter(([, eventIds]) => eventIds.includes(eventId))
            .map(([userId]) => {
                // Student info comes from localStorage registration data (backend will return populated user objects)
                return { id: userId, name: `Student ${userId}`, role: 'student' as const, email: `uid_${userId}@nit.edu`, studentId: userId };
            });
    };

    const handleDeleteEvent = (id: string) => {
        const updated = loadEvents().filter(e => e.id !== id);
        localStorage.setItem(EVENTS_KEY, JSON.stringify(updated));
        setEvents(updated);
        window.dispatchEvent(new Event('storage'));
    };

    const totalRegistrations = Object.values(registrations).flat().length;

    const filtered = events.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.createdBy.toLowerCase().includes(search.toLowerCase()) ||
        e.venue.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Event Management
                </h1>
                <p className="text-muted-foreground mt-1">
                    Monitor all campus events, faculty announcements, and student registrations.
                </p>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Events', value: events.length, icon: <CalendarDays className="h-5 w-5" />, color: 'text-blue-400' },
                    { label: 'Total Registrations', value: totalRegistrations, icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-emerald-400' },
                    { label: 'Active Events', value: events.filter(e => new Date(e.date) >= new Date()).length, icon: <CalendarCheck className="h-5 w-5" />, color: 'text-primary' },
                    { label: 'Avg. Registrations', value: events.length ? Math.round(totalRegistrations / events.length) : 0, icon: <TrendingUp className="h-5 w-5" />, color: 'text-amber-400' },
                ].map((stat, i) => (
                    <Card key={i} className="bg-card/40 backdrop-blur-xl border-white/10">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className={`p-2.5 rounded-xl bg-white/5 ${stat.color}`}>
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

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search events, faculty, venue..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-10 bg-card/40 border-white/10"
                />
            </div>

            {/* Events List */}
            {filtered.length === 0 ? (
                <Card className="bg-card/20 border-white/5 border-dashed">
                    <CardContent className="py-20 flex flex-col items-center gap-3 text-center">
                        <CalendarDays className="h-14 w-14 text-muted-foreground/20" />
                        <p className="text-muted-foreground font-medium">No events found.</p>
                        <p className="text-xs text-muted-foreground/60">Events posted by faculty will appear here.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {filtered.map(event => {
                            const registrants = getRegistrantsForEvent(event.id);
                            const isExpanded = expandedId === event.id;
                            const isPast = new Date(event.date) < new Date();

                            return (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.97 }}
                                    layout
                                >
                                    <Card className={`bg-card/40 backdrop-blur-xl transition-all duration-300 border ${isExpanded ? 'border-primary/40' : 'border-white/10 hover:border-white/20'
                                        }`}>
                                        {/* Event Header Row */}
                                        <CardContent className="p-5">
                                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                                {/* Icon + info */}
                                                <div className="flex items-start gap-4 flex-1">
                                                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shrink-0">
                                                        {TYPE_ICONS[event.type]}
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="font-bold text-lg">{event.title}</h3>
                                                            <Badge className={`${TYPE_COLORS[event.type]} border text-xs capitalize`}>
                                                                <Tag className="h-3 w-3 mr-1" />{event.type}
                                                            </Badge>
                                                            {isPast && <Badge variant="secondary" className="text-[10px]">Completed</Badge>}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground line-clamp-1">{event.description}</p>
                                                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-1">
                                                            <span className="flex items-center gap-1">
                                                                <Shield className="h-3.5 w-3.5 text-primary" />
                                                                <span className="text-foreground font-medium">Faculty:</span> {event.createdBy}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3.5 w-3.5" />
                                                                {new Date(event.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="h-3.5 w-3.5" />
                                                                {event.venue}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right side: count + actions */}
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 gap-1 px-3 py-1 text-sm">
                                                        <Users className="h-3.5 w-3.5" />
                                                        {registrants.length} Registered
                                                    </Badge>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setExpandedId(isExpanded ? null : event.id)}
                                                        className="text-muted-foreground hover:text-foreground"
                                                    >
                                                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteEvent(event.id)}
                                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Expanded: Registered Students Table */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="mt-5 pt-5 border-t border-white/10">
                                                            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                                                <Users className="h-4 w-4 text-primary" />
                                                                Registered Students ({registrants.length})
                                                            </p>
                                                            {registrants.length === 0 ? (
                                                                <div className="py-8 text-center text-muted-foreground text-sm">
                                                                    No students have registered for this event yet.
                                                                </div>
                                                            ) : (
                                                                <div className="rounded-xl border border-white/10 overflow-hidden">
                                                                    <table className="w-full text-sm">
                                                                        <thead>
                                                                            <tr className="bg-white/5 border-b border-white/10">
                                                                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">#</th>
                                                                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                                                                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                                                                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student ID</th>
                                                                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {registrants.map((student, idx) => (
                                                                                <tr
                                                                                    key={student.id}
                                                                                    className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                                                                                >
                                                                                    <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                                                                                    <td className="px-4 py-3 font-medium">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[11px] font-bold text-primary">
                                                                                                {student.name.charAt(0)}
                                                                                            </div>
                                                                                            {student.name}
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="px-4 py-3 text-muted-foreground">{student.email}</td>
                                                                                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                                                                                        {student.studentId ?? student.id}
                                                                                    </td>
                                                                                    <td className="px-4 py-3">
                                                                                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-xs gap-1">
                                                                                            <CheckCircle2 className="h-3 w-3" /> Registered
                                                                                        </Badge>
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
