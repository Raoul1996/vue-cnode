<template>
  <div class="comments-container">
    <div class="comments__summary">
      <span>{{ comments.length }} 条评论</span>
    </div>

    <div class="clearfix">
      <div class="comments__left" v-if="host">
        <router-link :to="{ path: '/user/' + host.loginname }">
          <img :src="host.avatar_url" class="avatar avatar--s">
        </router-link>
      </div>

      <div class="comments__right" v-show="host">
        <label class="sr-only" for="hostReply" aria-hidden="true"></label>
        <textarea name="hostReply" id="hostReply"></textarea>
        <div class="comments__btnWrap">
          <button class="btn btn-default comments__replyBtn" @click="reply($event, true)">回复</button>
        </div>
      </div>
    </div>

    <!-- comments list -->
    <div class="comments__list" v-if="comments && comments.length > 0">
      <div class="comments__item clearfix" v-for="(c, key) in comments">
        <div class="comments__left">
          <router-link :to="{ path: '/user/' + c.author.loginname }">
            <img :src="c.author.avatar_url" class="avatar avatar--s">
          </router-link>
        </div>
        <div class="comments__right">
          <router-link :to="{ path: '/user/' + c.author.loginname }" class="comments__author">
            {{ c.author.loginname }}
          </router-link>
          <!-- comment content -->
          <div class="comments__cont" v-html="c.content"></div>

          <!-- meta -->
          <div class="comments__meta">
            <span class="comments__replyTime">{{ formatCreateTime(c.create_at) }}</span>

            <span class="comments__likenum" v-show="c.ups && c.ups.length > 0">{{ c.ups.length }} 赞</span>

            <a href="#" class="comments__opeBtn" @click.stop.prevent="handleUps(c)" v-if="host">
              <i class="fa fa-thumbs-o-up" aria-hidden="true"></i> 赞
            </a>

            <a href="#" class="comments__opeBtn" @click.stop.prevent="toggleReply(key, c)" v-if="host">
              <i class="fa fa-reply" aria-hidden="true"></i> 回复
            </a>
          </div>

          <!-- reply -->
          <transition name="fade">
            <div class="comments__replyField" v-show="storage[key] && storage[key].trigger">
              <div class="comments__left" v-if="host">
                <router-link :to="{ path: '/user/' + host.loginname }">
                  <img :src="host.avatar_url" class="avatar avatar--s">
                </router-link>
              </div>
              <div class="comments__right">
                <label class="sr-only" for="hostReply" aria-hidden="true"></label>
                <textarea :name="'reply' + c.id" :id="c.id"></textarea>
                <div class="comments__btnWrap">
                  <button class="btn comments__cancelBtn" @click="storage[key].trigger = !storage[key].trigger">取消</button>
                  <button class="btn btn-default comments__replyBtn" @click="reply($event, key)">回复</button>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
    <div class="no-comms" v-else>
      <p>暂无评论</p>
    </div>
  </div>
</template>

<script>
  import Tools from '../js/tools';
  import createSimplemde from '../js/createSimplemde';

  export default {
    data() {
      return {
        bottomMde: null, // 底部回复的simplemde对象
        storage: [] // 存储每条评论的回复开关及simplemde对象
      };
    },

    props: {
      comments: null,
      host: null
    },

    mounted() {
      this.bottomMde = createSimplemde({
        element: document.getElementById('hostReply'),
        placeholder: '写下你的评论'
      });
    },
    methods: {
      formatCreateTime(time) {
        return Tools.timeFormatCN(time);
      },

      // 点赞
      handleUps(reply) {
        reply.ups = reply.ups || [];

        this.$emit('ups', reply.id, (data) => {
          if (data.action === 'up') { // 点赞
            reply.ups.push(null);
          } else if (data.action === 'down') { // 取消点赞
            reply.ups.shift();
          }
        });
      },

      // 显示/隐藏 回复框
      toggleReply(key, c) {
        let item = null;
        const currData = this.storage[key];

        if (!currData) {
          item = {
            trigger: true,
            mde: createSimplemde({
              element: document.getElementById(c.id),
              autofocus: true
            })
          };
        } else {
          item = {
            trigger: !currData.trigger,
            mde: currData.mde
          };
        }

        item.mde.value(`@${c.author.loginname}`);

        this.$set(this.storage, key, item);
      },

      beforePost(target) {
        if (!target) return;

        if (target.classList.contains('disabled')) return;

        target.classList.add('disabled');
        target.setAttribute('disabled', 'disabled');

        target.textContent = '回复中...';
      },

      /*
      * @param key 当key为true时说明是来自头部的回复
      * */
      reply(event, key) {
        const mde = key === true ? this.bottomMde : this.storage[key].mde;

        if (!mde) return;

        const cont = mde.value();

        if (!cont) {
          this.$message.error('评论内容不能为空');
          return;
        }

        const target = event.target;

        this.beforePost(target);

        this.$emit('reply', cont, (state) => {
          this.afterPost(target);

          if (state && this.storage[key]) {
            this.storage[key].trigger = false;
          }
        });
      },

      afterPost(target) {
        if (!target) return;

        target.classList.remove('disabled');
        target.disabled = false;

        target.textContent = '回复';
      }
    }
  };
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity .2s linear;
  }

  .fade-enter,
  .fade-leave-active {
    opacity: 0;
  }

  .no-comms {
    text-align: center;
    color: #818181;
    font-size: 20px;
    > p {
      margin: 20px auto;
    }
  }

  .comments {
    &-container {
      padding: 0 20px;
      margin-bottom: 20px;
    }
    &__summary {
      line-height: 22px;
      font-weight: 700;
      position: relative;
      margin: 0 0 32px;
      font-size: 16px;

      &::after {
        content: '';
        position: absolute;
        height: 1px;
        left: 0;
        right: 0;
        top: 11px;
        background: #f0f0f0;
      }

      > span {
        background: #fff;
        position: relative;
        z-index: 1;
        padding-right: 16px;
      }
    }

    &__item {
      margin-top: 32px;
      position: relative;

      &:hover {
        .comments__opeBtn {
          visibility: visible;
        }
      }
    }

    &__left {
      float: left;
      height: 40px;
    }

    &__right {
      margin-left: 60px;
    }

    &__author {
      color: #333;
      font-weight: 700;
      outline: none;
      font-size: 16px;
    }

    &__cont {
      margin: 8px 0;
    }

    &__replyField {
      margin-top: 15px;
    }

    &__btnWrap {
      float: right;
      margin-top: 20px;

      .btn {
        color: #808080;
        min-width: 80px;
      }
    }

    &__cancelBtn {
      background: none;
      border: 0 none;
      margin-right: 10px;

      &:hover {
        color: #000;
      }
    }

    &__replyBtn {
      &:hover {
        background-color: #fff;
        border-color: #428bca;
        color: #428bca;
      }
    }

    &__meta {
      color: #808080;
      font-size: 14px;
    }

    &__likenum {
      float: right;
    }

    &__opeBtn {
      color: #808080;
      margin-left: 12px;
      visibility: hidden;
      &:hover {
        color: #000;
        text-decoration: none;
      }

      &:visited,
      &:active,
      &:focus {
        text-decoration: none;
      }
    }
  }

</style>
