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
    required: [true, "Full name is required"],
    trim: true
  },
  panNo: {
    type: String,
    required: [true, "PAN number is required"],
    uppercase: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Please enter a valid PAN number"]
  },
  adharNo: {
    type: String,
    required: [true, "Aadhaar number is required"],
    match: [/^\d{12}$/, "Please enter a valid 12-digit Aadhaar number"]
  },
  pincode: {
    type: String,
    required: [true, "Pincode is required"],
    match: [/^\d{6}$/, "Please enter a valid 6-digit pincode"]
  },
  phoneNo: {
    type: String,
    required: [true, "Primary phone number is required"],
    match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"]
  },
  phoneNo2: {
    type: String,
    match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
  },
  address: {
    type: String,
    required: [true, "Address is required"],
    trim: true
  },
  age: {
    type: Number,
    required: [true, "Age is required"],
    min: [1, "Age must be at least 1"],
    max: [120, "Age cannot be more than 120"]
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