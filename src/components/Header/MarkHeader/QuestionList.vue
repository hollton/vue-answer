<template>
    <div>
        <div class="slp-mod-guidindex__step4" isteven-multi-select>
            <span class="multiSelect inlineBlock">
                <button @click="handleOpenCard" ref="button">
                    <div class="buttonLabel">
                        {{currentQuestion.index+1 ? '第'+(currentQuestion.index+1)+'题' : ''}}
                        <span class="caret"></span>
                    </div>
                </button>
            </span>
        </div>
        <div class="slp-mod-guidindex__step5">
            <a class="examine-body-left-fold link" @click="changeQuestionShow">{{questionShow?'收起题目':'查看题目'}}</a>
        </div>
    </div>
</template>

<script>
    import {mapState,mapMutations} from 'vuex';
    import { QuestionsCard } from '../../Card';
    export default {
        name: 'quetionsList',
        computed: {
            ...mapState(
                {
                    currentQuestion: state => state.mark.currentQuestion,
                    questionShow: state => state.mark.questionShow
                }
            )
        },
        methods: {
            ...mapMutations(['setCardShow','setQuestionShow']),
            handleOpenCard(evt){
                this.setCardShow({type: 'questions'});
            },
            changeQuestionShow(){
                this.setQuestionShow(!this.questionShow);
            }
        },
        data(){
            return {
                showCard: false
            }
        },
        watch:{
            currentQuestion(newVal,oldVal){
                if(newVal && newVal!==oldVal){
                    this.setQuestionShow(true);
                }
            }
        },
        components: {
            QuestionsCard
        }
    }
</script>