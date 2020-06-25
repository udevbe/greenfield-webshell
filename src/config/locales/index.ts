import '@formatjs/intl-relativetimeformat/dist/locale-data/de'
import '@formatjs/intl-relativetimeformat/dist/locale-data/en'
import '@formatjs/intl-relativetimeformat/polyfill'
import intl from 'intl'
import areIntlLocalesSupported from 'intl-locales-supported'
import en from './en'

// START: Intl polyfill
// Required for working on Safari
// Code from here: https://formatjs.io/guides/runtime-environments/
const localesMyAppSupports: string[] = [
  /* list locales here */
]

if (global.Intl) {
  // Determine if the built-in `Intl` has the locale data we need.
  if (!areIntlLocalesSupported(localesMyAppSupports)) {
    // `Intl` exists, but it doesn't have the data we need, so load the
    // polyfill and replace the constructors with need with the polyfill's.
    const IntlPolyfill = intl
    Intl.NumberFormat = IntlPolyfill.NumberFormat
    Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat
  }
} else {
  // No `Intl`, so use and load the polyfill.
  global.Intl = intl
}

// END: Intl polyfill
interface Locale {
  locale: string
  messages: Record<string, string>
}

const locales: Locale[] = [
  {
    locale: 'en',
    messages: en,
  },
]

export function getLocaleMessages(l: string, ls: Locale[]) {
  if (ls) {
    for (let i = 0; i < ls.length; i++) {
      if (ls[i].locale === l) {
        return ls[i].messages
      }
    }
  }

  return en // Default locale
}

export default locales
