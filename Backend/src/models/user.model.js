

import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    street: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    pincode: {
      type: mongoose.Schema.Types.Mixed,
    },
    country: {
      type: String,
      trim: true,
    },
    phone: {
      type: mongoose.Schema.Types.Mixed,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    fullName: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },
      lastName: {
        type: String,
        required: true,
        trim: true,
      },
    },

    role: {
      type: String,
      enum: ["user", "seller"],
      default: "user",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    profileImage: {
      type: String,
      default: "",
    },

    profileImageFileId: {
      type: String,
      default: "",
      select: false,
    },

    addresses: {
      type: [addressSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
