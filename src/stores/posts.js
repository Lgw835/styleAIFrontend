import { defineStore } from 'pinia';

export const usePostsStore = defineStore('posts', {
  state: () => ({
    posts: [],
    pagination: {
      currentPage: 0,
      totalPages: 0,
      total: 0,
      size: 5
    }
  }),
  
  getters: {
    getPostById: (state) => (id) => {
      return state.posts.find(post => post.post.postId === id) || null;
    }
  },
  
  actions: {
    setPosts(posts) {
      this.posts = posts;
    },
    
    addPosts(newPosts) {
      this.posts = [...this.posts, ...newPosts];
    },
    
    setPagination(pagination) {
      this.pagination = pagination;
    },
    
    resetState() {
      this.posts = [];
      this.pagination = {
        currentPage: 0,
        totalPages: 0,
        total: 0,
        size: 5
      };
    }
  },
  
  // 持久化配置
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'posts-store',
        storage: sessionStorage
      }
    ]
  }
}); 