var admin = require('firebase-admin');
var fs = require('fs');
const fetch = require('node-fetch');
var serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://dasdoc-83fc7.firebaseio.com',
});

result = '';

saveFile = (db) => {
  fs.writeFile('docs.json', db, function (err) {
    if (err) throw err;
    console.log('Done!');
  });
};

wait5Sec = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), 5000);
  });
};

// delDoc = (col, docID) => {

//   return new Promise((resolve) => {
//     admin
//       .firestore()
//       .collection(Col)
//       .doc(docID)
//       .delete()
//       .then((snapshot) => {
//         resolve('doc deleted');
//       })
//       .catch((error) => {
//         console.log(error);
//         // res.status(500).send(error);
//       });
//   });
// }

// delDocs = async (cols) => {
//   for (i in cols) await delCol(cols[i]);
//   // cols.map((row) => await popCol(row));
// };

popCol = (row) => {
  return new Promise((resolve) => {
    Col = row.Col;
    delete row.Col;
    Doc = row;
    console.log(`Col: ${Col} ${Doc}`);
    admin
      .firestore()
      .collection(Col)
      .doc()
      .set(Doc)
      .then((snapshot) => {
        resolve('col saved');
      })
      .catch((error) => {
        console.log(error);
        // res.status(500).send(error);
      });
  });
};

//Batch writes need to be async.
popCols = async (cols) => {
  for (i in cols) await popCol(cols[i]);
  // cols.map((row) => await popCol(row));
};

TabtoJSON = () => {
  fs.readFile('impot.txt', 'utf8', (err, data) => {
    let arrRowData = data.split('\r\n');
    arrRowData.map((row, index) => {
      let item = row.split('\t');
      if (index == 0) {
        header = item;
        // console.log(header);
      } else {
        header.map((h, i) => {
          switch (i) {
            case 0:
              result += `{"${h}":"${item[i]}",`;
              break;
            case header.length - 1:
              result += `"${h}":"${item[i]}"},`;
              break;
            default:
              result += `"${h}":"${item[i]}",`;
              break;
          }
        });
      }
    });
    result = result.replace(/""/g, `"`);
    result = `[${result.substring(0, result.length - 1)}]`;
    // console.log(result);
    let cols = JSON.parse(result);
    popCols(cols);
  });
};

TabtoJSON();
