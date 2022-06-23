import axios from "axios";

const config = {
  patreonClientId: process.env.PATREON_CLIENT_ID,
  patreonClientSecret: process.env.PATREON_CLIENT_SECRET,
  patreonCreatorId: process.env.PATREON_CREATOR_ID,
};

export default class PatreonService {

  public static async getPatreonOauthTokens(oauthData): Promise<any> {
    const params = new URLSearchParams();
    // {
    //           ...oauthData,
    //           client_id: config.patreonClientId,
    //           client_secret: config.patreonClientSecret,
    //         }
    try {
      const { data } = await axios({
        method: 'POST',
        url: 'https://www.patreon.com/api/oauth2/token',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: params.toString(),
      });

      return data;
    } catch (e) {
      console.error('Oauth token call fail', e);
    }

    return null;
  }

  public static async fetchPatreonIdentityData(token: String, query: String): Promise<any> {
    try {
      const { data } = await axios({
        url: 'https://www.patreon.com/api/oauth2/v2/identity?' + query,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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

  public static async fetchPatreonUserData(token: String): Promise<any> {
    const params = new URLSearchParams();
    params.append('fields[user]','email,is_email_verified,thumb_url');
    return await this.fetchPatreonIdentityData(token, params.toString());
  }

  public static async fetchPatreonMembershipData(token: String): Promise<any> {
    const params = new URLSearchParams();
    params.append('include', 'memberships,memberships.currently_entitled_tiers');
    params.append('fields[member]', 'patron_status');
    params.append('fields[user]', 'email,is_email_verified,thumb_url' );
    const data = await this.fetchPatreonIdentityData(token, params.toString());
  }

  public static async isActiveOnePageRulesMember(token: String): Promise<any> {
    const data = await this.fetchPatreonMembershipData(token);

    try {
      console.info('Patreon Member id ->', data.data.id);
      console.info('Patreon Member data ->', JSON.stringify(data.data.attributes));
      if (data.included) {
        const oprCampaign = data.included
          .filter(item => item.type === 'member')
          .find(member => member.id === config.patreonCreatorId);

        // user is not an OPR member
        if (!oprCampaign) {
          console.info('No OPR Campaign found in included -> ', JSON.stringify(data.included));
          return false;
        }

        console.info('OPR campaign data ->', JSON.stringify(oprCampaign));

        const patronStatus = oprCampaign.attributes.patron_status;
        console.info('OPR campaign status ->', patronStatus);

        const entitledTiers = oprCampaign.relationships.currently_entitled_tiers.data;
        console.info('OPR campaign tier data ->', JSON.stringify(entitledTiers));

        const isActivePatron = patronStatus === 'active_patron';
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

}
