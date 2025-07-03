const splitTextIntoSentences = (text) => {
    return text.match(/[^.!?]+[.!?]/g) || [text]; // Cümlelere ayır
};

const splitTextIntoParagraphs = (text) => {
    return text
        .split('\n\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 0); // Paragraflara ayır
};

export { splitTextIntoSentences, splitTextIntoParagraphs };
