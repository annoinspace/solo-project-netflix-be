import express from "express"
import httpErrors from "http-errors"
import uniqid from "uniqid"
import { pipeline } from "stream"
import { getMovies, getMoviesJsonReadableStream, writeMovies } from "../../lib/fs-tools.js"
import { getPDFReadableStream } from "../../lib/pdf-tools.js"

const moviesRouter = express.Router()

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
    res.setHeader("Content-Disposition", `attachment; filename=${req.params.movieId}.pdf`)
    const source = getPDFReadableStream(movie)
    const destination = res
    console.log("pdf created")
    pipeline(source, destination, (err) => {
      if (err) console.log(err)
    })
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
  try {
    const newMovie = {
      imdbID: uniqid(),
      ...req.body
    }
    const moviesArray = await getMovies()
    moviesArray.push(newMovie)
    writeMovies(moviesArray)
    res.status(201).send({ imdbID: newMovie.imdbID })
  } catch (error) {
    console.log("----error adding new movie-----")
    next(BadRequest(`Unfortunately this movie was not created!`))
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
