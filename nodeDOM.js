// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/licenses/publicdomain/

// Hello world example for browserify.

var pdfJS = require('pdfjs-dist');
// var workerSrc = require('pdfjs-dist/build/pdf.worker');
// workerSrc = requirejs.toUrl('pdfjs-dist/build/pdf.worker.js');

var pdfPath = 'PRPlanning.pdf';

let doc = pdfJS.getDocument(pdfPath).promise.then(function (pdf) {
  console.log('ok');
});
