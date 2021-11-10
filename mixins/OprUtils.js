export default {
  methods: {
    parseSpecialRuleString(text) {
      // /^(?<name>[\w ]+)\(?(?<rating>.*[^)])\)?: (?<effect>.*)$/gm
      const regex = /^(?<name>[\w -]+)\(?(?<rating>[\w\d]*)\)?$/gm;
      const { groups } = regex.exec(text);
      return {
        ...groups,
        key: groups.name.toLowerCase(),
        label: `${groups.name}${groups.rating ? `(${groups.rating})` : '' }`,
      };
    },
    /**
     * e : {label, name, }
     *
     * @param equipment {object}
     * @returns {string}
     */
    equipmentToString(equipment) {
      let props = [];
      if (equipment.range && equipment.range > 0) props.push(`${equipment.range}"`);
      if (equipment.attacks) props.push(`A${equipment.attacks}`);
      return `${equipment.name} (${props.join(', ')})`;
    }
  }
}
