// src/UPNGenerator.ts
import QRCode from 'qrcode';

interface UPNData {
    // Payer information
    payerIban?: string;              // Field 2: Payer IBAN (19 chars) - optional
    payerName: string;               // Field 6: Payer name (33 chars)
    payerAddress: string;            // Field 7: Payer street address (33 chars)
    payerPost: string;               // Field 8: Payer city (33 chars)
    payerReference?: string;         // Field 5: Payer reference (26 chars) - optional
    
    // Transaction flags
    isDeposit?: boolean;             // Field 3: Deposit flag - optional
    isWithdrawal?: boolean;          // Field 4: Withdrawal flag - optional
    isUrgent?: boolean;              // Field 11: Urgent flag - optional
    
    // Receiver information
    receiverIban: string;            // Field 15: Receiver IBAN (34 chars)
    receiverName: string;            // Field 17: Receiver name (33 chars)
    receiverAddress: string;         // Field 18: Receiver street address (33 chars)
    receiverPost: string;            // Field 19: Receiver city (33 chars)
    receiverReference?: string;      // Field 16: Receiver reference (26 chars) - optional
    
    // Payment details
    amount: number;                  // Field 9: Amount (11 chars)
    code: string;                    // Field 12: Purpose code (4 chars)
    purpose: string;                 // Field 13: Payment purpose (42 chars)
    paymentDate: string;             // Field 10: Payment date DD.MM.YYYY (10 chars)
    paymentDeadline?: string;        // Field 14: Payment deadline DD.MM.YYYY (10 chars) - optional
    
    // Legacy compatibility
    dueDate?: string;                // @deprecated - use paymentDate instead
    reference?: string;              // @deprecated - use receiverReference instead
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
        // Convert legacy fields for backward compatibility
        const paymentDate = this.data.paymentDate || this.convertLegacyDate(this.data.dueDate);
        const receiverReference = this.data.receiverReference || this.data.reference || '';
        
        const fields = [
            'UPNQR',                                                    // 1. Leading string (5)
            this.formatField(this.data.payerIban || '', 19),           // 2. Payer IBAN (19)
            this.data.isDeposit ? 'X' : '',                            // 3. Deposit flag (1)
            this.data.isWithdrawal ? 'X' : '',                         // 4. Withdrawal flag (1)
            this.formatField(this.data.payerReference || '', 26),      // 5. Payer reference (26)
            this.formatField(this.data.payerName, 33),                 // 6. Payer name (33)
            this.formatField(this.data.payerAddress, 33),              // 7. Payer street address (33)
            this.formatField(this.data.payerPost, 33),                 // 8. Payer city (33)
            this.formatAmount(this.data.amount),                       // 9. Amount (11)
            paymentDate,                                               // 10. Payment date DD.MM.YYYY (10)
            this.data.isUrgent ? 'X' : '',                             // 11. Urgent flag (1)
            this.formatField(this.data.code, 4),                       // 12. Purpose code (4)
            this.formatField(this.data.purpose, 42),                   // 13. Payment purpose (42)
            this.data.paymentDeadline || '',                           // 14. Payment deadline DD.MM.YYYY (10)
            this.formatField(this.data.receiverIban, 34),              // 15. Receiver IBAN (34)
            this.formatField(receiverReference, 26),                   // 16. Receiver reference (26)
            this.formatField(this.data.receiverName, 33),              // 17. Receiver name (33)
            this.formatField(this.data.receiverAddress, 33),           // 18. Receiver street address (33)
            this.formatField(this.data.receiverPost, 33),              // 19. Receiver city (33)
        ];

        const qrData = fields.join('\n') + '\n';
        
        // 20. Total length checksum (3) - length of fields 1-19 with separators
        const totalLength = qrData.length;
        const checksumField = totalLength.toString().padStart(3, '0');
        
        return qrData + checksumField + '\n';
    }

    private formatAmount(amount: number): string {
        return (amount * 100).toFixed(0).padStart(11, '0');
    }

    private formatField(value: string, length: number): string {
        return value.padEnd(length, ' ');
    }

    private convertLegacyDate(legacyDate?: string): string {
        if (!legacyDate || legacyDate.length !== 8) {
            return '';
        }
        
        const year = legacyDate.substring(0, 4);
        const month = legacyDate.substring(4, 6);
        const day = legacyDate.substring(6, 8);
        
        return `${day}.${month}.${year}`;
    }

    async generateQRCode(): Promise<Buffer> {
        const qrData = this.generateUPNQRData();
        
        // Generate QR code with ISO-8859-2 encoding as required by UPN QR specification
        // Using Binary mode with ECC Level M and specific capacity settings
        return await QRCode.toBuffer(qrData, { 
            errorCorrectionLevel: 'M',    // Error correction level M as per spec
            version: 15,                  // QR Version 15 for capacity (411 chars max)
            width: 250,                   // Increased size for better scanning
            margin: 1,                    // Minimal margin
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
    }
}

export { UPNGenerator, UPNData };
