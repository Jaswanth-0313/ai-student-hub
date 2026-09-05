const JSZip = require('jszip');
const mammoth = require('mammoth');

const MAX_BYTES = 8 * 1024 * 1024;
const SUPPORTED_TYPES = new Set(['.pdf', '.ppt', '.pptx', '.docx', '.txt']);

function extensionOf(name = '') {
  const match = String(name).toLowerCase().match(/\.[a-z0-9]+$/);
  return match ? match[0] : '';
}

function decodeXml(value) {
  return value
    .replace(/<a:br\s*\/?>/gi, '\n')
    .replace(/<\/a:p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

async function extractPptx(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const slideNames = Object.keys(zip.files)
    .filter(name => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((a, b) => Number(a.match(/slide(\d+)/i)[1]) - Number(b.match(/slide(\d+)/i)[1]));

  const slides = [];
  for (const name of slideNames) {
    const xml = await zip.files[name].async('string');
    const text = decodeXml(xml);
    if (text) slides.push(`Slide ${slides.length + 1}\n${text}`);
  }
  return slides.join('\n\n');
}

async function extractPdf(buffer) {
  const { PDFParse } = require('pdf-parse');
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text || '';
  } finally {
    await parser.destroy();
  }
}

async function extractStudyMaterial({ fileName, mimeType, base64, text }) {
  if (text && String(text).trim()) return { text: String(text).trim(), sourceType: 'text' };
  if (!base64) throw new Error('Provide pasted text or an uploaded file.');

  const extension = extensionOf(fileName);
  if (!SUPPORTED_TYPES.has(extension)) throw new Error('Unsupported file type. Use PDF, PPTX, DOCX, or TXT. Legacy .ppt and .doc files are not supported.');
  const buffer = Buffer.from(base64, 'base64');
  if (!buffer.length) throw new Error('The uploaded file is empty.');
  if (buffer.length > MAX_BYTES) throw new Error('The uploaded file is too large. Maximum size is 8 MB.');

  let extracted = '';
  if (extension === '.txt') extracted = buffer.toString('utf8');
  else if (extension === '.pdf') extracted = await extractPdf(buffer);
  else if (extension === '.pptx') extracted = await extractPptx(buffer);
  else if (extension === '.docx') extracted = (await mammoth.extractRawText({ buffer })).value;
  else throw new Error(`Could not extract ${mimeType || extension}.`);

  extracted = extracted.replace(/\u0000/g, '').trim();
  if (!extracted) throw new Error('No readable text was found in the uploaded file. Image-only files need OCR, which is not configured.');
  return { text: extracted.slice(0, 120000), sourceType: extension.slice(1) };
}

module.exports = { extractStudyMaterial, MAX_BYTES };
