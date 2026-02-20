/**
 * Unified store — picks between local JSON storage and MongoDB
 * based on the STORAGE_MODE env variable.
 *
 * All route files require('../utils/localStore') currently.
 * We'll update them to require('../utils/store') instead.
 *
 * When STORAGE_MODE=mongodb, every function is async (returns a Promise).
 * When STORAGE_MODE=local, functions are synchronous (as before).
 */

const mode = (process.env.STORAGE_MODE || 'local').toLowerCase();

if (mode === 'mongodb') {
  module.exports = require('./mongoStore');
} else {
  module.exports = require('./localStore');
}
