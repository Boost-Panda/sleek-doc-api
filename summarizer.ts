import OpenAI from 'openai';


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function Summarize(text: string, onData: (data: string) => void): Promise<void> {
    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content: "You are a highly intelligent AI that provides concise and \
                clear summaries of lengthy texts. These texts are extracted from PDF files. \
                Try to infer what the PDF file is about and mention what you think the file seems to be. \
                Given the following text, provide a comprehensive summary that captures the main points and \
                important details while remaining neutral and objective. Ensure that the summary is coherent and \
                free of personal opinions or interpretations."
            },
            {
                role: "user",
                content: `Summarize this \n\nText:\n${text}\n\nSummary:`
            }
        ],
        temperature: 1,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: true
    });

    for await (const chunk of completion) {
        const payload = chunk.choices[0].delta.content;
        if (payload) {
            onData(payload);
        }
    }
}