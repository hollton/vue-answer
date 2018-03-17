/**
 * 锚点指令
 * 调用方法：
 * <li c v-anchor="{id: 'subQuestionType'+qItem.index}"></li>
 * 
 * @id：对应的锚点id
 */

import {on,setScrollTop} from '../utils/dom';

export default {
    name: 'anchor',
    directive(el,binding){
        on(el, 'click', evt => {
            evt.preventDefault();
            evt.stopPropagation();

            const anchor = document.querySelector(`#${binding.value.id}`);
            if(!anchor){
                console.log('无对应锚点信息');
                return;
            }
            const scrollTop = anchor.offsetTop + (binding.value.offset ? binding.value.offset : 0);
            setScrollTop(scrollTop);
        });
    }
}