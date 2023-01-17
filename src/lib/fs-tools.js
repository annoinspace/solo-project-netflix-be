import { fileURLToPath } from "url"
import { dirname, join } from "path"
import fs from "fs-extra"

const { readJSON, writeJSON } = fs

//for the medias
const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data")
const mediasJSONPath = join(dataFolderPath, "medias.json")

export const getMedias = () => readJSON(mediasJSONPath)
export const writeMedias = (mediasArray) => writeJSON(mediasJSONPath, mediasArray)

export const getMediasJsonReadableStream = () => createReadStream(mediasJSONPath)
export const getPDFWriteableStream = (filename) => createWriteStream(join(dataFolderPath, filename))
