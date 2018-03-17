/**
 * 控制是否允许暂停操作，及其样式
 * player：videojs 实例
 * options:{
 * 		disable:bool,  是否禁用暂停
 * 		isStop:bool,  暂停时是否设置为停止状态
 * }
 * 
 */
import './index.scss';
let customPause = (player, options) => {
    options = options || {};
    if (options.disable) {
        player.addClass('custom-disable-pause');
        player.on('pause', function() {
            // setTimeout(() => {
            //     player.play();
            // }, 0);
        });
    } else if (options.isStop) {
        player.on('pause', function() {
            player.currentTime(0);
        });
    }
};
export { customPause };
