import mongoose from "mongoose";

const bankDetailsSchema = new mongoose.Schema({
  bankName: {
    type: String,
    required: [true, "Bank name is required"],
    trim: true
  },
  accountNo: {
    type: String,
    required: [true, "Account number is required"],
    trim: true
  },
  accountHolderName: {
    type: String,
    required: [true, "Account holder name is required"],
    trim: true
  },
  bankBranch: {
    type: String,
    required: [true, "Bank branch is required"],
    trim: true
  },
  ifscCode: {
    type: String,
    required: [true, "IFSC code is required"],
    uppercase: true,
    match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, "Please enter a valid IFSC code"]
  }
}, {
  _id: false // Disable _id for subdocuments
});

const profileSchema = new mongoose.Schema({
  authId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth",
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    trim: true
  },
  panNo: {
    type: String,
    uppercase: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Please enter a valid PAN number"]
  },
  adharNo: {
    type: String,
    match: [/^\d{12}$/, "Please enter a valid 12-digit Aadhaar number"]
  },
  phoneNo: {
    type: String,
    match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"]
  },
  phoneNo2: {
    type: String,
    match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"]
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
  },
  address: {
    addressLine: {
      type: String,
      trim: true
    },
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
      match: [/^\d{6}$/, "Please enter a valid 6-digit pincode"]
    }
  },
  age: {
    type: Number,
    min: [1, "Age must be at least 1"],
    max: [120, "Age cannot be more than 120"]
  },
  employmentDetails: {
    employmentType: {
      type: String,
      enum: ["salaried", "self-employed", "business"]
    },
    companyName: {
      type: String,
      trim: true
    },
    monthlyIncome: {
      type: Number
    },
    experience: {
      type: Number
    }
  },
  bankDetails: [bankDetailsSchema],
  profilePic: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;