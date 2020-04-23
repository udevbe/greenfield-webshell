import React, { Component, useState } from 'react'
import type { CSSProperties, FunctionComponent } from 'react'
import common from '@material-ui/core/colors/common'
import grey from '@material-ui/core/colors/grey'
import BrokenImage from '@material-ui/icons/BrokenImage'
import Skeleton from '@material-ui/lab/Skeleton'

const Image: FunctionComponent<{
  /** Duration of the fading animation, in milliseconds. */
  animationDuration?: number
  /** Override aspect ratio. */
  aspectRatio?: number
  /** Set image alt. */
  alt?: string
  /** Override the background color. */
  color?: string
  /** Disables the error icon if set to true. */
  disableError?: boolean
  /** Disables the loading spinner if set to true. */
  disableSpinner?: boolean
  /** Disables the transition after load if set to true. */
  disableTransition?: boolean
  /** Override the error icon. */
  errorIcon?: Component
  /** Override the inline-styles of the container that contains the loading spinner and the error icon. */
  iconContainerStyle?: object
  /** Override the inline-styles of the image. */
  imageStyle?: object
  /** Override the loading component. */
  loading?: Component
  /** Fired when the user clicks on the image happened. */
  onClick?: (...args: any[]) => any
  /** Fired when the image failed to load. */
  onError?: (...args: any[]) => any
  /** Fired when the image finished loading. */
  onLoad?: (...args: any[]) => any
  /** Specifies the URL of an image. */
  src: string
  /** Override the inline-styles of the root element. */
  style?: CSSProperties
}> = ({
  animationDuration = 1500,
  aspectRatio = 1,
  color = common.white,
  imageStyle,
  disableTransition = false,
  iconContainerStyle,
  style,
  disableError = false,
  disableSpinner = false,
  errorIcon = (
    <BrokenImage style={{ width: 48, height: 48, color: grey[300] }} />
  ),
  loading = <Skeleton variant="rect" width={320} height={200} />,
  onLoad,
  onClick,
  onError,
  alt,
  ...image
}) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const getStyles = (): {
    root: CSSProperties
    image: CSSProperties
    iconContainer: CSSProperties
  } => {
    const imageTransition = !disableTransition && {
      opacity: imageLoaded ? 1 : 0,
      filterBrightness: imageLoaded ? 100 : 0,
      filterSaturate: imageLoaded ? 100 : 20,
      transition: `
        filterBrightness ${
          animationDuration * 0.75
        }ms cubic-bezier(0.4, 0.0, 0.2, 1),
        filterSaturate ${animationDuration}ms cubic-bezier(0.4, 0.0, 0.2, 1),
        opacity ${animationDuration / 2}ms cubic-bezier(0.4, 0.0, 0.2, 1)`,
    }

    return {
      root: {
        backgroundColor: color,
        paddingTop: '100%',
        position: 'relative',
        ...style,
      },
      image: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        ...imageTransition,
        ...imageStyle,
      },
      iconContainer: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        ...iconContainerStyle,
      },
    }
  }

  const handleLoadImage = () => {
    setImageLoaded(true)
    if (onLoad) {
      onLoad()
    }
  }

  const handleImageError = () => {
    if (image.src) {
      setImageError(true)
      if (onError) {
        onError()
      }
    }
  }

  const styles = getStyles()
  return (
    <div style={styles.root} onClick={onClick}>
      {image.src && (
        <img
          {...image}
          alt={alt}
          style={styles.image}
          onLoad={handleLoadImage}
          onError={handleImageError}
        />
      )}
      <div style={styles.iconContainer}>
        {!disableSpinner && !imageLoaded && !imageError && loading}
        {!disableError && imageError && errorIcon}
      </div>
    </div>
  )
}

export default Image
