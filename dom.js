//**DOM functions***
let nop = () => {};

//Elements Components Objects Array used to pop an element or get an element info
let ele = [
  { id: [] },
  { url: [] },
  { type: [] },
  { cl: [] },
  { par: [] },
  { val: [] },
  { txt: [] },
  { html: [] },
  { ev: [] },
  { evf: [] },
  { evp: [] },
  { dl: [] },
  { dsTag: [] },
  { dsVal: [] }
];

//DOM Handler
export let domOp = ele => {
  let {
    id,
    type,
    cl,
    par,
    val,
    txt,
    html,
    ev,
    evf,
    evp,
    dl,
    dsTag,
    dsVal
  } = ele;

  let newEle = {};
  console.log(document.getElementById(id));

  // ele =
  //   type !== undefined
  //     ? document.createElement(type)
  //     : document.getElementById(id);

  //Check if element already exists
  if (par !== undefined) {
    ele =
      document.getElementById(id) == undefined
        ? par.appendChild(document.createElement(type))
        : document.getElementById(id);
  } else {
    ele =
      document.getElementById(id) == undefined
        ? document.createElement(type)
        : document.getElementById(id);
  }

  // ele =
  //   id !== undefined && type == undefined
  //     ? document.getElementById(id)
  //     : document.createElement(type);

  // //Check if the element type change (video, pdf, jpg, etc..)
  // console.log(typeof ele.nodeName);
  // if (ele.nodeName.toLowerCase() !== type) {
  //   newEle = document.createElement(type);
  //   par.replaceChild(newEle, ele);
  // }

  ele.id = id !== undefined ? id : ele.id;
  cl = cl !== undefined ? (ele.className = cl) : ele.className;
  txt = txt !== undefined ? (ele.textContent = txt) : ele.textContent;
  val = val !== undefined ? (ele.value = val) : ele.value;
  html !== undefined ? (ele.innerHTML = html) : ele.innerHTML;
  dl !== undefined ? ele.setAttribute('list', dl) : nop();
  evp == undefined ? (evp = ele) : nop();
  evf !== undefined ? ele.addEventListener(ev, () => evf(event)) : nop();
  dsTag !== undefined ? ele.setAttribute(`data-${dsTag}`, dsVal) : nop();
  // par !== undefined ? par.appendChild(ele) : nop();
  return ele;
};
