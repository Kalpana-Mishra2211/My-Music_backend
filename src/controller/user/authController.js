import userModel from "../../models/user/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { uploadFile } from "../../services/storageService.js";

export const registerUser = async (req, res) => {
  try {
    const { userName, email, password, role } = req.body;

    if (!userName || !email || !password) {
      return res.status(400).json({
        message: "userName, email, password are required",
      });
    }

    const userRole = role === "artist" ? "artist" : "user";

    const isExists = await userModel.findOne({
      $or: [{ userName }, { email }],
    });

    if (isExists) {
      return res.status(409).json({
        message: "User already exists with this username or email",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const userData = {
      userName,
      email,
      password: hash,
      role: userRole,
    };

    if (userRole === "artist") {
      const { artistProfile } = req.body;

      if (!artistProfile?.phoneNumber) {
        return res.status(400).json({
          message: "Phone number is required for artist",
        });
      }

      let profileImageResult = null;

      if (req.file) {
        profileImageResult = await uploadFile(
          req.file,
          "/artist/profile"
        );
      }

      const genreArray = artistProfile?.genre
        ? Array.isArray(artistProfile.genre)
          ? artistProfile.genre
          : [artistProfile.genre]
        : [];


      userData.artistStatus = "pending";

      userData.artistProfile = {
        stageName: artistProfile?.stageName || "",
        bio: artistProfile?.bio || "",
        genre: genreArray,
        profileImage: profileImageResult?.url || "",
        profileImageFileId: profileImageResult?.fileId || "",

        phoneNumber: artistProfile.phoneNumber,
        socialLinks: {
          instagram: artistProfile?.socialLinks?.instagram || "",
          youtube: artistProfile?.socialLinks?.youtube || "",
          spotify: artistProfile?.socialLinks?.spotify || "",
          twitter: artistProfile?.socialLinks?.twitter || "",
        },
      };
    }

    const user = await userModel.create(userData);

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        ...(user.role === "artist" && {
          artistStatus: user.artistStatus,
        }),
      },
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await userModel.findOne({
      $or: [
        { userName: identifier },
        { email: identifier },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    if (user.role === "artist" && user.artistStatus !== "approved") {
      return res.status(403).json({
        message: `Artist account is ${user.artistStatus}. You cannot login until it is approved.`,
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    let ArtistProfile = null;

    if (user.role === "artist" && user.artistProfile) {
      const { profileImageFileId, ...rest } =
        user.artistProfile.toObject();

      ArtistProfile = rest;
    }


    return res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,

        ...(user.role === "artist" && {
          artistStatus: user.artistStatus,
          artistProfile: ArtistProfile,
        }),

        accessToken: token,
      },
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};



