// ***Library server  ***
const express = require('express');
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use('/pub', express.static('pub'));

const port = process.env.PORT || 8080;

const cors = require('cors');
app.use(cors({
    origin: "*",
    credentials: true,
}));

const sheetsLib = require("./sheets")
const { sheetsInit, sheetsInfo, sheetInfo, popNamedRanges, delNamedRanges, formatCell} = sheetsLib;

app.listen(port, () => {
    console.log(`Library listening at port ${port}`);
});

const init = (async() => {

    const sheetsAPIInfo = await sheetsInit()
    sheets = sheetsAPIInfo.sheets;
    auth = sheetsAPIInfo.auth;
    
    })()


// Home page
app.get('/', (req, res) => {
    res.send('Library ready');
    // res.sendFile(`${__dirname}/pub/signIn.html`);
});


// Sheets initialization
app.get('/sheetsInit', async (req, res) => {

    const sheetsObj = await sheetsInit();

    res.send(`sheets objects ${sheetsObj}`);
    // res.sendFile(`${__dirname}/pub/signIn.html`);
});

// Sheets info
app.get('/sheetsInfo', async (req, res) => {

    const sheetsData = await sheetsInfo('1TIQfrcPM15l_4NIjDOz7MMe3EtHfIR8_aST4YD-PEY4');

try {

    let answer = `<h1 style='color:blue'>sheetsInfo<h1>
    <h2 style='color:green'>sheetsData</h2>
    <h2>namedRange :: <span style='color:peru'> ${sheetsData.namedRanges.length}</span></h2>
    <h2>properties.title :: <span style='color:peru'>${sheetsData.properties.title}</span></h2>
    <h2>sheets :: <span style='color:peru'>${sheetsData.sheets.length}</span> sheets</h2>
    <h2>spreadsheetId :: <span style='color:peru'>${sheetsData.spreadsheetId}</span></h2>
    <h2>spreadsheetUrl :: <span style='color:peru'>${sheetsData.spreadsheetUrl}</span></h2>
    `
    res.send(answer);
} 

catch(err) {

//    answser = err.message
   res.send(err.stack);
}
    // res.send(answer);
    // res.sendFile(`${__dirname}/pub/signIn.html`);
});

// Sheets info
app.get('/sheetInfo', async (req, res) => {

    const sheet = await sheetInfo('Library');

    let answer = `<h1 style='color:blue'>sheetInfo<h1>
    <h2 style='color:green'>sheet</h2>
    <h2>sheetId :: <span style='color:peru'>${sheet.sheetId}</span></h2>
    <h2>rowsData (index 4) :: <span style='color:peru'>${sheet.rowsData[4]}</span></h2>
    `

    res.send(answer);
    // res.sendFile(`${__dirname}/pub/signIn.html`);
});

// populate named ranges
app.get('/popNamedRanges', async (req, res) => {

    const sheetsData = await sheetsInfo('1TIQfrcPM15l_4NIjDOz7MMe3EtHfIR8_aST4YD-PEY4');
    const sheet = await sheetInfo('Library')
    popNamedRanges(sheet)
    res.send('named ranges populated');
    // res.sendFile(`${__dirname}/pub/signIn.html`);
});

// delete named ranges
app.get('/delNamedRanges', async (req, res) => {

    const sheetsData = await sheetsInfo('1TIQfrcPM15l_4NIjDOz7MMe3EtHfIR8_aST4YD-PEY4');
    const sheet = await sheetInfo('Library')
    delNamedRanges(sheet)
    res.send('named ranges deleted');
    // res.sendFile(`${__dirname}/pub/signIn.html`);
});

// format cell
app.get('/formatCell', async (req, res) => {

    let info = req.query
    
    const sheetsData = await sheetsInfo('1TIQfrcPM15l_4NIjDOz7MMe3EtHfIR8_aST4YD-PEY4');
    const sheet = await sheetInfo('Library')
    formatCell(info.tag, info.col)
    res.send('cell fomrmatted');
    // res.sendFile(`${__dirname}/pub/signIn.html`);
});

