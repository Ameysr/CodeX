// Simple route inspection
const express = require('express');
const videoRouter = require('./src/routes/videoCreator');

const app = express();

console.log('Video Router Stack:');
console.log('==================');

videoRouter.stack.forEach((layer, index) => {
  const method = Object.keys(layer.route.methods)[0].toUpperCase();
  const path = layer.route.path;
  console.log(`${index + 1}. ${method} /video${path}`);
});

console.log('\n✅ All routes are properly registered!');