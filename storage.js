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

export let storageOp = (op, file) => {
  if (op === 'upload') storage.ref('/' + file.name).put(file);

  if (op === 'download') storage.ref.child('/' + file.name).download(file);
};

{
  /* <input type="file" value="upload" id="fileButton" /> */
}
