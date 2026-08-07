import express from 'express'

const authRoute = express.Router()

authRoute.post("/register")
authRoute.post("/login")

export default authRoute