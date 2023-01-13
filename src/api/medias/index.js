// import express from "express"
// import httpErrors from "http-errors"
// import uniqid from "uniqid"
// import { getMovies } from "../../lib/fs-tools.js"

// const mediasRouter = express.Router()

// // all movies
// mediasRouter.get("/", async (req, res, next) => {
//   try {
//     const moviesArray = await getMovies()
//     res.status(200).send(moviesArray)
//   } catch (error) {
//     console.log("----error loading all movies-----")
//     next(error)
//   }
// })

// mediasRouter.post("/", async (req, res, next) => {
//   try {
//     const newMovie = {
//       imdbID: uniqid(),
//       ...req.body
//     }
//     const moviesArray = await getMovies()
//     moviesArray.push(newMovie)
//     writeMovies(moviesArray)
//     res.status(201).send({ imdbID: newMovie.imdbID })
//   } catch (error) {
//     console.log("----error adding new movie-----")
//     next(BadRequest(`Unfortunately this movie was not created!`))
//   }
// })

// export default mediasRouter
