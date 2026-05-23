import {User} from "../models/userModel.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import tokenBlacklistModel from "../models/blackListModel.js"

export async function register(req, res) {
    try {
        const { username, email, password } = req.body

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please provide username, email and password"
            })
        }
        const isUserAlreadyExists = await User.findOne({
            $or: [ { username }, { email } ]
        })

        if (isUserAlreadyExists) {
            return res.status(400).json({
                message: "Account already exists with this email address or username"
            })
        }

        const hash = await bcrypt.hash(password, 10)
        const user = await User.create({
            username,
            email,
            password: hash
        })

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.SECRET_KEY,
            { expiresIn: "1d" }
        )

        // ✅ FIXED: Configured cross-site cookies for registration sequence
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        })

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            })
        }

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.SECRET_KEY,
            { expiresIn: "1d" }
        )

        // ✅ FIXED: Added production-ready secure sameSite rules for Render deployments
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        })

        res.status(200).json({
            message: "User logged in successfully.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export async function logout(req, res) {
    try {
        const token = req.cookies.token

        if (token) {
            await tokenBlacklistModel.create({ token })
        }

        // ✅ FIXED: Matching security attributes must be applied to completely purge cross-site cookies
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        })

        res.status(200).json({
            message: "User logged out successfully"
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export async function getUser(req, res) {
    try {
        const user = await User.findById(req.user.id).select("-password")
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        res.status(200).json({ user })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}