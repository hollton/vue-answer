/** 
单个的用法
@mode 为String型， 水平排版、垂直排版；可选参数为 'horizontal','vertical'；默认为'horizontal'
@v-model 为Boolean型
@disabled 为Boolean型，是否禁用
@change 发送改变时的回调函数
<fa-checkbox v-model="checked" :disabled="true" @change="handleChange">选中</fa-checkbox>

组合用法
@mode 为String型， 水平排版、垂直排版；可选参数为 'horizontal','vertical'；默认为'vertical'
@v-model 为Array型，里面包含被选中项的label值
@change 发送改变时的回调函数
@label 多选框的值
<fa-checkbox-group v-model="checkedList" @change="handleChange">
    <fa-checkbox :label="'checked'">选中</fa-checkbox>
    <fa-checkbox :label="'unchecked'">不选中</fa-checkbox>
</fa-checkbox-group>

*/


<template>
    <label class="fa-checkbox" :class="[mode]">
        <span class="fa-checkbox__input"
            :class="[
                {
                    'is-checked': isChecked,
                    'is-disabled': disabled,
                    'is-correct': isCorrect,
                    'is-wrong': isWrong
                }
            ]"
        >
            <span class="fa-checkbox__inner">{{checkboxText}}</span>
            <input 
                type="checkbox" 
                class="fa-checkbox__original" 
                :disabled="disabled"
                :value="label"
                v-model="model"
                @change="handleChange"
                :style="{
                    display: checkboxText ? 'none' : 'inline-block'
                }"
            >
        </span>
        <span class="fa-checkbox__label"><slot></slot></span>
    </label>
</template>
<script>
    import Emitter from '../../../mixins/emitter';

    export default {
        name: 'FaCheckbox',
        componentName: 'FaCheckbox',
        mixins: [Emitter],
        props:{
            mode:{
                type: String,
                default: 'horizontal'
            },
            disabled:Boolean,
            isCorrect: Boolean,
            isWrong: Boolean,
            value:{},
            label:{},
            checked: Boolean,
            name: String,
            trueLabel: [String,Number],
            falseLabel: [String,Number],
            checkboxText: String
        },
        computed:{
            model:{
                get(){
                    return this.isGroup ? this.store : this.value !== undefined ? this.value : this.selfModel;
                },
                set(val){
                    if(this.isGroup){
                        this.dispatch('FaCheckboxGroup', 'input',[val]);
                    }else if(this.value !== undefined){
                        this.$emit('input',val);
                    }else{
                        this.selfModel = val;
                    }
                }
            },
            isGroup(){
                let parent = this.$parent;
                while(parent){
                    if(parent.$options.componentName !== 'FaCheckboxGroup'){
                        parent = parent.$parent;
                    }else{
                        this._checkboxGroup = parent;
                        return true;
                    }
                }
                return false;
            },
            isChecked(){
                if({}.toString.call(this.model) === '[object Boolean]'){
                    return this.model;
                }else if(Array.isArray(this.model)){
                    return this.model.indexOf(this.label) > -1;
                }else if(this.model !== null && this.model !== undefined){
                    return this.model === this.trueLabel;
                }
            },
            store(){
                return this.isGroup ? this._checkboxGroup.value : this.value;
            }
        },
        methods:{
            addToStore(){
                if(Array.isArray(this.model) && this.model.indexOf(this.label) === -1){
                    this.model.push(this.label);
                }else{
                    this.model = this.trueLabel || true;
                }
                this.model = this.trueLabel || true;
            },
            handleChange(ev){
                this.$emit('change', ev);
                if(this.isGroup){
                    this.$nextTick(_ => {
                        this.dispatch('FaCheckboxGroup', 'change', [this._checkboxGroup.value]);
                    })
                }
            }
        },
        data(){
            return {
                selfModel: false
            }
        },
        created(){
            this.checked && this.addToStore();
        }
    }
</script>