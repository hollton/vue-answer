<template>
    <div class="popup-wrap exampage-pop popup-topiclist slp-popup-topiclist" v-show="showQuestionsCard" ref="card">
        <a class="new-message" v-show="newSubmitOpt.submit_count > 0" @click="handleNewSubmit">{{newSubmitOpt.submit_count}}个新交卷</a>
        <div class="popup-content">
            <div class="popup-body" >
                <h2 v-html="paperData.title" style="margin: 10px 0;color: #666;"></h2>
                <div class="par" v-for="(question,$index) in questionsData" :key="$index" v-show="question.sub_item.length > 0">
                    <h3 v-html="question.title"></h3>
                    <ul class="list clearfix">
                        <li v-for="item in question.sub_item" @click="handleClick(item)" :key="item.index">
                            <a class="full"
                            :class="[
                                {
                                    'half': item.status === 'half',
                                    'done': item.status === 'marked'
                                }
                            ]"
                            >{{item.index+1}}</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapState,mapMutations,mapActions} from 'vuex';
    import MarkInit from '../../../init/mark';
    import {on,off} from '../../../utils/dom';
    import moment from 'moment';

    export default {
        name: 'questionsCard',
        mixins: [MarkInit],
        computed: {
            ...mapState({
                currentStudent: state => state.mark.currentStudent,
                questionsData: state => state.mark.questionsData,
                showQuestionsCard: state => state.mark.showQuestionsCard,
                newSubmitOpt: state => state.mark.newSubmitOpt
            }),
            ...mapState([
                'examId',
                'paperId',
                'classId',
                'otherOptions',
                'paperData'
                ])
        },
        methods: {
            ...mapMutations(['setCurrentQuestion',
            'setCurrentAnswer',
            'setQuestionsData',
            'setStudentsList',
            'setCardShow',
            'setNewSubmitOpt'
            ]),
            ...mapActions(['getCurrentAnswer','updateQuestionStatu']),
            handleClick(question){
                this.setCurrentQuestion({currentQuestion: question});
                this.getCurrentAnswer();
                this.setCardShow({type: 'questions',value: false});
            },
            getNewSubmit(){
                setInterval(()=>{
                    this.$apiService.MarkAPI.getNewSubmit({exam_id: this.examId},{last_date: this.newSubmitOpt.last_date})
                    .then(res => {
                        if(res.data && res.data.last_date){
                            this.setNewSubmitOpt({
                                server_date: res.data.last_date,
                                submit_count: res.data.new_submit_count
                            });
                        }
                    });
                },30000)
            },
            handleNewSubmit(){
                const opt = {
                    class_id: this.classId,
                    exam_id: this.examId,
                    paper_id: this.paperId
                };

                const path = this.otherOptions.path;
                
                this.setNewSubmitOpt({
                    submit_count: 0,
                    last_date: this.newSubmitOpt.server_date
                });
                this.initMark(this.paperId,this.classId,this.examId,path);
            },
            handleDocumentClick(evt){
                const isContains = this.$el.contains(evt.target);
                if(!isContains){
                    this.setCardShow({type: 'questions',value: false});
                }
            }
        },
        data(){
            return {
                date: moment().format()
            }
        },
        mounted(){
            this.getNewSubmit();
            this.setNewSubmitOpt({
                submit_count: 0,
                last_date: this.date
            });
        },
        watch: {
            showQuestionsCard(val){
                if(val){
                    setTimeout(()=>{
                        on(document, 'click', this.handleDocumentClick);
                    },100)
                    
                }else{
                    off(document, 'click', this.handleDocumentClick);
                }
            }
        }
    }
</script>