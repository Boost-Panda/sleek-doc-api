import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


export async function RunThread(threadId: string, query: string, onData: (data: string) => void): Promise<void> {
    return new Promise(async (resolve, reject) => {
        const threadMessages = await openai.beta.threads.messages.create(
            threadId,
            { role: "user", content: query }
        );

        console.log(threadMessages + " added to thread")

        const stream = openai.beta.threads.runs.stream(threadId, {
            assistant_id: process.env.ASSISTANT_ID || "",
        });

        stream
            .on('textCreated', () => console.log('assistant >'))
            .on('toolCallCreated', (event) => console.log('assistant ' + event.type))
            .on('messageDone', async (event) => {
                if (event.content[0].type === 'text') {
                    const { text } = event.content[0];
                    const { annotations } = text;
                    const citations: string[] = [];

                    let index = 0;
                    for await (let annotation of annotations) {
                        text.value = text.value.replace(annotation.text, '[' + index + ']');
                        const { file_citation } = annotation;
                        if (file_citation) {
                            const citedFile = await openai.files.retrieve(file_citation.file_id);
                            citations.push('[' + index + ']' + citedFile.filename);
                        }
                        index++;
                    }
                    
                }
            });

        stream.on('error', (err) => {
            console.error('Error streaming response:', err);
            reject(err); // Reject the Promise on error.
        });

        stream.on('end', () => {
            console.log('Streaming finished.');
            resolve(); // Resolve the Promise when streaming is finished.
        });
    });
}

export async function CreateThreadWithFile(filepath: string, query: string) {
    // attach File to OpenAI
    const thread_file = await openai.files.create({
        file: fs.createReadStream(filepath),
        purpose: "assistants",
      });

    const thread = await openai.beta.threads.create({
        messages: [
            {
            role: "user",
            content:
                query,
            // Attach the new file to the message.
            attachments: [{ file_id: thread_file.id, tools: [{ type: "file_search" }] }],
            },
        ],
    });

    return thread.id;
}

export async function runThreadandreturnStream(threadId: string, onData: (data: string) => void) {
        const assistantId = process.env.ASSISTANT_ID || ""; // Assign an empty string as default value if ASSISTANT_ID is undefined
        const stream = openai.beta.threads.runs
        .stream(threadId, {
                assistant_id: assistantId,
    })
}