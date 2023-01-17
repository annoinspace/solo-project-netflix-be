import { checkSchema, validationResult } from "express-validator"

const mediaSchema = {
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

export const checkMediaSchema = checkSchema(mediaSchema)

export const triggerMediaBadRequest = (req, res, next) => {
  const errors = validationResult(req)
  console.log(errors.array())

  if (!errors.isEmpty()) {
    next(BadRequest("Errors during movie validation", { errorsList: errors.array() }))
  } else {
    next()
  }
}
