<template>
        <div class="slp-mod-guidindex__step6" isteven-multi-select>
            <span class="multiSelect inlineBlock">
                <button ref="button" @click="handleOpenCard">
                    <div class="buttonLabel">
                        {{currentStudent.user_name}}
                        <span class="caret"></span>
                    </div>
                </button>
            </span>
        </div>
</template>

<script>
    import {mapState,mapMutations,mapGetters} from 'vuex';
    import { StudentCard } from '../../Card';
    export default {
        name: 'studentList',
        computed: {
            ...mapGetters(['studentInfoData']),
            ...mapState(
                {
                    currentStudent: state => state.mark.currentStudent
                }
            )
        },
        methods: {
            ...mapMutations(['setCardShow']),
            handleOpenCard(evt){
               this.setCardShow({type: 'student'});
            }
        },
        data(){
            return {
                showCard: false
            }
        },
        components: {
            StudentCard
        }
    }
</script>