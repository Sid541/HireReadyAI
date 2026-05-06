import jwt from "jsonwebtoken"
import tokenBlacklistModel from "../models/blackListModel.js"

export async function isAuthenticated(req, res, next) {

    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({ 
            message: "Token not provided."
        })
    }

    const isTokenBlacklisted = await tokenBlacklistModel.findOne({
        token
    })

    if (isTokenBlacklisted) {
        return res.status(401).json({
            message: "token is invalid"
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        req.user = decoded
        next()

    } catch (err) {
        return res.status(401).json({
            message: "Invalid token."
        })
    }
}

