const { UPNGenerator, UPNWriter } = require('../dist');
const fs = require('fs');
const path = require('path');

async function generateTestPNGs() {
    console.log('=== Generating Test PNG Files ===\n');

    // Ensure test directory exists
    const testDir = path.join(__dirname, 'test');
    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
    }

    // Test data for NEW format (complete UPN QR 20-field)
    const newFormatData = {
        // Payer information
        payerIban: 'SI56040010019981506',
        payerName: 'Janez Novak',
        payerAddress: 'Dunajska ulica 1',
        payerPost: '1000 Ljubljana',
        payerReference: 'SI99',
        
        // Transaction flags
        isDeposit: false,
        isWithdrawal: false,
        isUrgent: true,
        
        // Receiver information
        receiverIban: 'SI56040010049226426',
        receiverName: 'Test podjetje d.o.o.',
        receiverAddress: 'Testna ulica 1',
        receiverPost: '2000 Maribor',
        receiverReference: 'SI99',
        
        // Payment details
        amount: 1268.74,
        code: 'CPYR',
        purpose: 'Plačilo računa 18/2024',
        paymentDate: '11.07.2024',
        paymentDeadline: '25.07.2024'
    };

    // Test data for LEGACY compatibility (minimal fields)
    const legacyData = {
        payerName: 'Janez Novak',
        payerAddress: 'Dunajska ulica 1',
        payerPost: '1000 Ljubljana',
        receiverName: 'Test podjetje d.o.o.',
        receiverAddress: 'Testna ulica 1',
        receiverPost: '2000 Maribor',
        receiverIban: 'SI56040010049226426',
        amount: 100.50,
        code: 'RENT',
        reference: 'SI99', // legacy field
        purpose: 'Test payment legacy format',
        dueDate: '20240711' // legacy YYYYMMDD format
    };

    // Simple test data (minimal required fields)
    const simpleData = {
        payerName: 'Test User',
        payerAddress: 'Test Street 1',
        payerPost: '1000 Ljubljana',
        receiverName: 'Test Company',
        receiverAddress: 'Company Street 1',
        receiverPost: '2000 Maribor',
        receiverIban: 'SI56040010049226426',
        amount: 50.00,
        code: 'OTHR',
        purpose: 'Simple test payment',
        paymentDate: '20.12.2024'
    };

    try {
        console.log('1. Generating QR-only PNG files...');
        
        // Generate QR-only PNGs
        const newGenerator = new UPNGenerator(newFormatData);
        const legacyGenerator = new UPNGenerator(legacyData);
        const simpleGenerator = new UPNGenerator(simpleData);

        const newQRBuffer = await newGenerator.generateQRCode();
        const legacyQRBuffer = await legacyGenerator.generateQRCode();
        const simpleQRBuffer = await simpleGenerator.generateQRCode();

        // Save QR-only images
        fs.writeFileSync(path.join(testDir, 'upn_qr_new_format.png'), newQRBuffer);
        fs.writeFileSync(path.join(testDir, 'upn_qr_legacy_format.png'), legacyQRBuffer);
        fs.writeFileSync(path.join(testDir, 'upn_qr_simple.png'), simpleQRBuffer);

        console.log('✓ upn_qr_new_format.png (20-field format with all features)');
        console.log('✓ upn_qr_legacy_format.png (legacy data converted to new format)');
        console.log('✓ upn_qr_simple.png (minimal required fields)');

        console.log('\n2. Generating full UPN form PNG files...');
        
        // Generate full UPN form images with QR codes
        const newWriter = new UPNWriter(newFormatData);
        const legacyWriter = new UPNWriter(legacyData);
        const simpleWriter = new UPNWriter(simpleData);

        await newWriter.saveAsPNG(path.join(testDir, 'upn_form_new_format.png'));
        await legacyWriter.saveAsPNG(path.join(testDir, 'upn_form_legacy_format.png'));
        await simpleWriter.saveAsPNG(path.join(testDir, 'upn_form_simple.png'));

        console.log('✓ upn_form_new_format.png (complete UPN form)');
        console.log('✓ upn_form_legacy_format.png (legacy data on new form)');
        console.log('✓ upn_form_simple.png (simple UPN form)');

        console.log('\n3. QR Data verification:');
        console.log('========================');
        
        const newQRData = newGenerator.generateUPNQRData();
        const legacyQRData = legacyGenerator.generateUPNQRData();
        const simpleQRData = simpleGenerator.generateUPNQRData();

        console.log(`NEW format - Fields: ${newQRData.split('\n').length - 1}, Length: ${newQRData.length} chars`);
        console.log(`LEGACY format - Fields: ${legacyQRData.split('\n').length - 1}, Length: ${legacyQRData.length} chars`);
        console.log(`SIMPLE format - Fields: ${simpleQRData.split('\n').length - 1}, Length: ${simpleQRData.length} chars`);

        console.log('\n=== FILES GENERATED ===');
        console.log('Test files saved in ./test/ directory:');
        console.log('');
        console.log('QR Code Only (for mobile app scanning):');
        console.log('• upn_qr_new_format.png - Full 20-field format with all features');
        console.log('• upn_qr_legacy_format.png - Legacy data converted to new format');
        console.log('• upn_qr_simple.png - Minimal required fields');
        console.log('');
        console.log('Full UPN Forms (printable):');
        console.log('• upn_form_new_format.png - Complete UPN payment form');
        console.log('• upn_form_legacy_format.png - Legacy UPN form');
        console.log('• upn_form_simple.png - Simple UPN form');
        console.log('');
        console.log('🔍 TESTING INSTRUCTIONS:');
        console.log('1. Open your mobile banking app');
        console.log('2. Find the "Scan QR" or "UPN QR" option');
        console.log('3. Scan any of the upn_qr_*.png files');
        console.log('4. Check if payment details are correctly recognized');
        console.log('');
        console.log('Expected behavior: All QR codes should now be recognized by your banking app!');

    } catch (error) {
        console.error('Error generating PNG files:', error);
        throw error;
    }
}

// Run the test
generateTestPNGs().then(() => {
    console.log('\n✅ All test PNG files generated successfully!');
}).catch((error) => {
    console.error('\n❌ Failed to generate test files:', error);
    process.exit(1);
});
