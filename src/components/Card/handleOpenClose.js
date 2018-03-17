import { on,off } from '../../utils/dom';
import {mapMutations} from 'vuex';

export default {
     props: {
        value: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        ...mapMutations(['setCardShow']),
        handleDocumentClick(evt){
            const isContains = this.$el.contains(evt.target);
            if(!isContains){
                this.setCardShow({type: 'questions',value: false});
                this.setCardShow({type: 'student',value: false});
            }
        }
    },
    watch: {
        value(val){
            this.isOpen = val;
            if(val){
                setTimeout(()=>{
                    on(document,'click',this.handleDocumentClick);
                });
                
            }else{
                off(document,'click',this.handleDocumentClick);
            }
        },
        isOpen(val){
            this.$emit('input', val);
        }
    },
    data(){
        return {
            isOpen: false
        }
    }
}