<template>
  <div
    class="page page--din-a-4"
    :class="pageClass"
  >
    <header class="page-headline">
      <slot name="headline"></slot>
    </header>
    <slot></slot>
    <span class="page__page-number">{{ pageNumber }}</span>
  </div>
</template>

<script>
export default {
  name: 'OprPage',
  props: {
    dimension: {
      type: String,
      default: 'dina4',
    },
    universe: {
      type: String,
      default: 'Grimdark Future',
    },
    pageNumber: {
      type: [String, Number],
      default: '',
    },
  },
  computed: {
    pageClass() {
      const universeSlug = this.universe.toLowerCase().replace(/\W/gm, '-');
      return `page--${universeSlug}`;
    },
  },
}
</script>

<style lang="scss">

@font-face {
  font-family: 'GrimdarkTitle';
  font-weight: normal; //400
  src:
    url('~static/fonts/magistralc/magistralc-webfont.ttf')  format('truetype'),
    url('~static/fonts/magistralc/magistralc-webfont.otf') format('opentype'),
    url('~static/fonts/magistralc/magistralc-webfont.woff2') format('woff2'),
    url('~static/fonts/magistralc/magistralc-webfont.woff') format('woff'),
    url('~static/fonts/magistralc/magistralc-webfont.ttf') format('truetype');
}
/*
@font-face {
  font-family: 'GrimdarkTitle';
  font-weight: 700;
  src:
    url('~static/fonts/magistralc/magistralc-bold-webfont.ttf')  format('truetype'),
    url('~static/fonts/magistralc/magistralc-bold-webfont.otf') format('opentype'),
    url('~static/fonts/magistralc/magistralc-bold-webfont.woff2') format('woff2'),
    url('~static/fonts/magistralc/magistralc-bold-webfont.woff') format('woff'),
    url('~static/fonts/magistralc/magistralc-bold-webfont.ttf') format('truetype');
}
 */

@font-face {
  font-family: 'GrimdarkText';
  font-weight: normal; //400
  src:
    url('~static/fonts/din-alternate/din-alternate-regular-webfont.otf') format('opentype'),
    url('~static/fonts/din-alternate/din-alternate-regular-webfont.woff2') format('woff2'),
    url('~static/fonts/din-alternate/din-alternate-regular-webfont.woff') format('woff'),
    url('~static/fonts/din-alternate/din-alternate-regular-webfont.ttf') format('truetype'),
    url('~static/fonts/din-alternate/din-alternate-regular-webfont.svg#dinboldalternate') format('svg');
}

@font-face {
  font-family: 'GrimdarkText';
  font-weight: 300; //400
  src:
    url('~static/fonts/din-alternate/din-alternate-light-webfont.otf') format('opentype');
}

@font-face {
  font-family: 'GrimdarkText';
  font-weight: 500;
  font-style: normal;
  src:
    url('~static/fonts/din-alternate/din-alternate-medium-webfont.otf') format('opentype'),
    url('~static/fonts/din-alternate/din-alternate-medium-webfont.woff2') format('woff2'),
    url('~static/fonts/din-alternate/din-alternate-medium-webfont.woff') format('woff'),
    url('~static/fonts/din-alternate/din-alternate-medium-webfont.ttf') format('truetype'),
    url('~static/fonts/din-alternate/din-alternate-medium-webfont.svg#dinboldalternate') format('svg');
}

@font-face {
  font-family: 'GrimdarkText';
  font-weight: 700;
  font-style: normal;
  src:
    url('~static/fonts/din-alternate/din-alternate-bold-webfont.otf') format('opentype'),
    url('~static/fonts/din-alternate/din-alternate-bold-webfont.woff2') format('woff2'),
    url('~static/fonts/din-alternate/din-alternate-bold-webfont.woff') format('woff'),
    url('~static/fonts/din-alternate/din-alternate-bold-webfont.ttf') format('truetype'),
    url('~static/fonts/din-alternate/din-alternate-bold-webfont.svg#dinboldalternate') format('svg');
}

</style>

<style scoped lang="scss">

$font-size-text: 3.175mm;
$font-size-text--dense: 2.82mm;

$font-size-army-book-name: 7.76111mm;
$font-size-army-book-version-string: 3.88056mm;

$font-size-intro-headline: 3.88056mm;
$font-size-block-headline: 3.52778mm;

@font-face {
  font-family: 'AgeOfFantasyTitle';
  font-weight: normal;
  src: url('~static/fonts/caslon-antique.regular.ttf')  format('truetype'),
  url('~static/fonts/caslon-antique.regular.woff2') format('woff2'),
  url('~static/fonts/caslon-antique.regular.woff') format('woff')
}

@font-face {
  font-family: 'AgeOfFantasyText';
  font-weight: normal;
  src: url('~static/fonts/BKANT.ttf')  format('truetype'),
  url('~static/fonts/BKANT.woff2') format('woff2'),
  url('~static/fonts/BKANT.woff') format('woff')
}

@font-face { font-family: 'WarfleetsTitle'; font-weight: normal; src: url('~static/fonts/TeutonFett.otf') format('opentype') }
@font-face { font-family: 'WarfleetsText'; font-weight: normal; src: url('~static/fonts/Optima.ttf') format('truetype') }
@font-face { font-family: 'WarfleetsText'; font-weight: bold; src: url('~static/fonts/Optima-Bold.ttf') format('truetype') }

.page {
  //  page-break-inside: avoid;
  position: relative;

  &--din-a-4 {
    height: 296mm; // use 297-1 to get 2+ pages printed correctly
    width: 210mm;
    overflow: hidden;
    //margin: 5mm 10mm;
    padding: 6mm 10mm;

    font-size: $font-size-text--dense;
  }

  & .page-headline {
    font-size: $font-size-army-book-name;
  }

  &__page-number {
    position: absolute;
    bottom: 3.4mm;
    margin: 0 auto;
    left: 50%;
    font-size: 4.2mm;
    font-weight: 600;
  }

  &--grimdark-future {
    background-image: url('/img/army-books/border-grimdark-future.png');
    background-size: auto;
    background-position: center;

    font-family: GrimdarkText, sans-serif;
    font-weight: 300;

    & .page-headline {
      font-family: GrimdarkTitle, sans-serif;
      padding: 5mm 0 2mm 1mm;
      font-weight: 400;
    }
  }

  &--age-of-fantasy {
    background-image: url('/img/army-books/border-age-of-fantasy.png');
    background-size: auto;
    background-position: center;

    font-family: AgeOfFantasyText, serif;

    & .page-headline {
      font-family: AgeOfFantasyTitle, serif;
      text-transform: uppercase;
      padding: 7mm 0 3mm 6mm;
    }
  }

  &--warfleets-ftl {
    background-image: url('/img/border-warfleets-ftl.png');
    padding: 10mm 12mm;
    background-size: auto;
    background-position: center;
    font-family: WarfleetsText, sans-serif;

    & .page-headline {
      text-transform: uppercase;
      font-family: WarfleetsTitle, sans-serif;
    }
  }


}

@page {
  size: A4;
  margin: 0;
}

@media print {
  .page {
    margin: 0;
    border: initial;
    border-radius: initial;
    width: initial;
    min-height: initial;
    box-shadow: initial;
    //background: initial;
    page-break-after: always;
  }
  * {
    -webkit-print-color-adjust: exact !important;   /* Chrome, Safari */
    color-adjust: exact !important;                 /*Firefox*/
  }
}
</style>
