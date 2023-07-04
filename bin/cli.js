"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cli = void 0;
const config_1 = __importDefault(require("./config"));
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const qrcode_1 = __importDefault(require("qrcode"));
const fs_1 = __importDefault(require("fs"));
async function cli(program) {
    program
        .name(config_1.default.name)
        .description(config_1.default.description)
        .version(config_1.default.version, '-v', '--version');
    program
        .argument('[data]', 'data to be encoded in qrcode', null)
        .option('-f, --format <format>', "format of qr code (valid formats: 'png' | 'svg' | 'jpeg' | 'base64')", 'png')
        .option('-o, --output <filename>', 'output qr code to file')
        .option('-s, --small', 'whether or not to generate smaller sized qr code (this only applies to png and jpeg format when print code to console)', false)
        .action(async (data, options) => {
        if (data == null) {
            program.error(chalk_1.default.redBright('data is required!'));
            program.help();
        }
        const { output, format, small } = options;
        if (output != null) {
            const outputFileExtension = path_1.default.extname(output) || '.png';
            const outputFileName = path_1.default.basename(output, outputFileExtension);
            const outputDir = path_1.default.dirname(output);
            console.log(outputDir);
            console.log(outputFileName);
            console.log(outputFileExtension);
            const outputFilePath = path_1.default.join(outputDir, outputFileName.concat(outputFileExtension));
            const qrCode = await qrcode_1.default.toBuffer(data, { type: "png" });
            console.log(qrCode);
            fs_1.default.writeFileSync(outputFilePath, qrCode);
        }
        else {
            let qrCode;
            switch (format) {
                case 'svg':
                    qrCode = await qrcode_1.default.toString(data, { type: "svg" });
                    break;
                case 'base64':
                    qrCode = (await qrcode_1.default.toDataURL(data)).split(',')[1];
                    break;
                case 'base64:png':
                    qrCode = await qrcode_1.default.toDataURL(data, { type: 'image/png' });
                    break;
                case 'base64:jpeg':
                    qrCode = await qrcode_1.default.toDataURL(data, { type: 'image/jpeg' });
                    break;
                case 'base64:webp':
                    qrCode = await qrcode_1.default.toDataURL(data, { type: 'image/webp' });
                    break;
                default:
                    qrCode = await qrcode_1.default.toString(data, { type: 'terminal', small });
            }
            console.log(qrCode);
        }
    });
    await program.parseAsync();
}
exports.cli = cli;
