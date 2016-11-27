<template>
  <div class="article-container">
    <div class="article-list" v-if="(articles && articles.length > 0)">
      <div class="article__item clearfix" v-for="a in articles" :key="a.id">
        <div class="article__avatar">
          <router-link :to="{ path: '/user/' + a.author.loginname }">
            <img :src="a.author.avatar_url" alt="" class="avatar avatar--m">
          </router-link>
        </div>
        <div class="article__group">
          <h3 class="article__title">
            <router-link :to="{ path: '/topic/' + a.id }">
              {{ a.title }}
            </router-link>
          </h3>
          <!-- meta  -->
          <div class="article__meta article__meta--lg">
            <div class="meta article__reply article__reply--red"  v-if="typeof a.reply_count !== 'undefined'">
              <i class="fa fa-comment"></i>&nbsp;&nbsp;{{ a.reply_count }} 回复
            </div>
            <div class="meta article__view article__view--blue" v-if="typeof a.visit_count !== 'undefined'">
              <i class="fa fa-eye"></i>&nbsp;&nbsp;{{ a.visit_count }} 访问
            </div>
          </div>

          <!-- tag & time -->
          <div class="article__ft clearfix">
            <span class="article__replyTime">{{ replyTime(a.last_reply_at) }}</span>
            <div class="tags-list">
              <span class="article__tag" v-if="a.top">置顶</span>
              <span class="article__tag" v-if="a.good">精华</span>
              <span class="article__tag" v-if="a.tab">{{ getTypeName(a.tab) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="no-data-item" v-else>
      <p class="tips">暂无任何文章</p>
    </div>
  </div>
</template>
<script>
  import { articleTypeMap } from '../js/config';
  import Tools from '../js/tools';

  export default {
    props: {
      articles: {
        require: true
      }
    },

    methods: {
      getTypeName(type) {
        return articleTypeMap[type] || '';
      },

      replyTime(time) {
        return Tools.timeFormatCN(time);
      }
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
  .article {
    &__item {
      min-height: 100px;
      padding: 20px 0;
      border-bottom: 1px solid #e7eaf1;
      box-shadow: 0 1px 3px rgba(0, 37, 55, 0.05);

      &:last-child {
        border: 0 none;
        box-shadow: none;
      }
    }
    &__avatar {
      float: left;
      width: 120px;
      text-align: center;
      padding-top: 15px;
    }

    &__group {
      padding: 0 15px 0 120px;
    }

    &__title {
      margin-bottom: 15px;
      > a {
        color: #000;
      }
    }

    &__ft {
      margin-bottom: 15px;
    }

    &__replyTime {
      line-height: 1.85;
      float: right;
    }
  }

  .no-data-item {
    background-color: #fff;
    border-radius: 2px;
    height: 80px;
    > .tips {
      text-align: center;
      color: #929292;
      line-height: 80px;
      font-size: 20px;
    }
  }

</style>
