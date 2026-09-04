const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../../public/uploads');
const imagesDir = path.join(uploadsDir, 'images');
const attachmentsDir = path.join(uploadsDir, 'attachments');

[uploadsDir, imagesDir, attachmentsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'image') {
            cb(null, imagesDir);
        } else {
            cb(null, attachmentsDir);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${uniqueSuffix}-${safeName}`);
    }
});

const storage = process.env.BLOB_READ_WRITE_TOKEN
    ? multer.memoryStorage()
    : diskStorage;

const forbiddenExtensions = ['.exe', '.bat', '.cmd', '.sh', '.php', '.phtml', '.pl', '.cgi', '.js', '.vbs', '.jar', '.scr', '.msi'];

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (forbiddenExtensions.includes(ext)) {
        return cb(new Error(`Tipo de arquivo não permitido por motivos de segurança (${ext}).`), false);
    }

    if (file.fieldname === 'image') {
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const allowedImageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

        if (!allowedImageTypes.includes(file.mimetype) || !allowedImageExts.includes(ext)) {
            return cb(new Error('Formato de imagem inválido. Use JPG, PNG, GIF ou WEBP.'), false);
        }
    } else {
        // Document / Code Attachment allowed types
        const allowedExts = ['.txt', '.pdf', '.zip', '.rar', '.7z', '.json', '.sql', '.py', '.cpp', '.c', '.java', '.cs', '.md', '.png', '.jpg', '.jpeg'];
        if (!allowedExts.includes(ext)) {
            return cb(new Error(`Extensão de anexo '${ext}' não é permitida.`), false);
        }
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 6,
        fields: 30,
        parts: 40
    }
});

module.exports = upload;
