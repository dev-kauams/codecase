const fs = require('fs');
const path = require('path');

async function saveFile(file, folder) {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
        const { put } = require('@vercel/blob');
        const pathname = `${folder}/${createFilename(file.originalname)}`;
        const blob = await put(pathname, file.buffer, {
            access: 'public',
            contentType: file.mimetype,
            addRandomSuffix: false
        });
        return {
            filename: pathname,
            url: blob.url
        };
    }

    return {
        filename: file.filename,
        url: `/uploads/${folder}/${file.filename}`
    };
}

async function deleteFile(filePath) {
    if (!filePath) return;

    if (filePath.startsWith('https://') || filePath.startsWith('http://')) {
        if (!process.env.BLOB_READ_WRITE_TOKEN) return;
        const { del } = require('@vercel/blob');
        await del(filePath);
        return;
    }

    const fullPath = path.resolve(__dirname, '../../', filePath.replace(/^\/+/, ''));
    const uploadsRoot = path.resolve(__dirname, '../../public/uploads');
    if (!fullPath.startsWith(uploadsRoot + path.sep)) return;
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
}

function createFilename(originalName) {
    const extension = path.extname(originalName).toLowerCase();
    const safeName = path.basename(originalName, extension).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80) || 'file';
    return `${Date.now()}-${Math.round(Math.random() * 1E9)}-${safeName}${extension}`;
}

module.exports = { saveFile, deleteFile };