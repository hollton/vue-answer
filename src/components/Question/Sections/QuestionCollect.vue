<!-- 题目收藏（套题、主观、填空才会有）
    <question-collect slot="question-collect" :collection-type="collectionType" :question-id="questionId"></question-collect>
 -->
<template>
    <div class="examine-body-right-btns fr" v-if="showCollect">
        <a :class="{'active':standardAnswerType}" @click="operateCollect(true,standardAnswerType,typicalFaultType)">标准作答</a>
        <a :class="{'active':typicalFaultType}" @click="operateCollect(false,typicalFaultType,standardAnswerType)">典型错误</a>
    </div>
</template>
<script>
import { mapState,mapActions,mapGetters,mapMutations } from 'vuex';
export default {
    name: 'QuestionCollect',
    props: ['collectionType','questionId'],
    data(){
        return {
            selfCollectionType:this.collectionType
        };
    },
    computed: {
        ...mapState(['configData','examId', 'sessionId','paperId', 'examName', 'studentId', 'paperData']),
        ...mapGetters(['initPaperStatu']),
        showCollect(){
            return this.initPaperStatu.showQuestionCollect;
        },
        standardAnswerType(){
            return this.selfCollectionType==='standard_answer';
        },
        typicalFaultType(){
            return this.selfCollectionType==='typical_fault';
        }
    },
    watch:{
        collectionType(val){
            this.selfCollectionType = val;
        }
    },
    methods:{
        ...mapMutations(['setCollectData']),
        ...mapActions(['addAnswerCollection','cancelAnswerCollection']),
        /**
         * [operateCollect description]
         * @param  {Boolean} isStandard [是否为标准作答类型，区分type]
         * @param  {Boolean} isActive   [是否为已收藏，区分调用api及入参]
         * @return {[type]}             [description]
         */
        baseCollect(isStandard, isActive){
            let baseParam = {
                exam_id:this.examId,
                session_id:this.sessionId,
                question_id:this.questionId,
                owner:this.studentId
            };
            if(!isActive){
                baseParam.paper_id = this.paperId;
                baseParam.name = this.paperData.title;
                baseParam.type = isStandard?'standard_answer':'typical_fault';
            }
            let apiName = isActive?'cancelAnswerCollection':'addAnswerCollection';
            let _this = this;
            return _this[apiName](baseParam).then(function(){
                let type;
                if(!isActive){
                    type = isStandard?'standard_answer':'typical_fault';
                } else {
                    type = '';
                }
                _this.selfCollectionType = type;
                _this.setCollectData([{
                    owner:baseParam.owner,
                    question_id:baseParam.question_id,
                    session_id:baseParam.session_id,
                    type:baseParam.type
                }]);
            });
        },
        // 当前收藏类型状态为false且另一状态为true时，先取消收藏另一状态再收藏本类型
        operateCollect(isStandard, selfActive, otherActive){
            if(!selfActive && otherActive){
                let _this = this;
                this.baseCollect(!isStandard, otherActive).then(function(){
                    _this.baseCollect(isStandard, selfActive);
                });
            } else {
                this.baseCollect(isStandard, selfActive);
            }
        }
    }
};
</script>
<style lang="scss" scoped>
</style>