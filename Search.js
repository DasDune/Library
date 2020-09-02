var fs = require('fs');

fs.readFile('db.txt', 'utf8', (err, data) => {
  let arrRowData = data.split('\r\n');
  let line = [];
  let cols = [];
  arrRowData.map((row) => {
    if (row.includes('Roy')) {
      line = row.split('~');
      cols = [...cols, `${line[0]}~${line[1]}`];
    }
  });
  //   let arrRowData = data.split('\r\n');
  console.log(cols);
});
