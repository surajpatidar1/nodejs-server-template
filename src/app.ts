import express from "express"
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import { setupSwagger } from "@/swagger/index.js"
import {
    errorMiddleware,
    notFoundMiddleware
} from "@/middleware/index.js"

export const app = express()


app.use(helmet())                       // Security
app.use(cors())                         // Cors
app.use(express.json());                // Body parser
app.use(
    express.urlencoded({
        extended: true,
    }),
);
app.use(cookieParser());                // Cookies
app.use(compression());                 // compression
setupSwagger(app)                       // swagger

app.use(notFoundMiddleware)
app.use(errorMiddleware);