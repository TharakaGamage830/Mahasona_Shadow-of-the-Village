import fs from 'fs';
import StreamZip from 'node-stream-zip';

async function extractText(filename) {
    const zip = new StreamZip.async({ file: filename });
    try {
        const xml = await zip.entryData('word/document.xml');
        const text = xml.toString('utf8').replace(/<w:p[^>]*>/g, '\n').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        console.log(text);
    } catch (err) {
        console.error(err);
    } finally {
        await zip.close();
    }
}

extractText('f:\\Yaksha game\\Yaksha Gama\\Yaksha_Gama_Horror_Design_Bible.docx');
