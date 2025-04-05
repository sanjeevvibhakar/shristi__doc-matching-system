const natural = require('natural');
const tfidf = new natural.TfIdf();
const { extractTextFromPDF } = require('../utils/pdfUtils');

function preprocessText(text) {
  const cleanedText = text.toLowerCase().replace(/[^a-z\s]/g, '');
  const tokens = cleanedText.split(/\s+/);
  const stopwords = ['the', 'is', 'in', 'and', 'to', 'of', 'a', 'an'];
  return tokens.filter(token => !stopwords.includes(token));
}

function generateTFIDFVector(text) {
  const tokens = preprocessText(text);
  tfidf.addDocument(tokens.join(' '));
}

function cosineSimilarity(vec1, vec2) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  vec1.forEach((val, i) => {
    dotProduct += val * vec2[i];
    normA += val * val;
    normB += vec2[i] * vec2[i];
  });

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function compareDocuments(documentPath, otherDocumentPaths) {
  const documentText = await extractTextFromPDF(documentPath);
  generateTFIDFVector(documentText);

  let matches = [];
  for (let filePath of otherDocumentPaths) {
    const otherDocumentText = await extractTextFromPDF(filePath);
    generateTFIDFVector(otherDocumentText);

    const similarity = cosineSimilarity(tfidf.documents[0], tfidf.documents[1]);

    if (similarity > 0.7) { // Adjust threshold as needed
      matches.push({ filePath, similarity });
    }
  }

  return matches;
}

module.exports = { compareDocuments };
