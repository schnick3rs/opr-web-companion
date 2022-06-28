import calc from 'opr-point-calculator-lib';

export default ({ app, $config }, inject) => {
  if ($config.oprPointCalculatorEnabled) {
    console.debug('OPR Point Calculator ENABLED.');
    inject('oprPointCalculator', calc);
  } else {
    console.debug('OPR Point Calculator DISABLED.');
  }
};
