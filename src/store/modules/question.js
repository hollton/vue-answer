import Vue from 'vue';
import {customFind} from '../../utils/common';

const apiService = Vue.$apiService;

export default {
    state: {
        resourcePlayData:{},  // 存储资源播放次数数据
        players:[],  // 资源播放器
        collectionItems:[]
    },
    getters: {},
    mutations: {
        'setPlayData':(state, resData)=> {
            resData && resData.forEach(item=>{
                // 要加个配对的get
                state.resourcePlayData[item.question_id+'_'+item.resource_id] = item;
            });
        },
        'addPlayer':(state, player)=> {
            if(state.players.indexOf(player)===-1){
                state.players.push(player);
            }
        },
        'setCollectData':(state, itemsData)=> {
            let currentCollect;
            if(itemsData){
                itemsData.forEach(item=>{
                    currentCollect = customFind(state.collectionItems,{owner:item.owner, question_id:item.question_id, session_id:item.session_id});
                    if(currentCollect){
                        currentCollect.type = item.type;
                    } else {
                        state.collectionItems.push(item);
                    }
                });
            }
        }
    },
    actions: {
        // 根据exam_id,session_id,question_id获取题目信息
        getExamQuestionsById(context, paramData) {
            return apiService.AnswerAPI.getExamQuestionsById(paramData).then((response) => {
                return response.data;
            });
        },
        // 根据paper_id,question_id获取试卷题目信息
        getExamPaperById(context, paramData) {
            return apiService.AnswerAPI.getExamPaperById(paramData).then((response) => {
                return response.data;
            });
        },
        // 实时保存作答信息
        saveAnswer(context, paramData) {
            return apiService.AnswerAPI.saveAnswer(paramData).then((response) => {
                return response.data;
            });
        },
        getUploadUrl() {
            return apiService.AnswerAPI.getUploadUrl().then((response) => {
                return response.data;
            });
        },
        examSubmit(context, paramData) {
            return apiService.AnswerAPI.examSubmit(paramData).then((response) => {
                return response.data;
            });
        },
        getResourcePlayCount(context, paramData) {
            return apiService.AnswerAPI.getResourcePlayCount(paramData).then((response) => {
                context.commit('setPlayData', response.data);
                return response.data;
            });
        },
        addResourcePlayCount(context, paramData) {
            return apiService.AnswerAPI.addResourcePlayCount(paramData).then((response) => {
                context.commit('setPlayData', [response.data]);
                return response.data;
            });
        },
        getAnswerCollection(context, exam_id) {
            return apiService.AnswerAPI.getAnswerCollection(exam_id).then((response) => {
                context.commit('setCollectData', response.data && response.data.items);
                return response.data;
            });
        },
        addAnswerCollection(context, paramData) {
            return apiService.AnswerAPI.addAnswerCollection(paramData).then((response) => {
                return response.data;
            });
        },
        cancelAnswerCollection(context, paramData) {
            return apiService.AnswerAPI.cancelAnswerCollection(paramData).then((response) => {
                return response.data;
            });
        }
    }
};