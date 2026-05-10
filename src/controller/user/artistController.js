import albumModel from "../../models/user/albumModel.js";
import musicModel from "../../models/user/musicModel.js";
import userModel from "../../models/user/userModel.js";
import { uploadFile } from "../../services/storageService.js";


export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userModel
            .findById(userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
                role: user.role,

                ...(user.role === "artist" && {
                    artistStatus: user.artistStatus,
                    artistProfile: {
                        stageName: user.artistProfile?.stageName || "",
                        bio: user.artistProfile?.bio || "",
                        genre: user.artistProfile?.genre || [],
                        profileImage: user.artistProfile?.profileImage || "",
                        phoneNumber: user.artistProfile?.phoneNumber || "",
                        socialLinks: user.artistProfile?.socialLinks || {},
                        totalSongs: user.artistProfile?.totalSongs || 0,
                        totalAlbums: user.artistProfile?.totalAlbums || 0,
                    },
                }),

                createdAt: user.createdAt,
            },
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

export const updateArtistProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await userModel.findById(userId);

        if (!user || user.role !== "artist") {
            return res.status(404).json({
                message: "Artist not found",
            });
        }
        const {
            stageName,
            bio,
            genre,
            phoneNumber,
            socialLinks = {},
        } = req.body;
        let socialLink = {};

        if (req.body.socialLinks) {
            socialLink = JSON.parse(req.body.socialLinks);
        } let genreArray = user.artistProfile?.genre || [];

        if (genre) {
            genreArray = Array.isArray(genre) ? genre : [genre];
        }

        const pendingProfile = {
            stageName: stageName ?? user.artistProfile?.stageName,
            bio: bio ?? user.artistProfile?.bio,
            genre: genreArray,
            phoneNumber: phoneNumber ?? user.artistProfile?.phoneNumber,

            socialLinks: {
                instagram: socialLink.instagram ?? user.artistProfile?.socialLinks?.instagram,
                youtube: socialLink.youtube ?? user.artistProfile?.socialLinks?.youtube,
                spotify: socialLink.spotify ?? user.artistProfile?.socialLinks?.spotify,
                twitter: socialLink.twitter ?? user.artistProfile?.socialLinks?.twitter,
            },

            profileImage:
                user.artistProfile?.profileImage ||
                user.artistProfilePending?.profileImage ||
                "",

            profileImageFileId:
                user.artistProfile?.profileImageFileId ||
                user.artistProfilePending?.profileImageFileId ||
                "",

            totalSongs: user.artistProfile?.totalSongs || 0,
            totalAlbums: user.artistProfile?.totalAlbums || 0,
            followers: user.artistProfile?.followers || [],
            followersCount: user.artistProfile?.followersCount || 0,
        };

        if (req.file) {
            const uploadResult = await uploadFile(req.file, "/artist/profile");
            pendingProfile.profileImage = uploadResult.url;
            pendingProfile.profileImageFileId = uploadResult.fileId;
        }

        user.artistProfilePending = pendingProfile;

        user.profileUpdateStatus = "pending";

        user.userType = "existing";

        await user.save();

        return res.status(200).json({
            message: "Profile update submitted for approval",
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
};

export const getGenresById = async (req, res) => {
    try {
        const artistId = req.user.id;
        const artist = await userModel.findById(artistId);
        if (!artist) {
            return res.status(404).json({
                success: false,
                message: "Artist not found",
            });
        }
        return res.status(200).json({
            success: true,
            genres: artist.artistProfile.genre || [],
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

export const getStats = async (req, res) => {
    try {
        const music = await musicModel.find({ approvalStatus: "approved" });
        const album = await albumModel.find();
        const artist = await userModel.find({ role: "artist", artistStatus: "approved" });

        return res.status(200).json({
            success: true,
            stats: {
                music: music.length,
                album: album.length,
                artist: artist.length
            }
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

export const getArtists = async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        let search = req.query.search || "";

        const skip = (page - 1) * limit;

        let filter = {
            role: "artist",
            artistStatus: "approved"
        };

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { stageName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const total = await userModel.countDocuments(filter);

        const artists = await userModel
            .find(filter)
            .select("artistProfile.stageName artistProfile.profileImage artistProfile.totalSongs")
            .sort({
                "artistProfile.followersCount": -1,
                createdAt: -1,
            }).skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            message: "Artists fetched successfully",
            data: artists,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const getArtistDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const artist = await userModel.findById(id).select(
            "artistProfile.stageName artistProfile.bio artistProfile.genre artistProfile.profileImage artistProfile.totalSongs artistProfile.totalAlbums artistProfile.socialLinks artistProfile.followersCount artistProfile.followers"
        );

        if (!artist || !artist.artistProfile) {
            return res.status(404).json({
                success: false,
                message: "Artist not found",
            });
        }
        const userId = req.user?.id;
        const isFollowing = userId
            ? artist.artistProfile.followers?.includes(userId)
            : false;

        const artistProfile = artist.artistProfile.toObject
            ? artist.artistProfile.toObject()
            : artist.artistProfile;

        const responseArtist = {
            ...artistProfile,
            _id: artist._id,
            isFollowing,
        };

        return res.status(200).json({
            success: true,
            artist: responseArtist,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};

export const getMusicByArtist = async (req, res) => {
    try {
        const { id } = req.params;

        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 5;

        const skip = (page - 1) * limit;

        const filter = {
            artist: id,
            approvalStatus: "approved",
        };

        const total = await musicModel.countDocuments(filter);

        const musics = await musicModel
            .find(filter)
            .populate("artist", "artistProfile.stageName")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            musics,

            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

