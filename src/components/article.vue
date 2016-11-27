<template>
  <div class="article-container">
    <article>
      <h1 class="article__title">{{ article.title }}</h1>
      <div class="article__metaWrap clearfix">
        <div class="article__authorWrap">
          <router-link :to="{ path: '/user/' + article.author.loginname }" class="article__author">
            <img :src="article.author.avatar_url" class="avatar avatar--s">
            {{ article.author.loginname }}
          </router-link>
          <span class="article__replyTime">
            {{ formatCreateTime(article.create_at) }}
          </span>
        </div>

        <!-- article collect -->
        <button class="btn btn-info article__collectBtn" @click="collect" v-show="canCollect !== 0">{{ collectText }}</button>
        <button class="btn btn-success article__edit" @click="edit" v-show="canEdit">编辑</button>

        <!-- meta  -->
        <div class="article__meta">
          <span class="meta article__reply">
            <i class="fa fa-comment"></i>&nbsp;&nbsp;{{ article.visit_count }} 回复
          </span>
          <span class="meta article__view">
            <i class="fa fa-eye"></i>&nbsp;&nbsp;{{ article.reply_count }} 访问
          </span>
        </div>
      </div>
      <div class="article__cont" v-html="article.content"></div>
    </article>
  </div>
</template>
<script>
  import Tools from '../js/tools';

  export default {
    props: {
      article: {
        require: true
      },

      canCollect: { // 0(隐藏该功能) | 1(已收藏) | 2(没有收藏)
        type: Number,
        default: 0,
        validator: val => val >= 0 && val <= 2
      },

      canEdit: {
        type: Boolean,
        default: false
      }
    },

    computed: {
      collectText() {
        if (this.canCollect) {
          return this.canCollect === 1 ? '取消收藏' : '收藏';
        }

        return false;
      }
    },

    methods: {
      formatCreateTime(time) {
        return Tools.timeFormatCN(time);
      },

      collect() {
        this.$emit('collect');
      },

      edit() {
        this.$emit('edit');
      }
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
  .article-container {
    padding: 15px 20px;
    margin-bottom: 20px;
  }

  .article {
    &__cont {
      margin-bottom: 20px;
    }

    &__authorWrap {
      margin-bottom: 15px;
      color: #808080;
    }

    &__metaWrap {
      margin: 22px 0;
    }

    &__replyTime {
      &:before {
        content: '\00B7';
        margin: 0 5px;
      }
    }

    &__author {
      text-decoration: none;
      color: inherit;

      &:hover {
        text-decoration: none;
      }

      .avatar--s {
        margin-right: 12px;
      }
    }

    &__edit {
      float: right;
      margin-right: 10px;
      border-radius: 2px;
    }

    &__collectBtn {
      float: right;
      display: inline-block;
      border-radius: 2px;
      width: 80px;

      &:focus {
        outline: none;
      }
    }
  }
</style>
