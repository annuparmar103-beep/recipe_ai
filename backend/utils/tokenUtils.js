import jwt from 'jsonwebtoken';

/**
 * Generate Access Token (Short-lived, typically 15 mins)
 * Contains minimal payload for identity verification
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      isVerified: user.isVerified
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m'
    }
  );
};

/**
 * Generate Refresh Token (Long-lived, typically 7 days)
 * Used to request new Access Tokens securely
 */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d'
    }
  );
};
