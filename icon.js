const fs = require('fs');
const { JSDOM } = require('jsdom');
const { createCanvas } = require('canvas');
const toIco = require('to-ico');

// Create a DOM environment
const dom = new JSDOM();
global.document = dom.window.document;

// Load the SVG
const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="6" fill="#000000"/>
  <rect x="15" y="2" width="2" height="6" fill="#000000"/>
  <rect x="15" y="24" width="2" height="6" fill="#000000"/>
  <rect x="24" y="15" width="6" height="2" fill="#000000"/>
  <rect x="2" y="15" width="6" height="2" fill="#000000"/>
  <rect x="22.5" y="6.5" width="2" height="6" transform="rotate(45 23.5 9.5)" fill="#000000"/>
  <rect x="7.5" y="19.5" width="2" height="6" transform="rotate(45 8.5 22.5)" fill="#000000"/>
  <rect x="19.5" y="22.5" width="6" height="2" transform="rotate(45 22.5 23.5)" fill="#000000"/>
  <rect x="6.5" y="7.5" width="6" height="2" transform="rotate(45 9.5 8.5)" fill="#000000"/>
</svg>`;

// Create canvas and draw SVG
const canvas = createCanvas(32, 32);
const ctx = canvas.getContext('2d');

// Convert the canvas to PNG buffer
const pngBuffer = canvas.toBuffer();

// Convert PNG to ICO
toIco([pngBuffer]).then(buf => {
  fs.writeFileSync('icon.ico', buf);
  console.log('Created icon.ico');
}).catch(console.error);
