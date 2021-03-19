// Import the database scripts
import { storageOp } from './firebase.js';
import { authOp } from './firebase.js';

//enable auth changes trigger
storageOp({ op: 'chg' });
authOp({ op: 'chg' });
//listener for auth message
document.addEventListener('storageMsg', (e) => storageMsg(e.detail));
document.addEventListener('authMsg', (e) => authMsg(e.detail));

let authMsg = (cred) => {
  const { op, msg } = cred;

  if (op === 'signIn') {
    const { user, token, err } = msg;
    console.log(user);
    console.log(token);
    console.log(err);
  }
};

let storageMsg = (cred) => {
  const { op, msg } = cred;

  if (op === 'upload') {
    console.log(op);
  }

  if (op === 'download') {
    console.log(op);
  }
};

let inputFiles = document.getElementById('filesInput');
let btnUpload = document.getElementById('btnUpload');

let filesList = [];

inputFiles.addEventListener('change', (e) => {
  let files = e.target.files;
  for (let file of files) {
    console.log(file.name);
    filesList = [...filesList, file];
    // storageOp('upload', file);
  }
});

btnUpload.addEventListener('click', (e) => {
  filesList.map((file) => {
    storageOp('upload', file);
    // storageOp('download', file);
  });
});

authOp({ op: 'signIn' });
