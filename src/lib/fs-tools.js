import { fileURLToPath } from "url"
import { dirname, join } from "path"
import fs from "fs-extra"

const { readJSON, writeJSON, writeFile } = fs

//for the movies
const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data")
const moviesJSONPath = join(dataFolderPath, "movies.json")

const publicFolderPath = join(process.cwd(), "./public/img")

export const getMovies = () => readJSON(moviesJSONPath)
export const writeMovies = () => writeJSON(moviesJSONPath)
