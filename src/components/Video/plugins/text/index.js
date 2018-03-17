/**
 * 文字提示
 * player：videojs 实例
 * options:{
 *      htmlText:`已播放：${playCount}次`,
 *      style:Object  //自定义样式
 * }
 */
import './index.scss';

let setStyle = (style,textBox)=>{
    if (style) {
        for (let i in style) {
            if (style.hasOwnProperty(i)) {
                textBox.style[i] = style[i];
            }
        }
    }
};
let setClass = (className,textBox)=>{
    if (className) {
        textBox.className += ' '+className;
    }
};
let customText = (player, options) => {
    options = options || {};
    let textBox,textBoxDom;
    if (options.htmlText) {
        textBoxDom = player.el().querySelector('.play-count-box');
        if(textBoxDom){
            textBoxDom.innerHTML = options.htmlText;
            setStyle(options.style,textBoxDom);
            setClass(options.className,textBoxDom);
        } else {
            textBox = document.createElement('p');
            textBox.className += ' play-count-box';
            textBox.innerHTML = options.htmlText;
            setStyle(options.style,textBox);
            setClass(options.className,textBox);
            player.el().appendChild(textBox);
        }
    }
};
export { customText };
