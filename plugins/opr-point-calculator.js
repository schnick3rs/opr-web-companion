import calc from 'opr-point-calculator-lib';

export default ({ app, $config }, inject) => {

  if ($config.oprPointCalculatorEnabled) {
    console.info('OPR Point Calculator ENABLED.');
    inject('oprPointCalculator', calc);
  } else {
    console.info('OPR Point Calculator DISABLED.');
    //inject('oprPointCalculator', null);
  }

}
