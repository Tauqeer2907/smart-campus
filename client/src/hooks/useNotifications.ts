/**
 * useNotifications - localStorage-based notification + event registration system
 * Faculty creates events → auto-notifies all students
 * Students can register for events; bell icon shows unread count
 */

import { useState, useEffect, useCallback } from 'react';

const EVENTS_KEY = 'unicampus_events_2026';
const READ_KEY = 'unicampus_read_notifs_2026';
const REGISTRATIONS_KEY = 'unicampus_event_registrations_2026';

/** Admin helper: returns a map of { userId → eventId[] } from localStorage */
export function getAllRegistrations(): Record<string, string[]> {
    try {
        return JSON.parse(localStorage.getItem(REGISTRATIONS_KEY) || '{}');
    } catch { return {}; }
}

export interface CampusEvent {
    id: string;
    title: string;
    description: string;
    date: string;
    venue: string;
    type: 'academic' | 'cultural' | 'sports' | 'placement' | 'general';
    createdBy: string;
    createdAt: string;
}

function loadEvents(): CampusEvent[] {
    try { return JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]'); }
    catch { return []; }
}

function loadReadIds(userId: string): string[] {
    try {
        const all = JSON.parse(localStorage.getItem(READ_KEY) || '{}');
        return all[userId] || [];
    } catch { return []; }
}

function saveReadIds(userId: string, ids: string[]) {
    try {
        const all = JSON.parse(localStorage.getItem(READ_KEY) || '{}');
        all[userId] = ids;
        localStorage.setItem(READ_KEY, JSON.stringify(all));
    } catch { }
}

function loadRegistrations(userId: string): string[] {
    try {
        const all = JSON.parse(localStorage.getItem(REGISTRATIONS_KEY) || '{}');
        return all[userId] || [];
    } catch { return []; }
}

function saveRegistrations(userId: string, ids: string[]) {
    try {
        const all = JSON.parse(localStorage.getItem(REGISTRATIONS_KEY) || '{}');
        all[userId] = ids;
        localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(all));
    } catch { }
}

export function useNotifications(userId?: string) {
    const [events, setEvents] = useState<CampusEvent[]>(loadEvents);
    const [readIds, setReadIds] = useState<string[]>(userId ? loadReadIds(userId) : []);
    const [registeredIds, setRegisteredIds] = useState<string[]>(userId ? loadRegistrations(userId) : []);

    // Sync from localStorage (cross-tab support)
    useEffect(() => {
        const handler = () => {
            setEvents(loadEvents());
            if (userId) {
                setReadIds(loadReadIds(userId));
                setRegisteredIds(loadRegistrations(userId));
            }
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, [userId]);

    // Persist read state
    useEffect(() => {
        if (userId) saveReadIds(userId, readIds);
    }, [readIds, userId]);

    // Persist registrations
    useEffect(() => {
        if (userId) saveRegistrations(userId, registeredIds);
    }, [registeredIds, userId]);

    const unreadCount = events.filter(e => !readIds.includes(e.id)).length;

    const markAllRead = useCallback(() => {
        setReadIds(events.map(e => e.id));
    }, [events]);

    const markRead = useCallback((id: string) => {
        setReadIds(prev => prev.includes(id) ? prev : [...prev, id]);
    }, []);

    const createEvent = useCallback((event: Omit<CampusEvent, 'id' | 'createdAt'>) => {
        const newEvent: CampusEvent = {
            ...event,
            id: `evt_${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        const updated = [newEvent, ...loadEvents()];
        localStorage.setItem(EVENTS_KEY, JSON.stringify(updated));
        setEvents(updated);
        window.dispatchEvent(new Event('storage'));
        return newEvent;
    }, []);

    const deleteEvent = useCallback((id: string) => {
        const updated = loadEvents().filter(e => e.id !== id);
        localStorage.setItem(EVENTS_KEY, JSON.stringify(updated));
        setEvents(updated);
        window.dispatchEvent(new Event('storage'));
    }, []);

    const registerForEvent = useCallback((id: string) => {
        setRegisteredIds(prev => prev.includes(id) ? prev : [...prev, id]);
        // Also mark as read when registering
        setReadIds(prev => prev.includes(id) ? prev : [...prev, id]);
    }, []);

    const unregisterFromEvent = useCallback((id: string) => {
        setRegisteredIds(prev => prev.filter(r => r !== id));
    }, []);

    return {
        events,
        unreadCount,
        readIds,
        registeredIds,
        markRead,
        markAllRead,
        createEvent,
        deleteEvent,
        registerForEvent,
        unregisterFromEvent,
    };
}
