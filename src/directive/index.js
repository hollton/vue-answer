import Vue from 'vue';

import moveel from './move-el'; // 移动元素
import anchor from './anchor'; // 锚点
import imageavatar from './image-avatar'; // 加载头像
import imageload from './image-load'; // 加载图片

const directivesObj = [
    moveel,
    anchor,
    imageavatar,
    imageload
];

directivesObj.map(item => {
    Vue.directive(item.name, item.directive);
})