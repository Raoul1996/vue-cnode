<template>
  <div>
    <vc-pageloading :show="isLoading"></vc-pageloading>
    <vc-header :article="editingArticle" @hostIsSignIn="hostIsSignIn"></vc-header>
    <div class="app-main">
      <div class="page-container">
        <vc-article v-if="article" :article="article" :canCollect="collectState" :canEdit="canEditArticle"
                    @collect="handleCollect"
                    @edit="handleEdit"></vc-article>
        <vc-comments v-if="comments" :comments="comments" :host="host"
                     @reply="handleReply"
                     @ups="handleUps"></vc-comments>
      </div>
      <div class="page-feedback" v-show="!isLoading && !article">
        文章不存在, {{ time }}秒后跳转至首页
      </div>
    </div>
  </div>
</template>
<script>
  import { API } from '../js/config';
  import Tools from '../js/tools';
  import PageLoading from '../components/pageLoading';
  import Header from '../components/header';
  import Article from '../components/article';
  import Comments from '../components/comments';

  export default {
    data() {
      return {
        isLoading: false,
        time: 3, // 没有数据时跳转至首页的时间
        host: null,
        topicId: 0,
        article: null,
        collectState: 0, // 0(隐藏该功能) | 1(已收藏) | 2(没有收藏)
        canEditArticle: false, // 是否可对文章编辑
        editingArticle: null, // 编辑状态的文章数据
        comments: []
      };
    },

    mounted() {
      this.fetchData();
    },

    watch: {
      // 如果路由有变化，会再次执行该方法
      $route() {
        this.fetchData();
      }
    },

    components: {
      'vc-pageloading': PageLoading,
      'vc-header': Header,
      'vc-article': Article,
      'vc-comments': Comments
    },

    methods: {
      hostIsSignIn(hostData) {
        this.host = hostData;

        this.$http
            .get(API.getUserById + this.host.loginname)
            .then((response) => {
              const data = response.data;

              if (data.success) {
                this.setEditState();
                this.getCollectTopic(this.host.loginname);
              } else {
                this.$message.error(data.error_msg);
              }
            }, (reject) => {
              Tools.handleAjaxError(reject, this);
            });
      },

      fetchData() {
        this.isLoading = true;

        const path = this.$route.path;

        this.topicId = path.substring(path.lastIndexOf('/') + 1);

        this.$http
            .get(API.interface + this.$route.path)
            .then((response) => {
              const data = response.data;

              if (data.success) {
                this.article = data.data;
                this.comments = this.article.replies;
              }

              this.setEditState();

              this.isLoading = false;
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

      // 登录用户收藏的文章， 确保在用户登录后进行调用
      getCollectTopic(loginname) {
        if (!loginname) return;

        this.$http
            .get(API.topicCollect + loginname)
            .then((response) => {
              const data = response.data;

              if (data.success) {
                const arr = data.data;

                if (arr.length >= 0) {
                  this.collectState = 2;

                  arr.every((val) => {
                    if (val.id === this.topicId) {
                      this.collectState = 1;
                      return false;
                    }
                    return true;
                  });
                }
              } else {
                this.$message.error(data.error_msg);
              }
            }, (reject) => {
              Tools.handleAjaxError(reject, this);
            });
      },

      // 点赞
      handleUps(id, callback) {
        if (!this.host) return;

        this.$http
            .post(`${API.replyUps}${id}/ups`, { accesstoken: this.host.accesstoken })
            .then((response) => {
              const data = response.data;

              if (data.success) {
                typeof callback === 'function' && callback(data);
              }
            }, (reject) => {
              Tools.handleAjaxError(reject, this);
            });
      },

      // 评论
      handleReply(cont, callback) {
        if (!this.host) return;

        const params = {
          accesstoken: this.host.accesstoken,
          content: cont
        };

        this.$http
            .post(`${API.topic}${this.topicId}/replies`, params)
            .then((response) => {
              const data = response.data;

              typeof callback === 'function' && callback(data.success);

              if (data.success) {
                this.$message.success('回复成功');
                this.fetchData();
              } else {
                this.$message.error(data.error_msg);
              }
            }, (reject) => {
              const data = reject.data;

              Tools.handleAjaxError(reject, this, () => {
                typeof callback === 'function' && callback(data.success);
              });
            });
      },

      // 专题收藏 | 取消
      handleCollect() {
        if (!this.collectState) return;

        const url = this.collectState === 1 ? API.deCollect : API.collect;

        const params = {
          accesstoken: this.host.accesstoken,
          topic_id: this.topicId
        };

        this.$http
            .post(url, params)
            .then((response) => {
              const data = response.data;

              if (data.success) {
                this.collectState = this.collectState === 1 ? 2 : 1;
              } else {
                this.$message.error(data.error_msg);
              }
            }, (reject) => {
              Tools.handleAjaxError(reject, this);
            });
      },

      setEditState() {
        if (this.host && this.article) {
          this.canEditArticle = this.host.loginname === this.article.author.loginname;
        } else {
          this.canEditArticle = false;
        }
      },

      handleEdit() {
        if (this.canEditArticle && this.article) {
          // 重新获取数据
          this.$http.get(`${API.topic}${this.article.id}?mdrender=false`)
            .then((response) => {
              const body = response.data;

              if (body.success) {
                const { id, tab, title, content } = body.data;

                this.editingArticle = {
                  topic_id: id,
                  tab,
                  title,
                  content
                };
              }
            }, (reject) => {
              Tools.handleAjaxError(reject, this);
            });
        }
      }
    }
  };
</script>
