/**
 * 控制是否允许拖拽控制条操作
 * player：videojs 实例
 * options:{
 * 		disable:禁用控制条
 * }
 */
import './index.scss';
let customProgress = (player, options) => {
    options = options || {};
    if (options.disable) {
        player.addClass('custom-disable-progress');

        // https://github.com/rsadwick/videojs-disable-progress/blob/master/src/videojs.disableProgress.js
        player.controlBar.progressControl.seekBar.off('mousedown');
        player.controlBar.progressControl.seekBar.off('touchstart');
        player.controlBar.progressControl.seekBar.off('click');
    }
};
export { customProgress };
