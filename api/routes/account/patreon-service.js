import querystring from 'querystring';
import axios from 'axios';
import { pool } from '../../db';

export function getEmail(patreonUserData) {
  return patreonUserData.data.attributes.email;
}

export function getThumbnailUrl(patreonUserData) {
  return patreonUserData.data.attributes.thumb_url;
}

export function getActiveUntil() {
  const now = new Date();
  if (now.getMonth() === 11) {
    return new Date(now.getFullYear() + 1, 0, 4);
  } else {
    return new Date(now.getFullYear(), now.getMonth() + 1, 4);
  }
}

const config = {
  patreonClientId: process.env.PATREON_CLIENT_ID,
  patreonClientSecret: process.env.PATREON_CLIENT_SECRET,
  patreonCreatorId: process.env.PATREON_CREATOR_ID,
};

export async function getPatreonOauthTokensFromCode(code) {
  const oauthData = {
    code,
    grant_type: 'authorization_code',
    redirect_uri: 'http://localhost:3000/api/account/patreon',
  };
  return await getPatreonOauthTokens(oauthData);
}

export async function getPatreonOauthTokensFromRefresh(refreshToken) {
  const oauthData = {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  };
  return await getPatreonOauthTokens(oauthData);
}

async function getPatreonOauthTokens(oauthData) {
  try {
    const { data } = await axios({
      method: 'POST',
      url: 'https://www.patreon.com/api/oauth2/token',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data: querystring.stringify({
        ...oauthData,
        client_id: config.patreonClientId,
        client_secret: config.patreonClientSecret,
      }),
    });

    return data;
  } catch (e) {
    console.error('Oauth token call fail', e);
  }

  return null;
}

// eslint-disable-next-line no-unused-vars
async function fetchIdentity() {}

export async function fetchPatreonIdentityData(token, query) {
  try {
    const { data } = await axios({
      url: 'https://www.patreon.com/api/oauth2/v2/identity?' + query,
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });
    // console.debug('membershipsResponse.data', data);
    return data;
  } catch (e) {
    if (e.response) {
      const { data } = e.response;
      console.error(JSON.stringify(data));
    }
    console.error('Failed to get patreon data:', JSON.stringify(e));
  }
  return null;
}

export async function fetchPatreonUserData(token) {
  const query = querystring.stringify({
    'fields[user]': 'email,is_email_verified,thumb_url',
  });
  const data = await fetchPatreonIdentityData(token, query);
  // console.info('patreon identity user data:', data);
  return data;
}

export async function isActiveOnePageRulesMember(token) {
  const query = querystring.stringify({
    include: 'memberships,memberships.currently_entitled_tiers',
    'fields[member]': 'patron_status',
    'fields[user]': 'email,is_email_verified,thumb_url',
  });
  const data = await fetchPatreonIdentityData(token, query);

  try {
    console.info('Patreon Member id ->', data.data.id);
    console.info('Patreon Member data ->', JSON.stringify(data.data.attributes));
    if (data.included) {
      const oprCampaign = data.included.filter(item => item.type === 'member')[0];

      // user is not an OPR member
      if (!oprCampaign) {
        console.warn('No (OPR) Campaign found in included -> ', JSON.stringify(data.included));
        return false;
      } else {
        console.info('Campaign found in included -> ', JSON.stringify(data.included));
      }

      console.info('OPR campaign data ->', JSON.stringify(oprCampaign));

      const patronStatus = oprCampaign.attributes.patron_status;
      console.info('OPR campaign status ->', patronStatus);

      const entitledTiers = oprCampaign.relationships.currently_entitled_tiers.data;
      console.info('OPR campaign tier data ->', JSON.stringify(entitledTiers));

      const isActivePatron = patronStatus === 'active_patron';
      console.info('POR Campaign, found entitled tiers ->', entitledTiers.length);
      const hasAnyActiveTier = entitledTiers.length >= 1;

      return isActivePatron && hasAnyActiveTier;
    } else {
      console.warn('Data does not contain includes values.');
    }
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function getUserPatreonRefreshToken(userId) {
  // Save refresh token against the user?
  const { rows } = await pool.query(
    'SELECT patreon_refresh_token FROM opr_companion.user_accounts WHERE id = $1',
    [userId]
  );
  return rows[0].patreon_refresh_token;
}

export async function setUserPatreonRefreshToken(uuid, refreshToken) {
  // Save refresh token against the user?
  await pool.query(
    'UPDATE opr_companion.user_accounts SET patreon_refresh_token = $2 WHERE uuid = $1',
    [uuid, refreshToken]
  );
}

export async function getUserPatreonActive(userId) {
  // Save refresh token against the user?
  const res = await pool.query(
    'SELECT patreon_active_until FROM opr_companion.user_accounts WHERE id = $1',
    [userId]
  );
  return res.rows[0].patreon_refresh_token;
}


