import { createContext, useContext, useState } from 'react';

// 1. Create the Context object
const PostContext = createContext(undefined);

// 2. The Provider Component
export function PostProvider({ children }) {
  const [posts, setPosts] = useState([
    { id: 1, title: "My first React post", author: "Alex", likes: 12 },
    { id: 2, title: "Context is awesome", author: "Alex", likes: 8 }
  ]);

  const addPost = (title, author) => {
    const newPost = {
      id: posts.length + 1,
      title,
      author,
      likes: 0
    };
    setPosts(prev => [...prev, newPost]);
  };

  const likePost = (postId) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  return (
    <PostContext.Provider value={{ posts, addPost, likePost }}>
      {children}
    </PostContext.Provider>
  );
}

// 3. The Custom Hook with Error Handling
export function usePosts() {
  const context = useContext(PostContext);

  if (context === undefined) {
    throw new Error("usePosts must be used within a PostProvider");
  }

  return context;
}
