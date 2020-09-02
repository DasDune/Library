import * as Firebase from './node_modules/firebase/firebase-app.js';
import * as Firestore from './node_modules/firebase/firebase-firestore.js';

// import 'firebase/firestore';

console.log(firebase);

// Initialize Firebase for home automation database
var cfgAutoDB = {
  apiKey: 'AIzaSyB0sGHAlHiEoSXI_OJOPPMsqCIiLYto4-U',
  authDomain: 'homeautomation-654d6.firebaseapp.com',
  databaseURL: 'https://homeautomation-654d6.firebaseio.com',
  projectId: 'homeautomation-654d6',
  storageBucket: 'homeautomation-654d6.appspot.com',
  messagingSenderId: '1064401878518',
  appId: '1:1064401878518:web:a5fe69b172b0284ff3dbd7',
  measurementId: 'G-VHQPQVSSVS'
};

firebase.initializeApp(cfgDocDB);

const db = firebase.firestore();

//Event raised when the DB Collection is not found, the event return the requested collection
let colEmpty = col => {
  const event = new CustomEvent('colEmpty', {
    detail: { col: col }
  });
  document.dispatchEvent(event);
};

//Event raised when the DB collection is found, the event return the documents belonging to the requested collection
let colFound = doc => {
  const event = new CustomEvent('colFound', {
    detail: { doc: doc }
  });
  document.dispatchEvent(event);
};

//DB change event
let docChanged = (type, id, doc) => {
  const event = new CustomEvent('docChanged', {
    detail: { type: type, id: id, doc: doc }
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
  { removed: {} }
];

//db Handler
export let dbOp = dbObj => {
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
    removed
  } = dbObj;

  if (op === 'get') {
    // firebase
    //   .firestore()
    db.collection(col)
      .get()
      .then(snapshot => {
        //If collection found : Raise an event 'colEmpty' and pass the name of the collection for verification
        // else pass the documents collection
        snapshot.empty
          ? colEmpty(snapshot._originalQuery.path.segments[0])
          : colFound(snapshot.docs);
      });
  }

  if (op === 'add') {
    db.collection(col)
      .doc()
      .set(doc)
      .then(res => {
        console.log('db doc added!');
      });
  }

  if (op === 'upt') {
    db.collection(col)
      .doc(id)
      .set(doc)
      .then(res => {
        console.log('db doc updated!');
      });
  }

  if (op === 'del') {
    db.collection(col)
      .doc(id)
      .delete()
      .then(res => {
        console.log('db doc deleted!');
      });
  }

  if (op === 'chg') {
    db.collection(col).onSnapshot(snapshot => {
      console.log('something change...');
      snapshot.docChanges().map(change => {
        docChanged(change.type, change.doc.id, change.doc.data());
        console.log(
          'change Type: ' + change.type + ' on doc: ' + change.doc.id
        );
        console.log(change.doc.data());
      });
    });
  }
};
