document.addEventListener('event1', e => console.log('event received'));

let body = document.getElementById('body');

let btn = document.createElement('btn');
btn.textContent = 'Click';

console.log(body);

body.appendChild(btn);

btn.addEventListener('click', () => console.log('you click me'));
