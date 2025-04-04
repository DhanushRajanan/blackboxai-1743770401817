// DOM Elements
const qrGeneratorForm = document.getElementById('qr-generator-form');
const qrCodeContainer = document.getElementById('qr-code-container');
const downloadQrBtn = document.getElementById('download-qr');
const stopScanBtn = document.getElementById('stop-scan');
const scannedResult = document.getElementById('scanned-result');
const statusMessage = document.getElementById('status-message');
const qrReader = document.getElementById('qr-reader');

// Screen Elements
const showGeneratorBtn = document.getElementById('showGenerator');
const showScannerBtn = document.getElementById('showScanner');
const generatorScreen = document.getElementById('generatorScreen');
const scannerScreen = document.getElementById('scannerScreen');
const productListContent = document.getElementById('productListContent');

// QR Scanner instance
let html5QrcodeScanner = null;

// Session Storage Keys
const PRODUCTS_KEY = 'sap_products';
const TRACKING_KEY = 'product_tracking';

// Tracking data structure
class TrackingRecord {
    constructor(productId, productName) {
        this.productId = productId;
        this.productName = productName;
        this.startTime = null;
        this.stopTime = null;
        this.duration = null;
        this.isTracking = false;
        this.id = Date.now().toString(); // Unique ID for the tracking record
    }

    start() {
        this.startTime = new Date();
        this.isTracking = true;
        this.stopTime = null;
        this.duration = null;
    }

    stop() {
        this.stopTime = new Date();
        this.isTracking = false;
        this.calculateDuration();
    }

    calculateDuration() {
        if (this.startTime && this.stopTime) {
            const diff = this.stopTime - this.startTime;
            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            
            this.duration = {
                hours: hours,
                minutes: minutes % 60,
                seconds: seconds % 60
            };
        }
    }
}

// Initialize storage
function initializeStorage() {
    if (!sessionStorage.getItem(PRODUCTS_KEY)) {
        sessionStorage.setItem(PRODUCTS_KEY, JSON.stringify([]));
    }
    if (!sessionStorage.getItem(TRACKING_KEY)) {
        sessionStorage.setItem(TRACKING_KEY, JSON.stringify([]));
    }
}

// Save tracking record
function saveTrackingRecord(record) {
    const records = JSON.parse(sessionStorage.getItem(TRACKING_KEY) || '[]');
    const index = records.findIndex(r => r.id === record.id);
    
    if (index !== -1) {
        records[index] = record;
    } else {
        records.unshift(record);
    }
    
    sessionStorage.setItem(TRACKING_KEY, JSON.stringify(records));
    updateTrackingList();
}

// Update tracking list in UI
function updateTrackingList() {
    const trackingListContent = document.getElementById('trackingListContent');
    const records = JSON.parse(sessionStorage.getItem(TRACKING_KEY) || '[]');
    
    trackingListContent.innerHTML = records.length === 0 
        ? '<p class="text-gray-500 text-center">No tracking records yet</p>'
        : records.map(record => `
                <div class="tracking-card ${record.isTracking ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50'} p-4 rounded-lg mb-4">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-semibold text-gray-800">${record.productName}</h3>
                        <p class="text-sm text-gray-600">ID: ${record.productId}</p>
                        ${record.duration ? `
                            <p class="text-sm text-gray-600 mt-1">
                                Duration: ${record.duration.hours}h ${record.duration.minutes}m ${record.duration.seconds}s
                            </p>
                        ` : ''}
                    </div>
                    <div class="flex space-x-2">
                        ${!record.isTracking ? `
                            <button onclick="startTracking('${record.id}')" class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                                <i class="fas fa-play"></i>
                            </button>
                        ` : `
                            <button onclick="stopTracking('${record.id}')" class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                                <i class="fas fa-stop"></i>
                            </button>
                        `}
                    </div>
                </div>
                ${record.startTime ? `
                    <p class="text-xs text-gray-400 mt-2">
                        <i class="fas fa-clock mr-1"></i>
                        Started: ${new Date(record.startTime).toLocaleString()}
                    </p>
                ` : ''}
                ${record.stopTime ? `
                    <p class="text-xs text-gray-400">
                        <i class="fas fa-flag-checkered mr-1"></i>
                        Stopped: ${new Date(record.stopTime).toLocaleString()}
                    </p>
                ` : ''}
            </div>
        `).join('');
}

// Start tracking for a record
function startTracking(recordId) {
    const records = JSON.parse(sessionStorage.getItem(TRACKING_KEY) || '[]');
    const record = records.find(r => r.id === recordId);
    if (record) {
        record.start();
        saveTrackingRecord(record);
        showStatus('Tracking started', 'success');
    }
}

// Stop tracking for a record
function stopTracking(recordId) {
    const records = JSON.parse(sessionStorage.getItem(TRACKING_KEY) || '[]');
    const record = records.find(r => r.id === recordId);
    if (record) {
        record.stop();
        saveTrackingRecord(record);
        showStatus('Tracking stopped', 'success');
    }
}

// Save product to session storage
function saveProduct(product) {
    const products = JSON.parse(sessionStorage.getItem(PRODUCTS_KEY) || '[]');
    products.unshift(product); // Add new product at the beginning
    sessionStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    updateProductList();
}

// Update product list in UI
function updateProductList() {
    const products = JSON.parse(sessionStorage.getItem(PRODUCTS_KEY) || '[]');
    productListContent.innerHTML = products.length === 0 
        ? '<p class="text-gray-500 text-center">No products generated yet</p>'
        : products.map((product, index) => `
            <div class="product-card bg-gray-50 p-4 rounded-lg">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-semibold text-gray-800">${product.name}</h3>
                        <p class="text-sm text-gray-600">ID: ${product.id}</p>
                    </div>
                    <button onclick="regenerateQR(${index})" class="text-blue-600 hover:text-blue-800">
                        <i class="fas fa-qrcode"></i>
                    </button>
                </div>
                <p class="text-xs text-gray-400 mt-2">
                    <i class="fas fa-clock mr-1"></i>
                    Generated: ${new Date().toLocaleString()}
                </p>
            </div>
        `).join('');
}

// Regenerate QR code for existing product
function regenerateQR(index) {
    const products = JSON.parse(sessionStorage.getItem(PRODUCTS_KEY) || '[]');
    if (products[index]) {
        showGeneratorScreen();
        generateQRCode(products[index]);
    }
}

// Screen navigation
function showGeneratorScreen() {
    generatorScreen.classList.remove('hidden');
    scannerScreen.classList.add('hidden');
    showGeneratorBtn.classList.add('bg-blue-700');
    showScannerBtn.classList.remove('bg-purple-700');
}

function showScannerScreen() {
    scannerScreen.classList.remove('hidden');
    generatorScreen.classList.add('hidden');
    showScannerBtn.classList.add('bg-purple-700');
    showGeneratorBtn.classList.remove('bg-blue-700');
    initializeScanner();
}

// Check if device has a camera
async function checkCamera() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.some(device => device.kind === 'videoinput');
    } catch (error) {
        console.error('Error checking camera:', error);
        return false;
    }
}

// Initialize QR Scanner
async function initializeScanner() {
    const hasCamera = await checkCamera();
    
    if (!hasCamera) {
        qrReader.innerHTML = `
            <div class="p-4 bg-yellow-50 rounded-lg">
                <p class="text-yellow-700">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    No camera found on this device. QR code scanning is not available.
                </p>
            </div>
        `;
        return;
    }

    try {
        if (html5QrcodeScanner) {
            await html5QrcodeScanner.clear();
        }

        html5QrcodeScanner = new Html5QrcodeScanner(
            "qr-reader",
            { 
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                showTorchButtonIfSupported: true
            }
        );

        await html5QrcodeScanner.render(onScanSuccess, onScanFailure);
        stopScanBtn.classList.remove('hidden');
    } catch (error) {
        console.error("Error creating scanner:", error);
        qrReader.innerHTML = `
            <div class="p-4 bg-red-50 rounded-lg">
                <p class="text-red-700">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    Failed to initialize camera. Please check your browser permissions and compatibility.
                </p>
            </div>
        `;
    }
}

// Handle successful QR scan
function onScanSuccess(decodedText, decodedResult) {
    try {
        const productData = JSON.parse(decodedText);
        displayScannedProduct(productData);
        
        // Check if a tracking record already exists for this product
        const records = JSON.parse(sessionStorage.getItem(TRACKING_KEY) || '[]');
        let existingRecord = records.find(r => r.productId === productData.id);
        
        if (!existingRecord) {
            // Create new tracking record if none exists
            const record = new TrackingRecord(productData.id, productData.name);
            saveTrackingRecord(record);
            showStatus('New tracking record created. Click Start to begin tracking.', 'success');
        } else {
            showStatus('Product already being tracked.', 'info');
        }
        
        // Scroll to tracking section
        document.getElementById('trackingList').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error processing QR code:', error);
        showStatus('Invalid QR Code format', 'error');
    }
}

// Handle QR scan failure
function onScanFailure(error) {
    if (!error.includes('timeout')) {
        console.warn(`QR Code scanning failed: ${error}`);
        showStatus('Failed to scan QR code. Please try again.', 'error');
    }
}

// Display scanned product information
function displayScannedProduct(productData) {
    scannedResult.innerHTML = `
        <div class="scanned-card">
            <h3 class="text-xl font-semibold mb-2">
                <i class="fas fa-box text-blue-600 mr-2"></i>
                Scanned Product Details
            </h3>
            <p><strong>Product ID:</strong> ${productData.id}</p>
            <p><strong>Name:</strong> ${productData.name}</p>
            <p class="text-sm text-gray-500 mt-2">
                <i class="fas fa-clock mr-1"></i>
                Scanned at: ${new Date().toLocaleString()}
            </p>
        </div>
    `;
}

// Generate QR Code
function generateQRCode(productData) {
    try {
        console.log('Starting QR code generation');
        qrCodeContainer.innerHTML = '';
        
        // Create QR Code with error handling
        try {
            console.log('Creating QR code instance');
            const qr = new QRCode(qrCodeContainer, {
                text: JSON.stringify(productData),
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.L
            });
            console.log('QR code instance created successfully');
        } catch (qrError) {
            console.error('Error in QR code creation:', qrError);
            throw new Error('Failed to create QR code: ' + qrError.message);
        }

        // Save product data
        try {
            console.log('Saving product data');
            saveProduct(productData);
            console.log('Product data saved successfully');
        } catch (saveError) {
            console.error('Error saving product:', saveError);
            // Continue execution even if save fails
        }

        // Add success message
        const successMessage = document.createElement('div');
        successMessage.className = 'mt-4 mb-2 text-center text-green-600';
        successMessage.innerHTML = '<i class="fas fa-check-circle mr-2"></i>QR Code generated successfully!';
        qrCodeContainer.appendChild(successMessage);

        // Show download button
        downloadQrBtn.className = 'w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200 flex items-center justify-center';
        downloadQrBtn.innerHTML = '<i class="fas fa-download mr-2"></i>Download QR Code';
        downloadQrBtn.classList.remove('hidden');

        showStatus('QR Code generated successfully! Click the download button to save it.', 'success');
        console.log('QR code generation completed successfully');
    } catch (error) {
        console.error('Error in generateQRCode function:', error);
        showStatus('Failed to generate QR code: ' + error.message, 'error');
        qrCodeContainer.innerHTML = `
            <div class="p-4 bg-red-50 rounded-lg">
                <p class="text-red-700">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    Failed to generate QR code. Please try again.
                </p>
            </div>
        `;
    }
}

// Download QR Code as image
function downloadQRCode() {
    const qrCanvas = qrCodeContainer.querySelector('canvas');
    if (!qrCanvas) return;

    const link = document.createElement('a');
    link.download = 'product-qr-code.png';
    link.href = qrCanvas.toDataURL('image/png');
    link.click();
}

// Show status message
function showStatus(message, type = 'info') {
    const statusDiv = document.createElement('div');
    statusDiv.className = `status-message status-${type} flex items-center`;
    
    let icon = '';
    switch(type) {
        case 'success':
            icon = '<i class="fas fa-check-circle mr-2"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle mr-2"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle mr-2"></i>';
    }
    
    statusDiv.innerHTML = `${icon}${message}`;
    statusMessage.appendChild(statusDiv);

    setTimeout(() => {
        statusDiv.remove();
    }, 3000);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    initializeStorage();
    updateProductList();
    updateTrackingList();

    showGeneratorBtn.addEventListener('click', showGeneratorScreen);
    showScannerBtn.addEventListener('click', showScannerScreen);

    qrGeneratorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        try {
            const productData = {
                id: document.getElementById('product-id').value,
                name: document.getElementById('product-name').value
            };

            if (!productData.id || !productData.name) {
                showStatus('Please enter Product ID and Name', 'error');
                return;
            }

            console.log('Generating QR code for:', productData);
            generateQRCode(productData);
        } catch (error) {
            console.error('Error in form submission:', error);
            showStatus('Failed to process form data', 'error');
        }
    });

    downloadQrBtn.addEventListener('click', downloadQRCode);

    stopScanBtn.addEventListener('click', async () => {
        if (html5QrcodeScanner) {
            try {
                await html5QrcodeScanner.clear();
                stopScanBtn.classList.add('hidden');
                scannedResult.innerHTML = '';
                showStatus('Scanner stopped', 'info');
                setTimeout(initializeScanner, 1000);
            } catch (error) {
                console.error('Error stopping scanner:', error);
                showStatus('Failed to stop scanner', 'error');
            }
        }
    });

    showGeneratorScreen();
});
