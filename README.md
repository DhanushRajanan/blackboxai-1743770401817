
Built by https://www.blackbox.ai

---

```markdown
# SAP Product QR Code Generator & Scanner

## Project Overview
The **SAP Product QR Code Generator & Scanner** is a web application designed to help users generate and scan QR codes specifically for SAP products. It features a user-friendly interface that allows users to input product details, generate a corresponding QR code, and scan existing QR codes to retrieve product information.

## Installation
To set up the project locally, follow these steps:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/sap-product-qr-generator.git
   cd sap-product-qr-generator
   ```

2. **Open the index.html File**
   Simply open `index.html` in your favorite web browser to run the application.

## Usage
After opening the application:
- **To Generate a QR Code:**
  1. Click on the **Generate** button.
  2. Enter the **Product ID** and **Product Name**.
  3. Click on **Generate QR Code** to create the QR code for the product.
  4. The generated QR code will be displayed, along with an option to download it.

- **To Scan a QR Code:**
  1. Click on the **Scan** button.
  2. Allow access to your camera if prompted.
  3. Scan any QR code, and the product details will be displayed.

## Features
- Generate QR codes for SAP products with a unique ID and name.
- Scan QR codes using the device camera.
- Display recently generated product QR codes and tracking records.
- Download generated QR codes as images.
- User-friendly interface with Tailwind CSS styling.

## Dependencies
This project utilizes the following libraries:
- [Tailwind CSS](https://tailwindcss.com/)
- [QRCode.js](https://github.com/davidshimjs/qrcodejs)
- [HTML5-QRCode](https://github.com/mebjas/html5-qrcode)
- [Font Awesome](https://fontawesome.com/)

The libraries are included via CDN links in the `index.html` file.

## Project Structure
The project directory contains the following files:
```
├── index.html          # Main HTML file
├── style.css           # Custom styles extending Tailwind CSS
└── script.js           # JavaScript for handling functionality
```

### Description of Each File:
- **index.html**: The main HTML structure of the application, including the layout for generating and scanning QR codes.
- **style.css**: Custom styles to enhance the appearance of the application beyond default Tailwind CSS styles.
- **script.js**: Contains the main JavaScript code that handles user interactions, QR code generation, and scanning.

## Contributing
If you'd like to contribute to this project, please fork the repository, make your changes, and submit a pull request.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- Special thanks to the creators of the libraries used in this project.
- Inspiration drawn from various web applications focusing on QR code technology.
```