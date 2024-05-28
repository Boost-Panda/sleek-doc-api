import path from 'path';
import fs from 'fs';
import express from "express";
import fileUpload from "express-fileupload";
import { GetTextFromPDF }  from './pdfExport';
import { Summarize } from './summarizer';
import cors from 'cors';


const app = express();
// default options
app.use(fileUpload());
const port = 8080;


app.use(cors());

app.post('/upload', async (req, res) => {
    console.log(req.files); // the uploaded file object
    if (req.files) {
        console.log(req.files.foo.name); // the uploaded file object
        const filePath = path.join(__dirname, 'temp', req.files.foo.name);
        // Save the file temporarily
        await req.files.foo.mv(filePath);
        // Extract text from the PDF
        const pdfText = await GetTextFromPDF(filePath);
        // res.json({ text: pdfText });

        // Set headers for streaming
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Transfer-Encoding', 'chunked');

        await Summarize(pdfText, (data) => {
            res.write(data);
        });

        res.end();
    }
    else {
        res.status(500).send('No files were uploaded.');
    }
    // res.json({ message: "File uploaded!" });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});