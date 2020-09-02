//*Dir object
let dirObj = {
  menu: 'menu',
  title: 'title',
  topic: 'topic'
};

//Look for the menu item name in the current path and get the title and topic names
export let dirOp = dirObj => {
  const { menu } = dirObj;
  //Get the current directory path
  let currPath = `${location.pathname}`;
  console.log(`path: ${currPath}`);

  let arrPath = currPath.split('/');
  console.log(`paths : ${arrPath}`);
  let dirs = arrPath;
  let levels = { ...dirs };

  dirs.map(item => {
    
  });

  //   switch (levels.length){

  //     // case 1:
  //     //     console.log(`menu level: ${{1:menu}}`);
  //     //     break;

  //     // case 2:
  //     //         console.log(`menu level: ${arrPath[levels - 2]}`);
  //     //         console.log(`title level: ${arrPath[levels - 1]}`);
  //     //         break;

  //     // case 3:
  //     //         console.log(`menu level: ${arrPath[levels - 3]}`);
  //     //         console.log(`title level: ${arrPath[levels - 2]}`);
  //     //         console.log(`topic level: ${arrPath[levels - 1]}`);
  //     //         break;

  //     case 4:
  //             console.log(`menu level: ${{levels.0} - 4]}`);
  //             console.log(`title level: ${arrPath[levels - 3]}`);
  //             console.log(`topic level: ${arrPath[levels - 2]}`);

  //             break;

  //   }

  console.log(`current level : ${levels - 1}`);
  console.log(`topic level: ${arrPath[levels - 2]}`);
  console.log(`title level: ${arrPath[levels - 3]}`);
  console.log(`menu level: ${arrPath[levels - 4]}`);

  let menuLevel = arrPath.indexOf(menu);

  //   if (menuLevel != -1) {
  //     console.log(`${menu} is located at level: ${menuLevel}`);
  //     let title = arrPath[menuLevel + 1];
  //     let topic = arrPath[menuLevel + 2];
  //     console.log(`Title is: ${title}`);
  //     console.log(`Topic is: ${topic}`);
  //   } else console.log(`Cannot find: ${menu} in the path !`);
};

dirOp({ menu: 'doc' });
