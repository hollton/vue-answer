/**
 * 播放更新
 * player：videojs 实例
 * options:{
 *      type:'times' || 'once' 执行回调类型
 * 		handleBack:Fn 回调
 * }
 */
let customTimeUpdate = (player, options) => {
    options = options || {};
    let isPlaying;
    player.on('timeupdate', function() {
        isPlaying = !player.paused();
        if(options.type==='times' && player.currentTime() > player.duration() * 0.3 && isPlaying && window.unexecuted){
            window.unexecuted = false;
            options.handleBack();
        } else if(options.type==='once' && isPlaying && window.unexecuted){
            window.unexecuted = false;
            options.handleBack();
        }
    });
};
export {customTimeUpdate};
