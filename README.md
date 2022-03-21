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


# Sqoosh

    npx @squoosh/cli 

## webp

npx @squoosh/cli --webp '{"quality":75,"target_size":0,"target_PSNR":0,"method":4,"sns_strength":50,"filter_strength":60,"filter_sharpness":0,"filter_type":1,"partitions":0,"segments":4,"pass":1,"show_compressed":0,"preprocessing":0,"autofilter":0,"partition_limit":0,"alpha_compression":1,"alpha_filtering":1,"alpha_quality":100,"lossless":1,"exact":1,"image_hint":0,"emulate_jpeg_size":0,"thread_level":0,"low_memory":0,"near_lossless":100,"use_delta_palette":0,"use_sharp_yuv":0}'

### 800

npx @squoosh/cli --resize '{"enabled":true,"width":1283,"height":800,"method":"lanczos3","fitMethod":"stretch","premultiply":true,"linearRGB":true}' --webp '{"quality":75,"target_size":0,"target_PSNR":0,"method":4,"sns_strength":50,"filter_strength":60,"filter_sharpness":0,"filter_type":1,"partitions":0,"segments":4,"pass":1,"show_compressed":0,"preprocessing":0,"autofilter":0,"partition_limit":0,"alpha_compression":1,"alpha_filtering":1,"alpha_quality":100,"lossless":1,"exact":0,"image_hint":0,"emulate_jpeg_size":0,"thread_level":0,"low_memory":0,"near_lossless":100,"use_delta_palette":0,"use_sharp_yuv":0}'

## avif

npx @squoosh/cli --avif '{"cqLevel":0,"cqAlphaLevel":-1,"subsample":3,"tileColsLog2":0,"tileRowsLog2":0,"speed":6,"chromaDeltaQ":false,"sharpness":0,"denoiseLevel":0,"tune":0}'

npx @squoosh/cli --avif '{"cqLevel":33,"cqAlphaLevel":-1,"denoiseLevel":0,"tileColsLog2":0,"tileRowsLog2":0,"speed":6,"subsample":1,"chromaDeltaQ":false,"sharpness":0,"tune":0}'


Less dependency heavy options

https://www.npmjs.com/package/bcrypt (268kb, 2dep) -> htps://www.npmjs.com/package/bcryptjs (21kb, 0dep)
https://www.npmjs.com/package/jsonwebtoken (39kb, 10dep) -> @types/jsonwebtoken (smaller, 1dep)
marked (46kb, 0dep)
nanoid (1kb, 0dep)
pluralize (6kb, 0dep)
rfc6902 (, 0dep)
unique-names-generator (67kb, 0dep)
uuid (, 0dep)
pbkdf2 (57kb, 5dep) -> crypto-js? (50kb, 0dep) || pbkdf2-hmac (2kb, 0dep)
