// Хелпер для корректного отображения аватаров пользователей
export const getAvatarUrl = (commentatorImage) => {
  if (!commentatorImage) {
    return '/default-avatar.png'
  }

  // Если уже полный URL
  if (commentatorImage.startsWith('http')) {
    return commentatorImage
  }

  // Если старый путь с /media/ - заменяем на S3 URL
  if (commentatorImage.startsWith('/media/')) {
    return commentatorImage.replace('/media/', 'https://artblog-media.s3.amazonaws.com/')
  }

  // Если относительный путь - добавляем базовый S3 URL
  return `https://artblog-media.s3.amazonaws.com/${commentatorImage}`
}

export default getAvatarUrl
