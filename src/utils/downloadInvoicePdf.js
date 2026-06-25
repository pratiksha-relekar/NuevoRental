import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export async function downloadInvoicePdf(element, filename) {
  if (!element) {
    throw new Error('Invoice element not found.')
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  })

  const imageData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 24
  const usableWidth = pageWidth - margin * 2
  const imageHeight = (canvas.height * usableWidth) / canvas.width

  let heightLeft = imageHeight
  let position = margin

  pdf.addImage(imageData, 'PNG', margin, position, usableWidth, imageHeight)
  heightLeft -= pageHeight - margin * 2

  while (heightLeft > 0) {
    position = heightLeft - imageHeight + margin
    pdf.addPage()
    pdf.addImage(imageData, 'PNG', margin, position, usableWidth, imageHeight)
    heightLeft -= pageHeight - margin * 2
  }

  pdf.save(filename)
}
