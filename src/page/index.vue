<template>
  <div>
    <vc-pageloading :show="isLoading"></vc-pageloading>
    <vc-loadingbar v-show="percentage > -100 && percentage < 0" :percentage="percentage"></vc-loadingbar>
    <vc-header @hostIsSignIn="hostIsSignIn"></vc-header>

    <div class="app-main">
      <div class="page-container">
        <!-- sub nav -->
        <div class="sub-nav">
          <nav class="navbar">
            <ul class="list-unstyled navbar__list" @click="selectNav">
              <li class="navbar__nav" v-for="n in navs">
                <a href="#" class="navbar__link" :class="{active: currType === n.tag}" :data-type="n.tag">{{ n.name }}</a>
              </li>
            </ul>
          </nav>
        </div>
        <div class="page-cont home-cont">
          <vc-articlelist v-if="articles" :articles="articles"></vc-articlelist>

          <div class="loadmore-wrap" v-show="showLoadMoreModal">
            <vc-loadmorebtn :state="loadMoreType" @loadMore="loadMore"></vc-loadmorebtn>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { API } from '../js/config';
  import Tools from '../js/tools';
  import PageLoading from '../components/pageLoading';
  import LoadingBar from '../components/loadingBar';
  import Header from '../components/header';
  import ArticleList from '../components/articleList';
  import LoadMoreBtn from '../components/loadMoreBtn';

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
        percentage: -100,
        isLoading: false, // page loading
        showLoadMoreModal: false,
        loadMoreType: 0,  // 0(loading) | 1(load more) | 2(none)
        isLoadingMore: false, // 是否正在加載更多
        scrollEvt: null,
        page: 1,
        currType: '',
        articles: null,
        host: null  // 登入的用户
      };
    },

    components: {
      'vc-pageloading': PageLoading,
      'vc-loadingbar': LoadingBar,
      'vc-header': Header,
      'vc-articlelist': ArticleList,
      'vc-loadmorebtn': LoadMoreBtn
    },

    mounted() {
      this.isLoading = true;

      this.getArticleType(this.navs[0].tag, () => {
        this.isLoading = false;
      });

      this.addScrollEvt();

      const $subNav = this.$el.querySelector('.sub-nav');
      const fixedClassName = 'sub-nav--fixed';

      window.addEventListener('scroll', () => {
        if (document.body.scrollTop >= 75 && !$subNav.classList.contains(fixedClassName)) {
          $subNav.classList.add(fixedClassName);
        } else if (document.body.scrollTop < 75 && $subNav.classList.contains(fixedClassName)) {
          $subNav.classList.remove(fixedClassName);
        }
      }, false);
    },

    methods: {
      hostIsSignIn(data) {
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

      selectNav(evt) {
        const target = evt.target;

        // click link
        if (target.nodeName.toLowerCase() === 'a' && target.classList.contains('navbar__link')) {
          evt.preventDefault();

          this.percentage = -100;

          const timer = setInterval(() => {
            if (this.percentage === 0) {
              clearInterval(timer);
              return;
            }

            this.percentage = this.percentage + 10;
          }, 300);

          this.getArticleType(target.dataset.type, () => {
            clearInterval(timer);
            this.percentage = 0;
          });
        }
      },

      addScrollEvt() {
        const winH = window.innerHeight;

        const doc = document.documentElement;
        const body = document.body;

        this.scrollEv = () => {
          if (this.isLoadingMore) return;

          const docH = Math.max(doc.clientHeight, doc.scrollHeight);
          const bodyScrollTop = body.scrollTop;

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
  .sub-nav {
    background-color: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.15);
    height: 60px;

    &--fixed {
      position: fixed;
      top: 0;
      z-index: 9999;

      .navbar__brand {
        display: block;
      }
    }


  }

  .navbar {
    padding: 0 10px;
    border: 0 none;
    margin-bottom: 0;
    height: 100%;

    &__nav {
      float: left;
      text-align: center;
      margin-right: 10px;
    }

    &__link {
      color: #333;
      display: block;
      padding: 19px 0;
      min-width: 70px;
      font-size: 16px;
      position: relative;
      &::before {
        position: absolute;
        right: 0;
        bottom: 1px;
        left: 0;
        height: 3px;
        content: '';
      }
      &.active,
      &:hover {
        color: #1DA1F2;
        text-decoration: none;
        &::before {
          background: #0f88eb;
        }
      }
    }
  }

  .home-cont {
    padding: 0 20px;
  }

  .loadmore-wrap {
    padding: 15px 0;
    border-top: 1px solid #e7eaf1;
    box-shadow: 0 1px 3px rgba(0, 37, 55, 0.05);
  }
</style>
