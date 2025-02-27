import '@testing-library/jest-dom';

if (typeof global.TextEncoder === "undefined") {
    global.TextEncoder = require("util").TextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
    const { TextDecoder } = require("util");
    global.TextDecoder = TextDecoder as unknown as {
        new(label?: string, options?: TextDecoderOptions): TextDecoder;
        prototype: TextDecoder;
    };
}
