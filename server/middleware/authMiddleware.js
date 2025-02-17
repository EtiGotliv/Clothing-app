import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // נניח שהטוקן נשלח בפורמט "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token required' });
  jwt.verify(token, 'secretKey', (err, payload) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.userId = payload.userId;
    next();
  });
};

export default authenticateToken;
