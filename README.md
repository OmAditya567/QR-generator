# QR Code Generator

A simple browser-based web app to generate and customize QR codes. Built with plain HTML, CSS and JavaScript — no backend, no build step.

## Live Demo
https://qr-gen-om-aditya.vercel.app

## Features
- Generate QR codes for URL, Plain Text, Email, Phone Number, and Wi-Fi
- Customize QR color, background color, size, and error correction level
- Download the generated QR code as a PNG
- Recent QR codes are saved locally and persist after a page refresh
- Responsive layout for desktop and mobile

## Tech Used
- HTML, CSS, JavaScript
- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) library (via CDN)
- Canvas API for rendering and PNG export
- localStorage for saving recent codes

## Screenshots
![Main screen](screenshots/main-screen.png)
![Generated QR](screenshots/qr-generated.png)
![Recent history](screenshots/recent-history.png)

## Run Locally
Just open `index.html` in a browser, or serve the folder:
```
npx serve .
```

## Deploy
Deployed on Vercel. To deploy your own copy:
```
npx vercel
```
