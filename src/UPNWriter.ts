// src/UPNWriter.ts
import { createCanvas, Canvas, loadImage, registerFont } from 'canvas';
import fs from 'fs';
import path from 'path';
import { UPNGenerator, UPNData } from './UPNGenerator';

// Register the Courier Bold font
registerFont(path.join(__dirname, '../assets/courbd.ttf'), { family: 'Courier Bold' });

class UPNWriter {
    private upnGenerator: UPNGenerator;

    constructor(data: UPNData) {
        this.upnGenerator = new UPNGenerator(data);
    }

    // Method to generate the UPN image on the canvas
    private async generateCanvas(): Promise<Canvas> {
        const templatePath = path.join(__dirname, '../assets/upn_sl.png');
        const templateImage = await loadImage(templatePath);

        const canvas = createCanvas(templateImage.width, templateImage.height);
        const context = canvas.getContext('2d');
        context.drawImage(templateImage, 0, 0);

        const largeFontSize = '24px';
        const smallFontSize = '20px';

        context.fillStyle = '#000';

        // Draw QR code with 10% increased size (242x242)
        const qrCodeBuffer = await this.upnGenerator.generateQRCode();
        context.drawImage(await loadImage(qrCodeBuffer), 415, 42, 250, 250);

        const data = this.upnGenerator.getData();

        // Large text fields
        context.font = `${largeFontSize} "Courier Bold"`;
        context.fillText(data.payerName, 697, 170);
        context.fillText(data.payerAddress, 697, 201);
        context.fillText(data.payerPost, 697, 233);
        context.fillText(data.receiverName, 418, 507);
        context.fillText(data.receiverAddress, 418, 538);
        context.fillText(data.receiverPost, 418, 570);
        context.fillText(data.receiverIban, 418, 400);
        context.fillText(this.getReferencePrefix(data.reference), 418, 451);
        context.fillText(this.getReferenceSuffix(data.reference), 528, 451);
        context.fillText(data.purpose, 528, 340);
        context.fillText(data.code, 418, 340);
        context.fillText('***' + this.formatAmount(data.amount), 750, 285);

        if (data.dueDate) {
            const formattedDate = this.formatDate(data.dueDate);
            context.fillText(formattedDate, 1155, 340);
        }

        // Small text fields
        context.font = `${smallFontSize} "Courier Bold"`;
        context.fillText(data.payerName, 30, 62);
        context.fillText(data.payerAddress, 30, 87);
        context.fillText(data.payerPost, 30, 112);
        context.fillText(data.receiverName, 30, 405);
        context.fillText(data.receiverAddress, 30, 430);
        context.fillText(data.receiverPost, 30, 455);
        context.fillText(data.receiverIban, 30, 300);
        context.fillText(data.reference, 30, 351);
        context.fillText(data.purpose, 30, 165);

        if (data.dueDate) {
            const formattedDate = this.formatDate(data.dueDate);
            context.fillText(formattedDate, 30, 195);
        }

        context.fillText('***' + this.formatAmount(data.amount), 110, 247);

        return canvas;
    }

    // Save as PNG file
    async saveAsPNG(outputPath: string): Promise<void> {
        const canvas = await this.generateCanvas();
        const out = fs.createWriteStream(outputPath);
        const stream = canvas.createPNGStream();
        stream.pipe(out);
        out.on('finish', () => console.log(`UPN image saved as ${outputPath}`));
    }

    // Get PNG as a base64 string
    async png(): Promise<string> {
        const canvas = await this.generateCanvas();
        return canvas.toDataURL('image/png').split(',')[1]; // Remove "data:image/png;base64,"
    }

    // Get image buffer (equivalent to GD resource in PHP)
    async gdResource(): Promise<Buffer> {
        const canvas = await this.generateCanvas();
        return canvas.toBuffer('image/png');
    }

    private getReferencePrefix(reference: string): string {
        return reference.slice(0, 4);
    }

    private getReferenceSuffix(reference: string): string {
        return reference.slice(4);
    }

    private formatDate(date: string): string {
        return `${date.slice(6, 8)}.${date.slice(4, 6)}.${date.slice(0, 4)}`;
    }

    private formatAmount(amount: number): string {
        return amount.toFixed(2);
    }
}

export { UPNWriter };
