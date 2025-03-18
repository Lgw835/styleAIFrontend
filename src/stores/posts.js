import { defineStore } from 'pinia';
import { ref, watch, computed } from 'vue';

export const usePostsStore = defineStore('posts', () => {
  // 使用 ref 存储状态
  const posts = ref([]);
  const pagination = ref({
    currentPage: 0,
    totalPages: 0,
    total: 0,
    size: 5
  });

  // 获取帖子的方法
  const getPostById = computed(() => {
    return (id) => {
      return posts.value.find(post => post.post.postId === id) || null;
    };
  });

  // 设置帖子
  function setPosts(newPosts) {
    posts.value = newPosts;
  }
  
  // 添加帖子
  function addPosts(newPosts) {
    posts.value = [...posts.value, ...newPosts];
  }
  
  // 设置分页信息
  function setPagination(paginationInfo) {
    pagination.value = paginationInfo;
  }
  
  // 重置状态
  function resetState() {
    posts.value = [];
    pagination.value = {
      currentPage: 0,
      totalPages: 0,
      total: 0,
      size: 5
    };
  }
  
  // 添加单个帖子
  function addSinglePost(post) {
    const existingIndex = posts.value.findIndex(p => p.post.postId === post.post.postId);
    if (existingIndex >= 0) {
      posts.value[existingIndex] = post;
    } else {
      posts.value.push(post);
    }
  }

  // 从 sessionStorage 恢复数据
  function restoreFromSession() {
    try {
      const savedData = sessionStorage.getItem('postsData');
      if (savedData) {
        const data = JSON.parse(savedData);
        posts.value = data.posts || [];
        pagination.value = data.pagination || {
          currentPage: 0,
          totalPages: 0,
          total: 0,
          size: 5
        };
        console.log('从session恢复帖子数据成功');
      }
    } catch (error) {
      console.error('恢复帖子数据失败:', error);
    }
  }

  // 保存数据到 sessionStorage
  function saveToSession() {
    try {
      const data = {
        posts: posts.value,
        pagination: pagination.value
      };
      sessionStorage.setItem('postsData', JSON.stringify(data));
      console.log('帖子数据已成功保存到session');
    } catch (error) {
      console.error('保存帖子数据到session失败:', error);
    }
  }

  // 监听数据变化并保存
  watch(
    [posts, pagination],
    () => {
      console.log('帖子数据已变更，正在保存到session...');
      saveToSession();
    },
    { deep: true }
  );

  // 初始化时恢复数据
  restoreFromSession();

  return {
    posts,
    pagination,
    getPostById,
    setPosts,
    addPosts,
    setPagination,
    resetState,
    addSinglePost,
    restoreFromSession,
    saveToSession
  };
}); 