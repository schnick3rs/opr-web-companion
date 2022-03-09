import Router from 'express-promise-router';
import cors from 'cors';
import { createClient } from 'contentful';
import _ from 'lodash';

const router = new Router();

const config = {
  space: process.env.CTF_SPACE_ID,
  accessToken: process.env.CTF_CDA_ACCESS_TOKEN
}
const client = createClient(config);

router.get('/game-systems/', cors(), async (request, response) => {

  const query = {
    'content_type': 'gameSystem',
    order: '-fields.universe,fields.name',
  };
  const gameSystemsResponse = await client.getEntries(query);
  const gameSystems = gameSystemsResponse.items;

  response.status(200).json(gameSystems);
});

router.get('/game-systems/:slug', cors(), async (request, response) => {
  const { slug } = request.params;

  const query = {
    'content_type': 'gameSystem',
    'fields.slug[in]': slug,
  };
  const gameSystemsResponse = await client.getEntries(query);
  const gameSystem = gameSystemsResponse.items[0].fields;

  response.status(200).json(gameSystem);
});

router.get('/game-systems/:slug/special-rules', cors(), async (request, response) => {
  const { slug } = request.params;

  const query = {
    'content_type': 'gameSystem',
    'fields.slug[in]': slug,
  };
  const gameSystemsResponse = await client.getEntries(query);
  const gameSystem = gameSystemsResponse.items[0].fields;

  const specialRules = gameSystem.commonSpecialRules.map(sr => {
    return {
      ...sr.fields,
      key: sr.fields.slug,
    };
  });

  response.set('Cache-Control', 'public, max-age=3600'); // one hour
  response.status(200).json(specialRules);
});

router.get('/game-systems/:slug/rule-book', cors(), async (request, response) => {
  const { slug } = request.params;

  const query = {
    'content_type': 'gameSystem',
    'fields.slug[in]': slug,
  };
  const gameSystemsResponse = await client.getEntries(query);
  const gameSystem = gameSystemsResponse.items[0]
  const ruleBooks = gameSystem.fields.ruleBooks;
  const ruleBookEntry = await client.getEntry(ruleBooks[0].sys.id, {include: 3});
  const ruleBook = ruleBookEntry.fields;

  response.status(200).json(ruleBook);
});

router.get('/rule-books/:id', async (request, response) => {
  const { id } = request.params;

  const ruleBookResponse = await client.getEntry(id, {include: 3});
  const ruleBook = ruleBookResponse.fields;

  response.status(200).json(ruleBook);
});

router.get('/special-rules', cors(), async (request, response) => {

  const query = {
    'content_type': 'oprSpecialRuleSnippet',
  };
  const { items } = await client.getEntries(query);

  const reducer = (previousValue, currentValue) => {
    const number = previousValue.findIndex(rule => rule.key === currentValue.key);
    if (number >= 0) {
      if (currentValue.slug.endsWith('-skirmish')) {
        previousValue[number].descriptions[3] = currentValue.description;
        previousValue[number].descriptions[5] = currentValue.description;
      } else if (currentValue.slug.endsWith('-regiments')) {
        previousValue[number].descriptions[6] = currentValue.description;
      } else {
        previousValue[number].description = currentValue.description;
      }
    } else {
      if (currentValue.slug.endsWith('-skirmish')) {
        currentValue.descriptions[3] = currentValue.description;
        currentValue.descriptions[5] = currentValue.description;
      } else if (currentValue.slug.endsWith('-regiments')) {
        currentValue.descriptions[6] = currentValue.description;
      }
      previousValue.push(currentValue);
    }
    return previousValue;
  };

  let commonSpecialRules = items
    .map(item => {
      const { name, slug, description, hasRating, defaultRating, tags } = item.fields;
      return {
        key: name.toLowerCase().replace(/\W/gm, '-'),
        slug,
        name,
        description,
        descriptions: {},
        hasRating,
        defaultRating,
        tags,
      };
    })
    .reduce(reducer, [])
    .map(rule => {
      rule.slug = rule.key;
      return rule;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  response.set('Cache-Control', 'public, max-age=3600'); // one hour
  response.status(200).json(commonSpecialRules);
});

export default router;
