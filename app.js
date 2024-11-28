const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const QRCode = require('qrcode');
const Jimp = require('jimp');
const jsQR = require('jsqr');

const app = express();
const upload = multer();

app.use(bodyParser.json());

// Generate QR Code
app.post('/generate', async (req, res) => {
    const { data } = req.body;
    try {
        const qrCode = await QRCode.toDataURL(data);
        const base64Data = qrCode.split(',')[1]; // Extract base64
        res.json({ qrCode: base64Data });
    } catch (error) {
        res.status(500).send('Error generating QR code');
    }
});

// Decode QR Code
app.post('/decode', upload.single('qr_image'), async (req, res) => {
    try {
        const imageBuffer = req.file.buffer;

        const image = await Jimp.read(imageBuffer);
        const { data, width, height } = image.bitmap;

        const code = jsQR(new Uint8ClampedArray(data), width, height);
        if (code) {
            res.json({ decodedData: code.data });
        } else {
            res.status(400).send('No QR code found in the image');
        }
    } catch (error) {
        res.status(500).send('Error decoding QR code');
    }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
