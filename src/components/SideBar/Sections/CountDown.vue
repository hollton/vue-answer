<template>
    <a v-show="show" class="btn-time">
        <span><i>{{countDown?timer:'无限制'}}</i></span>
        <span>已完成<i>{{questionsCount}}</i>/{{questionsTotal}}</span>
    </a>
</template>
<script>
    import {mapState, mapMutations} from 'vuex';

    export default {
        name: 'countdown',
        props: {
            show: {
                type: Boolean,
                default: true
            }
        },
        computed:{
            ...mapState(['questionsTotal', 'questionsCount','countDown']),
            timer(){
                let hours = Math.floor(this.count_down_time/60);
                hours = hours < 10 ? '0' + hours : hours ;
                let mins = Math.floor(this.count_down_time%60);
                mins = mins < 10 ? '0' + mins : mins;
                let minsFloat = this.count_down_time.toString().split('.')[1] ? this.count_down_time.toString().split('.')[1] : 0;
                let seconds = Math.round(('0.' + minsFloat) * 60);
                seconds = seconds < 10 ? '0' + seconds : seconds;
                return `${hours}:${mins}:${seconds}`;
            }
        },
        methods:{
            ...mapMutations(['actionIsTimeOut','changeConfig']),
            handleCountDown(){
                if(this.count_down_time){
                    let seconds = this.count_down_time*60;
                    const timoutInterval = setInterval(()=>{
                        if(seconds === 0){
                            this.actionIsTimeOut(true);
                            this.$confirm('答题时间已经截止，请停止作答', '答题时间截止',{noBtnShow: false});
                            this.changeConfig({key: 'editable', isTruth: false});
                            clearInterval(timoutInterval);
                            return;
                        }
                        seconds -= 1;
                        const minus = seconds/60;
                        this.count_down_time = minus;
                    },1000)
                }else{
                    this.count_down_time = (99*60+59+0.98);
                }
                
            }
        },
        data(){
            return {
                count_down_time: this.$store.state.countDown
            }
        },
        mounted(){
            this.handleCountDown();
        }
    }
</script>
<style lang="scss">
    
</style>