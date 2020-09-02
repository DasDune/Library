//Append the link to the style sheet to the html caller (index.html)
let link1 = document.createElement('link');
link1.href = 'http://dasdune/Lib/doc2.css';
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

//*DB Doc object
let dbDoc = {
  topic: 'topic',
  desc: 'description',
  link: 'none',
};

let popLink = (id, dbDoc, card) => {
  const { link } = dbDoc;

  // Check if the link is a file
  let type = 'div';
  let fileOrDir = '';
  if (link !== undefined && link !== 'none') {
    if (link.match(/mp4/i)) type = 'video';
    if (link.match(/jpg/i)) type = 'img';
    if (link.match(/pdf/i)) type = 'object';
    let arrPathSegment = link.split('/');
    let lastPathSegment = arrPathSegment[arrPathSegment.length - 1];
    fileOrDir = lastPathSegment.includes('.') ? 'file' : 'dir';
  } else fileOrDir = 'dir';

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
    ele.href = link;
    ele.text = ' ';

    domOp({
      type: 'i',
      id: `${id}-icon`,
      cl: 'fa fa-eye',
      par: ele,
    });

    // If the file type is PDF use 'data' attribute else use 'src' attribute
    type == 'object' ? (eleFile.data = link) : (eleFile.src = link);

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
    eleLinkBox.src = dbDoc.link;
    eleLinkBox.style.backgroundImage = `url(${dbDoc.link}/logo.jpg)`;
    eleLinkBox.style.backgroundSize = `contain`;
  }
};

//DB change dispatcher
const dbChg = (data) => {
  let ele = {};
  switch (data.type) {
    case 'added':
      popCard(data.id, data.doc);
      break;

    case 'modified':
      ele = domOp({ id: `${data.id}-card` });
      ele.parentNode.removeChild(ele);
      popCard(data.id, data.doc);
      break;

    case 'removed':
      ele = domOp({ id: `${data.id}-card` });
      ele.parentNode.removeChild(ele);
      break;
  }
};

//Custom event listener for an empty DB Collection after a 'get' request, return the collection requested
document.addEventListener('colEmpty', (e) =>
  dbOp({ op: 'add', col: e.detail.col, doc: dbDoc })
);

//Custom event listener for a DB Collection after a 'get' request, return the documents collection
document.addEventListener('colFound', (e) => console.log(e.detail));

//Custom event listener for a DB Change
document.addEventListener('docChanged', (e) => dbChg(e.detail));

//Get the current directory path
let absolutePath = `${window.location.href.replace('index.html', '')}`;
let relativePath = `${window.location.pathname.replace('index.html', '')}`;
// let serverName = window.location.hostname;
// serverName = `http//${serverName}`;
console.log(`current path: ${relativePath}`);

const editDisplay = (id, editmode) => {
  if (editmode == 'true') {
    domOp({ id: `${id}-update` }).style.visibility = 'visible';
    domOp({ id: `${id}-add` }).style.visibility = 'visible';
    domOp({ id: `${id}-del` }).style.visibility = 'visible';
    domOp({ id: `${id}-topic` }).readOnly = false;
    domOp({ id: `${id}-desc` }).readOnly = false;
  } else {
    domOp({ id: `${id}-update` }).style.visibility = 'hidden';
    domOp({ id: `${id}-add` }).style.visibility = 'hidden';
    domOp({ id: `${id}-del` }).style.visibility = 'hidden';
    domOp({ id: `${id}-topic` }).readOnly = true;
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
  // let link = dbDoc.link = link;
  id = e.target.id.split('-')[0];
  let eleLinkBox = domOp({ id: `${id}-linkBox` });
  let link = eleLinkBox.src;

  let editMode = domOp({ id: `${id}-card` }).dataset.editmode;
  if (editMode == 'true') {
    let askLink = prompt('Directory name for this card:', link);
    if (askLink != link) {
      link = askLink;
      dbDoc.link = link;
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
  let topic = domOp({ id: `${id}-topic` }).value;
  topic = topic != 'new topic' ? topic : 'new topic';
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
        dbDoc.link = relativePath + droppedFile.name;
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
          id: `${id}-topic`,
          cl: 'fileTopic',
          val: topic,
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

//*Events functions
let iconEditClicked = (e) => {
  id = e.target.id.split('-')[0];
  // editmode ? editDisplay(false) : editDisplay(true);
  let ele = domOp({ id: `${id}-card` });
  ele.dataset.editmode = ele.dataset.editmode == 'true' ? 'false' : 'true';
  editDisplay(id, ele.dataset.editmode);
  console.log(ele.dataset.editmode);
};

let iconUpdateClicked = (e) => {
  id = e.target.id.split('-')[0];
  dbDoc.topic =
    domOp({ id: `${id}-topic` }).value != undefined
      ? domOp({ id: `${id}-topic` }).value
      : 'none';
  dbDoc.desc =
    domOp({ id: `${id}-desc` }).value != undefined
      ? domOp({ id: `${id}-desc` }).value
      : 'none';

  if (domOp({ id: `${id}-card` }).className == 'dirCard')
    dbDoc.link = domOp({ id: `${id}-linkBox` }).src;
  else {
    let link =
      domOp({ id: `${id}-file` }).data != undefined
        ? domOp({ id: `${id}-file` }).data
        : domOp({ id: `${id}-file` }).src;
    dbDoc.link = link.substring(
      link.indexOf(location.pathname),
      link.length + 1
    );
  }
  // dbDoc.link =
  //   domOp({ id: `${id}-file` }).dataset.link != undefined
  //     ? domOp({ id: `${id}-file` }).dataset.link
  //     : 'none';

  dbOp({ op: 'upt', col: currDir, id: id, doc: dbDoc });
};

let iconAddClicked = (e) => {
  id = e.target.id.split('-')[0];

  // dbDoc.file = 'new';
  dbDoc.topic = 'new title/topic...';
  dbDoc.desc = 'new description...';
  dbDoc.file = 'none';

  dbOp({ op: 'add', col: currDir, doc: dbDoc });
  e.target.dataset.editmode = 'false';
  editDisplay(id, 'false');
};

//Delete
let iconDelClicked = (e) => {
  id = e.target.id.split('-')[0];
  dbOp({ id: id, op: 'del', col: currDir });
};

//Get the title/currDir directory name
let arrPath = relativePath.split('/');
let titleDir = arrPath[arrPath.length - 3];
console.log(`title from dir: ${titleDir}`);
let currDir = arrPath[arrPath.length - 2];
console.log(`topic from dir: ${currDir}`);

//Get the title/topic on the first comment line in the header Box of the html page caller (index.html)
let data = document.getElementsByTagName('head')[0].childNodes[1].data;
let title = '';
let subTitle = '';

if (data !== undefined) {
  let info = data.split('-');
  title = info[0];
  console.log(`title from header: ${title}`);
  subTitle = info[1];
  console.log(`topic from header: ${currDir}`);
} else {
  title = titleDir;
  subTitle = currDir;
}

console.log(`title: ${title}`);
console.log(`subTitle: ${subTitle}`);
console.log(`collection: ${currDir}`);

//Pop card
const popCard = (id, dbDoc) => {
  const { topic, desc, link } = dbDoc;
  let fileOrDir = '';

  if (link != 'none') {
    let arrPathSegment = link.split('/');
    let lastPathSegment = arrPathSegment[arrPathSegment.length - 1];
    fileOrDir = lastPathSegment.includes('.') ? 'file' : 'dir';
  } else fileOrDir = 'dir';

  let cardClass = fileOrDir == 'dir' ? 'dirCard' : 'fileCard';
  let textBoxClass = fileOrDir == 'dir' ? 'dirTextBox' : 'fileTextBox';
  let topicClass = fileOrDir == 'dir' ? 'dirTopic' : 'fileTopic';

  //Pop Card element Box as the first child of doc element
  let Card = domOp({
    type: `div`,
    id: `${id}-card`,
    cl: cardClass,
    dsTag: `editmode`,
    dsVal: `false`,
    par: doc,
  });

  // Card.draggable = true;

  // Pop a file element (video, pdf, img, etc..)
  popLink(id, dbDoc, Card);

  //Pop Box to put the text and icons
  let eleTextBox = domOp({
    type: `div`,
    id: `${id}-textBox`,
    cl: textBoxClass,
    par: Card,
  });

  //Pop a topic element (editable)
  let Topic = domOp({
    type: `textarea`,
    id: `${id}-topic`,
    par: eleTextBox,
    cl: topicClass,
    val: topic,
  });
  Topic.readOnly = true;
  Topic.rows = 1;
  Topic.cols = 90;

  // Pop a description element (editable)
  if (fileOrDir == 'file') {
    domOp({
      type: `textarea`,
      id: `${id}-desc`,
      par: eleTextBox,
      cl: 'desc',
      val: desc,
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

  //Create add icon with listener
  domOp({
    id: `${id}-add`,
    type: 'i',
    cl: 'iconAdd fas fa-plus-circle',
    par: eleTextBox,
    ev: 'click',
    evf: iconAddClicked,
  });

  //Create delete icon with listener
  domOp({
    id: `${id}-del`,
    type: 'i',
    cl: 'iconDelete fas fa-trash-alt',
    par: eleTextBox,
    ev: 'click',
    evf: iconDelClicked,
  });
};

//**Pop the title, sub-title
const popDoc = (title, currDir) => {
  // db = firebase.firestore();

  let body = document.getElementById('body');

  // doc Box
  const doc = domOp({
    type: `div`,
    id: `doc`,
    cl: `doc`,
    par: body,
  });

  // Title
  let ele = domOp({
    type: `div`,
    id: `title`,
    cl: `title`,
    html: `${title}`,
    par: doc,
  });

  //subTitle
  ele = domOp({
    type: `div`,
    id: `subTitle`,
    cl: `subTitle`,
    html: `${currDir}`,
    par: doc,
  });
};

//************ Program *********************/

//Pop header

subTitle == currDir ? popDoc(title, currDir) : popDoc(title, subTitle);

//Enable DB changes detection for the current collection
dbOp({ op: 'chg', col: currDir });

//Get the documents for the current collection
dbOp({ op: 'get', col: currDir });

// console.log('dune');
