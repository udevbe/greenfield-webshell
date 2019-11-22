import 'firebase/storage'
import { AppBar, Button, CircularProgress, Dialog, IconButton, Slide, Toolbar, Typography } from '@material-ui/core'
import { Close } from '@material-ui/icons'
import Dropzone from 'react-dropzone'
import React, { useState } from 'react'
import { Cropper } from 'react-image-cropper'
import { useIntl } from 'react-intl'
import { useTheme } from '@material-ui/core/styles'
import { useSelector } from 'react-redux'

const Transition = props => <Slide direction='up' {...props} />

const ImageCropDialog = ({ open, title, cropperProps, path, fileName, onUploadSuccess, handleClose }) => {
  const intl = useIntl()
  const [src, setSrc] = useState(undefined)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [file, setFile] = useState(undefined)
  let cropper = null
  const storage = useSelector(({ firebase: { storage } }) => storage)

  const handlePhotoURLUpload = photoUrl => {
    setIsUploading(true)
    setUploadProgress(0)

    const uploadTask = storage.ref(`${path}/${fileName}`).putString(photoUrl, 'data_url')

    uploadTask.on(
      storage.TaskEvent.STATE_CHANGED,
      snapshot => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setIsUploading(true)
        setUploadProgress(progress)
      },
      error => console.log(error),
      () => {
        setIsUploading(false)
        setUploadProgress(100)
        setSrc(undefined)
        onUploadSuccess(uploadTask.snapshot)
      })
  }

  const handlePhotoULRChange = files => {
    const reader = new FileReader()
    reader.onload = () => {
      setSrc(reader.result)
      setFile(files[0])
    }
    reader.readAsDataURL(files[0])
  }

  const handleOwnClose = () => {
    setSrc(undefined)
    handleClose()
  }

  const theme = useTheme()
  return (
    <Dialog
      fullScreen
      TransitionComponent={Transition}
      open={open}
      onClose={handleOwnClose}
      aria-labelledby='responsive-dialog-title'
    >
      <AppBar style={{ position: 'relative' }}>
        <Toolbar>
          <IconButton edge='start' color='inherit' onClick={handleOwnClose} aria-label='close'>
            <Close />
          </IconButton>
          <Typography style={{ marginLeft: theme.spacing(2), flex: 1 }} variant='h6'>
            {title}
          </Typography>
          <Button
            color='inherit'
            disabled={!src || isUploading}
            onClick={() => handlePhotoURLUpload(cropper.crop())}
          >
            {intl.formatMessage({ id: 'save' })}
          </Button>
        </Toolbar>
      </AppBar>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        {!src && !isUploading && (
          <Dropzone onDrop={handlePhotoULRChange}>
            {({ getRootProps, getInputProps }) => {
              return (
                <div
                  {...getRootProps()}
                  style={
                    src
                      ? undefined
                      : {
                        height: '50vh',
                        width: '50vw',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderStyle: 'dashed',
                        borderColor: theme.palette.secondary.main
                      }
                  }
                >
                  <input {...getInputProps()} />
                  <Typography>{src ? file.name : intl.formatMessage({ id: 'drop_or_select_file_label' })}</Typography>
                </div>
              )
            }}
          </Dropzone>
        )}

        {isUploading && (
          <div>
            <CircularProgress
              variant='static'
              value={uploadProgress}
              style={{ width: 200, height: 200 }}
              size={50}
              thickness={20}
            />
          </div>
        )}

        {src && !isUploading && (
          <div style={{ maxWidth: '80vw', maxHeight: '80vh' }}>
            <Cropper
              ref={field => { cropper = field }}
              src={src}
              aspectRatio={9 / 9}
              {...cropperProps}
            />
          </div>
        )}
      </div>
    </Dialog>
  )
}

export default ImageCropDialog
