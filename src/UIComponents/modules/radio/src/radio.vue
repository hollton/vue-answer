/**
    使用方法
    @mode 为String型， 水平排版、垂直排版；可选参数为 'horizontal','vertical'；默认为'horizontal'
    @label: 每个单选按钮的值
    @v-model: 单选按钮选中的值
    @change: 选择改变时的回调事件，参数为单选框的值
    @radioText: 单选框内的文字
    <fa-radio :label="1" v-model="radio">单选按钮1</fa-radio>
    <fa-radio :label="2" v-model="radio">单选按钮2</fa-radio>

    <fa-radio-group v-model="radioGroup" @change="handleRadioGroup">
        <fa-radio :label="1">单选按钮组1</fa-radio>
        <fa-radio :label="2">单选按钮组2</fa-radio>
    </fa-radio-group>
 */
<template>
    <label class="fa-radio">
        <span class="fa-radio__input"
            :class="[
                {
                    'is-checked': model === label,
                    'is-disabled': isDisabled,
                    'is-correct': isCorrect,
                    'is-wrong': isWrong
                }
            ]"
        >
            
            <span class="fa-radio__inner">{{radioText}}</span>
            <input 
            type="radio" 
            class="fa-radio__original" 
            :value="label" 
            v-model="model"
            @focus="focus = true"
            @blur="focus = false"
            :name="name"
            :disabled="isDisabled"
            :style="{
                display: radioText ? 'none' : 'inline-block'
            }"
            >
        </span>
        <span class="fa-raido__label">
            <slot></slot>
        </span>
    </label>
</template>
<script>
    import Emitter from '../../../mixins/emitter';
    export default{
        name: 'FaRadio',
        componentName: 'FaRadio',
        mixins:[Emitter],
        props:{
            mode:{
                type: String,
                default: 'horizontal'
            },
            disabled: Boolean,
            label: {},
            value: {},
            name: String,
            isCorrect: Boolean,
            isWrong: Boolean,
            radioText: String
        },
        data(){
            return {
                focus: false
            }
        },
        computed: {
            isGroup(){
                let parent = this.$parent;
                while(parent){
                    if(parent.$options.componentName !== 'FaRadioGroup'){
                        parent = parent.$parent;
                    }else{
                        this._radioGroup = parent;
                        return true;
                    }
                }
                return false;
            },
            model: {
                get(){
                    return this.isGroup ? this._radioGroup.value : this.value;
                },
                set(val){
                    if(this.isGroup){
                        this.dispatch('FaRadioGroup', 'input', [val]);
                    }else{
                        this.$emit('input', val);
                        this.$emit('change', val);
                    }
                }
            },
            isDisabled(){
                return this.isGroup ? this._radioGroup.disabled || this.disabled : this.disabled;
            }
            
        }
    }
</script>