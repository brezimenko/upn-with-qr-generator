// src/index.ts
import { UPNWriter } from './UPNWriter';
import path from 'path';

const upnData = {
    payerName: 'Janez Novak',
    payerAddress: 'Dunajska ulica 1',
    payerPost: '1000 Ljubljana',
    receiverName: 'RentaCar d.o.o.',
    receiverAddress: 'Pohorska ulica 22',
    receiverPost: '2000 Maribor',
    receiverIban: 'SI56020170014356205',
    amount: 300.24,
    code: 'RENT',
    reference: 'SI121234567890120',
    purpose: 'Plačilo najemnine za marec',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10).replace(/-/g, '')
};

const upnWriter = new UPNWriter(upnData);

// Save as PNG file
const outputPath = path.join(__dirname, '../UPNFinal.png');
upnWriter.saveAsPNG(outputPath);

// Get PNG as a base64 string
upnWriter.png().then(base64String => {
    console.log('Base64 PNG:', base64String);
});

// Get PNG as a Buffer
upnWriter.gdResource().then(buffer => {
    console.log('Image Buffer:', buffer);
});

// src/index.ts
export { UPNGenerator, UPNData } from './UPNGenerator';
export { UPNWriter } from './UPNWriter';
