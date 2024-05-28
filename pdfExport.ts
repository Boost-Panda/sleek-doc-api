import * as pdfjsLib from "pdfjs-dist";

async function GetTextFromPDF(path: string): Promise<string> {
    let doc = await pdfjsLib.getDocument(path).promise;
    let numPages = doc.numPages;
    let allText = '';

    for (let i = 1; i <= numPages; i++) {
        let page = await doc.getPage(i);
        let content = await page.getTextContent();
        let strings = content.items.map(function (item) {
            if ('str' in item) {
                return item.str;
            }
        });
        allText += strings.join(' ') + ' ';
    }

    return allText.trim(); // Join strings to form the full text content of all pages
}

export { GetTextFromPDF };