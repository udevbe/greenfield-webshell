import { AppBar, Button, CircularProgress, Dialog, IconButton, Toolbar, Typography } from '@material-ui/core'
import { useTheme } from '@material-ui/core/styles'
import Close from '@material-ui/icons/Close'
import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react'
import Dropzone from 'react-dropzone'
import ReactCrop, { Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { useIntl } from 'react-intl'
import { useFirebase } from 'react-redux-firebase'
import type { UploadTaskSnapshot } from '@firebase/storage-types'

const pixelRatio = 4

const ImageCropDialog: FunctionComponent<{
  open: boolean
  title: string
  path: string
  fileName: string
  onUploadSuccess: (snapshot: UploadTaskSnapshot) => void
  handleClose: () => void
}> = ({ open, title, path, fileName, onUploadSuccess, handleClose }) => {
  const intl = useIntl()
  const firebase = useFirebase()
  const [src, setSrc] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [file, setFile] = useState<File | null>(null)
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 30, aspect: 1 })
  const cropCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const onCrop = useCallback((img) => {
    imgRef.current = img
  }, [])

  const handlePhotoURLUpload = () => {
    setIsUploading(true)
    setUploadProgress(0)
    const cropCanvas = cropCanvasRef.current
    if (!crop || !cropCanvas) {
      return
    }

    cropCanvas.toBlob((blob) => {
      if (blob === null) {
        // TODO notify user that we failed to save the image?
        return
      }
      const uploadTask = firebase.storage().ref(`${path}/${fileName}`).put(blob)

      uploadTask.on(
        // @ts-ignore we don't want to import firebase as that will make code splitting not work.
        firebase.firebase_.storage.TaskEvent.STATE_CHANGED,
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setIsUploading(true)
          setUploadProgress(progress)
        },
        (error) => console.log(error),
        () => {
          setIsUploading(false)
          setUploadProgress(100)
          setSrc(null)
          onUploadSuccess(uploadTask.snapshot)
        }
      )
    })
  }

  useEffect(() => {
    if (!completedCrop || !cropCanvasRef.current || !imgRef.current) {
      return
    }

    const image = imgRef.current
    const canvas = cropCanvasRef.current
    const crop = completedCrop

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const ctx = canvas.getContext('2d')
    if (ctx === null) {
      // TODO show an error to the uer that we can't crop his image.
      throw new Error('Could not initialize canvas 2d context!')
    }

    canvas.width = (crop.width ?? 0) * pixelRatio
    canvas.height = (crop.height ?? 0) * pixelRatio

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    ctx.imageSmoothingEnabled = false

    ctx.drawImage(
      image,
      (crop.x ?? 0) * scaleX,
      (crop.y ?? 0) * scaleY,
      (crop.width ?? 0) * scaleX,
      (crop.height ?? 0) * scaleY,
      0,
      0,
      crop.width ?? 0,
      crop.height ?? 0
    )
  }, [completedCrop])

  const handlePhotoULRChange = (files: File[]) => {
    const reader = new FileReader()
    reader.onload = () => {
      setSrc(reader.result as string)
      setFile(files[0])
    }
    reader.readAsDataURL(files[0])
  }

  const handleOwnClose = () => {
    setSrc(null)
    handleClose()
  }

  const theme = useTheme()
  return (
    <Dialog fullScreen open={open} onClose={handleOwnClose} aria-labelledby="responsive-dialog-title">
      <AppBar style={{ position: 'relative' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleOwnClose} aria-label="close">
            <Close />
          </IconButton>
          <Typography style={{ marginLeft: theme.spacing(2), flex: 1 }} variant="h6">
            {title}
          </Typography>
          <Button color="inherit" disabled={!src || isUploading} onClick={() => handlePhotoURLUpload()}>
            {intl.formatMessage({ id: 'save' })}
          </Button>
        </Toolbar>
      </AppBar>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
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
                          borderColor: theme.palette.secondary.main,
                        }
                  }
                >
                  <input {...getInputProps()} />
                  <Typography>
                    {src && file
                      ? file.name
                      : intl.formatMessage({
                          id: 'drop_or_select_file_label',
                        })}
                  </Typography>
                </div>
              )
            }}
          </Dropzone>
        )}

        {isUploading && (
          <div>
            <CircularProgress
              variant="static"
              value={uploadProgress}
              style={{ width: 200, height: 200 }}
              size={50}
              thickness={20}
            />
          </div>
        )}

        {src && !isUploading && (
          <div style={{ maxWidth: '80vw', maxHeight: '80vh' }}>
            <ReactCrop
              src={src}
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              onImageLoaded={onCrop}
            />
            <canvas
              ref={cropCanvasRef}
              style={{
                display: 'none',
              }}
            />
          </div>
        )}
      </div>
    </Dialog>
  )
}

export default React.memo(ImageCropDialog)
