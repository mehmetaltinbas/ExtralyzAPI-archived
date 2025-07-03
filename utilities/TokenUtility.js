import { encoding_for_model } from '@dqbd/tiktoken';

const countTokens = (text, model = 'gpt-4o-mini') => {
    const encoding = encoding_for_model(model);
    const tokens = encoding.encode(text);
    return tokens.length;
};

const encodeTokens = (text, model = 'gpt-4o-mini') => {
    const encoding = encoding_for_model(model);
    const tokens = encoding.encode(text);
    encoding.free();
    return tokens;
};

const decodeTokens = (tokens, model = 'gpt-4o-mini') => {
    const encoding = encoding_for_model(model);
    const decodedTokens = encoding.decode(tokens);
    encoding.free();
    return new TextDecoder('utf-8').decode(decodedTokens);
};

export { countTokens, encodeTokens, decodeTokens };
