import PdfPrinter from "pdfmake"

export const getPDFReadableStream = async (media) => {
  const fonts = {
    Roboto: {
      normal: "Helvetica"
    }
  }

  const printer = new PdfPrinter(fonts)

  const docDefinition = {
    content: [
      { text: media.Title, style: "header" },

      {
        text: `Year released: ${media.Year}`
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
