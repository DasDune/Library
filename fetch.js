// exportTags = () => {
const fetch = require('node-fetch');
//node-fetch does not look to work with local files so use URL of the file instead

const getTags = async () => {
  let res = await fetch(
    'http://dasdune/Projects/HomeAutomation/json/tags.json'
  );
  return await res.json();
};

const getText = async () => {
  let res = await fetch('http://dasdune/Projects/Lib/DB.txt');
  return await res.text();
};









// getTags2();
// getTags().then((data) => console.log(data));
getText().then((data) => console.log(data));

// console.log(getTags2());
