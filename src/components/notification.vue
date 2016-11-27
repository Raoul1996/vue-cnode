<template>
  <transition name="fade-slide">
    <div class="notification" v-show="show">
      <div class="Menu Menu--arrowed notification__markup">
        <div class="notification__header">
          <button class="btn btn-info notification__markBtn" v-show="hasUnread" @click.stop="markAll">批量处理</button>
          <span class="notification__title">通知</span>
        </div>

        <div class="notification__mask" :class="'is-' + state">
          <div class="spinner"></div>
          <div class="notification__feedback">
            <p>{{ feedbackMsg[state] }}</p>
          </div>
          <div class="notification__cont">
            <ul class="list-unstyled" v-if="notifies && notifies.length > 0" @mousewheel.stop="scrollNotifies">
              <li class="notification__item" v-for="n in notifies" :class="{ 'is-unread': !n.has_read }">
                <img :src="n.author.avatar_url" alt="" class="avatar avatar--s">
                <div class="notification__info">
                  <router-link :to="{ path: '/user/' + n.author.loginname }">
                    {{ n.author.loginname }}
                  </router-link>
                  回复了你的话题
                  <router-link :to="{ path: '/topic/' + n.topic.id }">
                    {{ n.topic.title }}
                  </router-link>

                  <div class="notification__replyTime">
                    {{ formatReplyTime(n.topic.last_reply_at) }}
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
  import { API } from '../js/config';
  import Tools from '../js/tools';

  export default {
    data() {
      return {
        state: 'loading', // loading | none | error | success
        notifies: null, // 所有的通知（未读 & 已读）
        unread: null,
        read: null,
        hasUnread: false,
        feedbackMsg: {
          error: '服务器异常，稍后再试',
          none: '暂无任何消息'
        }
      };
    },

    props: {
      show: {
        type: Boolean,
        default: false
      }
    },

    watch: {
      show(newVal) {
        if (newVal) {
          this.state = 'loading';

          setTimeout(() => {
            this.getMessage();
          }, 1000);
        }
      }
    },

    methods: {
      formatReplyTime(time) {
        return Tools.timeFormatCN(time);
      },

      getMessage(callback) {
        const token = Tools.CookieUtil.get('token');

        this.$http
            .get(`${API.messages}?accesstoken=${token}&mdrender=false`)
            .then((response) => {
              const data = response.data;

              if (data.success) {
                const cb = data.data;

                this.unread = cb.hasnot_read_messages;
                this.read = cb.has_read_messages;

                this.hasUnread = (this.unread instanceof Array) && this.unread.length > 0;

                if (this.unread.length === 0 && this.read.length === 0) {
                  this.state = 'none';
                  return;
                }

                this.notifies = this.unread.concat(this.read);
                this.state = 'success';
              } else {
                this.state = 'error';
              }

              typeof callback === 'function' && (callback());
            }, () => {
              this.hasUnread = false;
              this.state = 'error';
            });
      },

      markAll(evt) {
        const target = evt.target;

        if (target.classList.contains('disabled')) return;

        target.classList.add('disabled');
        target.disabled = true;
        target.innerText = '处理中...';

        const token = Tools.CookieUtil.get('token');

        this.$http
          .post(API.messageMarkAll, { accesstoken: token })
          .then((response) => {
            const data = response.data;

            if (data.success) {
              this.state = 'loading';

              setTimeout(() => {
                this.getMessage(() => {
                  target.classList.remove('disabled');
                  target.disabled = false;
                  target.innerText = '批量处理';
                  this.$emit('markedAll');
                });
              }, 1000);
            } else {
              this.$message.error(data.error_msg ? data.error_msg : '操作失败');
            }
          }, (reject) => {
            Tools.handleAjaxError(reject, this);
          });
      },

      // see http://stackoverflow.com/questions/7600454/how-to-prevent-page-scrolling-when-scrolling-a-div-element
      scrollNotifies(evt) {
        const target = evt.currentTarget;
        const d = evt.wheelDelta || -evt.detail;
        const dir = d > 0 ? 'up' : 'down';
        const $mask = target.parentNode.parentNode;

        const stop = (dir === 'up' && $mask.scrollTop === 0) ||
            (dir === 'down' && $mask.scrollTop === (target.scrollHeight - $mask.offsetHeight));

        stop && evt.preventDefault();
      }
    }
  };
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: all .2s linear;
  }

  .fade-slide-enter,
  .fade-slide-leave-active {
    opacity: 0;
    transform: translate3d(0, -5px, 0);
  }

  .notification {
    position: absolute;
    left: -166px;
    top: 40px;
    &__markup {
      border-radius: 2px;
      width: 360px;
      background: #fff;
      position: relative;
      &::before {
        top: -8px;
        border-bottom: 8px solid #e7eaf1;
      }
      &::after {
        top: -7px;
        border-bottom: 8px solid #ffffff;
      }
    }

    &__header {
      padding: 0 12px;
      text-align: left;
      border-bottom: 1px solid #e7eaf1;
      box-shadow: 0 1px 3px rgba(0, 37, 55, 0.05);
    }

    &__cont {
      > ul {
        margin-bottom: 0;
      }
    }

    &__title {
      font-size: 18px;
      color: #82929f;
      display: block;
      padding: 10px 0;
    }

    &__markBtn {
      margin-top: 3px;
      float: right;
    }

    &__mask {
      width: 100%;
      height: 380px;
      overflow-x: hidden;
      overflow-y: auto;
      > div {
        display: none;
      }

      .spinner {
        margin-top: 163px;
      }

      &.is-loading {
        .spinner {
          display: block;
        }
      }

      &.is-error,
      &.is-none {
        .notification__feedback {
          display: block;
        }
      }

      &.is-success {
        .notification__cont {
          display: block;
        }
      }

    }

    &__feedback {
      font-size: 20px;
      color: #9e9e9e;
      text-align: center;
    }

    &__item {
      border-bottom: 1px solid #ebeef5;
      padding: 15px;
      overflow: hidden;
      position: relative;
      > .avatar {
        float: left;
      }

      &:last-child {
        border: 0 none;
      }

      &.is-unread {
        background-color: #f4f8fb;
      }
    }

    &__info {
      padding-left: 50px;
      text-align: left;
      line-height: 1.42857143;
      color: #404040;
    }

    &__replyTime {
      color: #B0BCC7;
      margin-top: 5px;
    }
  }

</style>
