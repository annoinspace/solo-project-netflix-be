import { checkSchema, validationResult } from "express-validator"

const movieSchema = {
  Title: {
    in: ["body"],
    isString: {
      errorMessage: "please include the movie name"
    }
  },
  Year: {
    in: ["body"],
    isString: {
      errorMessage: "please include the movie year"
    }
  }
}

export const checkMovieSchema = checkSchema(movieSchema)

export const triggerMovieBadRequest = (req, res, next) => {
  const errors = validationResult(req)
  console.log(errors.array())

  if (!errors.isEmpty()) {
    next(BadRequest("Errors during movie validation", { errorsList: errors.array() }))
  } else {
    next()
  }
}
