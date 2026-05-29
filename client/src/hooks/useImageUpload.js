import { useState } from 'react'

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)

  const uploadImages = async (files) => {
    setIsUploading(true)
    setError(null)
    try {
      // Placeholder: in a real implementation, this would POST to Cloudinary using VITE_CLOUDINARY_CLOUD_NAME
      // For now, we simulate an upload and return dummy URLs or local blob URLs.
      const urls = await Promise.all(
        Array.from(files).map((file) => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(URL.createObjectURL(file))
            }, 1000)
          })
        })
      )
      setIsUploading(false)
      return urls
    } catch (err) {
      setError(err.message)
      setIsUploading(false)
      return []
    }
  }

  return { uploadImages, isUploading, error }
}
