const express = require('express');
const dotenv = require('dotenv');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();
const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({model: `gemini-2.5-flash`});
const PORT = process.env.PORT || 3000;
const upload = multer({ storage: multer.memoryStorage() });

async function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType: mimeType,
    },
  };
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.post(`/generate-text`, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ code: 400, error: 'Prompt is required' });
    }

    const result = await model.generateContent(prompt);
    const response = result.response;

    res.json({ output: response.candidates[0].content.parts[0].text });
  } catch (error) {
    console.error('Error generating text:', error);
    res.status(500).json({ error: 'Failed to generate text' });
  }
});

app.post(`/generate-from-image`, upload.single('image'), async (req, res) => {
  try {
    if(!req.body.prompt) {
        return res.status(400).json({ code: 400, error: 'Prompt is required' });
    }
    if (!req.file) {
      return res.status(400).json({ code: 400, error: 'Image file is required' });
    }

    const image = await fileToGenerativePart(req.file.buffer, req.file.mimetype);

    const result = await model.generateContent([req.body.prompt, image]);
    const response = result.response;

    res.json({ output: response.candidates[0].content.parts[0].text });
  } catch (error) {
    console.error('Error generating from image:', error);
    res.status(500).json({ error: 'Failed to generate from image' });
  }
});

app.post(`/generate-from-files`, upload.array('files'), async (req, res) => {
  try {
    if(!req.body.prompt) {
        return res.status(400).json({ code: 400, error: 'Prompt is required' });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ code: 400, error: 'At least one file is required' });
    }

    const files = await Promise.all(req.files.map(file => fileToGenerativePart(file.buffer, file.mimetype)));

    const result = await model.generateContent([req.body.prompt, ...files]);
    const response = result.response;

    res.json({ output: response.candidates[0].content.parts[0].text });
  } catch (error) {
    console.error('Error generating from files:', error);
    res.status(500).json({ error: 'Failed to generate from files' });
  }
});

app.post(`/generate-from-audio`, upload.single('audio'), async (req, res) => {
  try {
    if(!req.body.prompt) {
        return res.status(400).json({ code: 400, error: 'Prompt is required' });
    }
    if (!req.file) {
      return res.status(400).json({ code: 400, error: 'Audio file is required' });
    }

    const audio = await fileToGenerativePart(req.file.buffer, req.file.mimetype);

    const result = await model.generateContent([req.body.prompt, audio]);
    const response = result.response;

    res.json({ output: response.candidates[0].content.parts[0].text });
  } catch (error) {
    console.error('Error generating from audio:', error);
    res.status(500).json({ error: 'Failed to generate from audio' });
  }
});