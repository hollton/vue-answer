<template>
    <a v-show="show" class="btn-back" @click="openConfirm"><span>返回列表</span></a>
</template>
<script>
import {
    mapState
} from 'vuex';
export default {
    name: 'returnlist',
    props: {
        show: {
            type: Boolean,
            default: true
        },
        closeBtn: {
            type: Function,
            default(){}
        },
        confirmBtn: {
            type: Function,
            default(){}
        }
    },
    computed: {
        ...mapState(['isSubmitting','isSaving'])
    },
    methods: {
        openConfirm() {
            if (this.isSubmitting || this.isSaving) {
                this.$tip('还有请求未完成，请稍后......');
                return;
            }
            this.$confirm('确定返回到试卷列表？', '您正在结束作答').then(() => {
                this.closeBtn();
                this.confirmBtn();
            }, err => {
                this.closeBtn();
            });
        }
    }
};
</script>
