<template>
   <div class="popup-wrap exampage-pop popup-topiclist popup-stulist slp-popup-topiclist" v-show="showStudentCard" ref="studentcard">
        <div class="popup-content">
            <div class="popup-body">
                <div class="par" v-for="(student,key) in studentInfoData" :key="key"
                    :class="[
                        {
                            'marked-student': key === 'marked'
                        }
                    ]"
                >
                    <h3>{{key === 'marked' ? '已批改(' + student.length + ')' : '未批改(' + student.length + ')'}}</h3>
                    <ul class="list clearfix">
                        <li 
                        v-for="item in student" 
                        :key="item.user_id" 
                        :title="item.user_name" 
                        @click="handleClick(item)"
                        :class="[
                            {
                                'on': item.user_id === currentStudent.user_id
                            }
                        ]"
                        >
                            <a v-imageavatar="item.avatar" class="student-item">
                                <img :src="item.avatar" class="avatar-img" ref="img">
                            </a>
                            <span class="list-name" :title="item.user_name">{{item.user_name}}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState,mapMutations,mapActions,mapGetters } from 'vuex';
    import {on,off} from '../../../utils/dom';
    export default {
        name: 'studentCard',
        computed: {
            ...mapGetters(['studentInfoData']),
            ...mapState(['examId']),
            ...mapState({
                studentsList: state => state.mark.studentsList,
                currentQuestion: state => state.mark.currentQuestion,
                currentStudent: state => state.mark.currentStudent,
                showStudentCard: state => state.mark.showStudentCard
            })
        },
        methods: {
            ...mapMutations(['setCurrentStudent', 'setCurrentAnswer', 'setStudentsList','setCardShow']),
            ...mapActions(['getCurrentAnswer']),
            handleClick(user_info){
                if(user_info.status !== 'marked'){
                    this.setCurrentStudent({currentStudent: user_info});
                    this.getCurrentAnswer();
                    this.setCardShow({type: 'student',value: false});
                }
            },
            handleDocumentClick(evt){
                const isContains = this.$el.contains(evt.target);
                if(!isContains){
                    this.setCardShow({type: 'student',value: false});
                }
            }
        },
        data(){
            return {
                defaultAva: '../../../assets/images/user.png'
            }
        },
        watch: {
            showStudentCard(val){
                if(val){
                    setTimeout(()=>{
                        on(document, 'click', this.handleDocumentClick);
                    },100)
                    
                }else{
                    off(document, 'click', this.handleDocumentClick);
                }
            }
        }
    }
</script>

<style lang="scss">
    .img-error{
        position: relative;
        &:before{
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            border: 0;
            width: 100%;
            height: 100%;
            background-color: #fff;
            border-radius: 50%;
        }
        &:after{
            width: 44px;
            height: 44px;
            content: "";
            background: url('../../../assets/images/user.png') center center no-repeat;
            background-size: 44px 44px;
            position: absolute;
            top: 0;
            left: 0;

        }
    }

    .marked-student{
        a{
            cursor: default;
        }
    }
</style>