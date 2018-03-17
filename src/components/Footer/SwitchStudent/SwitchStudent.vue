<template>
    <div :class="guideClass">
        <div class="examine-pagination slp-mod-guidindex__step3">
            <a class="slp-ui-btn slp-ui-btn--light slp-ui-btn--l slp-mod-btn-light" @click="handlePre"
                :class="[
                    {
                        'slp-disabled': preBtnDisabled
                    }
                ]"
            >上一个(←)</a>
            <a class="slp-ui-btn slp-ui-btn--light slp-ui-btn--l slp-mod-btn-light" @click="handleNext"
                :class="[
                    {
                        'slp-disabled': nextBtnDisabled
                    }
                ]"
            >下一个(→/SPACE)</a>
        </div>
    </div>
</template>

<script>
    import {mapState, mapMutations, mapGetters,mapActions} from 'vuex';
    import {on,off} from '../../../utils/dom';
    export default {
        name: 'switchStudent',
        computed: {
            ...mapGetters(['studentInfoData']),
            ...mapState({
                currentStudent: state => state.mark.currentStudent,
                currentQuestion: state => state.mark.currentQuestion,
                studentsList: state => state.mark.studentsList,
                questionsList: state => state.mark.questionsList,
                currentAnswer: state => state.mark.currentAnswer,
                disableKeyBoard: state => state.mark.disableKeyBoard,
                guideClass: state => state.mark.guideIndex>0?'slp-mod-guidindex slp-mod-guidindex--step'+state.mark.guideIndex:''
            })
        },
        methods: {
            ...mapMutations(['setCurrentStudent','setCurrentQuestion']),
            ...mapActions(['getCurrentAnswer']),
            isFirstStudent(){
                return this.getStudentIndex() === 0;
            },
            isLastStudent(){
                return this.getStudentIndex() === this.studentInfoData.unmark.length - 1;
            },
            getStudentIndex(){
                let index;
                const currentStudent = this.currentStudent.user_id;
                this.studentInfoData.unmark.map((s,i)=>{
                    if(s.user_id === currentStudent){
                        index = i;
                    }
                });
                return index;
            },
            isFirstQuestion(){
                return this.getQuestionIndex() === 0;
            },
            isLastQuestion(){
                return this.getQuestionIndex() === this.questionsList.length - 1;
            },
            getQuestionIndex(){
                const qId = this.currentQuestion.id;
                let index;
                this.questionsList.map((q,i) => {
                    if(q.id === qId){
                        index = i;
                    }
                });

                return index;
            },
            handlePre(){
                const studentLength = this.studentInfoData.unmark.length;
                const currentStudentIndex = this.getStudentIndex();

                if(this.isFirstStudent() && !this.isFirstQuestion()){
                    this.switchQuestion(-1);
                    this.switchStudent((this.studentInfoData.unmark.length-1));
                }else if(!this.isFirstStudent()){
                    this.switchStudent(-1);
                }
            },
            handleNext(){
                const studentLength = this.studentInfoData.unmark.length;
                const currentStudentIndex = this.getStudentIndex();
                
                if(this.isLastStudent() && !this.isLastQuestion()){
                    this.switchQuestion(1);
                    this.switchStudent(-(this.studentInfoData.unmark.length-1));
                }else if(!this.isLastStudent()){
                    this.switchStudent(1);
                }
            },
            switchStudent(step){
                let currentStudentIndex = this.getStudentIndex();
                currentStudentIndex += step;

                if(currentStudentIndex < 0){
                    currentStudentIndex = 0;
                }else if(currentStudentIndex > this.studentInfoData.unmark.length -1){
                    currentStudentIndex = this.studentInfoData.unmark.length -1;
                }

                const nextStudent = this.studentInfoData.unmark[currentStudentIndex];
                
                this.setCurrentStudent({currentStudent: nextStudent});
                this.getCurrentAnswer();
            },
            switchQuestion(step){
                let qIndex = this.getQuestionIndex();

                qIndex += step;

                const qData = this.questionsList[qIndex];

                this.setCurrentQuestion({currentQuestion: qData});
            },
            handleKeyBoardEvt(evt){
                if(this.disableKeyBoard){
                    return;
                }
                if(evt.keyCode === 37){
                    this.handlePre();
                }else if(evt.keyCode === 39 || evt.keyCode === 32){
                    this.handleNext();
                }
            },
            checkBtnStatu(){
                this.preBtnDisabled = false;
                this.nextBtnDisabled = false;

                const isFirstQuestion = this.isFirstQuestion();
                const isFirstStudent = this.isFirstStudent();
                const isLastQuestion = this.isLastQuestion();
                const isLastStudent = this.isLastStudent();

                if(isFirstStudent && isFirstQuestion && isLastStudent && isLastQuestion){
                    this.preBtnDisabled = true;
                    this.nextBtnDisabled = true;
                }else if(isFirstStudent && isFirstQuestion){
                    this.preBtnDisabled = true;
                }else if(isLastStudent && isLastQuestion){
                    this.nextBtnDisabled = true;
                }
            }
        },
        data(){
            return {
                unmarkArray: [],
                preBtnDisabled: false,
                nextBtnDisabled: false
            }
        },
        mounted(){
            on(window, 'keyup', this.handleKeyBoardEvt);
        },
        watch:{
            currentAnswer(val,old){
                if(val !== old){
                    this.checkBtnStatu();
                }
            }
        },
        destroyed(){
            off(window, 'keyup', this.handleKeyBoardEvt);
        }
    }
</script>

<style lang="scss" scoped>
    .examine-pagination{
        width: 100%;
    }
    
</style>