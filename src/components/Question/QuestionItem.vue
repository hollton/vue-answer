<template>
    <div>
        <div v-for="quesData in questionData" :id="'subQuestionType'+quesItem.index" v-show="!(currentQuestionResult.result && currentQuestionResult.result.right && configData.onlyError)" @click="viewImageProxy($event)">
            <component v-if="loadComponent"
                :is="quesData.question_type | questionTypeFilter"
                :quesItem="quesData"
                :quesIndex="quesItem.index"
                :timeSaveAnswer="timeSaveAnswer"
                @answerResult="answerResult"
                :isDisabled="isDisabled"
                @randerVideo="randerVideo">
                <question-image slot="question-img"
                    :questionResult="currentQuestionResult"
                    :timeSaveAnswer="timeSaveAnswer"
                    :disableUpload="quesData.question_type===50"
                    :editable="configData.editable"></question-image>
            </component>
            <!-- 计算当题对错状态 -->
            <question-status :questionResult="currentQuestionResult"></question-status>
        </div>
        <!-- 图片预览组件 -->
        <fa-cropper v-model="showPicView" :img-url="currentPicSrc" :img-list="picAttachments" :use-crop="false"></fa-cropper>
    </div>
</template>
<script>
import {
    mapState,
    mapMutations,
    mapActions,
    mapGetters
} from 'vuex';

import '../../filters/filter';
import QuestionsComponents from './QuestionType/index';
import Complex from './QuestionType/Complex';
import SectionsComponents from './Sections';
import {checkDone,convertAllVideoId,getCurrentDateTime} from '../../utils/question';
import {customFind} from '../../utils/common';
import videojs from 'video.js';
import 'video.js/dist/video-js.min.css';
import '../Video/video.css'; //第三方videojs样式
import languages from '../Video/languages';
import * as videoPlugins from '../Video/plugins/index'; // videojs插件控制
import '../Video/plugins/index.scss'; //自定义样式
let calcNum;

export default {
    name: 'questionItem',
    mounted() {
        // todo: 只要转化有显示的题目
        this.convertQuestionBody([this.quesItem]);
    },
    props: {
        quesItem: Object,
        parentIndex: Number
    },
    data() {
        return {
            questionData: [],
            showPicView: false,
            currentPicSrc: '',
            picAttachments: [],
            selfIsDone: '', // 存储当前题的作答状态
            resourceIds: [], // 当题音视频id集合，用于videojs渲染
            loadComponent: false,
            videoOptions: { // 视频配置
                language: 'zh-CN',
                bigPlayButton:false,
                preload:'metadata',
                controlBar: {
                    remainingTimeDisplay: false,
                    currentTimeDisplay:true,
                    timeDivider:true,
                    durationDisplay:true,
                    volumeMenuButton: {
                        inline: true,
                        vertical: false
                    },

                    captionsButton : false,  // 不需要的false减少节点
                    chaptersButton: false,
                    subtitlesButton:false,
                    liveDisplay:false,
                    playbackRateMenuButton:false,
                    descriptionsButton:false
                },
                poster:'poster' //封面加载图
            },
            resourceLimitCount:1,
            onceUnplayText:'<i></i>本题干仅播放一次，请确保播放期间不会受到其他干扰',
            oncePlayedText:'<i></i>你已播放过该资源，不能再次播放！'
        };
    },
    computed: {
        ...mapState(['paperData', 'configData', 'resultData', 'studentId', 'examId', 'paperId', 'sessionId', 'type','resourceLimit']),
        ...mapState({
            resourcePlayData: state => state.question.resourcePlayData,
            players: state => state.question.players,
            collectionItems: state => state.question.collectionItems
        }),
        ...mapGetters(['initPaperStatu']),
        isDisabled() {
            return !this.configData.editable;
        },
        // 当前考试会话+当前题+当前查看学生的收藏信息
        currentCollectionType() {
            let collectionData;
            this.collectionItems && this.collectionItems.forEach(item => {
                if (item.owner === this.studentId && item.session_id === this.sessionId && item.question_id === this.quesItem.id) {
                    collectionData = item;
                }
            });
            return collectionData && collectionData.type;
        },
        // 当题作答结果
        currentQuestionResult() {
            let thisResult = this.resultData[this.quesItem.id] || {};
            // 作答中，套题的照片作答数据要修改为第一个主观子题作答
            if(this.configData.editable && thisResult.answer && this.quesItem.question_type === 50){
                let picAnswer = JSON.parse(thisResult.answer);
                if(picAnswer.type==='cs_image'){
                    let q;
                    this.quesItem.sub_items && this.quesItem.sub_items.forEach((item,index)=>{
                        if(!q && (item.question_type===20 || item.question_type===25)){
                            q = (index+1).toString();
                        }
                    });
                    picAnswer = {
                        type:'cs_sub_image',
                        data:[{
                            q:q,
                            sub_data:picAnswer.data
                        }]
                    };
                }
                thisResult.answer = JSON.stringify(picAnswer);
            }
            return thisResult;
        }
    },
    updated() {
        if (this.currentQuestionResult.result && this.currentQuestionResult.result.right === false) {
            this.$emit('hasError', this.parentIndex, true);
        }
    },
    components: {
        ...QuestionsComponents,
        Complex,
        ...SectionsComponents
    },
    methods: {
        ...mapActions(['getExamQuestionsById', 'saveAnswer', 'getExamPaperById', 'addResourcePlayCount']),
        ...mapMutations(['changeQuestionDoneStatus', 'calcQuestionCount','setPlayData','setResultData','addPlayer']),

        randerVideo() {
            // 渲染公式
            window.MathJax && MathJax.Hub.Queue(['Typeset', MathJax.Hub]);

            // 等待题干html标签渲染出来后才渲染视频
            let _this = this;
            videojs.addLanguage(this.videoOptions.language, languages[this.videoOptions.language]);
            this.resourceIds.forEach(id => {
                // 只初始化需要在页面显示的视频
                if(!customFind(this.players,{id_:id}) && !!document.getElementById(id)){
                    //todo: 又一个依赖元素id规则
                    let resourceId = id.match(/_video_(.+)@/i)[1];
                    let questionResourceId = this.quesItem.id + '_' + resourceId;
                    let player = videojs(id, this.videoOptions).ready(function() {
                        let resourceType = this.isAudio_?'audio':'video';
                        let isDoLimit = _this.type==='answer' && _this.configData.editable && _this.resourceLimit.range.indexOf(resourceType)!==-1;
                        this.isLimit = isDoLimit;

                        _this.hideVideoPoster();
                        _this.videoLinster(this, questionResourceId, resourceId);
                    });
                    this.addPlayer(player);
                }
            });
        },
        // 获取单资源播放次数
        getResourcePlayCountById(resourceId){
            let isCanPlay = true;
            let paramData = {
                exam_id: this.examId,
                resource_id:resourceId,
                question_id:this.quesItem.id
            };
            if(this.resourceLimit.type==='once'){
                paramData.session_id = this.sessionId;
            }
            return this.$store.dispatch('getResourcePlayCount', paramData).then(data=>{
                if(data){
                    data.forEach(item=>{
                        if(item.play_count>=this.resourceLimitCount){
                            isCanPlay = false;
                        }
                    });
                }
                return isCanPlay;
            });
        },
        //处理同题同id资源
        solveIdentityPlayers(players,myPlayer,operateFn){
            players.forEach(player=>{
                // 依赖videoPlayer.getPlayerHtml方法中videoIdentity的规则。对于同一题和同一个资源，根据规则拼出来的id只要去掉计数部分后如果相同，说明是统一到题中加了相同的资源
                // todo: 解耦 to 刘浩东
                if(player.id_.split('@')[0] ===  myPlayer.id_.split('@')[0]){
                    operateFn(player);
                }
            });
        },

        /**
         * [videoLinster]
         * @param myPlayer           [videojs实例]
         * @param questionResourceId [store上资源标识，存储资源播放次数（questionId_resourceId）]
         * @param resourceId         [资源id]
         */
        videoLinster(myPlayer, questionResourceId, resourceId) {
            let limitType = this.resourceLimit.type || 'times';
            let playCount = this.resourcePlayData[questionResourceId] && this.resourcePlayData[questionResourceId].play_count || 0;
            /**
             * limitType==='times'时，播放资源暂停或停止其他；
             * limitType==='once'时，有播放中资源时，不可播放本资源
             */
            videoPlugins.customPlay(myPlayer,{
                type:limitType,
                resourceId:resourceId,
                handlePromise: this.getResourcePlayCountById,
                handleBack: ()=>{
                    let htmlText = this.oncePlayedText;
                    this.solveIdentityPlayers(this.players, myPlayer, (player)=>{
                        videoPlugins.customText(player,{
                            htmlText: htmlText,
                            className: 'once-tip',
                        });
                        videoPlugins.customPlay(player,{
                            disable:true,
                        });
                    });
                }
            });
            if(myPlayer.isLimit){
                // 一些限制操作
                if(limitType==='times'){

                    videoPlugins.customProgress(myPlayer,{
                        disable:true
                    });
                    videoPlugins.customPause(myPlayer,{
                        isStop:true
                    });

                    let htmlText = `已播放：${playCount}次`;
                    videoPlugins.customText(myPlayer,{
                        htmlText: htmlText
                    });
                    videoPlugins.customTimeUpdate(myPlayer,{
                        type:limitType,
                        handleBack:()=>{
                            debugger
                            this.$store.dispatch('addResourcePlayCount', {
                                exam_id: this.paperData.exam_id,
                                question_id: this.quesItem.id,
                                resource_id: resourceId,
                                session_id:''
                            }).then((rtnData) => {
                                // 更新同题的同资源的播放次数
                                playCount = rtnData && rtnData.play_count || 0;
                                htmlText = `已播放：${playCount}次`;
                                this.solveIdentityPlayers(this.players, myPlayer, (player)=>{
                                    videoPlugins.customText(player,{
                                        htmlText: htmlText
                                    });
                                });
                            });
                        }
                    });
                } else if(limitType==='once'){
                    videoPlugins.customProgress(myPlayer,{
                        disable:true
                    });
                    let htmlText = this.onceUnplayText;
                    if(playCount>=this.resourceLimitCount){
                        videoPlugins.customPlay(myPlayer,{
                            disable:true,
                        });
                        htmlText = this.oncePlayedText;
                    }

                    videoPlugins.customText(myPlayer,{
                        htmlText: htmlText,
                        className: 'once-tip',
                    });

                    videoPlugins.customPause(myPlayer,{
                        disable:true,
                    });

                    videoPlugins.customTimeUpdate(myPlayer,{
                        type:limitType,
                        handleBack:()=>{
                            this.$store.dispatch('addResourcePlayCount', {
                                exam_id: this.paperData.exam_id,
                                question_id: this.quesItem.id,
                                resource_id: resourceId,
                                session_id: this.sessionId
                            });
                        }
                    });
                }
            }
        },
        hideVideoPoster(){
            // 视频加载完成后隐藏封面
            let allPosters = this.$el.querySelectorAll('.vjs-poster') || [];
            setTimeout(()=>{
                for (let i=0;i<allPosters.length;i++){
                    allPosters[i].style.display = 'none';
                }
            },1000);
        },
        //处理题干图片、音视频
        convertQuestionBody(quesData) {
            let _this = this;
            let convertSubQuestions = (item)=>{
                let subItemsCount = 0;
                item.sub_items.forEach(function(subItem) {
                    subItem.body = subItem.body && subItem.body.replace(/<img/g, '<img class="hollton-cursor"');
                    convertAllVideoId(subItem.body,item.id).then(function(questionBody) {
                        if (questionBody.resourceIds) {
                            _this.resourceIds = _this.resourceIds.concat(questionBody.resourceIds);
                        }
                        subItem.convert_body = questionBody.htmlStr;
                        subItemsCount++;
                        if(subItemsCount===item.sub_items.length){
                            _this.loadComponent = true;
                        }
                    });
                });
            };
            quesData.forEach(item => {
                // 对题干图片设置特殊class，以区分作答的图片
                item.complex_body = item.complex_body && item.complex_body.replace(/<img/g, '<img class="hollton-cursor"');
                if(item.complex_body){
                    convertAllVideoId(item.complex_body,item.id).then(function(questionBody) {
                        if (questionBody.resourceIds) {
                            _this.resourceIds = _this.resourceIds.concat(questionBody.resourceIds);
                        }
                        item.convert_complex_body = questionBody.htmlStr;
                        convertSubQuestions(item);
                    });
                } else {
                    convertSubQuestions(item);
                }
            });
            _this.questionData = quesData;
            _this.answerResult(checkDone(_this.questionData[0] && _this.questionData[0].sub_items, _this.currentQuestionResult));
        },
        //保存作答
        timeSaveAnswer: function(answerData) {
            if (!answerData) {
                console.log('缺少作答数据');
                return;
            }
            let selfAnswerData = {
                answer: '',
                ss: [],
                id: this.quesItem.id,
                cs: 0,
                qv: 0,
                lut: getCurrentDateTime()
            };
            // 每次提交数据需与state存储的数据做合并
            if (this.resultData[this.quesItem.id]) {
                selfAnswerData.ss = this.resultData[this.quesItem.id].ss;
                selfAnswerData.answer = this.resultData[this.quesItem.id].answer;
            }

            if (answerData.ss !== undefined) {
                selfAnswerData.ss = answerData.ss;
            }
            if (answerData.answer !== undefined) {
                selfAnswerData.answer = answerData.answer;
            }

            //没作答时根据套题子题数量填充默认ss数数据为['',...]，否则填空题报错
            let isAllEmptySs = true;
            if(selfAnswerData.ss){
                selfAnswerData.ss = selfAnswerData.ss.map(item=>{
                    // 去除空格及换行符
                    item = item && item.replace(/\s+$/g, '');
                    if(item){
                        isAllEmptySs = false;
                    }
                    return item;
                });
            }
            if(isAllEmptySs){
                selfAnswerData.ss = [];
                this.questionData.forEach(item=>{
                    item && item.sub_items.forEach(()=>{
                        selfAnswerData.ss.push('');
                    });
                });
            }

            // 异步成功再更新store会在弱网下丢失数据，因此改为提交前更新
            this.setResultData([selfAnswerData]);

            this.$store.commit('setSaveStatus', true);
            this.saveAnswer({
                exam_id: this.paperData.exam_id,
                session_id: this.paperData.session_id,
                data: [selfAnswerData]
            }).then(() => {
                //this.$tip('保存成功');
                // 统一数据结构，用于checkDone判断是否答题完整
                if(selfAnswerData.ss){
                    selfAnswerData.subs = selfAnswerData.ss.map(item => {
                        return {
                            answer: item
                        };
                    });
                }
                this.answerResult(checkDone(this.questionData[0].sub_items, selfAnswerData), true);
                this.$store.commit('setSaveStatus', false);

            }, (err) => {
                let errorCode = err && err.code;
                // 作答保存错误提示，排除无效考试错误码
                if(errorCode !== 'FEP/EXAM_INVALID' && errorCode !== 'FEP/EXAM_NOT_EXIST'){
                    this.$tip('保存失败');
                }
                this.$store.commit('setSaveStatus', false);
            });
        },
        /**
         * [answerResult 更改单题作答状态]
         * @param  {Boolean} isDone   [当题是否全部做完]
         * @param  {Boolean} isChange [是否为改变答题状态操作]
         */
        answerResult: function(isDone, isChange) {
            this.changeQuestionDoneStatus({
                id: this.quesItem.id,
                key: 'done',
                isTruth: isDone
            });

            // 计算已答题数，第一次加载题目计算时只对有做完+1，而操作当前题时未做完要-1
            if (this.selfIsDone !== isDone) {
                this.selfIsDone = isDone;
                calcNum = isDone ? 1 : (isChange ? -1 : 0);
                this.calcQuestionCount(calcNum);
            }
        },
        //当前查看图片
        viewImageProxy(evt) {
            if (evt.target.nodeName === 'IMG' && evt.target.className === 'hollton-cursor') {
                evt.stopPropagation();
                this.showPicView = true;
                this.currentPicSrc = evt.target.currentSrc || evt.target.href;
                this.picAttachments = [{
                    url:this.currentPicSrc,
                    __oriUrl:this.currentPicSrc
                }];
            }
        }
    }
};
</script>
<style lang="scss">
img.hollton-cursor {
    cursor: pointer;
}

.question-order {
    .question-title {
        float: left;
    }
    .option {
        display: inline-block;
        width: calc(100% - 50px);
        vertical-align: top;
        position: relative;
        top: 6px;
    }
    h4 {
        min-height: auto;
        font-size:100%;
        overflow:auto;
    }
    .my-answer {
        margin-bottom: 20px;
    }
}

</style>

<!--

// 收起题目关键帧动画

.question-fade-enter-active {
    animation: question-fade-in .5s;
}

.question-fade-leave-active {
    animation: question-fade-out .5s;
}

@keyframes question-fade-in {
    0% {
        max-height: 0;
        overflow: hidden;
    }
    100% {
        max-height: 800px;
    }
}

@keyframes question-fade-out {
    0% {
        max-height: 800px;
    }
    100% {
        max-height: 0;
        overflow: hidden;
    }
}
 -->