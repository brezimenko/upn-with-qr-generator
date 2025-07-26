// src/UPNWriter.ts
import fs from 'fs';
import path from 'path';
import { UPNGenerator, UPNData } from './UPNGenerator';

class UPNWriter {
    private upnGenerator: UPNGenerator;
    private canvas: any;
    private canvasAvailable: boolean = false;

    constructor(data: UPNData) {
        this.upnGenerator = new UPNGenerator(data);
        this.initializeCanvas();
    }

    private initializeCanvas() {
        try {
            // Try to load canvas - this should work in regular Node.js environments
            const { createCanvas, loadImage, registerFont } = require('canvas');
            this.canvas = { createCanvas, loadImage, registerFont };
            this.canvasAvailable = true;
            
            // Register the Courier Bold font only when canvas is available
            try {
                // Use require.resolve to find the correct package location
                const packageRoot = path.dirname(require.resolve('upn-with-qr-generator/package.json'));
                const fontPath = path.join(packageRoot, 'assets', 'courbd.ttf');
                registerFont(fontPath, { family: 'Courier Bold' });
            } catch (fontError: any) {
                console.warn('Could not register Courier Bold font:', fontError instanceof Error ? fontError.message : String(fontError));
            }
        } catch (error: any) {
            // Canvas not available (likely serverless environment or missing dependencies)
            console.warn('Canvas not available in this environment:', error instanceof Error ? error.message : String(error));
            this.canvasAvailable = false;
        }
    }

    // Method to generate the UPN image on the canvas
    private async generateCanvas(): Promise<any> {
        if (!this.canvasAvailable) {
            throw new Error(
                'PNG generation requires canvas library which is not available in this environment. ' +
                'Use QR code generation only or run in a Node.js environment with canvas support.'
            );
        }

        // Use require.resolve to find the correct package location
        const packageRoot = path.dirname(require.resolve('upn-with-qr-generator/package.json'));
        const templatePath = path.join(packageRoot, 'assets', 'upn_sl.png');
        const templateImage = await this.canvas.loadImage(templatePath);

        const canvas = this.canvas.createCanvas(templateImage.width, templateImage.height);
        const context = canvas.getContext('2d');
        context.drawImage(templateImage, 0, 0);

        const largeFontSize = '24px';
        const smallFontSize = '20px';

        context.fillStyle = '#000';

        // Draw QR code with 10% increased size (242x242)
        const qrCodeBuffer = await this.upnGenerator.generateQRCode();
        context.drawImage(await this.canvas.loadImage(qrCodeBuffer), 415, 42, 250, 250);

        const data = this.upnGenerator.getData();

        // Large text fields
        context.font = `${largeFontSize} "Courier Bold"`;
        context.fillText(data.payerName || '', 697, 170);
        context.fillText(data.payerAddress || '', 697, 201);
        context.fillText(data.payerPost || '', 697, 233);
        context.fillText(data.receiverName || '', 418, 507);
        context.fillText(data.receiverAddress || '', 418, 538);
        context.fillText(data.receiverPost || '', 418, 570);
        context.fillText(data.receiverIban || '', 418, 400);
        
        // Handle receiver reference (new structure with fallback to legacy)
        const receiverRef = data.receiverReference || data.reference || '';
        context.fillText(this.getReferencePrefix(receiverRef), 418, 451);
        context.fillText(this.getReferenceSuffix(receiverRef), 528, 451);
        
        context.fillText(data.purpose || '', 528, 340);
        context.fillText(data.code || '', 418, 340);
        context.fillText('***' + this.formatAmount(data.amount), 750, 285);

        // Handle payment date (new DD.MM.YYYY format vs legacy YYYYMMDD)
        const paymentDate = data.paymentDate || this.convertLegacyDate(data.dueDate);
        if (paymentDate) {
            context.fillText(paymentDate, 1155, 340);
        }

        // Small text fields
        context.font = `${smallFontSize} "Courier Bold"`;
        context.fillText(data.payerName || '', 30, 62);
        context.fillText(data.payerAddress || '', 30, 87);
        context.fillText(data.payerPost || '', 30, 112);
        context.fillText(data.receiverName || '', 30, 405);
        context.fillText(data.receiverAddress || '', 30, 430);
        context.fillText(data.receiverPost || '', 30, 455);
        context.fillText(data.receiverIban || '', 30, 300);
        context.fillText(receiverRef, 30, 351);
        context.fillText(data.purpose || '', 30, 165);

        if (paymentDate) {
            context.fillText(paymentDate, 30, 180);
        }

        return canvas;
    }

    // Save as PNG file
    async saveAsPNG(outputPath: string): Promise<void> {
        if (!this.canvasAvailable) {
            throw new Error(
                'PNG generation requires canvas library which is not available in this environment. ' +
                'Use QR code generation only or run in a Node.js environment with canvas support.'
            );
        }

        const canvas = await this.generateCanvas();
        const out = fs.createWriteStream(outputPath);
        const stream = canvas.createPNGStream();
        stream.pipe(out);
        out.on('finish', () => console.log(`UPN image saved as ${outputPath}`));
    }

    // Get PNG as a base64 string
    async png(): Promise<string> {
        if (!this.canvasAvailable) {
            throw new Error(
                'PNG generation requires canvas library which is not available in this environment. ' +
                'Use QR code generation only or run in a Node.js environment with canvas support.'
            );
        }

        const canvas = await this.generateCanvas();
        return canvas.toDataURL('image/png').split(',')[1]; // Remove "data:image/png;base64,"
    }

    // Get image buffer (equivalent to GD resource in PHP)
    async gdResource(): Promise<Buffer> {
        if (!this.canvasAvailable) {
            throw new Error(
                'PNG generation requires canvas library which is not available in this environment. ' +
                'Use QR code generation only or run in a Node.js environment with canvas support.'
            );
        }

        const canvas = await this.generateCanvas();
        return canvas.toBuffer('image/png');
    }

    // Add method to check if PNG generation is available
    isPNGGenerationAvailable(): boolean {
        return this.canvasAvailable;
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

    private convertLegacyDate(date?: string): string {
        if (!date || date.length !== 8) {
            return '';
        }
        return `${date.slice(6, 8)}.${date.slice(4, 6)}.${date.slice(0, 4)}`;
    }
}

export { UPNWriter };
