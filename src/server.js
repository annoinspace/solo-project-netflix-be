import express from "express"
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import { join } from "path"
import createHttpError from "http-errors"
import { badRequestHandler, unauthorizedHandler, notFoundHandler, genericErrorHandler } from "./errorHandlers.js"
import moviesRouter from "./api/movies/index.js"
import mediasRouter from "./api/medias/index.js"

const server = express()
const port = process.env.PORT

const publicFolderPath = join(process.cwd(), "./public")

// ----------------------------------whitelist for cors

const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL]

const corsOptions = {
  origin: (origin, corsNext) => {
    console.log("--------------------------current origin------------------------", origin)
    if (!origin || whitelist.indexOf(origin) !== -1) {
      corsNext(null, true)
    } else {
      corsNext(createHttpError(400, `Origin ${origin} is not in the whitelist! Please enter a valid origin`))
    }
  }
}

server.use(express.static(publicFolderPath))
server.use(express.json())
server.use(cors(corsOptions))

// ----------------------------------endpoints

server.use("/movies", moviesRouter)
server.use("/medias", mediasRouter)
// server.use("/third", thirdRouter)

// ----------------------------------error handlers

server.use(badRequestHandler) // 400
server.use(unauthorizedHandler) // 401
server.use(notFoundHandler) // 404
server.use(genericErrorHandler) // 500

// ----------------------------------server handlers
server.listen(port, () => {
  console.table(listEndpoints(server))
  console.log("server is running on port:", port)
})
