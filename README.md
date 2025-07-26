# UPN with QR Generator

TypeScript library for generating Slovenian UPN (Univerzalni Plačilni Nalog) payment slips with QR codes, compliant with the 2024 banking standard.

## Installation

```bash
npm install upn-with-qr-generator
```

### System Requirements

For PNG generation, the following system packages are required:

**Ubuntu/Debian:**
```bash
sudo apt-get install libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++
```

**macOS:**
```bash
brew install cairo pango libpng jpeg giflib librsvg
```

## Quick Start

```typescript
import { UPNGenerator, UPNWriter } from 'upn-with-qr-generator';

// Generate UPN data and QR code
const generator = new UPNGenerator();
const upnData = generator.generateUPN({
  payer: "Janez Novak",
  payerAddress: "Dunajska cesta 1",
  payerPost: "1000 Ljubljana",
  amount: "25.50",
  purpose: "Članarina januar 2024",
  bankAccount: "SI56610000019840242",
  bankName: "NLB d.d.",
  bic: "LJBASI2X",
  reference: "SI99123456789"
});

// Generate PNG image (requires canvas)
const writer = new UPNWriter();
const pngBuffer = await writer.generatePNG(upnData);

// QR code only (no canvas required)
const qrCode = upnData.qrCode; // Base64 QR code image
```

## API Reference

### UPNGenerator

```typescript
interface UPNData {
  payer: string;
  payerAddress: string;
  payerPost: string;
  amount: string;
  purpose: string;
  bankAccount: string;
  bankName: string;
  bic: string;
  reference: string;
}

const generator = new UPNGenerator();
const result = generator.generateUPN(data: UPNData);
```

### UPNWriter

```typescript
const writer = new UPNWriter();
const pngBuffer = await writer.generatePNG(upnData);
```

## Environment Compatibility

### ⚠️ Next.js / Serverless Limitations

This package uses the `canvas` library for PNG generation, which **is not compatible** with:
- Next.js server-side rendering (especially with Turbopack)
- Vercel serverless functions
- Most serverless environments

### Workarounds

1. **Client-side only**: Use in browser environments
2. **QR code only**: Use `upnData.qrCode` without PNG generation
3. **Separate service**: Run PNG generation in a dedicated Node.js service
4. **Environment detection**: Conditionally import canvas-dependent code

```typescript
// Environment-safe usage
let pngBuffer;
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
  // Only use PNG generation in development server environments
  const writer = new UPNWriter();
  pngBuffer = await writer.generatePNG(upnData);
}
```

## Output Format

The generated UPN complies with the 2024 Slovenian banking standard and includes:
- Formatted payment slip layout
- QR code with payment data
- All required fields and validation
- PNG image output (when canvas is available)

## License

MIT License - see [LICENSE](LICENSE) file for details.

A comprehensive TypeScript library for generating Slovenian UPN (Univerzalni Plačilni Nalog) payment slips with QR codes, compliant with the 2024 banking standard.

## 🏦 What is UPN?

UPN (Univerzalni Plačilni Nalog) is the standardized payment slip system used in Slovenia. This library generates both:
- **Complete UPN payment forms** - Visual payment slips ready for printing
- **QR codes** - Machine-readable payment data for mobile banking apps

## ✨ Features

- ✅ **2024 UPN QR Standard Compliant** - 20-field format that works with modern banking apps
- ✅ **Backward Compatible** - Automatically converts legacy data to new format
- ✅ **TypeScript Support** - Full type definitions included
- ✅ **Dual Output** - Generate QR codes only or complete UPN payment forms
- ✅ **Mobile Banking Ready** - QR codes scan correctly in current banking apps
- ✅ **Environment Aware** - Works in Node.js servers, graceful fallback in serverless
- ✅ **Canvas-based Rendering** - High-quality PNG output for payment slips

## 📦 Installation

```bash
npm install upn-with-qr-generator
```

### System Requirements

This package requires the `canvas` library for generating UPN payment slips. On some systems, you may need to install additional dependencies:

**Ubuntu/Debian:**
```bash
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

**macOS:**
```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

**Windows:** See [node-canvas installation guide](https://github.com/Automattic/node-canvas/wiki/Installation:-Windows)

## 🚀 Quick Start

### Basic Usage (New Format)

```typescript
import { UPNGenerator, UPNWriter } from 'upn-with-qr-generator';

const upnData = {
  // Payer information
  payerName: 'Janez Novak',
  payerAddress: 'Dunajska cesta 1',
  payerPost: '1000 Ljubljana',
  
  // Receiver information
  receiverIban: 'SI56610000019840242',
  receiverName: 'Mercator d.d.',
  receiverAddress: 'Einspielerjeva 7',
  receiverPost: '1000 Ljubljana',
  receiverReference: 'SI99123456789',
  
  // Payment details
  amount: 25.50,
  code: 'OTHR',
  purpose: 'Članarina januar 2024',
  paymentDate: '31.01.2024'
};

// Generate QR code only
const generator = new UPNGenerator(upnData);
const qrData = generator.generateUPNQRData();
const qrBuffer = await generator.generateQRCode();

// Generate complete UPN payment slip
const writer = new UPNWriter(upnData);
await writer.saveAsPNG('./payment-slip.png');
const base64Image = await writer.png();
```

### Legacy Data Support

The library automatically converts legacy field names for backward compatibility:

```typescript
// Legacy format (still supported)
const legacyData = {
  payerName: 'Janez Novak',
  // ... other fields
  reference: 'SI99123456789',  // ← Legacy field
  dueDate: '20240131'          // ← Legacy format (YYYYMMDD)
};

// Automatically converted to:
// receiverReference: 'SI99123456789'
// paymentDate: '31.01.2024'
```

## 📚 Field Reference

### Required Fields

| Field | Type | Max Length | Description |
|-------|------|------------|-------------|
| `payerName` | string | 33 chars | Full name of the payer |
| `payerAddress` | string | 33 chars | Street address of the payer |
| `payerPost` | string | 33 chars | City and postal code of the payer |
| `receiverIban` | string | 34 chars | IBAN of the payment receiver |
| `receiverName` | string | 33 chars | Name of the payment receiver |
| `receiverAddress` | string | 33 chars | Address of the payment receiver |
| `receiverPost` | string | 33 chars | City and postal code of the receiver |
| `amount` | number | - | Payment amount (in EUR) |
| `code` | string | 4 chars | Purpose code (e.g., 'OTHR', 'SALA') |
| `purpose` | string | 42 chars | Payment description |
| `paymentDate` | string | 10 chars | Payment date in DD.MM.YYYY format |

### Optional Fields

| Field | Type | Max Length | Description |
|-------|------|------------|-------------|
| `payerIban` | string | 19 chars | IBAN of the payer (optional) |
| `payerReference` | string | 26 chars | Payer's reference number |
| `receiverReference` | string | 26 chars | Receiver's reference number |
| `paymentDeadline` | string | 10 chars | Payment deadline in DD.MM.YYYY format |
| `isDeposit` | boolean | - | Mark as deposit transaction |
| `isWithdrawal` | boolean | - | Mark as withdrawal transaction |
| `isUrgent` | boolean | - | Mark as urgent payment |

### 📅 Date Fields Explained

- **`paymentDate`**: When the payment should be processed (DD.MM.YYYY)
- **`paymentDeadline`**: Latest date for payment (DD.MM.YYYY, optional)
- **Legacy `dueDate`**: Automatically converted from YYYYMMDD to DD.MM.YYYY format

## 🛠️ API Reference

### UPNGenerator

Handles QR code generation and data formatting.

```typescript
const generator = new UPNGenerator(upnData);

// Generate QR code data string (20 fields)
const qrData = generator.generateUPNQRData();

// Generate QR code as PNG buffer
const qrBuffer = await generator.generateQRCode();

// Get the underlying data
const data = generator.getData();
```

### UPNWriter

Handles complete UPN payment slip generation with canvas.

```typescript
const writer = new UPNWriter(upnData);

// Check if PNG generation is available
const canGeneratePNG = writer.isPNGGenerationAvailable();

// Save complete UPN form as PNG file (if canvas available)
await writer.saveAsPNG('./output.png');

// Get UPN form as base64 string (if canvas available)
const base64 = await writer.png();

// Get UPN form as buffer (if canvas available)
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
  dueDate: '20240711' // YYYYMMDD
}
```

**After (v2.0.0+):**
```typescript
{
  receiverReference: 'SI99',
  paymentDate: '11.07.2024' // DD.MM.YYYY
}
```

## 📱 Mobile Banking Compatibility

This library generates QR codes compliant with:
- ✅ Current Slovenian UPN QR standard (2024)
- ✅ 20-field format required by modern banking apps
- ✅ Proper field lengths and encoding
- ✅ ISO-8859-2 character encoding support

Tested with major Slovenian banks:
- NLB Klik
- SKB mobilno
- Delavska hranilnica
- Banka Sparkasse

## 🚨 Environment Compatibility

### ⚠️ Next.js / Serverless Limitations

The `UPNWriter` class uses the `canvas` package which may not work in serverless environments or with Next.js Turbopack. The library handles this gracefully:

**v2.0.0+ Behavior:**
- **Regular Node.js servers** ✅ - Full UPN generation with images
- **Serverless environments** ✅ - Graceful fallback to QR-only mode
- **Clear feedback** - Use `isPNGGenerationAvailable()` to check capabilities

**Workarounds for serverless:**

1. **Use QR generation only:**
```typescript
const generator = new UPNGenerator(upnData);
const qrBuffer = await generator.generateQRCode(); // Works in server environments
```

2. **Check canvas availability:**
```typescript
const writer = new UPNWriter(upnData);
if (writer.isPNGGenerationAvailable()) {
  const png = await writer.png(); // Full UPN image
} else {
  const qr = await generator.generateQRCode(); // QR only
}
```

3. **Client-side UPN generation:**
```typescript
// Generate UPN forms in the browser where canvas is available
```

## 🏗️ Architecture

```
upn-with-qr-generator/
├── src/
│   ├── UPNGenerator.ts    # QR code generation and data formatting
│   ├── UPNWriter.ts       # Canvas-based UPN slip rendering
│   └── index.ts           # Public API exports
├── assets/
│   ├── upn_sl.png         # UPN form template
│   └── courbd.ttf         # Courier Bold font
└── test/                  # Generated test examples
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Issues and pull requests are welcome! Please ensure:

1. **Test with real banking apps** - Verify QR codes scan correctly
2. **Follow TypeScript conventions** - Maintain type safety
3. **Update tests** - Add test cases for new features
4. **Document changes** - Update README for API changes
