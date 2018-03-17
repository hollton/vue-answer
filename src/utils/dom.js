// 增加元素样式
export const changeElementStyle = (function(){
    return function(element, style, value){
        element.style[style] = value;
    }
})();

// 获取元素getComputedStyle样式
export const getElementStyle = (function(){
    return function(element, style){
        let computedStyle = window.getComputedStyle(element, '');
        return computedStyle[style];
    }
})();

// 增加类名
export const addClass = (function(){
    return function(element, className){
        const oldClassName = element.className.split(' ');
        const addClassName = className.split(' ');

        const newClassName = oldClassName.concat(addClassName);

        element.className = newClassName.join(' ');
    }
})();

// 删除类名
export const removeClass = (function(){
    return function(element, className){
        const oldClassName = element.className.split(' ');
        const removeClassName = className.split(' ');

        removeClassName.forEach((c, index) => {
            let c_index = oldClassName.indexOf(c);
            if(c_index > -1){
                oldClassName.splice(c_index, 1);
            }
        });

        element.className = oldClassName.join(' ');
    }
})();

// 增加事件监听器
export const on = (function() {
    if (document.addEventListener) {
        return function(element, event, handler, propagation) {
            if(!propagation){
                propagation = false;
            }
            if (element && event && handler) {
                element.addEventListener(event, handler, propagation);
            }
        };
    } else {
        return function(element, event, handler) {
            if (element && event && handler) {
                element.attachEvent('on' + event, handler);
            }
        };
    }
})();

// 移除事件监听器
export const off = (function() {
    if (document.removeEventListener) {
        return function(element, event, handler, propagation) {
            if(!propagation){
                propagation = false;
            }
            if (element && event) {
                element.removeEventListener(event, handler, propagation);
            }
        };
    } else {
        return function(element, event, handler) {
            if (element && event) {
                element.detachEvent('on' + event, handler);
            }
        };
    }
})();

export const setScrollTop = (function(){
    return function(top, dom){
        //添加dom参数
        if(dom){
            dom.scrollTop = top;
        } else {
            // scrollTop 兼容性修改 
            document.body.scrollTop = top; // chrome
            document.documentElement.scrollTop = top; // ie、firefox
        }
    }
})();

export default {
    changeElementStyle,
    getElementStyle,
    on,
    off,
    setScrollTop
}