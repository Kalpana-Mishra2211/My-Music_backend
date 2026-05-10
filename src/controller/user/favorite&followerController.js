import userModel from "../../models/user/userModel.js";

export const toggleFavorite = async (req, res) => {
    try {
        const { musicId } = req.body;

        const user = await userModel.findById(req.user.id);

        const index = user.favorites.findIndex(
            (id) => id.toString() === musicId
        );

        let message = "";

        if (index > -1) {
            user.favorites.splice(index, 1);
            message = "Removed from favorites";
        } else {
            user.favorites.push(musicId);
            message = "Added to favorites";
        }

        await user.save();

        return res.status(200).json({
            message,
            favorites: user.favorites,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: err.message,
        });
    }
};

export const getFavoriteMusicList = async (req, res) => {
    const userId = req.user.id
    try {
        const user = await userModel
            .findById(req.user.id)
            .populate({
                path: "favorites",
                populate: {
                    path: "artist",
                    select: "userName"
                }
            });
        const updatedMusic = user.favorites.map((music) => ({
            ...music._doc,

            isLiked: user.likedSongs.some(
                (likedId) =>
                    likedId.toString() === music._id.toString()
            ),
        }));

        return res.status(200).json({
            message: "Fetch Favorite Musics",
            favorites: updatedMusic
        })
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            message: err.message,
        });
    }


}


export const toggleFollowArtist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { artistId } = req.params;

        const artistUser = await userModel.findById(artistId);

        if (!artistUser || !artistUser.artistProfile) {
            return res.status(404).json({ message: "Artist not found" });
        }

        if (artistId === userId) {
            return res.status(400).json({
                success: false,
                message: "You cannot follow yourself",
            });
        }

        const followers = artistUser.artistProfile.followers || [];

        const isFollowing = followers.includes(userId);

        let updatedArtist;

        if (isFollowing) {
            await userModel.findByIdAndUpdate(userId, {
                $pull: { following: artistId },
            });
            updatedArtist = await userModel.findByIdAndUpdate(
                artistId,
                {
                    $pull: {
                        "artistProfile.followers": userId,
                    },
                    $inc: {
                        "artistProfile.followersCount": -1,
                    },
                },
                { returnDocument: "after" }
            );

            return res.status(200).json({
                success: true,
                message: "Unfollowed successfully",
                isFollowing: false,
                followersCount: updatedArtist.artistProfile.followersCount,
            });
        } else {
            await userModel.findByIdAndUpdate(userId, {
                $addToSet: { following: artistId },
            });
            updatedArtist = await userModel.findByIdAndUpdate(
                artistId,
                {
                    $addToSet: {
                        "artistProfile.followers": userId,
                    },
                    $inc: {
                        "artistProfile.followersCount": 1,
                    },
                },
                { returnDocument: "after" }
            );

            return res.status(200).json({
                success: true,
                message: "Followed successfully",
                isFollowing: true,
                followersCount: updatedArtist.artistProfile.followersCount,
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};

export const getFollowers = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await userModel
            .findById(userId)
            .populate({
                path: "artistProfile.followers",
                select: "userName email role artistProfile.stageName artistProfile.profileImage",
            });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        const followingIds =
            user?.following?.map((id) => id.toString()) || [];
        
        const followers = (user.artistProfile?.followers || []).map((follower) => {
            return {
                ...follower.toObject(),
                I_Follow: followingIds.includes(follower._id.toString()), 
            };
        });

        return res.status(200).json({
            success: true,
            followers,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getFollowing = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await userModel
            .findById(userId)
            .populate({
                path: "following",
                select: "userName email role artistProfile.stageName artistProfile.profileImage",
            });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            following: user.following,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

