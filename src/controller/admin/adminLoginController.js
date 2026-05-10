import Admin from "../../models/admin/adminLoginModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email })
        if (!admin) {
            return res.status(404).json({
                message: "Admin not found"
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, admin.password);
        if (!isPasswordMatch) {
            return res.status(404).json({
                message: "Invalid password"
            })
        }
        const token = jwt.sign({
            id: admin._id,
            role: admin.role
        }, process.env.JWT_SECRET_KEY,
            { expiresIn: "7d" });

        res.status(200).json({
            message: "Admin login successful",
            accessToken: token,
            admin: {
                id: admin._id,
                email: admin.email,
            },
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}