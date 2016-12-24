<template>
  <div class="page">
    <Door :state="doorState" @ready="doorIsReady"></Door>
    <ActionBtn :host="host"></ActionBtn>
    <GlobalNav @ready="ready" :isLoading="isLoading">
      <li class="globalnav__link" :class="{'is-active': currType === n.tag}" v-for="n in navs">
        <a href="#" @click.prevent="selectNav(n.tag)">{{ n.name }}</a>
      </li>
    </GlobalNav>
    <div class="page__main">
      <div class="container">
        <div class="home-content" v-if="articles && articles.length > 0">
          <ArticleList  :articles="articles"></ArticleList>
          <div class="loadmore-wrap" v-show="showLoadMoreModal">
            <LoadMore :state="loadMoreType" @loadMore="loadMore"></LoadMore>
          </div>
        </div>
        <p class="page__feedback" v-else>
          暂无任何文章
        </p>
      </div>
    </div>
  </div>
</template>
<script>
  import { API } from '../js/config';
  import Tools from '../js/tools';
  import Door from '../components/Door';
  import GlobalNav from '../components/GlobalNav';
  import ActionBtn from '../components/ActionButton';
  import ArticleList from '../components/ArticleBrief';
  import LoadMore from '../components/LoadMore';

  export default {
    data() {
      const navs = [
        { name: '全部', tag: 'all' },
        { name: '精华', tag: 'good' },
        { name: '分享', tag: 'share' },
        { name: '问答', tag: 'ask' },
        { name: '招聘', tag: 'job' }
      ];

      return {
        navs,
        doorState: 'init', // init | start | end
        // barState: 'init', // init | start | end
        isLoading: false,
        showLoadMoreModal: false,
        loadMoreType: 0,  // 0(loading) | 1(load more) | 2(none)
        isLoadingMore: false, // 是否正在加載更多
        page: 1,
        currType: '',
        articles: null,
        host: null  // 登入的用户
      };
    },

    components: {
      Door,
      ActionBtn,
      GlobalNav,
      ArticleList,
      LoadMore
    },

    mounted() {},
    methods: {
      // 启动页加载完毕（动画完成）
      doorIsReady() {
        this.doorState = 'start';
        this.getArticleType(this.navs[0].tag, () => {
          this.doorState = 'end';

          this.addScrollEvt();
        });
      },

      ready(data) {
        this.host = data;
      },

      getArticleType(type, callback) {
        this.fetchData(type).then((cb) => {
          this.articles = cb.data.data;
          this.currType = cb.type;
          this.page = cb.page;
          typeof callback === 'function' && (callback());
        }, (reject) => {
          Tools.handleAjaxError(reject, this);
        });
      },

      fetchData(type, page = 1, limit = 20) {
        const params = `?tab=${(type === 'all' ? '' : type)}&page=${page}&limit=${limit}`;
        const self = this;

        return new Promise((resolve, reject) => {
          self.$http
              .get(API.topics + params)
              .then((response) => {
                resolve({ data: response.data, type, page });
              }, (error) => {
                reject(error);
              });
        });
      },

      selectNav(tag) {
        this.isLoading = true;
        this.getArticleType(tag, () => {
          this.isLoading = false;
        });
      },

      addScrollEvt() {
        const winH = window.innerHeight;

        const doc = document.documentElement;
        const body = document.body;

        this.scrollEv = () => {
          if (this.isLoadingMore) return;

          const docH = Math.max(doc.clientHeight, doc.scrollHeight);
          // fix firefox body.scrollTop always return 0
          // see http://stackoverflow.com/questions/28633221/document-body-scrolltop-firefox-returns-0-only-js
          const bodyScrollTop = window.pageYOffset || body.scrollTop || doc.scrollTop || 0;

          if ((bodyScrollTop + winH - docH) >= 0) {
            if (this.loadMoreType === 2) {
              window.removeEventListener('scroll', this.scrollEv);
              return;
            }

            this.showLoadMoreModal = true;

            if (this.page % 3 === 0) { // load more
              this.loadMoreType = 1;
            } else {
              this.loadMore();
            }
          }
        };

        window.addEventListener('scroll', this.scrollEv, false);
      },

      loadMore() {
        this.isLoadingMore = true;
        this.loadMoreType = 0;

        setTimeout(() => {
          let currPage = this.page;

          this.fetchData(this.currType, (currPage += 1))
              .then((cb) => {
                const data = cb.data;

                if (data.success) {
                  const arr = data.data;
                  if ((arr instanceof Array) && arr.length > 0) {
                    !this.articles && (this.articles = []);

                    this.articles = this.articles.concat(arr);

                    this.showLoadMoreModal = false;
                  } else {
                    this.loadMoreType = 2;
                    window.removeEventListener('scroll', this.scrollEv);
                  }

                  this.page = currPage;
                } else {
                  this.loadMoreType = 1;
                  Tools.handleAjaxError(data, this);
                }

                this.isLoadingMore = false;
              }, (reject) => {
                Tools.handleAjaxError(reject, this);

                this.loadMoreType = 1;
                this.isLoadingMore = false;
              });
        }, 1000);
      }
    }
  };
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
</style>
