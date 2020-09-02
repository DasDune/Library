//Append the link to the style sheet to the html caller (index.html)
let link1 = document.createElement('link');
link1.href = 'http://dasdune/Lib/doc.css';
// link1.href = './doc.css';
link1.rel = 'stylesheet';
document.head.appendChild(link1);

//Append the link to fontawesome to the html caller (index.html)
let link2 = document.createElement('link');
link2.href = 'https://use.fontawesome.com/releases/v5.0.7/css/all.css';
link2.rel = 'stylesheet';
document.head.appendChild(link2);

// Import the database scripts
import { dbOp } from './db.js';

// // Import the dom scripts
import { domOp } from './dom.js';

//**Global var */
let id = '';
let editmode = false;
let searchMode = false;
let searchItem = 'keyword?';
let title = '';
let subTitle = '';
let col = '';
let relativePath = '';
let DBtxt = '';
let elBefore = { stat: 'none' };

//*DB Doc object
let doc = {
  Title: 'Title',
  Desc: 'Description',
  Link: 'Link',
};

// ******************** Functions ************************************** //

//Fetch the text database
const getDBtxt = async () => {
  let res = await fetch('http://dasdune/Projects/Lib/DB.txt');
  return await res.text();
};

const highLight = (id, op) => {
  let el = domOp({ id: `${id}-card` });
  el.style.transition = 'all ease-in-out .5s';

  if (op == 'set') {
    el.style.borderWidth = '3px';
    el.style.borderColor = 'yellow';
  }

  if (op == 'reset') {
    el.style.borderWidth = '1px';
    el.style.borderColor = 'peachpuff';
  }

  if (op == 'error') {
    el.style.borderWidth = '3px';
    el.style.borderColor = 'red';
  }
};

let setPaths = () => {
  //Get the current directory path
  let absolutePath = `${window.location.href.replace('index.html', '')}`;
  relativePath = `${window.location.pathname.replace('index.html', '')}`;
  let URL = absolutePath.replace(relativePath, '');
  let arrPath = relativePath.split('/');
  arrPath.shift();
  arrPath.pop();

  let l = arrPath.length;
  if (l == 1) {
    col = arrPath;
    title = 'Library';
    subTitle = arrPath[0];
  }
  if (l == 2) {
    col = `${arrPath[l - 2]}-${arrPath[l - 1]}`;
    title = arrPath[0];
    subTitle = arrPath[1];
  }
  if (l >= 3) {
    col = `${arrPath[l - 3]}-${arrPath[l - 2]}-${arrPath[l - 1]}`;
    title = arrPath[l - 2];
    subTitle = arrPath[l - 1];
  }
  // col = col.toString();
  console.log(col);
};

let popLink = (id, doc, card) => {
  const { Link } = doc;

  // Check if the link is a file
  let type = 'div';
  let fileOrDir = '';
  if (Link !== 'Link') {
    if (Link.match(/mp4/i)) type = 'video';
    if (Link.match(/jpg/i)) type = 'img';
    if (Link.match(/pdf/i)) type = 'object';
  }

  fileOrDir = Link.includes('.') ? 'file' : 'dir';
  //fit the linkBox for a file or a dir.
  let linkBoxClass = fileOrDir == 'dir' ? 'dirLinkBox' : 'fileLinkBox';

  //pop linkBox
  let eleLinkBox = domOp({
    type: 'div',
    id: `${id}-linkBox`,
    par: card,
    cl: linkBoxClass,
    ev: 'drop',
    evf: fileDropped,
  });

  eleLinkBox.ondragover = (e) => linkBoxDragOver(e);

  //pop file child
  let eleFile = domOp({
    type: type,
    id: `${id}-file`,
    par: eleLinkBox,
    cl: 'file',
    ev: 'drop',
    evf: fileDropped,
  });

  eleFile.src = '';

  if (fileOrDir == 'file') {
    //pop file link child
    let ele = domOp({
      type: 'a',
      id: `${id}-link`,
      cl: 'link',
      par: eleLinkBox,
    });
    ele.target = '_blank';
    ele.href = Link;
    ele.text = ' ';

    domOp({
      type: 'i',
      id: `${id}-icon`,
      cl: 'fa fa-eye',
      par: ele,
    });

    // If the file type is PDF use 'data' attribute else use 'src' attribute
    type == 'object' ? (eleFile.data = Link) : (eleFile.src = Link);

    if (type == 'video') {
      // eleLinkBox.src = eleFile;
      // console.log(eleLinkBox.src);
      eleFile.controls = true;
      eleFile.preload = false;
      eleFile.loop = false;
    }
  }
  //shall be a dir, add the event
  else {
    let eleLinkBox = domOp({
      id: `${id}-linkBox`,
      ev: 'click',
      evf: linkClicked,
    });
    eleLinkBox.src = doc.Link;
    eleLinkBox.style.backgroundImage = `url(${doc.Link}/logo.jpg)`;
    eleLinkBox.style.backgroundSize = `cover`;
  }
};

//DB change dispatcher
const dbChg = (data) => {
  let ele = {};
  switch (data.type) {
    case 'added':
      popCard(elBefore, col, data.id, data.doc);
      elBefore = { stat: 'none' };
      break;

    case 'modified':
      ele = domOp({ id: `${data.id}-card` });
      editDisplay(id, false);

      // ele.parentNode.removeChild(ele);
      // popCard(col, data.id, data.doc);

      break;

    case 'removed':
      ele = domOp({ id: `${data.id}-card` });
      ele.parentNode.removeChild(ele);
      break;
  }
};

//Custom event listener for an empty DB Collection after a 'get' request, return the collection requested
document.addEventListener('colEmpty', (e) =>
  dbOp({ op: 'add', col: e.detail.col, doc: doc })
);

//Custom event listener for a DB Collection after a 'get' request, return the documents collection
document.addEventListener('colFound', (e) => console.log(e.detail));

//Custom event listener for a DB Change
document.addEventListener('docChanged', (e) => dbChg(e.detail));

const editDisplay = (id, editmode) => {
  if (editmode == 'true') {
    highLight(id, 'set');
    domOp({ id: `${id}-update` }).style.visibility = 'visible';
    domOp({ id: `${id}-add` }).style.visibility = 'visible';
    domOp({ id: `${id}-del` }).style.visibility = 'visible';
    domOp({ id: `${id}-Title` }).readOnly = false;
    domOp({ id: `${id}-desc` }).readOnly = false;
  } else {
    highLight(id, 'reset');
    domOp({ id: `${id}-update` }).style.visibility = 'hidden';
    domOp({ id: `${id}-add` }).style.visibility = 'hidden';
    domOp({ id: `${id}-del` }).style.visibility = 'hidden';
    domOp({ id: `${id}-Title` }).readOnly = true;
    domOp({ id: `${id}-desc` }).readOnly = true;
  }
};

// * Need to prevent default drag over event to allow a custom drop event !!
const linkBoxDragOver = (e) => {
  e.preventDefault();
  e.target.style.backgroundColor = 'green';
};

//Link Box clicked: if edit mode On, ask for the new link,
const linkClicked = (e) => {
  console.log('link clicked!');
  // let link = doc.link = link;
  id = e.target.id.split('-')[0];
  let eleLinkBox = domOp({ id: `${id}-linkBox` });
  let link = eleLinkBox.src;

  let editMode = domOp({ id: `${id}-card` }).dataset.editmode;
  if (editMode == 'true') {
    let askLink = prompt('Directory name for this card:', link);
    if (askLink != link) {
      link = askLink;
      doc.Link = link;
      eleLinkBox.src = link;
      // eleLinkBox.style.backgroundImage = `url(${absolutePath}${link}/logo.jpg)`;
      // eleLinkBox.style.backgroundSize = `contain`;
      // e.target.dataset.link = link;
    }
    // if edit mode off and if it is a link-dir element, follow the link.
  } else {
    // let link = domOp({ id: `${id}-linkBox` }).dataset.link;
    let linkType = link.includes('.') ? 'file' : 'dir';
    if (linkType == 'dir') location.assign(link);
  }
};

// * File has been dropped, update the filename and file type/element if required
const fileDropped = (e) => {
  e.preventDefault();
  id = e.target.id.split('-')[0];
  let editMode = domOp({ id: `${id}-card` }).dataset.editmode;
  let Title = domOp({ id: `${id}-Title` }).value;
  Title = Title != 'new Title' ? Title : 'new Title';
  let desc = domOp({ id: `${id}-desc` }).value;
  desc = desc != 'new description' ? desc : 'new description';

  if (editMode == 'true') {
    console.log('File(s) dropped');
    // e.preventDefault();

    let eleCurrentFileLink = document.getElementById(e.target.id);
    if (e.dataTransfer.items) {
      if (e.dataTransfer.items[0].kind === 'file') {
        let droppedFile = e.dataTransfer.items[0].getAsFile();
        // let eleNewFile = {};
        doc.Link = relativePath + droppedFile.name;
        // relativePath + droppedFile.name;

        //Check the dropped file extension
        let type = 'div';
        if (droppedFile !== undefined && droppedFile.name.match(/mp4/i))
          type = 'video';
        if (droppedFile !== undefined && droppedFile.name.match(/jpg/i))
          type = 'img';
        if (droppedFile !== undefined && droppedFile.name.match(/pdf/i))
          type = 'object';

        //Create a new element to replace the current element
        let eleNewFile = domOp({
          id: 'newID',
          type: type,
          cl: 'file',
          // ev: 'drop',
          // evf: fileDropped
          // dsTag: 'file',
          // dsVal: droppedFile.name
        });

        type == 'object'
          ? (eleNewFile.data = droppedFile.name)
          : (eleNewFile.src = droppedFile.name);

        let eleCurrFile = domOp({ id: `${id}-file` });
        let eleLinkBox = domOp({ id: `${id}-linkBox` });

        eleNewFile.id = `${id}-file`;
        eleLinkBox.replaceChild(eleNewFile, eleCurrFile);

        domOp({
          id: `${id}-card`,
          cl: `fileCard`,
        });

        domOp({
          id: `${id}-linkBox`,
          cl: 'fileLinkBox',
        });

        // pop anchor element child
        let ele = domOp({
          type: 'a',
          id: `${id}-link`,
          cl: 'link',
          par: eleLinkBox,
        });
        ele.target = '_blank';
        ele.href = droppedFile.name;
        ele.text = ' ';

        // pop an icon element for the anchor element above
        domOp({
          type: 'i',
          id: `${id}-icon`,
          cl: 'fa fa-eye',
          par: ele,
        });

        domOp({
          id: `${id}-textBox`,
          cl: 'fileTextBox',
        });

        domOp({
          id: `${id}-Title`,
          cl: 'fileTitle',
          val: Title,
        });

        let eleTextBox = domOp({ id: `${id}-textBox` });

        let Desc = domOp({
          type: `textarea`,
          id: `${id}-desc`,
          par: eleTextBox,
          cl: 'desc',
          val: desc,
        });

        // ele.target = '_blank';
        // ele.href = relativePath + droppedFile.name;

        if (type == 'video') {
          eleNewFile.controls = true;
          eleNewFile.preload = false;
          eleNewFile.loop = false;
        }
      }
    }
  }
};

//****** Events functions  **********

let titleClicked = (e) => {
  let absolutePath = `${window.location.href.replace('index.html', '')}`;
  // arrPath = absolutePath.split('/');
  // let arrPath2 = arrPath.pop();
  let pos = absolutePath.indexOf(e.target.textContent);
  absolutePath = absolutePath.substr(0, pos + e.target.textContent.length);
  // let arrPath = relativePath.split('/');
  // arrPath.shift();
  // arrPath.pop();
  // let i = arrPath.indexOf(e.target.textContent);
  // let target = e.target.textContent;
  // if (arrPath.indexOf(e.target.textContent) == 0)
  //   popHeader('Library', e.target.textContent);
  // else popHeader(arrPath[i - 1], e.target.textContent);

  location.assign(absolutePath);
  // let arrPath2 = arrPath.pop();
  // setColHeader(arrPath);
  // popHeader(title, subTitle);
  // dbOp({ op: 'get', col: col });
};

let iconEditClicked = (e) => {
  id = e.target.id.split('-')[0];
  // editmode ? editDisplay(false) : editDisplay(true);
  let ele = domOp({ id: `${id}-card` });
  ele.dataset.editmode = ele.dataset.editmode == 'true' ? 'false' : 'true';
  editDisplay(id, ele.dataset.editmode);
  console.log(ele.dataset.editmode);

  // if (searchMode) {
  //   col =
  //     domOp({ id: `${id}-col` }).dataset.col != undefined
  //       ? domOp({ id: `${id}-col` }).dataset.col
  //       : col;

  //   dbOp({ op: 'chg', col: col });
  // }
};

let updateDoc = (id) => {
  doc.Title =
    domOp({ id: `${id}-Title` }).value != undefined
      ? domOp({ id: `${id}-Title` }).value
      : 'none';
  doc.Desc =
    domOp({ id: `${id}-desc` }).value != undefined
      ? domOp({ id: `${id}-desc` }).value
      : 'none';

  if (domOp({ id: `${id}-card` }).className == 'dirCard')
    doc.Link = domOp({ id: `${id}-linkBox` }).src;
  else {
    let link =
      domOp({ id: `${id}-file` }).data != undefined
        ? domOp({ id: `${id}-file` }).data
        : domOp({ id: `${id}-file` }).src;
    doc.Link = link.substring(link.indexOf(location.pathname), link.length + 1);
  }
};

let iconUpdateClicked = (e) => {
  id = e.target.id.split('-')[0];
  updateDoc(id);

  //Check the collection name if exist (search mode)
  col =
    domOp({ id: `${id}-col` }).dataset.col != undefined
      ? domOp({ id: `${id}-col` }).dataset.col
      : col;

  dbOp({ op: 'upt', col: col, id: id, doc: doc });
  domOp({ id: `${id}-card` }).dataset.editmode = 'false';
  if (searchMode) editDisplay(id, false);
};

let iconAddClicked = (e) => {
  id = e.target.id.split('-')[0];
  elBefore = domOp({ id: `${id}-card` });

  // doc.file = 'new';
  doc.Title = 'Title your Doc...';
  doc.Desc = 'Described your Doc...';
  doc.Link = 'Link';

  dbOp({ op: 'add', col: col, doc: doc });

  boolVal =
    domOp({ id: `${id}-Title` }).value == 'Title your Doc...' ? true : false;

  domOp({ id: `${id}-card` }).dataset.editmode = boolVal;
  editDisplay(id, boolVal);

  // popCard(e.target, col, id, doc);
};

//Delete
let iconDelClicked = (e) => {
  id = e.target.id.split('-')[0];

  //Check the collection name if exist (search mode)
  col =
    domOp({ id: `${id}-col` }).dataset.col != undefined
      ? domOp({ id: `${id}-col` }).dataset.col
      : col;

  dbOp({ id: id, op: 'del', col: col });
};

//Pop card
const popCard = (elBefore, col, id, doc) => {
  const { Title, Desc, Link } = doc;

  let fileOrDir = '';
  let classStr = '';
  fileOrDir = Link.includes('.') ? 'file' : 'dir';

  let cardClass = fileOrDir == 'dir' ? 'dirCard' : 'fileCard';
  let textBoxClass = fileOrDir == 'dir' ? 'dirTextBox' : 'fileTextBox';
  let TitleClass = fileOrDir == 'dir' ? 'dirTitle' : 'fileTitle';

  let editEnable = Title == 'Title your Doc...' ? true : false;

  // let Card = {};

  let Card = domOp({
    type: `div`,
    id: `${id}-card`,
    cl: cardClass,
    dsTag: `editmode`,
    dsVal: editEnable,
  });

  if (elBefore.stat === 'none') cards.appendChild(Card);
  else elBefore.after(Card);

  // Card.draggable = true;

  // Pop a file element (video, pdf, img, etc..)
  popLink(id, doc, Card);

  //Pop Box to put the text and icons
  let eleTextBox = domOp({
    type: `div`,
    id: `${id}-textBox`,
    cl: textBoxClass,
    par: Card,
  });

  //Pop a Title element (editable)
  let Title2 = domOp({
    type: `textarea`,
    id: `${id}-Title`,
    par: eleTextBox,
    cl: TitleClass,
    val: Title,
  });
  Title2.readOnly = true;
  Title2.rows = 1;
  Title2.cols = 90;

  // Pop a description element (editable)
  if (fileOrDir == 'file') {
    domOp({
      type: `textarea`,
      id: `${id}-desc`,
      par: eleTextBox,
      cl: 'desc',
      val: Desc,
    });
  }

  //Pop a edit icon with listener
  domOp({
    id: `${id}-edit`,
    type: 'i',
    cl: 'iconEdit fas fa-edit',
    par: eleTextBox,
    ev: 'click',
    evf: iconEditClicked,
  });

  // Create update icon with listener
  domOp({
    id: `${id}-update`,
    type: 'i',
    cl: 'iconUpdate fas fa-sync-alt',
    par: eleTextBox,
    ev: 'click',
    evf: iconUpdateClicked,
  });

  if (!searchMode) {
    //Create add icon with listener
    domOp({
      id: `${id}-add`,
      type: 'i',
      cl: 'iconAdd fas fa-plus-circle',
      par: eleTextBox,
      ev: 'click',
      evf: iconAddClicked,
    });
  }

  classStr = searchMode
    ? 'iconAdd fas fa-trash-alt'
    : 'iconDelete fas fa-trash-alt';

  //Create delete icon with listener
  domOp({
    id: `${id}-del`,
    type: 'i',
    cl: classStr,
    par: eleTextBox,
    ev: 'click',
    evf: iconDelClicked,
  });

  //Keep the collection name in the card to allow edition in search mode
  domOp({
    id: `${id}-col`,
    type: 'div',
    dsTag: 'col',
    dsVal: col,
    par: Card,
  });

  //Make the new card editable as default
  if (editEnable) editDisplay(id, 'true');
  // ele.dataset.editmode = ele.dataset.editmode == 'true' ? 'false' : 'true';
};

//**Pop the title, sub-title
const popHeader = (title, subTitle) => {
  // db = firebase.firestore();

  let body = document.getElementById('body');

  // Cards Box
  const doc = domOp({
    type: `div`,
    id: `cards`,
    cl: `cards`,
    par: body,
  });

  // Title with event listener
  let ele = domOp({
    type: `div`,
    id: `title`,
    cl: `title`,
    html: `${title}`,
    par: cards,
    ev: 'click',
    evf: titleClicked,
  });

  //subTitle
  ele = domOp({
    type: `div`,
    id: `subTitle`,
    cl: `subTitle`,
    html: `${subTitle}`,
    par: cards,
  });
};

document.addEventListener(
  'searchFound',
  // (e) => console.log(e.detail.col, e.detail.id, e.detail.doc)
  (e) => popCard({ stat: 'none' }, e.detail.col, e.detail.id, e.detail.doc)
);

//************ Program *********************/

setPaths();

if (subTitle == 'Search') {
  getDBtxt().then((DBtxt) => {
    title = 'Search';
    searchMode = true;
    let askSearchItem = prompt('Search for what?', searchItem);
    subTitle = askSearchItem;
    searchItem = askSearchItem;
    console.log(DBtxt);

    let arrSearchItem = askSearchItem.split(' ');
    let strPatt = '';

    arrSearchItem.map((word) => {
      strPatt += `(?=.*${word})`;
    });

    strPatt = `${strPatt}`;

    let arrRowData = DBtxt.split('\r\n');
    let line = [];
    let cols = [];
    let patt = new RegExp(strPatt, 'i');

    arrRowData.map((row) => {
      if (row.match(patt) != null) {
        console.log(row.match(patt));
        line = row.split('~');
        cols = [...cols, `${line[0]}~${line[1]}`];
      }
    });
    // console.log(cols);
    popHeader(title, subTitle);

    cols.map((row) => {
      line = row.split('~');
      console.log(`${line[0]} - ${line[1]} `);
      dbOp({ op: 'search', col: line[0], id: line[1] });
    });
  });
} else {
  //Pop header
  searchMode = false;
  popHeader(title, subTitle);

  col = col.toString();
  //Enable DB changes detection
  dbOp({ op: 'chg', col: col });

  //Get the documents for the current collection
  dbOp({ op: 'get', col: col });
}

// console.log('dune');
