import express from "express"
import httpErrors from "http-errors"
import uniqid from "uniqid"
import { pipeline } from "stream"
import { getMovies, writeMovies } from "../../lib/fs-tools.js"
import { getPDFReadableStream } from "../../lib/pdf-tools.js"
import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"

const moviesRouter = express.Router()
const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "netflix-backend"
    }
  })
}).single("Poster")

// all movies
// moviesRouter.get("/", async (req, res, next) => {
//   try {
//     const moviesArray = await getMovies()
//     res.status(200).send(moviesArray)
//   } catch (error) {
//     console.log("----error loading movies-----")
//     next(error)
//   }
// })

moviesRouter.get("/:movieId/pdf", async (req, res, next) => {
  try {
    const moviesArray = await getMovies()
    const movie = await moviesArray.find((movie) => movie.imdbID === req.params.movieId)
    if (movie) {
      console.log(movie.Title)
      res.setHeader("Content-Disposition", "attachment; filename=movie.pdf")
      const source = await getPDFReadableStream(movie)
      const destination = res
      console.log("pdf created")
      pipeline(source, destination, (err) => {
        if (err) console.log(err)
      })
    }
  } catch (error) {
    next(error)
  }
})

// single movie
moviesRouter.get("/:movieId", async (req, res, next) => {
  try {
    const moviesArray = await getMovies()
    console.log(req.params.movieId)
    const movie = moviesArray.find((movie) => movie.imdbID === req.params.movieId)
    if (movie) {
      res.status(200).send(movie)
    } else {
      next(NotFound(`Unfortunately the movie with id:${req.params.movieId} was not found!`))
    }
  } catch (error) {
    console.log("----error loading movies-----")
    next(error)
  }
})

// movies by title
moviesRouter.get("/", async (req, res, next) => {
  try {
    const moviesArray = await getMovies()
    console.log(req.query)
    const moviesFromSearch = await moviesArray.filter((movie) =>
      movie.Title.toLowerCase().includes(req.query.title.toLowerCase())
    )

    if (moviesFromSearch) {
      res.status(200).send(moviesFromSearch)
    } else {
      next(NotFound(`Unfortunately the movies with title:${req.query.title} are not found!`))
    }
  } catch (error) {
    console.log("----error loading movies-----")
    next(error)
  }
})

moviesRouter.post("/", async (req, res, next) => {
  if (req.body) {
    try {
      const newMovie = {
        imdbID: uniqid(),
        // Title: "req.body.Title",
        Type: "movie",
        ...req.body
      }
      console.log(newMovie)
      const moviesArray = await getMovies()
      moviesArray.push(newMovie)
      writeMovies(moviesArray)
      res.status(201).send({ imdbID: newMovie.imdbID })
    } catch (error) {
      console.log("----error adding new movie-----")
      next(BadRequest(`Unfortunately this movie was not created!`))
    }
  } else {
    console.log("cannot do put request yet")
  }
})

moviesRouter.post("/:movieId/poster", cloudinaryUploader, async (req, res, next) => {
  try {
    console.log(req.file)
    const url = req.file.path

    const moviesArray = await getMovies()
    const index = moviesArray.findIndex((movie) => movie.imdbID === req.params.movieId)
    //   updating the movie cover
    if (index !== -1) {
      const oldMovieInfo = moviesArray[index]

      const updatedMovie = { ...oldMovieInfo, Poster: url }
      moviesArray[index] = updatedMovie
      await writeMovies(moviesArray)
    }
    res.send("movie image updated")
  } catch (error) {
    next(error)
  }
})

moviesRouter.put("/:movieId", async (req, res, next) => {
  try {
    const moviesArray = await getMovies()
    const index = moviesArray.findIndex((movie) => movie.imdbID === req.params.movieId)

    if (index !== -1) {
      const oldMovieInfo = moviesArray[index]
      const updatedMovieInfo = { ...oldMovieInfo, ...req.body, updatedAt: new Date() }
      moviesArray[index] = updatedMovieInfo

      await writeProducts(moviesArray)

      res.send(updatedMovieInfo)
    } else {
      next(NotFound(`Product with id ${req.params.movieId} not found!`))
    }
  } catch (error) {
    console.log("----error updating product-----")
    next(error)
  }
})

moviesRouter.delete("/:movieId", async (req, res, next) => {
  try {
    const moviesArray = await getMovies()
    const remainingMovies = moviesArray.filter((movie) => movie.imdbID === req.params.movieId)
    if (moviesArray.length !== remainingMovies.length) {
      await writeMovies(remainingMovies)
      res.status(204).send()
    } else {
      next(BadRequest(`Movie with id ${req.params.movieId} not deleted!`))
    }
  } catch (error) {
    next(error)
  }
})

export default moviesRouter
