import path from 'path';
import express from "express";
import fileUpload from "express-fileupload";
import { GetTextFromPDF }  from './pdfExport';
import { Summarize } from './summarizer';
import {CreateThreadWithFile, RunThread, AddMessageToThread} from './assistant';
import cors from 'cors';


const app = express();
// default options
app.use(fileUpload());
const port = 8080;


app.use(cors());

// thread_Tci1Bjn8zAxcNPFkNSQGwlJq
app.post('/create-thread', async (req, res) => {
    if (req.files) {
        const filePath = path.join(__dirname, 'temp', req.files.foo.name);
        // await req.files.foo.mv(filePath);

        const threadId = await CreateThreadWithFile(filePath, req.body.query);

        res.json({ threadId: threadId});
    }
    else {
        res.status(500).send('No files were uploaded.');
    }
});

app.post('/run-thread', async (req, res) => {
    const { threadId, query } = req.body;
    if (!threadId || !query) {
        return res.status(400).send('Invalid request.');
    }
    console.log(threadId, query);
    const message = await AddMessageToThread(threadId, query);
    console.log(message);
    
    await RunThread(threadId, query , (data) => {
        console.log(data);
        res.json({reply: data});
    });
    // res.end();
});

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