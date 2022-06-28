// @ts-ignore
import dotenv from 'dotenv';
import axios from 'axios';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const config = {
  patreonClientId: process.env.PATREON_CLIENT_ID,
  patreonClientSecret: process.env.PATREON_CLIENT_SECRET,
  patreonRedirectBase: process.env.PATREON_REDIRECT_BASE,
};

class PatreonApi {

  public static async getOauthTokens(paramsData: URLSearchParams): Promise<any> {
    try {
      const { data } = await axios.post(
        'https://www.patreon.com/api/oauth2/token',
        paramsData,
        { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
      );

      return data;
    } catch (e) {
      console.error('Could not get oath token from patreon ->', e);
    }

    return null;
  }

  public static async getIdentityData(token: string, params: URLSearchParams): Promise<any> {
    try {
      const { data } = await axios.get(
        'https://www.patreon.com/api/oauth2/v2/identity',
        {
          headers: { Authorization: `Bearer ${token}` },
          params: params,
        }
      );
      return data;
    } catch (e) {
      console.error('Failed to fetch patreon identity data ->', JSON.stringify(e));
    }
    return null;
  }
}

export default class PatreonService {

  public static async getPatreonOauthTokensFromCode(code: string): Promise<any> {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', `${config.patreonRedirectBase}/api/account/patreon`);
    params.append('client_id', config.patreonClientId);
    params.append('client_secret', config.patreonClientSecret);
    return await PatreonApi.getOauthTokens(params);
  }

  public static async getPatreonOauthTokensFromRefresh(refreshToken: string): Promise<any> {
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);
    params.append('client_id', config.patreonClientId);
    params.append('client_secret', config.patreonClientSecret);
    return await PatreonApi.getOauthTokens(params);
  }

  public static async fetchPatreonUserData(token: string): Promise<any> {
    const params = new URLSearchParams();
    params.append('fields[user]','email,is_email_verified,thumb_url');
    return await PatreonApi.getIdentityData(token, params);
  }

  public static async fetchPatreonMembershipData(token: string): Promise<any> {
    const params = new URLSearchParams();
    params.append('include', 'memberships,memberships.currently_entitled_tiers');
    params.append('fields[member]', 'patron_status');
    params.append('fields[user]', 'email,is_email_verified,thumb_url' );
    return await PatreonApi.getIdentityData(token, params);
  }

  public static async isActiveOnePageRulesMember(token: string): Promise<boolean> {
    const { data, included } = await this.fetchPatreonMembershipData(token);

    try {
      console.info('Patreon Member id ->', data.id);
      console.info('Patreon Member data ->', JSON.stringify(data.attributes));
      if (included) {
        const oprCampaign = included.filter(item => item.type === 'member')[0];

        // user is not an OPR member
        if (!oprCampaign) {
          console.warn('No (OPR) Campaign found in included ->', JSON.stringify(included));
          return false;
        } else {
          console.info('Campaign found in included ->', JSON.stringify(included));
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

  public static computeComingActiveUntilDate(): Date {
    const now = new Date();
    if (now.getMonth() === 11) {
      return new Date(now.getFullYear() + 1, 0, 4);
    } else {
      return new Date(now.getFullYear(), now.getMonth() + 1, 4);
    }
  }

}
