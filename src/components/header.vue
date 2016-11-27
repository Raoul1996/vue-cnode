<template>
  <div>
    <header class="globalNav">
      <div class="container">
        <router-link to="/" class="globalNav__brand">CNode</router-link>
        <div class="globalNav__right">
          <div class="globalNav__group globalNav__group--in" v-if="host">
            <div class="globalNav__notifies" :class="{ 'is-active': notifiesCount }">
              <a href="#" @click.stop.prevent="showNotification = !showNotification"
                 :class="{ active: showNotification }">
                <i class="fa fa-envelope fa-2x animated"></i>
              </a>
              <vc-notification :show="showNotification" @markedAll="markedAll"></vc-notification>
            </div>
            <a href="#" class="globalNav__post" @click.prevent="showPostModal">
              <i class="fa fa-pencil-square-o fa-2x" aria-hidden="true"></i>
            </a>
            <router-link :to="{ path: '/user/' + host.loginname }" class="globalNav__avatar">
              <img :src="host.avatar_url" alt="">
            </router-link>
          </div>
          <div class="globalNav__group" v-else>
            <a href="#" class="globalNav__signIn" :class="{'is-active': showLoginForm }" @click.stop.prevent="showLoginForm = !showLoginForm">登录</a>
            <vc-loginform :show="showLoginForm" @signIn="signIn"></vc-loginform>
          </div>
        </div>
      </div>
    </header>
    <vc-post v-show="showPost" @close="showPost = false" :article="article" @postTopic="postTopic"></vc-post>
  </div>
</template>
<script>
  import { API } from '../js/config';
  import Tools from '../js/tools';
  import loginForm from './loginForm';
  import Post from './post';
  import Notification from './notification';

  export default {
    data() {
      return {
        host: null, // 登录的用户
        state: 'normal', // normal | edit
        showLoginForm: false, // loginFrom
        showPost: false, // post
        showNotification: false, // Notification
        notifiesCount: 0 // host 未读信息数
      };
    },

    props: {
      article: { // 用于文章的编辑，必须含有topic_id
        type: Object,
        default: null,
        validator: val => val && val.topic_id
      }
    },

    components: {
      'vc-post': Post,
      'vc-loginform': loginForm,
      'vc-notification': Notification
    },

    watch: {
      article(newVal) {
        if (newVal) {
          this.state = 'edit';
          this.showPost = true;
        }
      }
    },

    mounted() {
      this.signIn();

      // see https://css-tricks.com/dangers-stopping-event-propagation/
      document.documentElement.addEventListener('click', () => {
        let parent = event.target;
        let isInside = false;

        if (this.showNotification || this.showLoginForm) {
          const checkedClassName = this.showNotification ? 'notification' : 'loginForm';
          while (parent) {
            if (parent.classList && parent.classList.contains(checkedClassName)) {
              isInside = true;
              break;
            }
            parent = parent.parentNode;
          }

          if (!isInside) {
            if (this.showNotification) {
              this.showNotification = false;
            } else {
              this.showLoginForm = false;
            }
          }
        }
      }, false);
    },

    methods: {
      // 用户登录
      signIn(token) {
        const auth = Tools.isLogin(token);

        auth.then((data) => {
          this.host = data.host;
          this.host.accesstoken = data.token;

          this.showLoginForm = false;

          this.getMessageCount(data.token);

          this.$emit('hostIsSignIn', this.host);
        }, () => {
          this.host = null;
        });
      },

      // 获取 host 未读消息数
      getMessageCount(accesstoken) {
        if (!accesstoken) return;

        this.$http
            .get(`${API.messageCount}?accesstoken=${accesstoken}`)
            .then((response) => {
              const data = response.data;

              if (data.success) {
                this.notifiesCount = data.data;
              }
            }, (reject) => {
              Tools.handleAjaxError(reject, this);
            });
      },

      showPostModal() {
        this.showPost = true;
      },

      postTopic(params) {
        if (!this.host || !params) return;

        if (!params.tab) {
          this.$message.error('类型不能为空');
          return;
        }

        if (!params.title) {
          this.$message.error('标题不能为空');
          return;
        }

        if (!params.content) {
          this.$message.error('内容不能为空');
          return;
        }

        params.accesstoken = this.host.accesstoken;

        if (this.state === 'edit' && this.article && this.article.topic_id) {
          params.topic_id = this.article.topic_id;
        }

        const url = this.state === 'edit' ? API.topicUpdate : API.topics;

        this.$http.post(url, params)
            .then((response) => {
              const data = response.data;

              // 跳转到发布的文章页
              if (data.success) {
                // edit 直接刷新页面
                if (this.state === 'edit') {
                  this.$router.go({
                    path: this.$router.path,
                    query: {
                      t: +new Date()
                    }
                  });
                  return;
                }
                this.$router.push({ path: `/topic/${data.topic_id}` });
              } else {
                this.$message.error(data.error_msg);
              }
            }, (reject) => {
              Tools.handleAjaxError(reject, this);
            });
      },

      // 批量处理完未读通知
      markedAll() {
        this.notifiesCount = 0;
      }
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
  @import '../scss/variable';

  $globalNavHeight: 60px;

  .globalNav {
    position: fixed;
    top: 0;
    width: 100%;
    background-color: #ffffff;
    height: $globalNavHeight;
    border-bottom: 1px solid rgba(0, 0, 0, 0.15);
    z-index: 1000;

    > .container {
      padding: 0;
    }

    &__brand {
      color: $blue-base;
      font-weight: 700;
      font-size: 20px;
      line-height: 20px;
      padding: 20px 5px;
      float: left;
      &:hover,
      &:focus {
        text-decoration: none;
      }
    }

    &__right {
      float: right;
      height: $globalNavHeight;
    }

    &__avatar {
      width: 30px;
      height: 30px;
      display: inline-block;
      margin-top: 15px;
      > img {
        border-radius: 4px;
        width: 100%;
      }
    }

    &__group {
      height: 100%;
      position: relative;
    }

    &__signIn {
      display: block;
      color: #BCC8D9;
      padding: 19px 12px;
      font-size: 16px;
      transition: color .15s linear;
      &:hover,
      &:focus {
        text-decoration: none;
      }
      &:hover {
        color: $blue-base;
      }
      &:focus {
        outline: none;
      }

      &.is-active {
        color: $blue-base;
      }
    }

    &__notifies {
      position: relative;
      display: inline-block;
      vertical-align: middle;
      > a {
        color: #BCC8D9;
        opacity: .8;
        &:hover,
        &.active {
          opacity: 1;
        }
      }

      &.is-active {
        &::before {
          visibility: visible;
        }
      }

      &::before {
        content: '';
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #F06049;
        position: absolute;
        right: -4px;
        top: 0;
        visibility: hidden;
        z-index: 2;
      }
    }

    &__post {
      margin: 0 15px;
      display: inline-block;
      color: #BCC8D9;
      opacity: .8;
      vertical-align: middle;
      &:hover {
        opacity: 1;
      }
      > .fa {
        position: relative;
        top: 2px;
      }
    }
  }

  @-webkit-keyframes flash {
    0%, 100%, 50% {
      opacity: 1
    }

    25%, 75% {
      opacity: 0
    }
  }

  @keyframes flash {
    0%, 100%, 50% {
      opacity: 1
    }

    25%, 75% {
      opacity: 0
    }
  }
</style>
