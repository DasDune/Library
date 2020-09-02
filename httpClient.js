const fetch = require('node-fetch');

const data = { name: 'Tag99', description: 'This is Tag99' };

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
};

const getTxt = async () => {
  let res = await fetch('http://localhost:666', options);
  return await res.text();
};

getTxt().then((txt) => {
  console.log(txt);
});
