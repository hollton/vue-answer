// import videojs from 'video.js';

// import {customPlay} from './play/index';
// import {customPause} from './pause/index';
// import {customProgress} from './progress/index';
// import {customText} from './text/index';
// import {customTimeUpdate} from './timeUpdate/index';

// let videoPlugins = [
//     customPlay,
//     customPause,
//     customProgress,
//     customText,
//     customTimeUpdate
// ];
// videoPlugins.forEach(plugin => {
//     videojs.plugin(plugin.name, plugin);
// });

window.unexecuted = false;  //回调未执行
window.canPlay = true;  //允许资源播放

export {customPlay} from './play/index';
export {customPause} from './pause/index';
export {customProgress} from './progress/index';
export {customText} from './text/index';
export {customTimeUpdate} from './timeUpdate/index';