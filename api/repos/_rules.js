import { stringToKebab } from '@/api/repos/_utility';

const sections = (sections) => {
  return {
    sections,
  };
};

const section = (headline, elements) => {
  return {
    key: `section-${stringToKebab(headline)}`,
    headline,
    elements,
  };
};

const p = (one, two = undefined) => {
  return two ? `<p><strong>${one}:</strong> ${two}</p>` : `<p>${one}</p>`;
};

const ul = (items = []) => {
  return `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
};

const element = (label, content) => {
  return {
    key: `element-${stringToKebab(label)}`,
    label,
    content,
  };
};

export {
  p,
  ul,
  element,
  sections,
  section,
};
