<template>
    <div class="popup-wrap popup-answersheet" v-if="showAnswersheet">
        <div class="popup-content" ref="answersheet">
            <div class="popup-headtitle" v-moveel="{x:false, moveel: 'answersheet'}">
                <h2 class="fl">答题卡</h2>
                <a class="popup-btn-close fr" @click="handleShowAnswersheet"></a>
            </div>
            <div class="popup-body">
                <div class="par" v-for="(item, $index) in _paperData" :key="$index" v-show="!(!item.isError && configData.onlyError)">
                    <h3 class="tit"><i v-html="item.title"></i></h3>
                    <ul class="list clearfix">
                        <li 
                            v-for="(qItem,$index) in item.questionItem" 
                            v-show="!(resultData[qItem.id].result.right && configData.onlyError)"
                            :key="qItem.id" 
                        >
                            <a 
                            :class="[
                                {
                                    'done': resultData[qItem.id].result.done && !initPaperStatu.showAnswer,
                                    'mark': resultData[qItem.id].result.marked,
                                    'correct': resultData[qItem.id].result.right,
                                    'false': resultData[qItem.id].result.done && initPaperStatu.showAnswer && !resultData[qItem.id].result.right,
                                    'working': questionActive === qItem.index && !initPaperStatu.showAnswer,
                                }
                            ]" 
                            @click="handleItemClick(qItem.index)"
                            v-anchor="{id: 'subQuestionType'+qItem.index, offset: -headerQuestiontypeHeight}">{{qItem.index+1}}</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import {on} from '../../../utils/dom';
    import {mapState,mapMutations,mapGetters} from 'vuex';

    export default {
        name: 'answersheet',
        computed: {
            ...mapState(['paperData',
            'showAnswersheet',
            'headerQuestiontypeHeight',
            'resultData',
            'configData',
            'questionActive']),
            ...mapGetters(['initPaperStatu']),
            _paperData(){
                const data = this.paperData.parts;
                return data;
            }
        },
        watch: {
            resultData(val, old){
                if(JSON.stringify(val) !== '{}' && val !== old){
                    let data = [];
                    this.paperData.parts.map( (part,index) => {
                        part.questionItem.map( q => {
                            let itemHeight = null;
                            const anchor = document.querySelector(`#subQuestionType${q.index}`);
                            if(anchor){
                                itemHeight = anchor.offsetTop - this.headerQuestiontypeHeight;
                            }
                             
                            data.push(itemHeight);
                        });
                    });

                    this.questionHeight = data;
                }
            }
        },
        methods: {
            ...mapMutations(['handleShowAnswersheet','setQuestionActive']),
            handleScroll(){
                const scrollY = window.pageYOffset;

                if(!this.scrollerInterval && !this.isClick){
                    this.scrollerInterval = setInterval(this.watchScroll, 300);
                }

                this.questionHeight.map((item, index) => {
                    if(scrollY > item || scrollY === item){
                        this.activeIndex = index;
                    }else if(scrollY < this.questionHeight[0]){
                        this.activeIndex = 0;
                        this.setQuestionActive(0);
                    }
                })
            },
            watchScroll(){
                const scroll = window.pageYOffset;

                if(scroll === this.lastScrollY){
                    clearInterval(this.scrollerInterval);
                    this.scrollerInterval = null;
                    this.setQuestionActive(this.activeIndex);
                }else{
                    this.lastScrollY = scroll;
                }
            },
            handleItemClick(index){
                clearInterval(this.scrollerInterval);
                this.isClick = true;
                this.scrollerInterval = null;
                this.activeIndex = index;
                this.lastScrollY = this.questionHeight[index];
                this.setQuestionActive(this.activeIndex);

                setTimeout(()=>{
                    this.isClick = false;
                },300)
            }
        },
        data(){
            return {
                questionHeight: [],
                activeIndex: 0,
                scrollerInterval: null,
                lastScrollY: 0,
                isClick: false
            }
        },
        mounted(){
            on(window, 'scroll', this.handleScroll);
        }
    }
</script>
<style lang="scss" scoped>
   .popup-answersheet{
        height: auto !important;
        .popup-content{
               height: auto !important; 
               .popup-headtitle{
                   cursor: move;
               }
           }
   }
</style>