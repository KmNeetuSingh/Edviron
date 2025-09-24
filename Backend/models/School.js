const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  address: { 
    type: String, 
    required: true, 
    trim: true 
  },
  contact_email: { 
    type: String, 
    required: true, 
    lowercase: true,
    trim: true 
  },
  phone: { 
    type: String, 
    required: true,
    trim: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  // Additional fields that might be useful
  city: { 
    type: String, 
    trim: true 
  },
  state: { 
    type: String, 
    trim: true 
  },
  pincode: { 
    type: String, 
    trim: true 
  },
  website: { 
    type: String, 
    trim: true 
  },
  principal_name: { 
    type: String, 
    trim: true 
  },
  established_year: { 
    type: Number 
  }
}, { 
  timestamps: true 
});

// Indexes for performance optimization
schoolSchema.index({ name: 1 });
schoolSchema.index({ contact_email: 1 });
schoolSchema.index({ phone: 1 });
schoolSchema.index({ isActive: 1 });

module.exports = mongoose.model('School', schoolSchema);
