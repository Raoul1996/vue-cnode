<!-- 个人中心 -->
<template>
  <div>
    <vc-pageloading :show="isLoading"></vc-pageloading>
    <vc-header></vc-header>
    <div class="app-main">
      <div class="page-container">
        <!-- vcard -->
        <div class="vcard" v-if="userData">
          <div class="vcard__avatar">
            <img :src="userData.avatar_url" alt="" class="avatar avatar--lg">
          </div>
          <div class="vcard__name">
            <h2 class="loginname">{{ userData.loginname }}</h2>
            <h3 class="githubname">{{ userData.githubUsername }}</h3>
          </div>
          <div class="vcard__meta">
            <div class="meta vcard__score">
              <i class="fa fa-star-o fa-lg"></i> {{ userData.score }}
            </div>
            <div class="meta vcard__time">
              <i class="fa fa-calendar fa-lg"></i> {{ formatCreateTime(userData.create_at) }}
            </div>
          </div>
        </div>

        <!-- topics -->
        <div class="topic-nav" @mouseleave="hoverIdx = currType.idx">
          <ul class="list-unstyled clearfix">
            <li class="topic-nav__item" v-for="(n, key) in navs"  @mouseover="hoverIdx = key">
              <a href="#" :data-type="n.tag" :class="currType.tag === n.tag ? 'active' : ''" @click.stop.prevent="getArticleType(n.tag)">{{ n.name }}</a>
            </li>
            <li class="topic-nav__line" :style="setLine"></li>
          </ul>

        </div>

        <div class="topic-list">
          <vc-articlelist v-if="articles" :articles="articles"></vc-articlelist>
        </div>
      </div>
      <div class="page-feedback" v-show="!isLoading && !userData">
        用户不存在, {{ time }}秒后跳转至首页
      </div>
    </div>

  </div>
</template>
<script>
  import { API } from '../js/config';
  import Tools from '../js/tools';
  import PageLoading from '../components/pageLoading';
  import Header from '../components/header';
  import ArticleList from '../components/articleList';

  export default {
    data() {
      return {
        navs: [
          { name: '创建的文章', tag: 'create' },
          { name: '参与的文章', tag: 'reply' },
          { name: '收藏的文章', tag: 'collect' }
        ],
        isLoading: false,
        currType: {
          tag: '',
          idx: 0
        },
        hoverIdx: 0,
        userData: null, // 用户信息
        articles: null,
        time: 3 // 没有数据时跳转至首页的时间
      };
    },

    components: {
      'vc-pageloading': PageLoading,
      'vc-header': Header,
      'vc-articlelist': ArticleList
    },

    computed: {
      setLine() {
        return {
          transform: `translate3d(${this.hoverIdx * 100}%, 0, 0)`
        };
      }
    },

    watch: {
      $route() {
        this.fetchData();
      }
    },

    mounted() {
      this.fetchData();
    },

    methods: {
      fetchData() {
        this.isLoading = true;

        this.$http.get(API.interface + this.$route.path)
            .then((response) => {
              const data = response.data;

              if (data.success) {
                const defaultTag = this.navs[0].tag;
                this.userData = data.data;

                this.hoverIdx = 0;
                this.getArticleType(defaultTag);

                this.isLoading = false;
              } else {
                this.$message.error(data.error_msg);
              }
            }, (reject) => {
              this.isLoading = false;

              const timer = setInterval(() => {
                if (this.time === 0) {
                  clearInterval(timer);
                  this.$router.push({ path: '/' });
                  return;
                }

                this.time -= 1;
              }, 1000);
            });
      },

      formatCreateTime(time) {
        return Tools.timeFormat(time);
      },

      getArticleType(type) {
        if (type === 'collect') {
          this.showCollectTopic(type);
          return;
        }

        if (!this.userData || (type !== 'create' && type !== 'reply')) return;

        if (type === 'create') {
          this.articles = this.userData.recent_topics;
        } else {
          this.articles = this.userData.recent_replies;
        }

        this.setTypeState(type);
      },

      // 显示用户收藏的主题
      showCollectTopic(type) {
        this.$http
            .get(API.topicCollect + this.userData.loginname)
            .then((response) => {
              const data = response.data;

              if (data.success) {
                this.articles = data.data;
              } else {
                this.$message.error(data.error_msg);
              }
            }, (reject) => {
              Tools.handleAjaxError(reject, this);
            });

        this.setTypeState(type);
      },

      setTypeState(tag) {
        this.currType.tag = tag;

        this.navs.every((val, idx) => {
          if (val.tag === tag) {
            this.currType.idx = idx;
            return false;
          }

          return true;
        });
      }
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
  @import '../scss/variable';

  .vcard {
    text-align: center;
    padding: 25px 0;
    border-bottom: 1px dashed #CFD8DC;

    .githubname {
      color: #808080;
      margin-top: -5px;
    }

    &__meta {
      font-size: 0;
      margin-top: 25px;
    }

    &__score {
      border-right: 2px solid #CFD8DC;
    }

    .meta {
      display: inline-block;
      width: 50%;
      font-size: 18px;
      padding: 6px 0;

      .fa {
        margin-right: 10px;
      }
      .fa-star-o {
        &:before {
          content: "\f005";
          color: #FFBB44;
        }
      }
    }
  }

  .topic-nav {
    text-align: center;
    margin: 20px 0;
    position: relative;
    padding: 0 20px;
    > ul {
      border-bottom: 1px solid #CACACA;
      width: 100%;
      position: relative;
      padding-bottom: 10px;
    }

    &__item {
      float: left;
      width: 33.3%;
      cursor: pointer;
      > a {
        color: #000000;
        display: block;
        padding: 12px 0;
        font-size: 18px;

        &:hover,
        &.active {
          text-decoration: none;
          color: $blue-base;
        }

        &:focus {
          text-decoration: none;
        }
      }
    }

    &__line {
      width: 33.4%;
      background: $blue-base;
      display: block;
      height: 2px;
      position: absolute;
      bottom: -1px;
      transition: all .2s ease;
    }
  }
</style>
