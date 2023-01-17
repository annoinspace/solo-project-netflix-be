import express from "express"
import httpErrors from "http-errors"
import uniqid from "uniqid"
import { pipeline } from "stream"
import { getMedias, writeMedias } from "../../lib/fs-tools.js"
import { getPDFReadableStream } from "../../lib/pdf-tools.js"
import { checkMediaSchema, triggerMediaBadRequest } from "../validator.js"
import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"

const mediasRouter = express.Router()
const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "netflix-backend"
    }
  })
}).single("Poster")

// all medias
// mediasRouter.get("/", async (req, res, next) => {
//   try {
//     const mediasArray = await getMedias()
//     res.status(200).send(mediasArray)
//   } catch (error) {
//     console.log("----error loading medias-----")
//     next(error)
//   }
// })

mediasRouter.get("/:mediaId/pdf", async (req, res, next) => {
  try {
    const mediasArray = await getMedias()
    const media = await mediasArray.find((media) => media.imdbID === req.params.mediaId)
    if (media) {
      console.log(media.Title)
      res.setHeader("Content-Disposition", "attachment; filename=media.pdf")
      const source = await getPDFReadableStream(media)
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

// single media
mediasRouter.get("/:mediaId", async (req, res, next) => {
  try {
    const mediasArray = await getMedias()
    console.log(req.params.mediaId)
    const media = mediasArray.find((media) => media.imdbID === req.params.mediaId)
    if (media) {
      res.status(200).send(media)
    } else {
      next(NotFound(`Unfortunately the media with id:${req.params.mediaId} was not found!`))
    }
  } catch (error) {
    console.log("----error loading medias-----")
    next(error)
  }
})

// medias by title
mediasRouter.get("/", async (req, res, next) => {
  try {
    const mediasArray = await getMedias()
    console.log(req.query)
    const mediasFromSearch = await mediasArray.filter((media) =>
      media.Title.toLowerCase().includes(req.query.title.toLowerCase())
    )

    if (mediasFromSearch) {
      res.status(200).send(mediasFromSearch)
    } else {
      next(NotFound(`Unfortunately the medias with title:${req.query.title} are not found!`))
    }
  } catch (error) {
    console.log("----error loading medias-----")
    next(error)
  }
})

mediasRouter.post("/", checkMediaSchema, triggerMediaBadRequest, async (req, res, next) => {
  if (req.body) {
    try {
      const newMedia = {
        imdbID: uniqid(),
        // Title: "req.body.Title",
        Type: "media",
        ...req.body
      }
      console.log(newMedia)
      const mediasArray = await getMedias()
      mediasArray.push(newMedia)
      writeMedias(mediasArray)
      res.status(201).send({ imdbID: newMedia.imdbID })
    } catch (error) {
      console.log("----error adding new media-----")
      next(BadRequest(`Unfortunately this media was not created!`))
    }
  } else {
    console.log("cannot do put request yet")
  }
})

mediasRouter.post("/:mediaId/poster", cloudinaryUploader, async (req, res, next) => {
  try {
    console.log(req.file)
    const url = req.file.path

    const mediasArray = await getMedias()
    const index = mediasArray.findIndex((media) => media.imdbID === req.params.mediaId)
    //   updating the media cover
    if (index !== -1) {
      const oldMediaInfo = mediasArray[index]

      const updatedMedia = { ...oldMediaInfo, Poster: url }
      mediasArray[index] = updatedMedia
      await writeMedias(mediasArray)
    }
    res.send("media image updated")
  } catch (error) {
    next(error)
  }
})

mediasRouter.put("/:mediaId", async (req, res, next) => {
  try {
    const mediasArray = await getMedias()
    const index = mediasArray.findIndex((media) => media.imdbID === req.params.mediaId)

    if (index !== -1) {
      const oldMediaInfo = mediasArray[index]
      const updatedMediaInfo = { ...oldMediaInfo, ...req.body, updatedAt: new Date() }
      mediasArray[index] = updatedMediaInfo

      await writeProducts(mediasArray)

      res.send(updatedMediaInfo)
    } else {
      next(NotFound(`Product with id ${req.params.mediaId} not found!`))
    }
  } catch (error) {
    console.log("----error updating product-----")
    next(error)
  }
})

mediasRouter.delete("/:mediaId", async (req, res, next) => {
  try {
    const mediasArray = await getMedias()
    const remainingMedias = mediasArray.filter((media) => media.imdbID === req.params.mediaId)
    if (mediasArray.length !== remainingMedias.length) {
      await writeMedias(remainingMedias)
      res.status(204).send()
    } else {
      next(BadRequest(`Media with id ${req.params.mediaId} not deleted!`))
    }
  } catch (error) {
    next(error)
  }
})

export default mediasRouter
