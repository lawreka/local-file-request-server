const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8000;

const upload = multer({ dest: 'uploads/' });

app.use(express.json());

app.post('/single-file-upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  console.log(`\n--- Received 1 file(s) ---`);
  console.log(`File: ${req.file.originalname}`);
  console.log('Content:');

  try {
    const content = fs.readFileSync(req.file.path, 'utf8');
    console.log(content);
    console.log('--- End of file ---');

    fs.unlinkSync(req.file.path);
  } catch (error) {
    console.error(`Error reading file ${req.file.originalname}:`, error.message);
  }

  res.json({
    message: 'File processed successfully',
    filename: req.file.originalname
  });
});

app.post('/multiple-file-upload', upload.array('files'), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  console.log(`\n--- Received ${req.files.length} file(s) ---`);

  req.files.forEach((file, index) => {
    try {
      const content = fs.readFileSync(file.path, 'utf8');
      console.log(`\nFile ${index + 1}: ${file.originalname}`);
      console.log('Content:');
      console.log(content);
      console.log('--- End of file ---');

      fs.unlinkSync(file.path);
    } catch (error) {
      console.error(`Error reading file ${file.originalname}:`, error.message);
    }
  });

  res.json({
    message: 'Files processed successfully',
    count: req.files.length
  });
});

app.get('/', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>File Upload Server</h1>
        <form action="/upload" method="post" enctype="multipart/form-data">
          <input type="file" name="files" multiple accept=".txt,.js,.json,.html,.css,.md" />
          <button type="submit">Upload Files</button>
        </form>
        <p>Or send a POST request to /upload with files in the 'files' field</p>
      </body>
    </html>
  `);
});

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Send POST requests to /single-file-upload and /multiple-file-upload with multiple files');
});
