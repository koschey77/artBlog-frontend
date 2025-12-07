import {useCallback} from 'react'
import useUserData from '../plugin/useUserData'
import useAxios from './useAxios'
import Toast from '../plugin/Toast'

/**
 * Хук для оптимизированного управления лайками и закладками постов
 * Обновляет состояние локально без полной перезагрузки
 */
export const usePostInteractions = (setPosts) => {
  const userId = useUserData()?.user_id
  const axiosInstance = useAxios()

  const handleLikePost = useCallback(
    async (post) => {
      if (post.user.id == userId) {
        Toast('error', 'It Is Your Post', 'You cannot like your own post')
        return
      }

      if (!userId) {
        Toast('error', 'Authentication Required', 'Please login to like posts')
        return
      }

      try {
        const jsonData = {
          user_id: userId,
          post_id: post.id,
        }
        const response = await axiosInstance.post(`post/like-post/`, jsonData)

        // Обновляем только конкретный пост локально
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === post.id
              ? {
                  ...p,
                  is_liked: !p.is_liked,
                  likes: p.is_liked ? p.likes.filter((like) => like.user !== userId) : [...p.likes, {user: userId}],
                }
              : p
          )
        )

        Toast('success', response.data.message, '')
      } catch (error) {
        console.error('Error liking post:', error)
        if (error.response?.status === 401) {
          Toast('error', 'Authentication Required', 'Please login again')
        } else {
          Toast('error', 'Error', 'Failed to like post')
        }
      }
    },
    [userId, axiosInstance, setPosts]
  )

  const handleBookmarkPost = useCallback(
    async (post) => {
      if (!userId) {
        Toast('error', 'Authentication Required', 'Please login to bookmark posts')
        return
      }

      try {
        const jsonData = {
          user_id: userId,
          post_id: post.id,
        }
        const response = await axiosInstance.post(`post/bookmark-post/`, jsonData)

        // Обновляем только конкретный пост локально
        setPosts((prevPosts) => prevPosts.map((p) => (p.id === post.id ? {...p, is_bookmarked: !p.is_bookmarked} : p)))

        Toast('success', response.data.message, '')
      } catch (error) {
        console.error('Error bookmarking post:', error)
        if (error.response?.status === 401) {
          Toast('error', 'Authentication Required', 'Please login again')
        } else {
          Toast('error', 'Error', 'Failed to bookmark post')
        }
      }
    },
    [userId, axiosInstance, setPosts]
  )

  return {
    handleLikePost,
    handleBookmarkPost,
  }
}

export default usePostInteractions
