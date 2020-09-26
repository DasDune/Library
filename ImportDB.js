var admin = require('firebase-admin');
var fs = require('fs');
const fetch = require('node-fetch');
var serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://taglinker-4ee7c.firebaseio.com',
});

db = [];

//Get all the collections
getCols = () => {
  cols = [];
  admin
    .firestore()
    .listCollections()
    .then((cs) => {
      cs.map((col) => {
        cols = [...cols, col.id];
        console.log(col.id);
      });
      getDocs(cols);
    })
    .catch((error) => {
      console.log(error);
      response.status(500).send(error);
    });
};

tabber = (col, id, doc) => {
  const { Title, Desc, Link } = doc;
  let strDoc = JSON.stringify(doc);
  db = [...db, `${col}~${id}~${strDoc}\r\n`];
  // console.log(trStr);
};

getDoc = (col) => {
  return new Promise((resolve) => {
    console.log(`Col: ${col}`);
    admin
      .firestore()
      .collection(col)
      .get()
      .then((snapshot) => {
        snapshot.docs.map((doc) => {
          // db = [...db, col, JSON.stringify(doc.data())];
          tabber(col, doc.id, doc.data());
          // console.log(db);
          resolve('got doc');
        });
        // response.send(docs);
      })
      .catch((error) => {
        console.log(error);
        response.status(500).send(error);
      });
  });
};

//Batch reads need to be async.
getDocs = async (cols) => {
  for (i in cols) await getDoc(cols[i]);
  fs.writeFile('db.txt', db, function (err) {
    if (err) throw err;
    console.log('Replaced!');
  });
  // cols.map((row) => await popCol(row));
};

getCols();
