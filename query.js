import { dbOp } from './db.js';

//**Global var */
let id = '';
let editmode = false;

//*DB Doc object
let dbDoc = {
  topic: 'topic',
  desc: 'description',
  link: 'none'
};

//Custom event listener for a DB Collection after a 'get' request, return the documents collection
document.addEventListener('colFound', e => listDoc(e.detail));

dbOp({ op: 'get', col: 'impot' });

const listDoc = data => {
  console.log(data);
};
