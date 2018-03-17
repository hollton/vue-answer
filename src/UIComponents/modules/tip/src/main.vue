<template>
    <div class="fa-tip"
   		 v-show="visible"
    	 @mouseenter="clearTimer"
    	 @mouseleave="startTimer">{{message}}</div>
</template>
<script>
export default {
    name: 'FaTip',
    data() {
        return {
            visible: false,
            message: '',
            duration: 2000,
            timer: null
        };
    },
    mounted() {
        this.startTimer();
    },
    methods: {
        startTimer() {
            if (this.duration > 0) {
                this.timer = setTimeout(() => {
                    this.close();
                }, this.duration);
            }
        },
        clearTimer() {
            clearTimeout(this.timer);
        },
        close() {
            this.visible = false;
            this.destroyElement();
        },
        destroyElement() {
            this.$el.removeEventListener('transitionend', this.destroyElement);
            this.$destroy(true);
            this.$el.parentNode.removeChild(this.$el);
        }
    }
};
</script>
