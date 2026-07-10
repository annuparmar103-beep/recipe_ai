import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Prevents returning password field in standard select queries
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    profilePicture: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [200, 'Bio cannot exceed 200 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare user-entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash email verification token
userSchema.methods.generateEmailVerificationToken = function () {
  // Generate random token
  const verificationTokenRaw = crypto.randomBytes(32).toString('hex');

  // Hash token and set database field
  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationTokenRaw)
    .digest('hex');

  // Set token expiration (24 hours from now)
  this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

  return verificationTokenRaw;
};

// Generate and hash reset password token
userSchema.methods.generateResetPasswordToken = function () {
  // Generate random token
  const resetTokenRaw = crypto.randomBytes(32).toString('hex');

  // Hash token and set database field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetTokenRaw)
    .digest('hex');

  // Set token expiration (1 hour from now)
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

  return resetTokenRaw;
};

const User = mongoose.model('User', userSchema);
export default User;
