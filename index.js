import express, { json } from 'express';
import { config } from 'dotenv';
import multer, { memoryStorage } from 'multer';
import { GoogleGenAI } from '@google/genai';

config();
const app = express();
app.use(json());

const MODEL_SETTINGS = {
  model: 'gemini-2.5-flash',
  contents: ``,
  temperature: 0.9,
  topP: 0.95,
  topK: 40,
};

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
const PORT = process.env.PORT || 3000;
const upload = multer({ storage: memoryStorage() });

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

    const localParamModel = MODEL_SETTINGS;
    localParamModel.contents = prompt;
    const result = await ai.models.generateContent(localParamModel);

    res.json({ 
      output: result.text
    });

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
    const localParamModel = MODEL_SETTINGS;
    localParamModel.contents = [image, {text: req.body.prompt}];
    const result = await ai.models.generateContent(localParamModel);

    res.json({ output: result.text });
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
    const localParamModel = MODEL_SETTINGS;
    localParamModel.contents = [{text: req.body.prompt}, ...files];
    const result = await ai.models.generateContent(localParamModel);
    
    res.json({ output: result.text });
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
    const localParamModel = MODEL_SETTINGS;
    localParamModel.contents = [audio, {text: req.body.prompt}];
    const result = await ai.models.generateContent(localParamModel);

    res.json({ output: result.text });
  } catch (error) {
    console.error('Error generating from audio:', error);
    res.status(500).json({ error: 'Failed to generate from audio' });
  }
});