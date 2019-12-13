import React, { useState } from 'react'
import PropTypes from 'prop-types'
import common from '@material-ui/core/colors/common'
import grey from '@material-ui/core/colors/grey'
import BrokenImage from '@material-ui/icons/BrokenImage'
import Skeleton from '@material-ui/lab/Skeleton'

/**
 * Images are ugly until they're loaded. Materialize it with material image! It will fade in like the material image loading pattern suggests.
 * @see [Image loading patterns](https://material.io/guidelines/patterns/loading-images.html)
 */
const Image = ({
  animationDuration,
  aspectRatio,
  color,
  imageStyle,
  disableTransition,
  iconContainerStyle,
  style,
  disableError,
  disableSpinner,
  errorIcon,
  loading,
  onLoad,
  onClick,
  onError,
  ...image
}) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const getStyles = () => {
    const imageTransition = !disableTransition && {
      opacity: imageLoaded ? 1 : 0,
      filterBrightness: imageLoaded ? 100 : 0,
      filterSaturate: imageLoaded ? 100 : 20,
      transition: `
        filterBrightness ${animationDuration * 0.75}ms cubic-bezier(0.4, 0.0, 0.2, 1),
        filterSaturate ${animationDuration}ms cubic-bezier(0.4, 0.0, 0.2, 1),
        opacity ${animationDuration / 2}ms cubic-bezier(0.4, 0.0, 0.2, 1)`
    }

    return {
      root: {
        backgroundColor: color,
        paddingTop: '100%', // 16:9
        position: 'relative',
        ...style
      },
      image: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        ...imageTransition,
        ...imageStyle
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
        ...iconContainerStyle
      }
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
    <div
      style={styles.root}
      onClick={onClick}
    >
      {image.src &&
      <img
        {...image}
        style={styles.image}
        onLoad={handleLoadImage}
        onError={handleImageError}
      />}
      <div style={styles.iconContainer}>
        {!disableSpinner && !imageLoaded && !imageError && loading}
        {!disableError && imageError && errorIcon}
      </div>
    </div>
  )
}

Image.defaultProps = {
  animationDuration: 1500,
  aspectRatio: 1,
  color: common.white,
  disableError: false,
  disableSpinner: false,
  disableTransition: false,
  errorIcon: <BrokenImage style={{ width: 48, height: 48, color: grey[300] }} />,
  loading: <Skeleton variant='rect' width={320} height={200} />
}

Image.propTypes = {
  /** Duration of the fading animation, in milliseconds. */
  animationDuration: PropTypes.number,
  /** Override aspect ratio. */
  aspectRatio: PropTypes.number,
  /** Override the background color. */
  color: PropTypes.string,
  /** Disables the error icon if set to true. */
  disableError: PropTypes.bool,
  /** Disables the loading spinner if set to true. */
  disableSpinner: PropTypes.bool,
  /** Disables the transition after load if set to true. */
  disableTransition: PropTypes.bool,
  /** Override the error icon. */
  errorIcon: PropTypes.node,
  /** Override the inline-styles of the container that contains the loading spinner and the error icon. */
  iconContainerStyle: PropTypes.object,
  /** Override the inline-styles of the image. */
  imageStyle: PropTypes.object,
  /** Override the loading component. */
  loading: PropTypes.node,
  /** Fired when the user clicks on the image happened. */
  onClick: PropTypes.func,
  /** Fired when the image failed to load. */
  onError: PropTypes.func,
  /** Fired when the image finished loading. */
  onLoad: PropTypes.func,
  /** Specifies the URL of an image. */
  src: PropTypes.string.isRequired,
  /** Override the inline-styles of the root element. */
  style: PropTypes.object
}

export default Image
