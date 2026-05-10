import mongoose from "mongoose";
const artistProfileSchema = new mongoose.Schema(
    {
        stageName: String,
        bio: String,
        genre: [String],
        profileImage: String,
        profileImageFileId: String,

        socialLinks: {
            instagram: String,
            youtube: String,
            spotify: String,
            twitter: String,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        totalSongs: {
            type: Number,
            default: 0,
        },
        totalAlbums: {
            type: Number,
            default: 0,
        },
        followers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
            },
        ],

        followersCount: {
            type: Number,
            default: 0,
        },


    },
    { _id: false }
);

const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        password: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ["user", "artist"],
            default: "user",
        },

        artistProfile: {
            type: artistProfileSchema,
            default: undefined,
        },

        artistProfilePending: {
            type: artistProfileSchema,
            default: undefined,
        },
        userType: {
            type: String,
            enum: ["new", "existing"],
            default: "new",
        },

        artistStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: undefined,
        },
        profileUpdateStatus: {
            type: String,
            enum: ["none", "pending", "approved", "rejected"],
            default: "none",
        },

        approvedAt: {
            type: Date,
            default: undefined,
        },

        rejectionReason: {
            type: String,
            default: undefined,
        },

        favorites: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "music",
            },
        ],
        likedSongs: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "music",
            },
        ],
        following: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
            },
        ],
    },
    { timestamps: true }
);

const userModel = mongoose.model("user", userSchema);

export default userModel;