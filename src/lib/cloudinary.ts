import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

export const uploadToCloudinary = async (file: Buffer, folder: string = 'screener') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder,
        use_filename: true,
        unique_filename: false,
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    ).end(file)
  })
} 