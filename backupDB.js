var admin = require('firebase-admin');
var fs = require('fs');

var serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://dasdoc-83fc7.firebaseio.com',
});

// const db = admin.firestore();
cols = [];
docs = [];
docStr = [];

saveFile = () => {
  fs.writeFile('docs.json', docStr, function (err) {
    if (err) throw err;
    console.log('Done!');
  });
};

function objStr(col, doc) {
  const { title, video, description, topic, desc, file, link } = doc;
  // Note2 = Note.replace(',', '-');
  docStr = [
    ...docStr,
    `${col}~${title}~${description}~${video}~${topic}~${desc}~${file}~${link}\r\n`,
  ];
}

getCols = () => {
  admin
    .firestore()
    .listCollections()
    .then((cs) => {
      cs.map((col) => {
        getDocs(col.id);
        console.log(col.id);
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

getDocs = (col) => {
  admin
    .firestore()
    .collection(col)
    .get()
    .then((snapshot) => {
      snapshot.docs.map((doc) => {
        // docs = [...docs, col + ' ## ' + JSON.stringify(doc.data())];
        objStr(col, doc.data());
        console.log(doc.data());
      });
      //   saveFile(JSON.stringify(docs));
    })
    .catch((error) => {
      console.log(error);
    });
};

getCols();

setTimeout(saveFile, 10000);
