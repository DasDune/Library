//Append the link to the style sheet to the html caller (index.html)
let link1 = document.createElement('link');
link1.href = 'http://DuneWebServer/Dune/lib/doc.css';
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
// let link = '';
// let serverName = 'http://dunewebserver';
// let IP = 'http:://192.168.1.2';

//*DB Doc object
let dbDoc = {
  file: 'none',
  topic: 'topic',
  desc: 'description',
  link: 'none'
};

const updateCard = (id, dbDoc) => {};

let popFile = (id, dbDoc, Card) => {
  const { topic, desc, file, link } = dbDoc;

  // The first card is created automatically with empty fields
  let type = 'div';
  if (file !== undefined && file.match(/mp4/i)) type = 'video';
  if (file !== undefined && file.match(/jpg/i)) type = 'img';
  if (file !== undefined && file.match(/pdf/i)) type = 'object';

  let targetSectionClass = file == 'none' ? 'dirSection' : 'fileSection';

  //pop file section
  let eleFileSection = domOp({
    type: 'div',
    id: `${id}-fileSection`,
    par: Card,
    cl: targetSectionClass,
    ev: 'drop',
    evf: dropFile
  });

  //pop file child
  let eleFile = domOp({
    type: type,
    id: `${id}-file`,
    par: eleFileSection,
    cl: 'file',
    dsTag: 'file',
    dsVal: file
  });

  eleFile.ondragover = e => fileDragOver(e);

  if (file != 'none') {
    //pop link child
    let ele = domOp({
      type: 'a',
      id: `${id}-link`,
      cl: 'link',
      par: eleFileSection
    });
    ele.target = '_blank';
    ele.href = file;
    ele.text = ' ';

    domOp({
      type: 'i',
      id: `${id}-icon`,
      cl: 'fa fa-eye',
      par: ele
    });
  } else {
    domOp({
      id: `${id}-file`,
      ev: 'click',
      evf: fileClick
    });

    domOp({
      id: `${id}-file`,
      dsTag: 'link',
      dsVal: link
    });
  }

  type == 'object' ? (eleFile.data = file) : (eleFile.src = file);

  if (type == 'video') {
    eleFile.src = file;
    console.log(eleFile.src);
    eleFile.controls = true;
    eleFile.preload = false;
    eleFile.loop = false;
    // eleFile.width = '100';
    // eleFile.height = '240';
  }
};

//DB change dispatcher
const dbChg = data => {
  let ele = {};
  switch (data.type) {
    case 'added':
      popCard(data.id, data.doc);
      break;

    case 'modified':
      ele = domOp({ id: `${data.id}-card` });
      ele.parentNode.removeChild(ele);
      popCard(data.id, data.doc);
      // const { file, topic, desc } = data.doc;
      // let fileType = file.includes('pdf') ? 'pdf' : 'picVid';
      // // ele = document.getElementById(data.id);
      // imgVid == 'pdf'
      //   ? (domOp({ id: `${id}-file` }).data = file)
      //   : (domOp({ id: `${id}-file` }).src = file);
      // domOp({ id: `${id}-topic` }).textContent = topic;
      // domOp({ id: `${id}-desc` }).textContent = desc;
      break;

    case 'removed':
      ele = domOp({ id: `${data.id}-card` });
      ele.parentNode.removeChild(ele);
      break;
  }
};

//Custom event listener for an empty DB Collection after a 'get' request, return the collection requested
document.addEventListener('colEmpty', e =>
  dbOp({ op: 'add', col: e.detail.col, doc: dbDoc })
);

//Custom event listener for a DB Collection after a 'get' request, return the documents collection
document.addEventListener('colFound', e => console.log(e.detail.msg));

//Custom event listener for a DB Change
document.addEventListener('docChanged', e => dbChg(e.detail));

//Get the current directory path
// let currPath = `${window.location.href.replace('index.html', '')}`;
let currPath = `${window.location.pathname.replace('index.html', '')}`;
// let serverName = window.location.hostname;
// serverName = `http//${serverName}`;
console.log(`current path: ${currPath}`);

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
const fileDragOver = e => {
  e.preventDefault();
  e.target.style.backgroundColor = 'green';
};

const fileClick = e => {
  console.log('file click!');
  id = e.target.id.split('-')[0];
  let link = e.target.dataset.link;
  let file = e.target.dataset.file;
  let editMode = domOp({ id: `${id}-card` }).dataset.editmode;
  if (editMode == 'true') {
    let askLink = prompt('Directory name for this card:', link);
    if (askLink != link) {
      link = askLink;
      dbDoc.link = link;
      e.target.dataset.link = link;
    }
  } else {
    link = link != 'none' ? e.target.dataset.link : e.target.dataset.file;
    if (link != 'none') location.assign(link);
  }
};

// * File has been dropped, update the filename and file type/element if required
const dropFile = e => {
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

    let currFile = document.getElementById(e.target.id);
    // let currCard = currFile.parentNode;
    if (e.dataTransfer.items) {
      if (e.dataTransfer.items[0].kind === 'file') {
        let droppedFile = e.dataTransfer.items[0].getAsFile();
        let eleFileNew = {};
        dbDoc.file = droppedFile.name;
        // let ext = droppedFile.name.split('.')[1];
        let type = 'div';
        if (droppedFile !== undefined && droppedFile.name.match(/mp4/i))
          type = 'video';
        if (droppedFile !== undefined && droppedFile.name.match(/jpg/i))
          type = 'img';
        if (droppedFile !== undefined && droppedFile.name.match(/pdf/i))
          type = 'object';

        //target the file element
        // id = e.target.id;

        //Create a new element to replace the current element
        eleFileNew = domOp({
          id: 'newID',
          type: type,
          cl: 'file',
          ev: 'drop',
          evf: dropFile,
          dsTag: 'file',
          dsVal: droppedFile.name
        });

        type == 'object'
          ? (eleFileNew.data = droppedFile.name)
          : (eleFileNew.src = droppedFile.name);
        eleFileNew.ondragover = e => fileDragOver(e);
        eleFileNew.id = `${id}-file`;
        e.target.parentNode.replaceChild(eleFileNew, e.target);

        domOp({
          id: `${id}-card`,
          cl: 'cardFile'
        });

        domOp({
          id: `${id}-fileSection`,
          cl: 'fileSection'
        });

        //Get the current element
        let elePar = domOp({ id: `${id}-fileSection` });

        // pop link child
        let ele = domOp({
          type: 'a',
          id: `${id}-link`,
          cl: 'link',
          par: elePar
        });
        ele.target = '_blank';
        ele.href = droppedFile.name;
        ele.text = ' ';

        domOp({
          type: 'i',
          id: `${id}-icon`,
          cl: 'fa fa-eye',
          par: ele
        });

        domOp({
          id: `${id}-section`,
          cl: 'textSectionFile'
        });

        domOp({
          id: `${id}-topic`,
          cl: 'fileTopic',
          val: topic
        });

        // ele = domOp({ id: `${id}-section` });

        let Desc = domOp({
          type: `textarea`,
          id: `${id}-desc`,
          par: ele,
          cl: 'desc',
          val: desc
        });

        // ele.target = '_blank';
        // ele.href = currPath + droppedFile.name;

        if (type == 'video') {
          eleFileNew.controls = true;
          eleFileNew.preload = false;
          eleFileNew.loop = false;
        }
      }
    }
  }
};

//*Events functions
let iconEditClicked = e => {
  id = e.target.id.split('-')[0];
  // editmode ? editDisplay(false) : editDisplay(true);
  let ele = domOp({ id: `${id}-card` });
  ele.dataset.editmode = ele.dataset.editmode == 'true' ? 'false' : 'true';
  editDisplay(id, ele.dataset.editmode);
  console.log(ele.dataset.editmode);
};

let iconUpdateClicked = e => {
  id = e.target.id.split('-')[0];
  dbDoc.topic =
    domOp({ id: `${id}-topic` }).value != undefined
      ? domOp({ id: `${id}-topic` }).value
      : 'none';
  dbDoc.desc =
    domOp({ id: `${id}-desc` }).value != undefined
      ? domOp({ id: `${id}-desc` }).value
      : 'none';
  dbDoc.file =
    domOp({ id: `${id}-file` }).dataset.file != undefined
      ? domOp({ id: `${id}-file` }).dataset.file
      : 'none';
  dbDoc.link =
    domOp({ id: `${id}-file` }).dataset.link != undefined
      ? domOp({ id: `${id}-file` }).dataset.link
      : 'none';

  // dbDoc.file = dbDoc.file != undefined ? dbDoc.file : 'none';
  // dbDoc.desc = dbDoc.desc != undefined ? dbDoc.desc : 'none';
  // dbDoc.link = dbDoc.link != undefined ? dbDoc.link : 'none';
  // let source = document.getElementById(`${id}-file`).value;
  // let data = document.getElementById(`${id}-file`).data;
  // // dbDoc.file = document.getElementById(`${id}-file`).value;
  // dbDoc.file = data != undefined ? data : source;

  dbOp({ op: 'upt', col: currDir, id: id, doc: dbDoc });
  // editmode = !editmode;
  // editDisplay(editmode);
};

let iconAddClicked = e => {
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
let iconDelClicked = e => {
  id = e.target.id.split('-')[0];
  dbOp({ id: id, op: 'del', col: currDir });
};

//Get the title/currDir directory name
let arrPath = currPath.split('/');
let titleDir = arrPath[arrPath.length - 3];
console.log(`title from dir: ${titleDir}`);
let currDir = arrPath[arrPath.length - 2];
console.log(`topic from dir: ${currDir}`);

//Get the title/topic on the first comment line in the header section of the html page caller (index.html)
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
  const { topic, desc, file } = dbDoc;

  let cardClass = file == 'none' ? 'cardDir' : 'cardFile';
  let textSectionClass = file == 'none' ? 'textSectionDir' : 'textSectionFile';
  let topicClass = file == 'none' ? 'dirTopic' : 'fileTopic';

  //Pop Card element container as the first child of body element
  let Card = domOp({
    type: `div`,
    id: `${id}-card`,
    cl: cardClass,
    dsTag: `editmode`,
    dsVal: `false`,
    par: doc
  });

  // Card.draggable = true;

  let type = 'div';

  // Pop a file element (video, pdf, img, etc..)
  popFile(id, dbDoc, Card);

  //Pop Section to put the text and icons
  let Section = domOp({
    type: `div`,
    id: `${id}-section`,
    cl: textSectionClass,
    par: Card
  });

  //Pop a topic element (editable)
  let Topic = domOp({
    type: `textarea`,
    id: `${id}-topic`,
    par: Section,
    cl: topicClass,
    val: topic
  });
  Topic.readOnly = true;
  Topic.rows = 1;
  Topic.cols = 90;

  // Pop a description element (editable)
  if (file != 'none') {
    let Desc = domOp({
      type: `textarea`,
      id: `${id}-desc`,
      par: Section,
      cl: 'desc',
      val: desc
    });
  }

  // Desc.readOnly = true;
  // Desc.rows = 4;
  // Desc.cols = 100;

  //Pop a edit icon with listener
  let IconEdit = domOp({
    id: `${id}-edit`,
    type: 'i',
    cl: 'iconEdit fas fa-edit',
    par: Section,
    ev: 'click',
    evf: iconEditClicked
  });

  // Create update icon with listener
  let IconUpdate = domOp({
    id: `${id}-update`,
    type: 'i',
    cl: 'iconUpdate fas fa-sync-alt',
    par: Section,
    ev: 'click',
    evf: iconUpdateClicked
  });

  //Create add icon with listener
  let IconAdd = domOp({
    id: `${id}-add`,
    type: 'i',
    cl: 'iconAdd fas fa-plus-circle',
    par: Section,
    ev: 'click',
    evf: iconAddClicked
  });

  //Create delete icon with listener
  let IconDel = domOp({
    id: `${id}-del`,
    type: 'i',
    cl: 'iconDelete fas fa-trash-alt',
    par: Section,
    ev: 'click',
    evf: iconDelClicked
  });
};

//**Pop the title, sub-title
const popDoc = (title, currDir) => {
  // db = firebase.firestore();

  let body = document.getElementById('body');

  // doc container
  const doc = domOp({
    type: `div`,
    id: `doc`,
    cl: `doc`,
    par: body
  });

  // Title
  let ele = domOp({
    type: `div`,
    id: `title`,
    cl: `title`,
    html: `${title}`,
    par: doc
  });

  //subTitle
  ele = domOp({
    type: `div`,
    id: `subTitle`,
    cl: `subTitle`,
    html: `${currDir}`,
    par: doc
  });
};

//************ Program *********************/

//Pop header

subTitle == currDir ? popDoc(title, currDir) : popDoc(title, subTitle);

//Enable DB changes detection
dbOp({ op: 'chg', col: currDir });

//Get the documents for the current collection
dbOp({ op: 'get', col: currDir });

// console.log('dune');
