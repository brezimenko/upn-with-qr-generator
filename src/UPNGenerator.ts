// src/UPNGenerator.ts
import QRCode from 'qrcode';

interface UPNData {
    payerName: string;
    payerAddress: string;
    payerPost: string;
    receiverName: string;
    receiverAddress: string;
    receiverPost: string;
    receiverIban: string;
    amount: number;
    code: string;
    reference: string;
    purpose: string;
    dueDate: string; // Format YYYYMMDD
}

class UPNGenerator {
    private data: UPNData;

    constructor(data: UPNData) {
        this.data = data;
    }

    // Public getter for `data`
    public getData(): UPNData {
        return this.data;
    }

    public generateUPNQRData(): string {
        const fields = [
            'UPNQR',
            this.formatField(this.data.payerName, 33),
            this.formatField(this.data.payerAddress, 33),
            this.formatField('SI', 2),
            this.formatField(this.data.payerPost, 10),
            this.formatField(this.data.receiverName, 33),
            this.formatField(this.data.receiverAddress, 33),
            this.formatField('SI', 2),
            this.formatField(this.data.receiverPost, 10),
            this.formatAmount(this.data.amount),
            this.data.dueDate,
            this.data.code,
            this.data.reference,
            this.formatField(this.data.receiverIban, 19),
            this.data.purpose
        ];

        return fields.join('\n');
    }

    private formatAmount(amount: number): string {
        return (amount * 100).toFixed(0).padStart(11, '0');
    }

    private formatField(value: string, length: number): string {
        return value.padEnd(length, ' ');
    }

    async generateQRCode(): Promise<Buffer> {
        const qrData = this.generateUPNQRData();
        return await QRCode.toBuffer(qrData, { errorCorrectionLevel: 'M', width: 200 });
    }
}

export { UPNGenerator, UPNData };
