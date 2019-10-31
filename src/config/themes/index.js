import { createMuiTheme } from '@material-ui/core/styles'
import red from '@material-ui/core/colors/red'
import pink from '@material-ui/core/colors/pink'
import green from '@material-ui/core/colors/green'
import blue from '@material-ui/core/colors/blue'

export const themes = [
  {
    id: 'default',
    color: green[500],
    source: {
      'palette': {
        'common': {
          'black': '#000',
          'white': 'rgba(240, 240, 240, 1)'
        },
        'background': {
          'paper': 'rgba(240, 240, 240, 1)',
          'default': 'rgba(240, 240, 240, 1)'
        },
        'primary': {
          'light': 'rgba(167, 230, 97, 1)',
          'main': 'rgba(111, 174, 42, 1)',
          'dark': 'rgba(55, 121, 0, 1)',
          'contrastText': '#fff'
        },
        'secondary': {
          'light': 'rgba(127, 247, 255, 1)',
          'main': 'rgba(50, 191, 249, 1)',
          'dark': 'rgba(0, 138, 192, 1)',
          'contrastText': '#fff'
        },
        'error': {
          'light': 'rgba(255, 128, 169, 1)',
          'main': 'rgba(250, 67, 117, 1)',
          'dark': 'rgba(187, 0, 69, 1)',
          'contrastText': '#fff'
        },
        'text': {
          'primary': 'rgba(0, 0, 0, 0.87)',
          'secondary': 'rgba(0, 0, 0, 0.54)',
          'disabled': 'rgba(0, 0, 0, 0.38)',
          'hint': 'rgba(0, 0, 0, 0.38)'
        }
      }
    }
  },
  {
    id: 'blue',
    color: blue[500],
    source: {
      palette: {
        primary: blue
      }
    }
  },
  {
    id: 'red',
    color: red[500],
    source: {
      palette: {
        primary: red,
        secondary: pink,
        error: red
      }
    }
  }
]

const getThemeSource = (t, ts) => {
  if (ts) {
    for (let i = 0; i < ts.length; i++) {
      if (ts[i]['id'] === t.source) {
        const source = ts[i]['source']
        const palette = source != null ? source.palette : {}

        return createMuiTheme({
          ...source,
          typography: {
            useNextVariants: true
          },
          palette: { ...palette }
        })
      }
    }
  }

  return createMuiTheme({
    typography: {
      useNextVariants: true
    },
    palette: { ...themes[0].source.palette }
  }) // Default theme
}

export default getThemeSource
