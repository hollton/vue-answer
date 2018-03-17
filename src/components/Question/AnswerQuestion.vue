<template>
    <div class="main-wrap wrapper main-mgt" 
    :style="{fontSize: rootFontSize+'em'}">
        <div class="exampage">
            <div class="exampage-question" v-for="(partItem,partIndex) in paperData.parts" v-show="!(!partItem.isError && configData.onlyError)">
                <h3 :id="'questionType'+partIndex" v-html="partItem.title"></h3>
                <div class="exampage-question-wrap"
                     v-if="loadComponent"
                     v-for="quesItem in partItem.questionItem">
                     <div class="examine-body-left">
                         <question-item :quesItem="setQuestionBodyById(quesItem)" @hasError="hasError" :parentIndex="partIndex"></question-item>
                     </div>
                </div>
            </div>
            <slot></slot>
        </div>
    </div>
</template>
<script>
import {
    mapState,
    mapGetters,
    mapMutations,
    mapActions
} from 'vuex';

import QuestionItem from './QuestionItem';
import {customFind,sliceArrayByNum} from '../../utils/common';

export default {
    name: 'question',
    data(){
        return {
            loadComponent:false,
            questionData:[]
        };
    },
    watch:{
        // view预览模式监控loadPaper获取试卷信息
        loadPaper:function(val){
            if(val){
                this.initPaper(this.paperData);
            }
        }
    },
    mounted(){
        // answer作答模式监控sessionId获取试卷信息
        this.$store.watch((state,val) => {
            if(val.asyncSessionId){
                this.$store.dispatch('getUserExamBySessionId', {
                    exam_id: this.examId,
                    session_id: this.sessionId
                }).then(paperData=>{
                    this.initPaper(paperData);
                });
            }
        });
    },
    computed: {
        ...mapState(['examId', 'sessionId','paperData', 'rootFontSize', 'resultData','configData','loadPaper','type','resourceLimit','paperId']),
        ...mapGetters(['initPaperStatu'])
    },
    components: {
        QuestionItem
    },
    methods: {
        ...mapMutations(['calcQuestionTotal','setConfig', 'setTotalPoint']),
        ...mapActions(['getExamPaperById','getExamQuestionsById']),
        //获取小题题目id数组
        getPaperQidsData(paperData){
            let answerQids = [],  // 获取作答答案的qids
                questionQids = [];  // 获取题目信息的qids，需要去掉'_0'
            paperData.parts && paperData.parts.forEach(part => {
                answerQids = answerQids.concat(part.question_identities);
                part.questionItem.forEach(item=>{
                    questionQids.push(item.id);
                });
            });
            this.calcQuestionTotal(questionQids.length);

            this.getExamQuestions(questionQids, this.initPaperStatu.showAnswer).then((questionData)=>{
                this.questionData = questionData;

                //计算试卷总分
                let paperScore = 0;
                questionData.forEach(item=>{
                    item.sub_items.forEach(subItem=>{
                        paperScore += subItem.score;
                    });
                });
                this.setTotalPoint({
                    point: paperScore
                });

                if(this.type==='answer' && (this.initPaperStatu.showAnswer || this.initPaperStatu.showResult)){
                    this.getQuestionsResultById(answerQids, this.initPaperStatu.showAnswer).then(()=>{
                        this.loadComponent = true;
                    });
                } else {
                    this.loadComponent = true;
                }
            });
        },
        // 获取题目信息
        getExamQuestions(qids,isViewMark) {
            let apiName = isViewMark ? 'getExamPaperById' : 'getExamQuestionsById';
            return this[apiName]({
                exam_id: this.examId,
                session_id: this.sessionId,
                paper_id: this.paperId,
                qids:{
                    qid:qids
                }
            });
        },
        //显示作答/批阅信息
        getQuestionsResultById:function(qids,isViewMark){
            return this.$store.dispatch('getQuestionsResultById', {
                exam_id: this.examId,
                session_id: this.sessionId,
                qids:{
                    qid:qids
                },
                apiName:isViewMark?'getQuestionsMarkById':'getQuestionsAnswerById'
            });
        },
        // 判断每part大题是否有答错的小题，用于只看错题模式时只显示有错题的part
        hasError:function(parentIndex,isHasError){
            this.paperData.parts[parentIndex].isError = isHasError;
        },
        initPaper(paperData){
            // 获取资源播放次数
            let paramData = {
                exam_id: this.examId
            };
            // 'once'时，每个session资源资源只能播一次
            if(this.resourceLimit.type==='once'){
                paramData.session_id = this.sessionId;
            }
            this.$store.dispatch('getResourcePlayCount', paramData);
            // 获取题目收藏
            if(this.initPaperStatu.showQuestionCollect){
                this.$store.dispatch('getAnswerCollection', this.examId);
            }
            this.getPaperQidsData(paperData);
        },
        // 依据题目id扩充题干信息
        setQuestionBodyById(questionItem){
            let currentQuestion = customFind(this.questionData,{id:questionItem.id});
            Object.assign(currentQuestion,questionItem);
            return currentQuestion;
        }
    }
};
</script>
<style lang="scss">
</style>
