# UPN QR Generator

A TypeScript library for generating UPN + QR codes for Slovenian banks, **fully compliant with the 2024 UPN QR standard**. This library generates QR codes that work with modern mobile banking applications.

Originally a TypeScript rewrite of [this PHP library](https://github.com/Media24si/UpnGenerator), now updated to support the current 20-field UPN QR format.

## ✨ Features

- ✅ **2024 UPN QR Standard Compliant** - 20-field format that works with modern banking apps
- ✅ **Backward Compatible** - Automatically converts legacy data to new format
- ✅ **TypeScript Support** - Full type definitions included
- ✅ **Dual Output** - Generate QR codes only or complete UPN payment forms
- ✅ **Mobile Banking Ready** - QR codes scan correctly in current banking apps

## 📦 Installation

```bash
npm install upn-with-qr-generator
```

## 🚀 Quick Start

### Basic Usage (New Format)

```typescript
import { UPNGenerator, UPNWriter } from 'upn-with-qr-generator';

// Complete UPN data with new 2024 standard fields
const upnData = {
  // Payer information
  payerIban: 'SI56040010019981504',        // Optional: Payer's IBAN
  payerName: 'Janez Novak',
  payerAddress: 'Dunajska ulica 1',
  payerPost: '1000 Ljubljana',
  payerReference: 'SI99',                   // Optional: Payer's reference
  
  // Transaction flags
  isDeposit: false,                        // Optional: Deposit flag
  isWithdrawal: false,                     // Optional: Withdrawal flag  
  isUrgent: true,                          // Optional: Urgent payment flag
  
  // Receiver information
  receiverIban: 'SI56040010049226422',     // Required: Receiver's IBAN
  receiverName: 'Test podjetje d.o.o.',
  receiverAddress: 'Testna ulica 1',
  receiverPost: '2000 Maribor',
  receiverReference: 'SI99',               // Optional: Receiver's reference
  
  // Payment details
  amount: 1268.74,                         // Required: Payment amount
  code: 'CPYR',                           // Required: Payment code
  purpose: 'Plačilo računa 18/2024',     // Required: Payment purpose
  paymentDate: '11.07.2024',             // Optional: Desired execution date (DD.MM.YYYY)
  paymentDeadline: '25.07.2024'          // Optional: Latest completion date (DD.MM.YYYY)
};

// Generate QR code only
const generator = new UPNGenerator(upnData);
const qrBuffer = await generator.generateQRCode();

// Generate complete UPN form with QR code
const writer = new UPNWriter(upnData);
await writer.saveAsPNG('./upn-form.png');
```

### Legacy Data Support

The library automatically converts legacy format data to the new standard:

```typescript
// Legacy format (still supported)
const legacyData = {
  payerName: 'Janez Novak',
  payerAddress: 'Dunajska ulica 1', 
  payerPost: '1000 Ljubljana',
  receiverName: 'Test podjetje d.o.o.',
  receiverAddress: 'Testna ulica 1',
  receiverPost: '2000 Maribor',
  receiverIban: 'SI56040010049226422',
  amount: 100.50,
  code: 'RENT',
  reference: 'SI99',                      // Automatically mapped to receiverReference
  purpose: 'Test payment',
  dueDate: '20240711'                     // YYYYMMDD format, auto-converted to DD.MM.YYYY
};

const generator = new UPNGenerator(legacyData);
// Automatically generates 20-field compliant QR code
```

## 📚 Field Reference

### Required Fields

- `receiverIban` - Receiver's IBAN (34 chars, padded)
- `receiverName` - Receiver's name (33 chars, padded)  
- `receiverAddress` - Receiver's address (33 chars, padded)
- `receiverPost` - Receiver's postal code and city (33 chars, padded)
- `amount` - Payment amount (number, formatted to 11 chars)
- `code` - Payment code (4 chars)
- `purpose` - Payment purpose (42 chars, padded)

### Optional Fields  

- `payerIban` - Payer's IBAN (19 chars if provided)
- `payerName` - Payer's name (33 chars, padded)
- `payerAddress` - Payer's address (33 chars, padded)
- `payerPost` - Payer's postal code and city (33 chars, padded)
- `payerReference` - Payer's reference (26 chars, padded)
- `receiverReference` - Receiver's reference (26 chars, padded)
- `isDeposit` - Deposit transaction flag (boolean)
- `isWithdrawal` - Withdrawal transaction flag (boolean)
- `isUrgent` - Urgent payment flag (boolean)
- `paymentDate` - Desired execution date (DD.MM.YYYY format)
- `paymentDeadline` - Latest completion date (DD.MM.YYYY format)

### 📅 Date Fields Explained

- **`paymentDate`** - When you want the payment to be processed (execution date)
- **`paymentDeadline`** - Latest date by which payment must be completed

Example:

```typescript
{
  paymentDate: '15.12.2024',      // Process on December 15th
  paymentDeadline: '20.12.2024'   // Must complete by December 20th
}
```

## 🛠️ API Reference

### UPNGenerator

```typescript
const generator = new UPNGenerator(upnData);

// Generate QR code data string (20 fields)
const qrData = generator.generateUPNQRData();

// Generate QR code as PNG buffer  
const qrBuffer = await generator.generateQRCode();
```

### UPNWriter

```typescript
const writer = new UPNWriter(upnData);

// Save complete UPN form as PNG file
await writer.saveAsPNG('./output.png');

// Get UPN form as base64 string
const base64 = await writer.png();

// Get UPN form as buffer
const buffer = await writer.gdResource();
```

## 🧪 Testing

Generate test QR codes to verify mobile banking compatibility:

```bash
npm run test:examples
```

This creates test PNG files in `./test/` directory that you can scan with your mobile banking app.

## 🔄 Migration from v1.0.x

The library maintains backward compatibility, but for best results with modern banking apps, update your usage:

**Before (v1.0.x):**
```typescript
{
  reference: 'SI99',
  dueDate: '20240711'  // YYYYMMDD
}
```

**After (v1.1.0+):**
```typescript
{
  receiverReference: 'SI99',
  paymentDate: '11.07.2024'  // DD.MM.YYYY
}
```

## 📱 Mobile Banking Compatibility  

This library generates QR codes compliant with:

- ✅ Current Slovenian UPN QR standard (2024)
- ✅ 20-field format required by modern banking apps
- ✅ Proper field lengths and encoding
- ✅ ISO-8859-2 character encoding support

## 📄 License

MIT

## 🤝 Contributing

Issues and pull requests are welcome!
