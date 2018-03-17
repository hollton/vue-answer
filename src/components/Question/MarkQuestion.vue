<template>
    <div :class="guideClass">
        <div class="main-wrap wrapper slp-mod-examinewrap">
            <div class="examine-body clearfix">
                <div class="slp-mod-drag slp-mod-guidindex__step2" :style="{'right':(markWidth-18)+'px'}"></div>
                <div class="slp-mod-dragline" v-moveel="{x:true,y:false}" :data-move="dataMove" :style="{left:(markArea.pageWidth-markWidth)+'px','z-index':51}"></div>
                <div class="examine-body-left fl" :style="{width:(markArea.pageWidth-markWidth)+'px'}">
                    <question-item v-if="loadComponent" :quesItem="questionData"></question-item>
                </div>
                <!-- 评分侧边栏 -->
                <div class="examine-body-right fr slp-mod-guidindex__step1" :style="{width:markWidth+'px'}">
                    <question-mark-standard
                        :question-standards="currentQuestionStandards"
                        :question-mark="currentMarkAnswer"
                        :question-data="questionData"
                        :question-result="currentQuestionResult"
                        @putStandard="putStandard">
                            <question-collect slot="question-collect" :collection-type="currentCollectionType" :question-id="currentQuestion.id"></question-collect>
                    </question-mark-standard>
                </div>
            </div>
            <questions-card v-model="showQuestionsCard"></questions-card>
            <student-card v-model="showStudentCard"></student-card>
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
import QuestionMarkStandard from './Sections/QuestionMarkStandard';
import QuestionCollect from './Sections/QuestionCollect';
import {customFind} from '../../utils/common';
import {setScrollTop} from '../../utils/dom';
import * as Card from '../Card';

export default {
    name: 'markQuestion',
    data(){
        return {
            questionData:null,
            loadComponent:null,
            dataMove: {
                x:0,
                xLimit:[]
            },
            markArea:{
                pageWidth:1200,
                minWidth:300,
                maxWidth:600,
                stoKey:'mark_width'
            }
        };
    },
    beforeMount(){
        // 设置x轴移动范围
        this.dataMove.xLimit = [this.markArea.pageWidth-this.markArea.maxWidth,this.markArea.pageWidth-this.markArea.minWidth];
        // localStorage获取评分区宽度，无存储则使用默认最小宽度
        let stoMarkWidth = window.localStorage.getItem(this.markArea.stoKey) || this.markArea.minWidth;
        this.dataMove.x = this.markArea.pageWidth-stoMarkWidth;
    },
    mounted(){
        // 获取题目收藏
        if(this.initPaperStatu.showQuestionCollect){
            this.$store.dispatch('getAnswerCollection', this.examId);
        }
    },
    computed: {
        ...mapState(['examId', 'rootFontSize','studentId','sessionId','resultData','userId']),
        ...mapState({
            currentQuestion:state=>state.mark.currentQuestion,
            currentMarkAnswer:state=>state.mark.currentAnswer,
            questionsAnswerData:state=>state.mark.questionsAnswerData,
            showQuestionsCard:state=>state.mark.showQuestionsCard,
            showStudentCard:state=>state.mark.showStudentCard,
            collectionItems:state=>state.question.collectionItems,
            currentStudent:state=>state.mark.currentStudent,
            studentsList:state=>state.mark.studentsList,
            guideClass: state => state.mark.guideIndex>0?'slp-mod-guidindex slp-mod-guidindex--step'+state.mark.guideIndex:''
        }),
        ...mapGetters(['initPaperStatu']),
        markWidth(){
            let _markWidth = this.markArea.pageWidth - this.dataMove.x;
            window.localStorage.setItem(this.markArea.stoKey,_markWidth);
            this.$store.commit('setMarkWidth',_markWidth);
            return _markWidth;
        },
        // 当前大题评分标准
        currentQuestionStandards(){
            let standards = [];
            if(this.questionData && this.questionData.sub_items){
                this.questionData.sub_items.forEach(subItem=>{
                    standards.push({
                        sq_code:subItem.sq_code,
                        score:subItem.score,
                        data:subItem.items
                    });
                });
            }
            return standards;
        },
        // 当前考试会话+当前题+当前查看学生的收藏信息
        currentCollectionType(){
            let collectionData;
            this.collectionItems && this.collectionItems.forEach(item=>{
                if(item.owner===this.studentId && item.session_id===this.sessionId && item.question_id===this.currentQuestion.id){
                    collectionData = item;
                }
            });
            return collectionData && collectionData.type;
        },
        // 当题作答结果
        currentQuestionResult() {
            return this.resultData[this.currentQuestion.id] || {};
        }
    },
    watch:{
        // 批阅下监控题目切换
        currentQuestion(newVal, oldVal){
            if(newVal && newVal !== oldVal){
                let questionData = customFind(this.questionsAnswerData,{id:newVal.id});
                questionData.index = newVal.index;
                this.questionData = questionData;
                this.setScrollTop();
            }
        },
        currentStudent(newVal, oldVal){
            if(newVal && newVal !== oldVal){
                this.setStudentId({
                    studentId:newVal.user_id
                });
                this.setSessionId({
                    sessionId:newVal.session_id
                });
                this.setScrollTop();
            }
        },
        currentMarkAnswer(val){
            let result = val?[val]:[];
            this.setResultData(result);
            this.loadComponent = false;
        }
    },
    updated(){
        if(this.questionData && this.currentMarkAnswer){
            this.loadComponent = true;
        }
    },
    components: {
        QuestionItem,
        QuestionMarkStandard,
        QuestionCollect,
        ...Card
    },
    methods:{
        ...mapMutations(['setStudentId','setSessionId','setResultData','setSaveStatus']),
        ...mapActions(['updateQuestionStatu']),
        putStandard(markData){
            this.setSaveStatus(true);
            let studentId = this.currentStudent.user_id;  // 直接使用currentStudent.user_id，由于异步会使更新状态的user_id传参串掉，每次赋值新变量
            this.$apiService.MarkAPI.putUserMark({exam_id:this.examId},[markData]).then(()=>{
                this.setSaveStatus(false);
                this.updateQuestionStatu({
                    user_id: studentId,
                    question_answer_status:markData.question_answer_status,
                    question_id:markData.question_id,
                });
                this.studentsList.map(student=>{
                    if(markData.session_id === student.session_id){
                        student.answers.map(answer=>{
                            if(markData.question_id === answer.question_id){
                                answer.marking_remark = markData.marking_remark;
                            }
                        });
                    }
                });
            },()=>{
                this.$tip('保存失败');
                this.setSaveStatus(false);
            });
        },
        // 切换学生、题目时题干的滚动条回顶部
        setScrollTop(){
            if(this.$el && this.$el.querySelector){
                setScrollTop(0, this.$el.querySelector('.examine-body-left'));
            }
        }
    }
};
</script>
<style lang="scss">
</style>

