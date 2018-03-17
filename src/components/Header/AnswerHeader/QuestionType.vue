<template>
    <ul class="exampage-questype wrapper clearfix" ref="questiontype">
        <li 
        v-for="(item, $index) in type_data" 
        :key="$index" 
        v-bind:class="{'exampage-questype-on': $index === questionsTypeActive}"
        v-show="!(!item.isError && configData.onlyError)"
        :href="'#'+$index"
        >
            <a @click="anchorAction($index)">{{item.title}}</a>
        </li>
    </ul>
</template>
<script>
    import {on,setScrollTop} from '../../../utils/dom';

    import {mapState, mapMutations } from 'vuex';
    export default {
        name: 'questions-type',
        computed:{
            ...mapState(['questionsTypeActive', 'paperData', 'headerQuestiontypeHeight','configData']),
            type_data(){ // 获取试卷类型信息
                let data = [];

                if(this.paperData && this.paperData.parts){ // 判断试卷信息是否存在
                    this.paperData.parts.map(item => {
                        item.title = item.title.replace(/(<([^>]+)>)/ig, ""); // 过滤html标签
                        data.push(item);
                    })
                }

                return data;
            },
            questionHeight(){
                let data = [];
                if(this.paperData && this.paperData.parts){
                    this.paperData.parts.map( (item,index) => {
                        const anchor = document.querySelector(`#questionType${index}`);
                        let itemHeight = anchor.offsetTop - this.headerQuestiontypeHeight;
                        data.push(itemHeight);
                    });
                }
                
                return data;
            }
        },
        methods:{
            ...mapMutations(['anchorQuestionType','handleChangeHeaderQuestionTypeHeight']),
            anchorAction(index){
                this.anchorQuestionType(index);
                const anchor = document.querySelector(`#questionType${index}`);
                if(!anchor){
                    console.log('无对应锚点信息');
                    return;
                }
                setScrollTop(anchor.offsetTop - this.headerQuestiontypeHeight);
            },
            handleScroll(){
                const scrollY = window.pageYOffset+this.headerQuestiontypeHeight;

                this.questionHeight.map((item, index) => {
                    if(scrollY > item || scrollY === item){
                        this.anchorQuestionType(index);
                    }else if(scrollY < this.questionHeight[0]){
                        this.anchorQuestionType(0);
                    }
                })
            }
        },
        mounted(){
            const height = this.$refs.questiontype.clientHeight;
            this.handleChangeHeaderQuestionTypeHeight(height);

            on(window, 'scroll', this.handleScroll);
        },
        updated(){
            const height = this.$refs.questiontype.clientHeight;
            this.handleChangeHeaderQuestionTypeHeight(height);
        }
    }
</script>
<style lang="scss">
    $typeItemHeight: 40px;
    $mainColor: #3fd1ad;
    @mixin itemAcitve{
        background-color: $mainColor;
        color: #fff;
    }
    .questions-type{
        background-color: #efefef;
        padding: 0 10px;
        .questions-type-item{
            min-width: 180px;
            height: $typeItemHeight;
            text-align: center;
            line-height: $typeItemHeight;
            background-color: #fff;
            border: 1px solid #ccc;
            border-radius: $typeItemHeight;
            margin: 5px;
            padding: 0 10px;
            cursor: pointer;
            clear:both;
            position: relative;
            &:hover{
               @include itemAcitve;
            }
            &.active{
               @include itemAcitve;
            }
        }
    }
    .exampage-questype{
        margin-top: 10px;
    }
</style>