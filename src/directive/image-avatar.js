/**
 * 加载头像指令
 */

import {on} from '../utils/dom';

export default {
    name: 'imageavatar',
    directive: {
        bind(el,binding,vnode){
            const imgSrc = binding.value;
            const child = el.children[0];

            let img = new Image();

            img.src = imgSrc;

            img.onerror = () => {
                el.className = 'img-error';
                child.style.width = 0;
                child.style.height = 0;
            }
        }
    }
}