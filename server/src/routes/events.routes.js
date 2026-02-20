const express = require('express');
const router = express.Router();
const {
    getEvents,
    createEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent,
    getEventRegistrations,
    getMyRegistrations,
} = require('../controllers/events.controller');
const { protect, authorize } = require('../middleware/auth');

// Public - all authenticated users can see events
router.get('/', protect, getEvents);

// Student: get their own registrations
router.get('/my-registrations', protect, authorize('student'), getMyRegistrations);

// Faculty/Admin: create event
router.post('/', protect, authorize('faculty', 'admin'), createEvent);

// Admin: delete event
router.delete('/:id', protect, authorize('admin', 'faculty'), deleteEvent);

// Admin: get all registrations for an event
router.get('/:id/registrations', protect, authorize('admin'), getEventRegistrations);

// Student: register/unregister
router.post('/:id/register', protect, authorize('student'), registerForEvent);
router.delete('/:id/register', protect, authorize('student'), unregisterFromEvent);

module.exports = router;
