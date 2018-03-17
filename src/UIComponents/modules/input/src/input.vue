/**
    与原生input相同
    @v-model 输入框的值
    @show-count 是否显示字数统计
    @maxlength 最大字符长度
    @minlength 最小字符长度
    @input 输入事件
    @focus 聚焦事件
    @blur 失焦事件
    @placeholder 默认提示语
    @readonly 只读
    @disabled 禁用
    <fa-input v-model="inputValue" :maxlength="10" :placeholder="'aaa'" show-count="true"></fa-input>
 */

<template>
    <div class="fa-input"
        :class="[
            {
                'is-count': showCount
            }
        ]"
    >
        <input 
            type="text" 
            class="fa-input__input"
            :placeholder="placeholder"
            :name="name"
            :maxlength="maxlength"
            :minlength="minlength"
            :value="currentValue"
            @input="handleInput"
            @focus="handleFocus"
            @blur="handleBlur"
            :readonly="readonly"
            :disabled="disabled"
            :autofoucs="autofocus"
            ref="input"
        />
        <span class="fa-input__count" ref="count">
            <span 
                class="fa-input__count__number" 
                :class="[
                    {
                        'is-overstep':isOverStep
                    }
                ]">
                {{textLength}}</span>/{{maxlength}}
        </span>
    </div>
</template>

<script>
    export default {
        name: 'FaInput',
        props:{
            showCount: Boolean, // 是否显示字数统计
            maxlength: [String,Number], // 最大输入长度
            minlength: [String,Number],
            value: [String,Number],
            placeholder: [String,Number],
            name: [String,Number],
            readonly:{},
            disabled:Boolean,
            autofocus: {String,Boolean}
        },
        computed:{
            textLength(){
                return this.currentValue ? this.currentValue.length : 0;
            },
            isOverStep(){
                return this.currentValue ? this.currentValue.length > this.maxlength : false;
            }
        },
        watch:{
            'value'(val,oldval){
                this.setCurrentValue(val);
            }
        },
        methods:{
            handleInput(evt){
                const value = event.target.value;
                this.setCurrentValue(value);
                this.$emit('input',value);
                this.$emit('change', value);
            },
            handleFocus(evt){
                this.$emit('focus',evt);
            },
            handleBlur(evt){
                this.$emit('blur',evt);
            },
            setCurrentValue(value){
                if(value === this.currentValue){
                    return;
                }
                this.currentValue = value;
            },
            setInputStyle(){
                const domCount = this.$refs.count;
                const domInput = this.$refs.input;
                const countWidth = domCount.clientWidth;

                if(this.inputPadding !== countWidth){
                    domInput.style.paddingRight = `${countWidth}px`;
                }
            },
            setCountStyle(){
                const domCount = this.$refs.count;
                const domInput = this.$refs.input;
                const countHeight = domCount.clientHeight;
                const inputHeight = domInput.clientHeight;

                domCount.style.bottom = (inputHeight/2 - countHeight/2)+'px';
            }
        },
        data(){
            return{
                currentValue: this.value,
                inputPadding: 0
            }
        },
        mounted(){
            if(this.showCount){
                this.setCountStyle();
            }
        },
        updated(){
            if(this.showCount){
                this.setInputStyle();
            }
        }
    }
</script>