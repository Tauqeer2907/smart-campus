const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');

// GET /api/notifications — returns unread event count for current student
const getNotifications = async (req, res) => {
    try {
        // Get all events
        const allEvents = await Event.find({ isActive: true }).sort({ createdAt: -1 });

        // Get events the student has already "read" (registered for, in this simplified model)
        const registeredEventIds = await EventRegistration.find({ student: req.user.id }).distinct('event');

        // Unread = events student hasn't registered for yet
        const unread = allEvents.filter(
            (e) => !registeredEventIds.some((id) => id.equals(e._id))
        );

        res.json({
            success: true,
            data: {
                total: allEvents.length,
                unreadCount: unread.length,
                events: allEvents,
                unreadEvents: unread,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getNotifications };
