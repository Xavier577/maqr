import type {Command} from "commander";
import config from "./config";
import chalk from "chalk";
import path from "path";
import QRCode from "qrcode";
import fs from "fs";

export async function cli(program: Command) {
    program
        .name(config.name)
        .description(config.description)
        .version(config.version, '-v', '--version')


    program
        .argument('[data]', 'data to be encoded in qrcode', null)
        .option('-f, --format <format>', "format of qr code (valid formats: 'png' | 'svg' | 'jpeg' | 'base64')", 'png')
        .option('-o, --output <filename>', 'output qr code to file')
        .option('-s, --small', 'whether or not to generate smaller sized qr code (this only applies to png and jpeg format when print code to console)', false)
        .action(async (data, options) => {

            if (data == null) {
                console.error(chalk.redBright('[data] is required!'))
                program.help()
            }

            const {output, format, small} = options;


            if (output != null) {
                const outputFileExtension = path.extname(output) || '.png'
                const outputFileName = path.basename(output, outputFileExtension)
                const outputDir = path.dirname(output)

                console.log(outputDir)
                console.log(outputFileName)
                console.log(outputFileExtension)


                const outputFilePath = path.join(outputDir, outputFileName.concat(outputFileExtension))

                const qrCode = await QRCode.toBuffer(data, {type: "png"})

                console.log(qrCode)

                fs.writeFileSync(outputFilePath, qrCode)


            } else {

                let qrCode: string

                switch (format) {
                    case 'svg':
                        qrCode = await QRCode.toString(data, {type: "svg"})
                        break;
                    case 'base64':
                        qrCode = (await QRCode.toDataURL(data)).split(',')[1]
                        break;
                    case 'base64:png':
                        qrCode = await QRCode.toDataURL(data, {type: 'image/png'})
                        break;
                    case 'base64:jpeg':
                        qrCode = await QRCode.toDataURL(data, {type: 'image/jpeg'})
                        break;
                    case 'base64:webp':
                        qrCode = await QRCode.toDataURL(data, {type: 'image/webp'})
                        break;
                    default:
                        qrCode = await QRCode.toString(data, {type: 'terminal', small})
                }

                console.log(qrCode)

            }

        })


    await program.parseAsync()
}
