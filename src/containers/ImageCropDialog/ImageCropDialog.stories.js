import React from 'react'
import ImageCropDialog from './ImageCropDialog'
import { action } from '@storybook/addon-actions'

export default {
  title: 'ImageCropDialog'
}

const uploadNewImageProps = {
  path: 'users/auth-uid',
  fileName: 'photoURL',
  onUploadSuccess: action('onUploadSuccess'),
  open: true,
  src: 'new_user_photo',
  handleClose: action('handleClose'),
  title: 'Upload New Image Test'
}
export const uploadNewImage = () => <ImageCropDialog {...uploadNewImageProps} />
