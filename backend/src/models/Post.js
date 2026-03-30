const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
  
    author: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true
    },

   
    type: {
      type:    String,
      enum:    ['image', 'thought'],
      default: 'image'
    },

    imageUrl: {
      type:    String,
      default: ''
    },

   
    caption: {
      type:      String,
      required:  [true, 'Caption is required'],
      maxlength: [500, 'Caption too long'],
      trim:      true
    },

    mood: {
      type:    [String],
      default: []
    },

  
    qualityScore: {
      type:    Number,
      default: null
    },

    aiCaptionSuggestions: {
      type:    [String],
      default: []
    },

  
    likes: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    ],

  
    isPublic: {
      type:    Boolean,
      default: true
    },

  
    scheduledAt: {
      type:    Date,
      default: null
    },

  
    isStarOfWeek: {
      type:    Boolean,
      default: false
    }
  },


  { timestamps: true }
);


postSchema.index({ isPublic: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
