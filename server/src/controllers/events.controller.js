const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');

// GET /api/events — get all active events
const getEvents = async (req, res) => {
    try {
        const events = await Event.find({ isActive: true }).sort({ createdAt: -1 });
        res.json({ success: true, data: events });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/events — faculty creates an event
const createEvent = async (req, res) => {
    try {
        const { title, description, date, venue, type } = req.body;

        if (!title || !date || !venue) {
            return res.status(400).json({ success: false, message: 'Title, date and venue are required' });
        }

        const event = await Event.create({
            title, description, date, venue, type: type || 'general',
            createdBy: req.user.id,
            createdByName: req.user.name,
        });

        res.status(201).json({ success: true, message: 'Event created', data: event });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/events/:id
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        await event.deleteOne();
        await EventRegistration.deleteMany({ event: req.params.id });

        res.json({ success: true, message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/events/:id/register — student registers for event
const registerForEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event || !event.isActive) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        const existing = await EventRegistration.findOne({ event: req.params.id, student: req.user.id });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Already registered for this event' });
        }

        const registration = await EventRegistration.create({
            event: req.params.id,
            student: req.user.id,
            studentName: req.user.name,
            studentEmail: req.user.email,
            studentId: req.user.studentId,
        });

        res.status(201).json({ success: true, message: 'Registered successfully', data: registration });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/events/:id/register — student unregisters
const unregisterFromEvent = async (req, res) => {
    try {
        await EventRegistration.findOneAndDelete({ event: req.params.id, student: req.user.id });
        res.json({ success: true, message: 'Unregistered successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/events/:id/registrations — admin view all registrants
const getEventRegistrations = async (req, res) => {
    try {
        const registrations = await EventRegistration.find({ event: req.params.id })
            .populate('student', 'name email studentId branch year')
            .sort({ createdAt: 1 });
        res.json({ success: true, data: registrations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/events/my-registrations — student's registered events
const getMyRegistrations = async (req, res) => {
    try {
        const registrations = await EventRegistration.find({ student: req.user.id })
            .populate('event')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: registrations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getEvents,
    createEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent,
    getEventRegistrations,
    getMyRegistrations,
};
