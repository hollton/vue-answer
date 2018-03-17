<!-- 批阅评分标准
    <question-mark-standard :standards="quesSubItem.items"></question-mark-standard>

    //localstore存储每题每学生未提交的批阅数据,已提交的要删除这条存储
    {
        `marking_question_${teacher_user_id}_${question_id}#${student_session_id}`:{
            createTime:'1496755829771',
            val:[{
                score:0,
                sq_code:"020401",
                question_answer_status:7,
                items:[{
                    standard_code:'01',
                    mark_index:0
                }]
            }]
        }
    }
 -->
<template>
    <div v-if="showMarkStandard" style="height: 100%;">
        <div class="examine-body-right-title clearfix">
            <span>评分区</span>
            <slot name="question-collect"></slot>
        </div>
        <div class="examine-body-right-content">
            <div class="examine-body-right-parts">
                <div v-for="(item,index) in selfQuestionStandards" v-if="!item.hidden">
                    <!-- 输入分数评分，要求为0-满分的整数 -->
                    <div v-if="customMarkStandard" v-for="(subItem,subIndex) in item.data">
                        <h3 class="scoring">第{{index+1}}题 （满分{{item.score}}分）</h3>
                        <div class="row-common input-score">
                            <label>得分：</label>
                            <fa-input
                                :disabled="isDisabled"
                                v-model="subItem.markScore"
                                @blur="writeStandard()"
                                @focus="focusStandard(subItem)">
                            </fa-input>
                            <span>分</span>
                            <p class="buhege-fc" v-show="subItem.showError">请输入0-{{item.score}}的整数</p>
                        </div>
                    </div>

                    <!-- 使用试卷评分标准评分 -->
                    <div v-if="!customMarkStandard" v-for="(subItem,subIndex) in item.data">
                        <h3 class="scoring">第{{index+1}}题 - 得分点{{subIndex+1}}</h3>
                        <div v-for="markItem in subItem.mark_items" class="slp-ui-scoring" :class="{'slp-focus':markItemFocus.index===markItem.index,'slp-checked':markItem.checked}" @click="chooseStandard(markItem,subItem)">
                            <span class="slp-ui-scoring__radio"></span><span v-html="filterBr(markItem.remark)"></span>（{{markItem.score}}分）
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { mapState, mapGetters } from 'vuex';
import {isEmptyObject,customFind,customFindIndex,customClone} from '../../../utils/common';
import {isSubjective} from '../../../utils/question';
import {setScrollTop,on,off} from '../../../utils/dom';
export default {
    name: 'QuestionMarkStandard',
    props: ['questionStandards','questionMark','questionData','questionResult'],
    data(){
        return {
            selfQuestionStandards:[],
            ignoreStandards:[],  // 忽略的客观题对应的评分标准，提交批阅时要补充自动批阅
            markGather:[],  //大题所有得分点子项，用于定位当前评分焦点
            markItemFocus:{}// 当前焦点得分点子项(包含得分项数据+sq_code+standard_code+批阅状态isMark+markGather索引index)
        };
    },
    computed: {
        ...mapState(['configData','userId','type','customMarkStandard']),
        ...mapState({
            marking_question:state=>state.mark.marking_question,
            onlyMarkSubjective:state=>state.mark.onlyMarkSubjective,
            disableKeyBoard:state=>state.mark.disableKeyBoard
        }),
        ...mapGetters(['initPaperStatu']),
        showMarkStandard(){
            return this.initPaperStatu.showQuestionMarkStandard && this.questionStandards && this.questionStandards.length;
        },
        isDisabled(){
            return !this.configData.markable;
        }
    },
    watch:{
        showMarkStandard(val){
            if(val){
                this.restoreCheckedStandards();
            }
        },
        questionMark(val){
            if(val){
                this.restoreCheckedStandards();
            }
        }
    },
    mounted(){
        on(window, 'keydown', this.handleKeyBoardEvt);
    },
    destroyed(){
        off(window, 'keydown', this.handleKeyBoardEvt);
    },
    methods:{
        handleKeyBoardEvt(evt){
            if(this.disableKeyBoard || this.customMarkStandard){
                return;
            }
            if(evt.keyCode === 38){  //↑
                evt.preventDefault();
                this.handleFocusMark('isPre');
            }else if(evt.keyCode === 40){  // ↓
                evt.preventDefault();
                this.handleFocusMark();
            }else if(evt.keyCode === 13){  // enter
                evt.preventDefault();
                this.handleSetMark();
            }
        },
        /**
         * [handleFocusMark 设置当前得分焦点]
         * @param  {[Boolear]} reverse  [上箭头操作，即是否为反向从下至上设置焦点项，为true时将得分点数组反转，方便统一后续操作]
         * 初始时markItemFocus为空{}，设置默认焦点索引为0，否则索引位下移并判断是否越阈值
         * 遍历得分点数组，若当前焦点项已被批阅(isMark),索引位下移并判断是否越阈值
         */
        handleFocusMark(reverse){
            let canContinue = true,
                cloneMarkGather = customClone(this.markGather),
                markItemFocusIndex;
            if(reverse){
                cloneMarkGather.reverse();
            }
            markItemFocusIndex = customFindIndex(cloneMarkGather,{index:this.markItemFocus.index});
            if(markItemFocusIndex===undefined){
                markItemFocusIndex = 0;
            } else {
                markItemFocusIndex = ++markItemFocusIndex>cloneMarkGather.length-1?cloneMarkGather.length-1:markItemFocusIndex;
            }

            cloneMarkGather.forEach(()=>{
                if(canContinue && cloneMarkGather[markItemFocusIndex].isMark){
                    markItemFocusIndex = ++markItemFocusIndex>cloneMarkGather.length-1?cloneMarkGather.length-1:markItemFocusIndex;
                } else if(canContinue){
                    canContinue = false;
                    this.markItemFocus = cloneMarkGather[markItemFocusIndex];

                    this.handleScrollVisible('.slp-ui-scoring.slp-focus','.examine-body-right-content');
                    let sqCodeFocusIndex = customFindIndex(this.selfQuestionStandards,{sq_code:this.markItemFocus.sq_code});
                    this.setScrollByStandardIndex(sqCodeFocusIndex);
                }
            });
        },
        /**
         * [handleSetMark 回车enter执行保存评分操作]
         * 获取当前焦点所在小题、得分点、得分点子项，设置评分
         * 设置与焦点得分点code相同的得分点集合数据的批阅状态为已批阅
         */
        handleSetMark(){
            let sqCodeFocus = customFind(this.selfQuestionStandards,{sq_code:this.markItemFocus.sq_code});
            let standardCodeFocus = customFind(sqCodeFocus.data,{standard_code:this.markItemFocus.standard_code});
            let markItemFocus = customFind(standardCodeFocus.mark_items,{index:this.markItemFocus.index});
            this.chooseStandard(markItemFocus,standardCodeFocus);
        },
        // 根据评分标准项索引滚动题目
        // 只对套题有效，因为遍历套题有 添加'complexSubQuestionType' id
        setScrollByStandardIndex(index){
            let anchor = document.querySelector(`#complexSubQuestionType${index}`);
            if(anchor){
                let scrollTop = anchor.offsetTop;
                setScrollTop(scrollTop, document.querySelector('.examine-body-left'));
            }
        },
        /**
         * [handleScrollVisible 滚动可视区，指定元素始终在可视区内]
         * @param  {[type]} visibleDomStr [指定可视元素'.slp-ui-scoring.slp-focus']
         * @param  {[type]} boxDomStr     [父节点滚动区域'.examine-body-right-content']
         * setTimeout推迟dom获取
         */
        handleScrollVisible(visibleDomStr,boxDomStr){
            setTimeout(()=>{
                let visibleDom = document.querySelector(visibleDomStr);
                let boxDom = document.querySelector(boxDomStr);
                if(!(visibleDom && boxDom)){
                    return ;
                }
                let top = visibleDom.offsetTop+visibleDom.offsetHeight-boxDom.clientHeight;
                setScrollTop(top,boxDom);
            },10);
        },
        // 去除br标签
        filterBr(htmlStr){
            return htmlStr.replace(/<br>/g,'').replace(/<br\/>/g,'');
        },
        // 评分标准展示（不需显示评分时或当题数据为空即服务端数据未返回时return）
        restoreCheckedStandards(){
            if(!(this.showMarkStandard && this.questionMark && !isEmptyObject(this.questionMark))){
                return ;
            }
            // 切换评分标准时滚动条回顶部
            setScrollTop(0, document.querySelector('.examine-body-right-content'));
            this.markGather = [];
            this.markItemFocus = {};
            this.lruClearMarkLocal();
            // 服务端当题当学生的批阅数据
            let questionMark = this.questionMark && this.questionMark.marking_remark && JSON.parse(this.questionMark.marking_remark),
                currentMark, // 小题的批阅数据
                currentMarkStandard, // 小题的评分标准
                markIndex = 0;  //得分点集合的每个得分点索引
            // 当前批阅数据为空时尝试从本地存储获取，否则就删除掉本地的存储（如果有的话）
            if(isEmptyObject(questionMark)){
                questionMark = this.getMarkFromLocal() || questionMark;
            } else {
                this.removeMarkOnLocal();
            }
            this.selfQuestionStandards = [];
            this.ignoreStandards = [];
            this.questionStandards.forEach(item=>{
                let currentQuestionData;
                currentMark = customFind(questionMark,{sq_code:item.sq_code});
                if(!this.customMarkStandard){
                    item.data && item.data.forEach(subItem=>{
                        subItem.isMark = false;
                        subItem.mark_items.forEach(lastitem=>{
                            this.$set(lastitem, 'checked', false);
                        });
                        if(currentMark){
                            currentMarkStandard = customFind(currentMark.items,{standard_code:subItem.standard_code});
                            if(currentMarkStandard && subItem.mark_items[currentMarkStandard.mark_index]){
                                subItem.mark_items[currentMarkStandard.mark_index].checked = true;
                                subItem.isMark = true;
                            }
                        }
                    });
                } else {
                    this.$store.commit('setShowCustomMarkError', false);
                    item.data && item.data.forEach(subItem=>{
                        subItem.isMark = false;
                        this.$set(subItem, 'showError', false);
                        if(currentMark){
                            subItem.isMark = true;
                            subItem.markScore = currentMark.score;
                            subItem.mark_items = [{
                                checked:true,
                                score:currentMark.score
                            }];
                        } else {
                            this.$set(subItem, 'markScore', null);
                        }
                    });
                }
                currentQuestionData = customFind(this.questionData && this.questionData.sub_items,{sq_code:item.sq_code});
                // 批阅忽略客观题
                if(currentQuestionData && !isSubjective(currentQuestionData.question_type) && this.type==='mark' && this.onlyMarkSubjective){
                    this.ignoreStandards.push(item);
                    item.hidden = true ;
                    item.data && item.data.forEach(subItem=>{
                        subItem.isMark = true;
                    });
                } else {  // 获取主观题得分点子项集合
                    item.data && item.data.forEach(subItem=>{
                        subItem.mark_items.forEach(lastitem=>{
                            lastitem.sq_code = item.sq_code;
                            lastitem.standard_code = subItem.standard_code;
                            lastitem.isMark = subItem.isMark;
                            lastitem.index = markIndex++;
                            this.markGather.push(lastitem);
                        });
                    });
                }
                this.selfQuestionStandards.push(item);
            });
            this.handleFocusMark();
        },
        // 点选得分（使用试卷评分标准评分时调用）
        // 并使焦点下移
        chooseStandard(markItem, markParentItems){
            if(markItem.checked || this.isDisabled){
                return;
            }
            this.markItemFocus = markItem;
            let sqCodeFocusIndex = customFindIndex(this.selfQuestionStandards,{sq_code:markItem.sq_code});
            this.setScrollByStandardIndex(sqCodeFocusIndex);
            let isNotAllMark,
                markData;
            markParentItems.mark_items.forEach(item=>{
                this.$set(item, 'checked', false);
            });
            this.$set(markItem, 'checked', true);
            markParentItems.isMark = true;
            this.markGather.forEach(item=>{
                if(item.sq_code === markItem.sq_code && item.standard_code === markItem.standard_code){
                    item.isMark = true;
                }
            });
            this.selfQuestionStandards.forEach(item=>{
                item.data.forEach(subItem=>{
                    if(!subItem.isMark){
                        isNotAllMark = true;
                    }
                });
            });
            markData = this.solveMarkData(this.selfQuestionStandards);
            // 各小题各得分点均批改才提交数据，否则存储本地
            if(!isNotAllMark){
                markData.marking_remark = JSON.stringify(markData.marking_remark);
                this.$emit('putStandard',markData);
                this.removeMarkOnLocal();
            } else {
                this.setMarkToLocal(markData.marking_remark);
            }
            this.handleFocusMark();
        },
        // 输入得分（使用自定义分数评分时调用）
        // 需对套题的多个子题分值做校验
        writeStandard(){
            if(this.isDisabled){
                return;
            }
            // 解除禁用键盘操作切换
            this.$store.commit('setDisableKeyBoard', false);
            this.selfQuestionStandards.forEach(_item=>{
                if(_item.hidden){
                    return;
                }
                _item.data.forEach(subItem=>{
                    subItem.isMark = false;
                    if(subItem.markScore!==0 && !subItem.markScore){
                        subItem.showError = true;
                        return;
                    }
                    // 输入类似'01'时提示
                    if(subItem.markScore.length>1 && subItem.markScore.indexOf('0')===0){
                        subItem.showError = true;
                        return;
                    }
                    let numberScore = Number(subItem.markScore);
                    // 校验为0-满分的整数
                    if(!(numberScore>=0 && numberScore<=_item.score && /^\d+$/.test(numberScore))){
                        subItem.showError = true;
                        return;
                    }

                    subItem.isMark = true;
                    subItem.mark_items = [{
                        checked:true,
                        score:numberScore
                    }];
                });
            });

            
            let isNotAllMark, markData;
            this.selfQuestionStandards.forEach(_item=>{
                _item.data.forEach(subItem=>{
                    if(!subItem.isMark){
                        isNotAllMark = true;
                    }
                });
            });
            markData = this.solveMarkData(this.selfQuestionStandards,this.customMarkStandard);
            // 各小题各得分点均批改才提交数据，否则存储本地
            this.$store.commit('setShowCustomMarkError', isNotAllMark);
            if(!isNotAllMark){
                markData.marking_remark = JSON.stringify(markData.marking_remark);
                this.$emit('putStandard',markData);
                this.removeMarkOnLocal();
            } else {
                this.setMarkToLocal(markData.marking_remark);
            }
        },
        focusStandard(markItem){
            markItem.showError = false;
            // 禁用键盘操作切换
            this.$store.commit('setDisableKeyBoard', true);
        },
        // 处理需提交给服务端的批阅数据
        solveMarkData(markStandard,isCustomMarkStandard){
            let markData = {
                marking_remark:this.questionMark.marking_remark,  // change
                marking_user_id:this.questionMark.marking_user_id, // change
                question_answer_status:this.questionMark.question_answer_status,  // change
                question_id:this.questionMark.question_id,
                question_version:this.questionMark.question_version || 0,
                score:this.questionMark.score,  // change
                session_id:this.questionMark.session_id,
                subs:this.questionMark.subs  // change
            };
            let remarkData = [], // 大题批阅数据
                answerStatus = 5,  // 大题批阅状态
                subAnswerStatus = 5,  // 小题批阅状态
                score = null,  // 大题批阅分数
                subsScore = null,  // 小题批阅分数
                subsData = []; // 大题的子题数据

            markStandard.forEach((item,index)=>{
                subsScore = null;
                if(!item.hidden){ // 主观题
                    let checkedItem;
                    item.data.forEach(subItem=>{
                        checkedItem = customFind(subItem.mark_items, {checked:true});
                        if(checkedItem && (checkedItem.score===0 || checkedItem.score)){
                            subsScore += checkedItem.score;
                        }
                    });

                    let currentSqcodeItem = customFind(this.questionData.sub_items,{sq_code:item.sq_code});
                    subAnswerStatus = currentSqcodeItem && currentSqcodeItem.score===subsScore?5:7;
                } else { // 客观题，从自动批阅结果中还原状态机分数
                    let itemResult = this.questionResult.subs[index];
                    subsScore = itemResult && itemResult.score;
                    subAnswerStatus = itemResult && itemResult.question_answer_status;
                }

                score += subsScore;
                if(subAnswerStatus===7){
                    answerStatus = 7;
                }
                subsData.push({
                    question_answer_status:subAnswerStatus,
                    score:subsScore
                });

                let remarkItems = [],
                    remarkIndex;
                item.data && item.data.forEach(markItem=>{
                    remarkIndex = customFindIndex(markItem.mark_items,{checked:true});

                    let isIgnore = customFind(this.ignoreStandards,{sq_code:item.sq_code});
                    if(remarkIndex !== undefined && !isIgnore){
                        remarkItems.push({
                            standard_code:markItem.standard_code,
                            mark_index:remarkIndex
                        });
                    }
                });
                remarkData.push({
                    sq_code:item.sq_code,
                    score:subsScore,
                    items:!isCustomMarkStandard?remarkItems:[]
                });
            });

            markData.marking_remark = remarkData;
            markData.marking_user_id = this.userId;
            markData.question_answer_status = answerStatus;
            markData.score = score;
            markData.subs = subsData;
            return markData;
        },
        getMarkKeyForLocal(){
            return `marking_question_${this.userId}_${this.questionMark.question_id}#${this.questionMark.session_id}`;
        },
        getMarkFromLocal(){
            try {
                let jsonStr = window.localStorage.getItem(this.getMarkKeyForLocal());
                let data = JSON.parse(jsonStr);
                return data.val;
            } catch (err) {
                return false;
            }
        },
        setMarkToLocal(data){
            let jsonStr,
                newData;
            try {
                newData = { val: data, createTime: new Date().getTime() };
                jsonStr = JSON.stringify(newData);
            } catch (err) {
                return false;
            }
            try {
                window.localStorage.setItem(this.getMarkKeyForLocal(), jsonStr);
            } catch (err) {
                return false;
            }
            return true;
        },
        removeMarkOnLocal(){
            try {
                window.localStorage.removeItem(this.getMarkKeyForLocal());
                return true;
            } catch (err) {
                return false;
            }
        },
        isMarkingQuestionLocal(key) {
            return typeof key == 'string' && key.indexOf('marking_question_') === 0;
        },
        // 保留最新的50条批阅中间状态数据记录
        lruClearMarkLocal(limit) {
            limit = limit || 50;
            var datas = [];
            try {
                for (var i = 0; i < window.localStorage.length; i++) {
                    var key = window.localStorage.key(i);
                    if (this.isMarkingQuestionLocal(key)) {
                        var jsonStr = window.localStorage.getItem(key);
                        var data =JSON.parse(jsonStr);
                        datas.push({ key: key, createTime: data.createTime });
                    }
                }
            } catch (err) {
                return false;
            }
            datas.sort(function (a, b) {
                return a.createTime > b.createTime ? -1 : 1;
            });

            for (var j = limit; j < datas.length; j++) {
                window.localStorage.removeItem(datas[j].key);
            }
        },
        isShowQuestion(questionType){
            return this.type==='mark' && this.onlyMarkSubjective && isSubjective(questionType);
        }
    }
};
</script>
<style lang="scss">
    .row-common{
        &.input-score{
            .fa-input{
                width:auto;
                .fa-input__input{
                    box-sizing:initial;
                }
            }
        }
    }
</style>