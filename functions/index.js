const functions = require('firebase-functions');

const admin = require('firebase-admin');

// const gcs = require('@google-cloud/storage');
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

cols = [];

exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send('Hello from Firebase!');
});

//Get the documents from a collection
exports.getDocs = functions.https.onRequest((request, response) => {
  const col = request.query.col;
  docs = [];
  admin
    .firestore()
    .collection(col)
    .get()
    .then((snapshot) => {
      snapshot.docs.map((doc) => {
        docs = [...docs, doc.data()];
      });
      response.send(docs);
    })
    .catch((error) => {
      console.log(error);
      response.status(500).send(error);
    });
});

//Get all the collections
exports.getCols = functions.https.onRequest((request, response) => {
  cols = [];
  admin
    .firestore()
    .listCollections()
    .then((cs) => {
      cs.map((col) => {
        cols = [...cols, col.id];
        console.log(col.id);
      });
      response.send(cols);
    })
    .catch((error) => {
      console.log(error);
      response.status(500).send(error);
    });
});

//backupDB
exports.backupDB = functions.https.onRequest((request, response) => {
  db = [];
  admin
    .firestore()
    .listCollections()
    .then((cs) => {
      cs.map((col) => {
        // cols = [...cols, col.id];
        console.log(col.id);
        admin
          .firestore()
          .collection(col.id)
          .get()
          .then((snapshot) => {
            snapshot.docs.map((doc) => {
              db = [...db, col.id, doc.data()];
              console.log(db);
            });
            // response.send(docs);
          })
          .catch((error) => {
            console.log(error);
            response.status(500).send(error);
          });
      });
      fs.writeFile(filePath, db, function (err) {
        if (err) throw err;
        console.log('Replaced!');
      });
      response.send('done');
    })
    .catch((error) => {
      console.log(error);
      response.status(500).send(error);
    });
});

exports.popCol = (cols) => {
  // const cols = req.body;
  // cols = JSON.parse(request.body);
  Col = cols[0].Col;
  delete cols[0].Col;
  Doc = cols[0];
  console.log(`Col: ${Col} ${Doc}`);
  admin
    .firestore()
    .collection(Col)
    .doc()
    .set(Doc)
    .then((snapshot) => {
      console.log(cols[0]);
      cols.shift();
      console.log(cols.length);
      if (cols.length != 0) popCol(cols);
      else res.send('done..');
    })
    .catch((error) => {
      console.log(error);
      // res.status(500).send(error);
    });
};

exports.popCols = functions.https.onRequest((req, res) => {
  popCol(req.body);
  res.send(cols);
});

//auth create user (testing...)
exports.popUser = functions.https.onRequest((req, res) => {
  admin
    .auth()
    .createUser({
      email: 'user@example.com',
      emailVerified: false,
      phoneNumber: '+11234567890',
      password: 'secretPassword',
      displayName: 'John Doe',
      photoURL: 'http://www.example.com/12345678/photo.png',
      disabled: false,
    })
    .then(function (userRecord) {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log('Successfully created new user:', userRecord.uid);
      res.send('Successfully created new user:', userRecord.uid);
    })
    .catch(function (error) {
      console.log('Error creating new user:', error);
      res.send('Error creating new user:', error);
    });
});
