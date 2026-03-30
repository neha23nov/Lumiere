const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');


const userSchema = new mongoose.Schema(
  {
   
    username: {
      type:      String,
      required:  [true, 'Username is required'],
      unique:    true,
      trim:      true,
      minlength: [3,  'Username must be at least 3 characters'],
      maxlength: [20, 'Username cannot exceed 20 characters']
    },

   
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
    },

  
    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select:    false
    },

    
    avatar: {
      type:    String,
      default: ''
    },

  
    bio: {
      type:      String,
      default:   '',
      maxlength: [160, 'Bio cannot exceed 160 characters']
    },


    points: {
      type:    Number,
      default: 0
    },

    
    followers: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    ],

   
    following: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    ],

   
    starBadges: [
      { type: Date }
    ],

 
    isPublic: {
      type:    Boolean,
      default: true
    }
  },


  { timestamps: true }
);


userSchema.virtual('tier').get(function () {
 
  const p = this.points;
  if (p >= 5000) return 'Master';
  if (p >= 1500) return 'Luminary';
  if (p >= 500)  return 'Curator';
  if (p >= 100)  return 'Framer';
  return 'Observer';
});


userSchema.set('toJSON',   { virtuals: true });
userSchema.set('toObject', { virtuals: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (typedPassword) {
  return bcrypt.compare(typedPassword, this.password);
};


module.exports = mongoose.model('User', userSchema);