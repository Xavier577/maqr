import type { Command } from 'commander';
import config from './config';
import chalk from 'chalk';
import path from 'path';
import QRCode from 'qrcode';
import fs from 'fs';
import { SUPPORT_OUTPUT_FILE_FORMATS } from './const';

export async function cli(program: Command) {
  program
    .name(config.name)
    .description(config.description)
    .version(config.version, '-v', '--version');

  program
    .argument('[data]', 'data to be encoded in qrcode', null)
    .option(
      '-f, --format <format>',
      'format of qr code (supported formats: png | svg | jpeg | base64 | base64:png | base64:jpeg | base64:webp)',
      'png'
    )
    .option(
      '-o, --output <filename>',
      `output qr code to file (supported file extensions: ${SUPPORT_OUTPUT_FILE_FORMATS.join(
        ' | '
      )} )`
    )
    .option(
      '-s, --small',
      'whether or not to generate smaller sized qr code (only applies to qr code printed to the terminal)',
      false
    )
    .action(async (data, options) => {
      if (data == null) {
        console.error(chalk.redBright('[data] is required!'));
        program.help();
      }

      const { output, format, small } = options;

      if (output != null) {
        const outputFileExtension = path.extname(output) || '.png';
        const outputFileName = path.basename(output, outputFileExtension);
        const outputDir = path.dirname(output);
        const outputFilePath = path.join(
          outputDir,
          outputFileName.concat(outputFileExtension)
        );

        if (!SUPPORT_OUTPUT_FILE_FORMATS.includes(outputFileExtension)) {
          program.error(chalk.redBright('Unsupported file extension'));
        }

        if (['.png', '.jpeg', '.jpg', '.webp'].includes(outputFileExtension)) {
          const qrCode = await QRCode.toBuffer(data, { type: 'png' });

          fs.writeFileSync(outputFilePath, qrCode);

          return;
        }

        if (outputFileExtension === '.svg') {
          const qrCode = await QRCode.toString(data, { type: 'svg' });

          fs.writeFileSync(outputFilePath, qrCode);

          return;
        }

        if (outputFileExtension === '.html') {
          if (format === 'svg') {
            const qrCode = await QRCode.toString(data, { type: 'svg' });

            fs.writeFileSync(outputFilePath, qrCode);

            return;
          }

          if (['png', 'base64', 'base64:png'].includes(format)) {
            const qrCode = await QRCode.toDataURL(data, { type: 'image/png' });

            const imgTag = `<img src="${qrCode}" alt="qr_code">`;

            fs.writeFileSync(outputFilePath, imgTag);

            return;
          }

          if (['jpeg', 'base64:jpeg'].includes(format)) {
            const jpegBase64 = (await QRCode.toDataURL(data, { type: 'image/jpeg' })).split(',')[1]

            const qrCode = ['data:image/jpeg;base64', jpegBase64].join(",")

            const imgTag = `<img src="${qrCode}" alt="qr_code">`;

            fs.writeFileSync(outputFilePath, imgTag);

            return;
          }

          if (['webp', 'base64:webp'].includes(format)) {
            const webpBase64 = (await QRCode.toDataURL(data, { type: 'image/webp' })).split(',')[1]

            const qrCode = ['data:image/webp;base64', webpBase64].join(",")

            console.log(qrCode)

            const imgTag = `<img src="${qrCode}" alt="qr_code">`;

            fs.writeFileSync(outputFilePath, imgTag);

            return;
          }
        }
      } else {
        let qrCode: string;

        switch (format) {
          case 'svg':
            qrCode = await QRCode.toString(data, { type: 'svg' });
            break;
          case 'base64':
            qrCode = (await QRCode.toDataURL(data)).split(',')[1];
            break;
          case 'base64:png':
            qrCode = await QRCode.toDataURL(data, { type: 'image/png' });
            break;
          case 'base64:jpeg':
            const jpegBase64 = (await QRCode.toDataURL(data, { type: 'image/jpeg' })).split(',')[1]
            qrCode = ['data:image/jpeg;base64', jpegBase64].join(",")
            break;
          case 'base64:webp':
            const webpBase64 = (await QRCode.toDataURL(data, { type: 'image/webp' })).split(',')[1]
              qrCode = ['data:image/webp;base64', webpBase64].join(",")
            break;
          default:
            qrCode = await QRCode.toString(data, { type: 'terminal', small });
        }

        console.log(qrCode);
      }
    });

  await program.parseAsync();
}
