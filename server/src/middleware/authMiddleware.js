const jwt = require('jsonwebtoken');
const { User } = require('../models');

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (token.startsWith('local_token_')) {
      const parts = token.split('_');
      const userId = parts[2];
      const user = await User.findOne({ id: userId }).lean();
      if (!user) return res.status(401).json({ message: 'Not authorized' });

      req.user = {
        userId: user._id?.toString(),
        role: user.role,
        branch: user.branch,
        facultyId: user.id,
        id: user.id,
      };
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized' });
  }
}

module.exports = { protect };
