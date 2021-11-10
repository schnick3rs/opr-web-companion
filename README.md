# opr-grimdark

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

## References

* https://restpack.io/html2pdf#usage
* https://stackoverflow.com/questions/31056543/safari-font-rendering-issues
* [fontquirel](https://www.fontsquirrel.com/tools/webfont-generator)
* https://developer.mozilla.org/de/docs/Web/CSS/font-weight

Grimdark
* Text: DIN 1451 (FF DIN)
  https://www.downloadfonts.io/ff-din-font-family-free/
  https://answers.microsoft.com/en-us/msoffice/forum/msoffice_word-mso_other-mso_365hp/font-family/897e2b7d-6dba-4a51-a391-4fdd20729173

# Layout / Typography

## Grimdark

* Title: MagistralC
* Text: DIN-RegularAlternate

On DIN Alternate 

  
```
  src: url('webfont.eot'); /* IE9 Compat Modes */
  src: url('webfont.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
       url('webfont.woff2') format('woff2'), /* Super Modern Browsers */
       url('webfont.woff') format('woff'), /* Pretty Modern Browsers */
       url('webfont.ttf')  format('truetype'), /* Safari, Android, iOS */
       url('webfont.svg#svgFontName') format('svg'); /* Legacy iOS */
```
