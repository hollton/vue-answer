<template>
    <div>
        <fa-loading :visible="loadingShow"></fa-loading>
    </div>
</template>
<script>
import {
    mapState
} from 'vuex';

export default {
    name: 'loading',
    computed: {
        ...mapState(['loadingShow'])
    }
};
</script>