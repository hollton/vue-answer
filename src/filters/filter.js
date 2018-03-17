import Vue from 'vue';

// 题目类型映射
Vue.filter('questionTypeFilter', value => {
    const type = {
        10: 'SingleChoice', // 单选
        15: 'MultiChoice', // 多选
        18: 'MultiChoice', // 不定项选择题型使用多选
        20: 'Completion', // 填空
        25: 'Subjective', // 主观
        30: 'Judgement', // 判断
        50: 'Complex'  // 套题
    };
    return type[value];
});

// 题目序号转字母
Vue.filter('indexToLetterFilter', index => {
    return String.fromCharCode(65+index);
});

/**
 * 保留小数点后几位
 * num：要格式化的数据
 * bit：需要保留几位小数。当数据是整数，或者小数点后的位数小于要保留的位数时，不做处理
 */
Vue.filter('numberToFixedFilter', (num, bit)=> {
    var number = num;

    if(isNaN(number)){
        return number;
    }

    if (number) {
        var numBit = bit !== undefined ? window.parseInt(bit) : 2;
        var numBitLen = number.toString().substr(number.toString().indexOf('.')).length;
        if (window.parseInt(number) !== number && numBitLen > numBit) {
            number = parseFloat(number).toFixed(numBit);
        }
        return Number(number);
    }
    return number;
});