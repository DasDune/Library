tag = document.getElementById('tag');
span = document.getElementById('span');
oneClickTarget = document.getElementById('oneClick');

oneClickTarget.href = "https://www.w3schools.com";

span.dataset.tooltip = 'Date : This guy change that';
span.style.transform = "scale(1.25)";
tag.style.backgroundColor = "peachpuff";

styleCtrl = () => {
    span.style.transform = "scale(0)";
    tag.style.backgroundColor = "transparent";
}

setTimeout(() => { styleCtrl() }, 5000);



// setTimeout(() => { tag.style.backgroundColor = "transparent"; }, 5000);