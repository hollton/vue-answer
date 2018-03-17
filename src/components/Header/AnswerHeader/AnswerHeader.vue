<template>
    <div class="answer-header exampage answering-header" ref="answerheader" id="toTop">
        <paper-info ref="paperinfo"></paper-info>
        <questions-type ref="questiontype"></questions-type>
    </div>
</template>

<script>
import {on} from '../../../utils/dom';

import QuestionsType from './QuestionType';
import PaperInfo from './PaperInfo';

export default {
    name: 'answerHeader',
    methods: {
        handleScroll(){
            if(window.pageYOffset > this.infoHeight){
                this.$refs.questiontype.$el.style.position = 'fixed';
                this.$refs.questiontype.$el.style.top = 0;
                this.$refs.questiontype.$el.style.left = '50%';
                this.$refs.questiontype.$el.style.right = 0;
                this.$refs.questiontype.$el.style.zIndex = 2;
                this.$refs.questiontype.$el.style.marginTop = 0;
                this.$refs.questiontype.$el.style.marginLeft = '-600px';
            }else{
                this.$refs.questiontype.$el.style.marginTop = '10px';
                this.$refs.questiontype.$el.style.position = 'static';
                this.$refs.questiontype.$el.style.marginLeft = 0;
            }
        }
    },
    mounted(){
        on(window, 'scroll', this.handleScroll);
        this.infoHeight = this.$refs.paperinfo.$el.clientHeight;
    },
    data(){
        return {
            infoHeight: ''
        }
    },
    components:{
        QuestionsType,
        PaperInfo
    }
};
</script>