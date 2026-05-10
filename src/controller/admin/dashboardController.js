import { json } from "express"
import musicModel from "../../models/user/musicModel.js"
import albumModel from "../../models/user/albumModel.js";
import userModel from "../../models/user/userModel.js";

export const getTopMusics = async (req, res) => {
    try {
        const topMusics = await musicModel
            .find({ approvalStatus: "approved" })
            .populate("artist", "userName")
            .select("title image likesCount genre")
            .sort({ likesCount: -1 })
            .limit(5);

        return res.status(200).json({
            success: true,
            topMusics
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

export const getRecentUser = async (req, res) => {
    try {
        const recentUsers = await userModel
            .find({ role: "user" })
            .select("userName email  role userType createdAt")
            .sort({ createdAt: -1 })
            .limit(5);

        return res.status(200).json({
            success: true,
            recentUsers
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

export const getStats = async (req, res) => {
    try {

        const music = await musicModel.find(
            { approvalStatus: "approved"}
        );

        const album = await albumModel.find();

        const artist = await userModel.find({
            artistStatus: "approved",
            role: "artist",
        });

        const users = await userModel.find({
            role: "user",
        });

        const pendingArtists = await userModel.find({
            artistStatus: "pending",
        });

        const pendingMusic = await musicModel.find({
            approvalStatus: "pending",
        });

        return res.status(200).json({
            success: true,

            stats: {
                music: music.length,

                album: album.length,

                artist: artist.length,

                users: users.length,

                pendingArtists: pendingArtists.length,

                pendingMusic: pendingMusic.length,
            },

        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};