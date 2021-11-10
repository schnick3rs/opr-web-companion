const stringToKebab = (text) => {
  return text.toLowerCase().replace(/\W/gm, '-');
};

export {
  stringToKebab,
};
