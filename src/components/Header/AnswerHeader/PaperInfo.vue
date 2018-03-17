<template>
        <div class="exampage-info">
            <h2>
                {{paper_info.title}}
            </h2>
            <div class="wrapper">
                <ul class="exampage-info-lit clearfix">
                    <li>
                        <p><span>本试卷共有</span>{{paper_info.broad_theme_count || '0'}}大题{{paper_info.narrow_theme_count||'0'}}小题<i class="quantity"></i></p>
                    </li>
                    <li>
                        <p><span>总分</span>{{paper_info.total_point||'0'}}分<i class="score"></i></p>
                    </li>
                    <li>
                        <p><span>答题时间</span>{{paper_info.time?paper_info.time+'分钟':'无限制'}}<i class="time"></i></p>
                    </li>
                    <li>
                        <p><span>试卷来源</span>{{paper_info.from||'北京师范大学'}}<i class="design"></i></p>
                    </li>
                </ul>
            </div>
        </div>
</template>

<script>
    import { mapState } from 'vuex';
    export default {
        name: 'paperInfo',
        computed: {
            ...mapState(['paperData','totalPoint']),
            paper_info() { // 获取异步存储在store中的试卷信息
                let data = { // 设置试卷信息的默认值
                    title: '', // 试卷标题
                    broad_theme_count: 0, // 大题数量
                    narrow_theme_count: 0, // 小题数量
                    total_point: this.totalPoint, // 总分
                    time: 0, // 答题时间
                    from: '' // 试卷来源
                };
                let narrow_theme_count = 0;
                if(this.paperData && JSON.stringify(this.paperData) !== '{}'){ // 判断试卷信息是否存在
                    data.title = this.paperData.title||'无';
                    data.broad_theme_count = this.paperData.parts.length;
                    this.paperData.parts.map(item => {
                        narrow_theme_count += item.question_identities.length;
                    });

                    data.narrow_theme_count = narrow_theme_count;
                }

                return data;
            }
        },
        data(){
            return {
                imgList: []
            }
        }
    }
</script>