/*
 * 进度组件
 * <fa-progress :percentage="percentage" :text="text" :bit="bit"></fa-progress>
 */
<template>
    <div class="fa-progress slp-ui-progress slp-mod-examprogress">
        <span class="slp-ui-progress__txt" v-text="text"></span>
        <div class="slp-ui-progress__bar"
            :aria-valuenow="roundPercentage"
            :aria-valuemin="0"
            :aria-valuemax="100">
            <p class="slp-ui-progress__barnow" :style="{width:roundPercentage+'%'}">
                <em class="slp-ui-progress__precent" v-text="roundPercentage+'%'"></em>
            </p>
        </div>
    </div>

    
</template>

<script>
    import '../../../../filters/filter';
    export default {
        name: 'FaProgress',
        props:{
            text:String,  //前置提示
            percentage: {  //百分比数据0-100
                type: Number,
                default: 0,
                required: true
            },
            bit:Number  //数据处理位数
        },
        computed:{
            roundPercentage(){
                let bit = this.bit?this.bit:0;
                return this.$options.filters.numberToFixedFilter(this.percentage,bit);
            }
        }
    };
</script>