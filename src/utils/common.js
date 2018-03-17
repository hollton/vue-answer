/**
 * [description] 类似lodash _.find()，在指定数组中查找包含指定键值的子项并返回该子项
 * @param  {[type]} arrayData [{id:1,name:'a',...},{id:2,name:'b',...}]
 * @param  {[type]} keyItem   {id:1,name:'a'}
 * @return {[type]} findItem  {id:1,name:'a',...}
 */
export let customFind = (arrayData, keyItem, getIndex)=>{
    if(!(arrayData && keyItem)){
        return ;
    }
    let findItem, findIndex, matchCount, keyArray = [], canContinue = true;
    for(let i in keyItem){
        if(keyItem.hasOwnProperty(i)){
            keyArray.push(i);
        }
    }
    arrayData.forEach((item,index)=>{
        matchCount = 0;
        keyArray.forEach(key=>{
            if(item[key] === keyItem[key]){
                matchCount++;
            }
        });
        if(matchCount === keyArray.length && canContinue){
            findItem = item;
            findIndex = index;
            canContinue = false;
        }
    });
    return getIndex?findIndex:findItem;
};

/**
 * [description] 类似lodash _.findIndex()，在指定数组中查找包含指定键值的子项并返回该子项序数
 * @param  {[type]} arrayData [{id:1,...},{id:2,...}]
 * @param  {[type]} keyItem   {id:1}
 * @return {[type]} findIndex  0
 */
export let customFindIndex = (arrayData, keyItem)=>{
    return customFind(arrayData, keyItem, true);
};

/**
 * [description] 判断是否为空对象
 * @param  {[Object]} obj
 * @return {[boolean]}
 */
export let isEmptyObject = (obj)=>{
    for(let i in obj){
        if(obj.hasOwnProperty(i)){
            return !1;
        }
    }
    return !0;
};

/**
 * [description] 将数组根据指定数分割成多个数组
 * @param  {[Array]} arrayData:[1,2,3,4]
 * @param  {[Number]} num :2
 * @return {[Array]}  slicedArray :[[1,2],[3,4]]
 */
export let sliceArrayByNum = (arrayData, num)=>{
    num = num || 20;
    arrayData = arrayData || [];
    let slicedArray = [];
    for(let i=0;i<arrayData.length;i+=num){
        slicedArray.push(arrayData.slice(i,i+num));
    }
    return slicedArray;
};

/**
 * [description] 对象或数组浅拷贝
 * @param  {[Object]} obj
 * @param  {[Object]} deepFlag  深递归拷贝
 * @return {[Object]} newObj
 */
export let customClone = (obj,deepFlag)=>{
    var newObj = obj.constructor === Array ? [] : {};
    if(typeof obj !== 'object'){
        return obj;
    } else {
        for(let i in obj){
            if(obj.hasOwnProperty(i)){
                if(deepFlag){
                    newObj[i] = customClone(obj[i]);
                } else {
                    newObj[i] = obj[i];
                }
            }
        }
    }
    return newObj;
};

/**
 * [description] 对象或数组深拷贝
 * @param  {[Object]} obj
 * @return {[Object]} newObj
 */
export let customDeepClone = (obj)=>{
    return customClone(obj,true);
};

export default {
    customFind,
    customFindIndex,
    isEmptyObject,
    sliceArrayByNum,
    customClone,
    customDeepClone
};