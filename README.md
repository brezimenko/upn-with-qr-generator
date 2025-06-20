# UPN Generator

A TypeScript library for generating UPN + QR codes for Slovenian banks, complete with customizable fields and QR code export options.
Essentially just a javascript rewrite of [this PHP library](https://github.com/Media24si/UpnGenerator) with the same functionality.

## Installation

Install via npm:

```bash
npm install upn-with-qr-generator
```

## Usage

```typescript
import { UPNGenerator, UPNWriter } from 'upn-generator';

// Define UPN data
const upnData = {
  payerName: 'Janez Novak',
  payerAddress: 'Dunajska ulica 1',
  payerPost: '1000 Ljubljana',
  receiverName: 'RentaCar d.o.o.',
  receiverAddress: 'Pohorska ulica 22',
  receiverPost: '2000 Maribor',
  receiverIban: 'SI56040010019981506',
  amount: 300.24,
  code: 'RENT',
  reference: 'SI99',
  purpose: 'Plačilo najemnine za marec',
  dueDate: '20231001'  // Format YYYYMMDD
};

// Create a UPN writer
const upnWriter = new UPNWriter(upnData);

// Save as PNG
upnWriter.saveAsPNG('./output/UPNFinal.png');

// Get as base64 string
upnWriter.png().then(base64String => {
  console.log('Base64 PNG:', base64String);
});

// Get as image buffer
upnWriter.gdResource().then(buffer => {
  console.log('Image Buffer:', buffer);
});
```

Above example will output:

![Upn Example](https://raw.githubusercontent.com/Media24si/UpnGenerator/master/example.png)


## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
# upn-with-qr-generator
