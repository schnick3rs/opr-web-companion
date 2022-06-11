
const toCustomRule = (rule) => {
  let customRule;
  if (rule.cost) {
    if (isNaN(rule.cost)) {
      const parts = rule.cost.split(' ').map(i => i.trim());
      const func = (unit) => {
        let cost = 0;
        let next = 0;
        let operation = null;
        parts.forEach((part) => {
          switch (part) {
            case '*': operation = (a, b) => a * b; break;
            case '/': operation = (a, b) => a / b; break;
            case '+': operation = (a, b) => a + b; break;
            case '-': operation = (a, b) => a - b; break;
            default:
              if (typeof part === 'string') {
                if (isNaN(part)) {
                  next = parseInt(unit[part]) || 1;
                } else {
                  next = parseInt(part);
                }
                if (typeof operation === 'function') {
                  cost = operation(cost, next);
                  operation = null;
                } else {
                  cost = next;
                }
              }
          }
          console.info('use func -> ', part, cost, next, operation);
        });
        return cost;
      };
      customRule = { cost: func };
    } else {
      customRule = { cost: rule.cost };
    }
  }
  return customRule;
};

export {
  toCustomRule,
};
