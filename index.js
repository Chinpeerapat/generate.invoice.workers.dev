import { jsPDF } from 'jspdf'

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event))
})

async function handleRequest(event) {
  const doc = new jsPDF({
    orientation: 'p',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 20

  const searchParams = new URL(event.request.url).searchParams

  // Helper functions
  const docText = (x, y, text, options = {}) => {
    const { align = 'left', fontSize = 10, fontStyle = 'normal' } = options
    doc.setFontSize(fontSize)
    doc.setFont('helvetica', fontStyle)
    if (align === 'right') {
      doc.text(text, pageWidth - margin, y, { align: 'right' })
    } else {
      doc.text(text, x, y)
    }
  }

  const wrapText = (text, maxWidth) => {
    const words = text.split(' ')
    const lines = []
    let currentLine = words[0]

    for (let i = 1; i < words.length; i++) {
      const word = words[i]
      const width = doc.getStringUnitWidth(currentLine + " " + word) * doc.internal.getFontSize() / doc.internal.scaleFactor
      if (width < maxWidth) {
        currentLine += " " + word
      } else {
        lines.push(currentLine)
        currentLine = word
      }
    }
    lines.push(currentLine)
    return lines
  }

  // Personal Information
  docText(margin, 20, searchParams.get('fullName'), { fontSize: 18, fontStyle: 'bold' })
  docText(margin, 30, searchParams.get('email'))
  docText(margin, 35, searchParams.get('phone'))
  docText(margin, 40, searchParams.get('linkedin'))
  docText(margin, 45, searchParams.get('location'))

  // Summary
  docText(margin, 55, 'Summary', { fontSize: 14, fontStyle: 'bold' })
  const summaryLines = wrapText(searchParams.get('summary'), pageWidth - 2 * margin)
  let yPos = 60
  summaryLines.forEach(line => {
    docText(margin, yPos, line)
    yPos += 5
  })

  // Areas of Expertise
  yPos += 5
  docText(margin, yPos, 'Areas of Expertise', { fontSize: 14, fontStyle: 'bold' })
  yPos += 5
  const expertiseItems = searchParams.get('expertise').split(',')
  expertiseItems.forEach(item => {
    docText(margin + 5, yPos, '• ' + item.trim())
    yPos += 5
  })

  // Professional Experience
  yPos += 5
  docText(margin, yPos, 'Professional Experience', { fontSize: 14, fontStyle: 'bold' })
  yPos += 5

  let expIndex = 1
  while (searchParams.get(`jobTitle${expIndex}`)) {
    const jobTitle = searchParams.get(`jobTitle${expIndex}`)
    const company = searchParams.get(`company${expIndex}`)
    const startDate = searchParams.get(`startDate${expIndex}`)
    const endDate = searchParams.get(`endDate${expIndex}`)
    const description = searchParams.get(`description${expIndex}`)

    docText(margin, yPos, jobTitle, { fontStyle: 'bold' })
    yPos += 5
    docText(margin, yPos, `${company} | ${startDate} - ${endDate}`)
    yPos += 5

    const descLines = wrapText(description, pageWidth - 2 * margin - 10)
    descLines.forEach(line => {
      docText(margin + 10, yPos, '• ' + line)
      yPos += 5
    })

    yPos += 5
    expIndex++
  }

  // Education
  yPos += 5
  docText(margin, yPos, 'Education', { fontSize: 14, fontStyle: 'bold' })
  yPos += 5

  let eduIndex = 1
  while (searchParams.get(`degree${eduIndex}`)) {
    const degree = searchParams.get(`degree${eduIndex}`)
    const university = searchParams.get(`university${eduIndex}`)
    const eduStartDate = searchParams.get(`eduStartDate${eduIndex}`)
    const eduEndDate = searchParams.get(`eduEndDate${eduIndex}`)

    docText(margin, yPos, degree, { fontStyle: 'bold' })
    yPos += 5
    docText(margin, yPos, `${university} | ${eduStartDate} - ${eduEndDate}`)
    yPos += 10
    eduIndex++
  }

  const output = doc.output('arraybuffer')

  const headers = new Headers()
  headers.set('Content-Type', 'application/pdf')

  return new Response(output, { headers })
}