import PdfPrinter from "pdfmake"

export const getPDFReadableStream = async (movie) => {
  const fonts = {
    Roboto: {
      normal: "Helvetica"
    }
  }

  const printer = new PdfPrinter(fonts)

  const docDefinition = {
    content: [
      { text: movie.Title, style: "header" },

      {
        text: `Year released: ${movie.Year}`
      }
    ],
    styles: {
      header: {
        fontSize: 48
      }
    }
  }

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition)
  pdfReadableStream.end()

  return pdfReadableStream
}
