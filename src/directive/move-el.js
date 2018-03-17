/**
 * 移动元素的指令
 * 调用方法：
 * <div class="answersheet" v-if="show_answersheet" ref="answersheet" v-moveel="{x:false} :data-move="dataMove"">
 * 
 * @x：x轴方向移动，默认为 true
 * @y：y轴方向移动，默认为 true
 * @dataMove:{  元素移动过程中距左边、顶部的距离
 *     x:num,
 *     y:num,
 *     xLimit:[num,num]  // 横轴移动限制
 * }
 */

import {on, off, changeElementStyle,getElementStyle} from '../utils/dom';

let attrs,moveEl,moveElWidth,moveElHeight,moveElTop,moveElLeft,nowX,nowY,windowX,windowY,maxTop,maxBottom;

const defaultOptions = {
    x: true,
    y: true
};

let _defaultOptions = {};

function handleMouseup(evt){
    off(document, 'mousemove', handleMousemove);
    off(document, 'mouseup', handleMouseup);
}

function handleMousemove(evt){
    evt.preventDefault();
    evt.stopPropagation();

    const X = evt.clientX - nowX;
    const Y = evt.clientY - nowY;

    const moveX = moveElLeft + X;
    const moveY = moveElTop + Y;

    if(_defaultOptions.x){
        let _moveX = moveX;
        if(attrs && attrs['data-move']){
            let xLimit = attrs['data-move'].xLimit;
            if(xLimit){
                xLimit.sort();
                _moveX = moveX<xLimit[0]?xLimit[0]:(moveX>xLimit[1]?xLimit[1]:moveX);
            }
            attrs['data-move'].x = _moveX;
        }

        changeElementStyle(moveEl, 'left', _moveX + 'px');
    }

    if(_defaultOptions.y && evt.clientY > maxTop && evt.clientY < maxBottom){
        if(attrs && attrs['data-move']){
            attrs['data-move'].y = moveY;
        }
        changeElementStyle(moveEl, 'top', moveY + 'px');
    }

    return false;
}

function handleMousedown(evt){
    evt.preventDefault();
    evt.stopPropagation();

    // 使用原有定位方式，防止抖动
    let originPosition = getElementStyle(moveEl, 'position');
    let positionStyles = ['absolute','relative'];
    if(positionStyles.indexOf(originPosition)===-1){
        changeElementStyle(moveEl, 'position', 'absolute');
    }
    nowX = evt.clientX;
    nowY = evt.clientY;

    windowX = window.innerWidth;
    windowY = window.innerHeight;

    moveElTop = moveEl.offsetTop;
    moveElLeft = moveEl.offsetLeft;

    moveElWidth = moveEl.clientWidth;
    moveElHeight = moveEl.clientHeight;

    const elToTop = moveEl.getBoundingClientRect().top;
    const elToBottom = moveEl.getBoundingClientRect().bottom;

    maxTop = nowY - elToTop;
    maxBottom = moveElHeight - (elToBottom - nowY) + (windowY - elToBottom) + nowY;

    on(document, 'mousemove', handleMousemove);
    on(document, 'mouseup', handleMouseup);
    return false;
}

export default {
    name: 'moveel',
    directive: {
        inserted(el,binding,vnode){
            Object.assign(_defaultOptions, defaultOptions, binding.value);
            if(binding.value.moveel && vnode.context.$refs[binding.value.moveel]){
                moveEl = vnode.context.$refs[binding.value.moveel];
            }else{
                moveEl = el;
            }

            attrs = vnode.data.attrs;
            on(el, 'mousedown', handleMousedown);
        }
    }
}