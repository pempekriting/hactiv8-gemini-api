# Hactiv8 Gemini API

A comprehensive Node.js API server that integrates with Google's Gemini AI to provide text generation capabilities from various input types including text prompts, images, audio files, and multiple files.

## Features

- **Text Generation**: Generate AI responses from text prompts
- **Image Analysis**: Analyze and generate content from uploaded images
- **Audio Processing**: Process and generate content from audio files
- **Multi-file Processing**: Handle multiple files simultaneously for content generation
- **RESTful API**: Clean and simple REST endpoints
- **File Upload Support**: Secure file handling with Multer
- **Error Handling**: Comprehensive error responses

## Technologies Used

- **Node.js**: Runtime environment (ES6 modules)
- **Express.js**: Web framework for building the API
- **@google/genai**: Google Generative AI SDK for Gemini 2.5 Flash model
- **Multer**: Middleware for handling multipart/form-data (file uploads)
- **dotenv**: Environment variable management

## Prerequisites

Before running this project, make sure you have:

- Node.js (v18 or higher with ES modules support)
- npm or yarn package manager
- Google AI Studio API key (Gemini API access)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hactiv8-gemini-api
   ```

2. **Install dependencies**
   ```bash
   npm install @google/genai express dotenv multer
   ```

3. **Package.json Configuration**
   Ensure your `package.json` includes ES modules support:
   ```json
   {
     "type": "module",
     "scripts": {
       "start": "node index.js",
       "dev": "node --watch index.js"
     }
   }
   ```

4. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

5. **Get your Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Generate a new API key
   - Copy the key to your `.env` file

## Usage

### Starting the Server

```bash
npm start
# or for development with auto-reload
npm run dev
# or directly
node index.js
```

The server will start on `http://localhost:3000` (or your specified PORT).

### API Endpoints

#### 1. Generate Text from Prompt

**Endpoint**: `POST /generate-text`

**Description**: Generate AI content from a text prompt.

**Request Body**:
```json
{
  "prompt": "Your text prompt here"
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/generate-text \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write a short story about a robot learning to paint"}'
```

**Response**:
```json
{
  "output": "Generated AI content based on your prompt..."
}
```

#### 2. Generate Content from Image

**Endpoint**: `POST /generate-from-image`

**Description**: Analyze an image and generate content based on a prompt.

**Request**: Form-data
- `prompt` (text): Description or question about the image
- `image` (file): Image file (JPEG, PNG, etc.)

**Example**:
```bash
curl -X POST http://localhost:3000/generate-from-image \
  -F "prompt=Describe what you see in this image" \
  -F "image=@path/to/your/image.jpg"
```

**Response**:
```json
{
  "output": "AI-generated description of the image..."
}
```

#### 3. Generate Content from Audio

**Endpoint**: `POST /generate-from-audio`

**Description**: Process audio content and generate text based on a prompt.

**Request**: Form-data
- `prompt` (text): Instructions for processing the audio
- `audio` (file): Audio file (MP3, WAV, etc.)

**Example**:
```bash
curl -X POST http://localhost:3000/generate-from-audio \
  -F "prompt=Transcribe and summarize this audio" \
  -F "audio=@path/to/your/audio.mp3"
```

**Response**:
```json
{
  "output": "AI-generated content based on audio analysis..."
}
```

#### 4. Generate Content from Multiple Files

**Endpoint**: `POST /generate-from-files`

**Description**: Process multiple files simultaneously and generate content.

**Request**: Form-data
- `prompt` (text): Instructions for processing the files
- `files` (multiple files): Various file types (images, documents, etc.)

**Example**:
```bash
curl -X POST http://localhost:3000/generate-from-files \
  -F "prompt=Compare and analyze these files" \
  -F "files=@file1.jpg" \
  -F "files=@file2.pdf" \
  -F "files=@file3.png"
```

**Response**:
```json
{
  "output": "AI-generated analysis of all uploaded files..."
}
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- **400 Bad Request**: Missing required parameters
- **500 Internal Server Error**: Server-side processing errors

**Error Response Format**:
```json
{
  "code": 400,
  "error": "Detailed error message"
}
```

## Supported File Types

### Images
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### Audio
- MP3 (.mp3)
- WAV (.wav)
- FLAC (.flac)
- OGG (.ogg)

### Documents
- PDF (.pdf)
- Text files (.txt)
- And other formats supported by Gemini API

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes | - |
| `PORT` | Server port number | No | 3000 |

### Model Configuration

The project uses `gemini-2.5-flash` model with configurable parameters. You can modify the model settings in `index.js`:

```javascript
const MODEL_SETTINGS = {
  model: 'gemini-2.5-flash',
  contents: '',
  temperature: 0.9,    // Controls randomness (0.0 - 1.0)
  topP: 0.95,         // Nucleus sampling parameter
  topK: 40,           // Top-k sampling parameter
};
```

**Model Parameters:**
- `temperature`: Higher values (0.9) make output more creative, lower values (0.1) more focused
- `topP`: Controls diversity via nucleus sampling (0.1 - 1.0)
- `topK`: Limits token selection to top K most likely tokens

Available models:
- `gemini-2.5-flash` (faster, cost-effective)
- `gemini-pro` (more accurate for complex tasks)

## Project Structure

```
hactiv8-gemini-api/
├── index.js          # Main application file (ES6 modules)
├── package.json      # Project dependencies and scripts
├── .env             # Environment variables (create this)
├── .gitignore       # Git ignore file
└── README.md        # Project documentation
```

## Development

### Adding New Endpoints

1. Define the route in `index.js`
2. Add appropriate middleware (multer for file uploads)
3. Implement error handling
4. Test the endpoint

### Example of adding a new endpoint:

```javascript
app.post('/your-new-endpoint', upload.single('file'), async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ code: 400, error: 'Prompt is required' });
    }

    const localParamModel = MODEL_SETTINGS;
    localParamModel.contents = prompt;
    const result = await ai.models.generateContent(localParamModel);
    
    res.json({ output: result.text });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Operation failed' });
  }
});
```

## Best Practices

1. **API Key Security**: Never commit your `.env` file or expose API keys
2. **File Size Limits**: Consider implementing file size limits for uploads
3. **Rate Limiting**: Implement rate limiting for production use
4. **Input Validation**: Always validate user inputs
5. **Logging**: Add proper logging for debugging and monitoring

## Troubleshooting

### Common Issues

1. **API Key Error**
   - Ensure your `GEMINI_API_KEY` is correctly set in `.env`
   - Verify the API key is valid and has proper permissions

2. **File Upload Issues**
   - Check file size limits
   - Verify file format is supported
   - Ensure proper `Content-Type` headers

3. **Server Won't Start**
   - Check if the port is already in use
   - Verify all dependencies are installed
   - Check for syntax errors in the code

### Debug Mode

Add debugging by setting the environment variable:
```bash
DEBUG=* node index.js
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Resources

- [Google Generative AI Documentation](https://ai.google.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [Multer Documentation](https://github.com/expressjs/multer)
- [Gemini API Quickstart](https://ai.google.dev/tutorials/get_started_node)

## Support

For questions and support, please open an issue in the repository or refer to the documentation links provided above.
