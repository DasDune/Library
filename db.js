import * as Firebase from './node_modules/firebase/firebase-app.js';
import * as Firestore from './node_modules/firebase/firebase-firestore.js';
import * as Auth from './node_modules/firebase/firebase-auth.js';
import * as Storage from './node_modules/firebase/firebase-storage.js';
// import 'firebase/firestore';

console.log(firebase);

// Initialize Firebase for documents database
const cfgDocDB = {
  apiKey: 'AIzaSyBOLEmiUX7yWTmTq3w5j-THGvhG5XxwtYM',
  authDomain: 'dasdoc-83fc7.firebaseapp.com',
  databaseURL: 'https://dasdoc-83fc7.firebaseio.com',
  projectId: 'dasdoc-83fc7',
  storageBucket: 'dasdoc-83fc7.appspot.com',
  messagingSenderId: '197289633451',
  appId: '1:197289633451:web:001fb714c9b10e5fc939ee',
  measurementId: 'G-Q93GE06Z0T',
};

// const cfgDocDB = {
//   apiKey: 'AIzaSyBVSrzEAqesBTzkp15g4Exhf-EARjVQ_BY',
//   authDomain: 'documents-f34f3.firebaseapp.com',
//   databaseURL: 'https://documents-f34f3.firebaseio.com',
//   projectId: 'documents-f34f3',
//   storageBucket: 'documents-f34f3.appspot.com',
//   messagingSenderId: '944235290752',
//   appId: '1:944235290752:web:c9d1e0f733f560322f4665',
// };

firebase.initializeApp(cfgDocDB);

let col = '';

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

//DB Login Stuff
const email = 'dasdune@dasdune.com';
const password = 'Benoit2020';

// One-Shot function to create the user once
// You can create the user from the firebase console under user menu
let createUser = () => {
  auth.createUserWithEmailAndPassword(email, password).then((cred) => {
    console.log(cred);
  });
};

// Start Everything by Login to DB
auth.signInWithEmailAndPassword(email, password).then((cred) => {
  console.log(cred);

  // *** If Credential Ok start the program and get the current month transactions
  // popHeader();
  // getMonthTransacts('current');
  // dbChanges();
  // readDB('budget');
});

//Event raised when the DB Collection is not found, the event return the requested collection
let colEmpty = (col) => {
  const event = new CustomEvent('colEmpty', {
    detail: { col: col },
  });
  document.dispatchEvent(event);
};

//Event raised when the DB collection is found, the event return the documents belonging to the requested collection

let searchFound = (col, id, doc) => {
  const event = new CustomEvent('searchFound', {
    detail: { col: col, id: id, doc: doc },
  });
  document.dispatchEvent(event);
};

//DB change event
let docChanged = (type, id, doc) => {
  const event = new CustomEvent('docChanged', {
    detail: { type: type, id: id, doc: doc },
  });
  document.dispatchEvent(event);
};

const nop = () => {};

//**DB functions
let dbObj = [
  { op: '' },
  { col: '' },
  { id: '' },
  { doc: {} },
  { popCol: {} },
  { popDoc: {} },
  { changed: {} },
  { added: {} },
  { modified: {} },
  { removed: {} },
];

//db Handler
export let dbOp = (dbObj) => {
  let {
    op,
    col,
    id,
    doc,
    popCol,
    popDoc,
    changed,
    added,
    modified,
    removed,
  } = dbObj;

  if (op === 'get') {
    // firebase
    //   .firestore()
    db.collection(col)
      .orderBy('Title')
      .get()
      .then((snapshot) => {
        //If collection found : Raise an event 'colEmpty' and pass the name of the collection for verification
        // else pass the documents collection
        snapshot.empty
          ? colEmpty(col)
          : colFound(
              snapshot.docs.map((doc) => {
                return doc.data();
              })
            );
      });
  }

  if (op === 'search') {
    // firebase
    //   .firestore()
    db.collection(col)
      // .orderBy('Title')
      .doc(id)
      .get()
      .then((doc) => {
        searchFound(col, doc.id, doc.data());
      });
  }

  if (op === 'add') {
    db.collection(col)
      .doc()
      .set(doc)
      .then((res) => {
        console.log('db doc added!');
      });
  }

  if (op === 'upt') {
    db.collection(col)
      .doc(id)
      .set(doc)
      .then((res) => {
        console.log('db doc updated!');
      });
  }

  if (op === 'del') {
    db.collection(col)
      .doc(id)
      .delete()
      .then((res) => {
        console.log('db doc deleted!');
      });
  }

  if (op === 'chg') {
    db.collection(col)
      .orderBy('Title')
      .onSnapshot((snapshot) => {
        console.log('something change...');
        snapshot.docChanges().map((change) => {
          docChanged(change.type, change.doc.id, change.doc.data());
          console.log(
            'change Type: ' + change.type + ' on doc: ' + change.doc.id
          );
          console.log(change.doc.data());
        });
      });
  }

  //not working...maybe listCollections only works on Node.js...?
  if (op === 'col') {
    console.log('hi');
    db.listCollections().then((collections) => {
      for (let collection of collections) {
        console.log(`Found collection with id: ${collection.id}`);
      }
    });
  }
};

//storage Handler
export let storageOp = (file) => {
  storage.ref('/' + file.name).put(file);
};

// createUser();
