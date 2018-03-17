/**
 * 控制是否允许播放操作，及其样式
 * player：videojs 实例
 * options:{
 *      disable:bool,  //是否禁用播放
 *      type:'string',  // 限制类型'times' || 'once'
 *      handlePromise:Fn,  //promise函数
 *      resourceId,'string',  //handlePromise传参
 *      handleBack:Fn  //回调函数
 * }
 */
// 从store中获取全部播放器实例，不太好。。用于暂停其他播放
import store from '../../../../store/modules/question.js';
import './index.scss';
let storePlayers = store.state.players;

// 若为限制操作类型，暂停为停止资源播放
let pauseMedia = (player) => {
    player.pause();
    if(player.isLimit){
        player.currentTime(0);
    }
};
let operateOtherPlayer = (currentPlayer, allPlayers, operateFn) => {
    allPlayers = allPlayers || [];
    if (!operateFn) {
        operateFn = () => {};
    }
    allPlayers.forEach(item => {
        if (currentPlayer !== item) {
            operateFn(item);
        }
    });
};
let customPlay = (player, options) => {
    options = options || {};
    if (options.disable) {
        player.addClass('custom-disable-play');
        player.on('play', () => {
            pauseMedia(player);
        });
    }

    if (options.type === 'times') { //播放资源暂停其他资源
        player.on('play', () => {
            operateOtherPlayer(player, storePlayers, pauseMedia);
            window.unexecuted = true;
        });
    } else if (options.type === 'once') { //判断能否播放，有播放中资源时不可播放
        player.on('play', () => {
            window.unexecuted = false;
            if(player.isLimit){
                if (window.canPlay) {
                    if(options.handlePromise){
                        options.handlePromise(options.resourceId).then(isCanPlay=>{
                            if(isCanPlay){
                                operateOtherPlayer(player, storePlayers, (item) => {
                                    item.addClass('disable-can-play');
                                });
                                window.canPlay = false;
                                window.unexecuted = true;
                            } else {
                                player.addClass('custom-disable-play');
                                pauseMedia(player);
                                if(options.handleBack){
                                    options.handleBack();
                                }
                            }
                        });
                    }
                } else {
                    pauseMedia(player);
                }
            } else {
                operateOtherPlayer(player, storePlayers, pauseMedia);
                window.unexecuted = true;
            }
        });
    }

    player.on('ended', () => {
        operateOtherPlayer(player, storePlayers, (item) => {
            item.removeClass('disable-can-play');
        });
        // 只能播放一次且为限制状态下，执行回调更改提示、禁用再次播放
        if(options.handleBack && player.isLimit && options.type === 'once'){
            options.handleBack();
        }
        window.canPlay = true;
    });
};
export { customPlay };
