import axios from "axios";
import querystring from "querystring";
import { pool } from "../../db";

const patreonClientId =
  "6qXBQh6Orvw5-n51Kiyn7jdX1x9aQa2HzlhpEq96DOJvAb5i-AHmy2F-89KTQkBE";
const patreonClientSecret =
  "QLTL-IMuMrL_t0HGfRbgRfMs_TBmgu-6R_DC2VeN771Jox4auFrWODyTSBLhqGe0";

const oprId = "7de51c6d-e6eb-4e5a-8763-db04d3deb5b1";

export async function getPatreonOauthTokensFromCode(code) {
  const oauthData = {
    code: code,
    grant_type: "authorization_code",
    client_id: patreonClientId,
    client_secret: patreonClientSecret,
    redirect_uri: "http://localhost:3000/api/account/patreon",
  };

  return await getPatreonOauthTokens(oauthData);
}

export async function getPatreonOauthTokensFromRefresh(refreshToken) {
  const oauthData = {
    refresh_token: refreshToken,
    grant_type: "refresh_token",
    client_id: patreonClientId,
    client_secret: patreonClientSecret,
  };

  return await getPatreonOauthTokens(oauthData);
}

async function getPatreonOauthTokens(oauthData) {
  try {
    const res = await axios({
      method: "POST",
      url: "https://www.patreon.com/api/oauth2/token",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      data: querystring.stringify(oauthData),
    });

    return res.data;
  } catch (e) {
    console.error("Oauth token call fail", e);
  }

  return null;
}

export async function isActiveOnePageRulesMember(token) {
  async function getMemberships() {
    try {
      const query = querystring.stringify({
        include: "memberships",
        "fields[member]": "patron_status",
      });
      const membershipsResponse = await axios({
        url: "https://www.patreon.com/api/oauth2/v2/identity?" + query,
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      return membershipsResponse;
    } catch (e) {
      if (e.response) {
        const { data } = e.response;
        console.error(JSON.stringify(data));
      }

      console.error("Failed to get patreon identity", JSON.stringify(e));
    }
    return null;
  }

  const { data } = await getMemberships();

  try {
    const oprCampaign = data.included.find(
      (campaign) => campaign.id === oprId
    );

    console.log("OPR Campaign", oprCampaign);

    // user is not an OPR member
    if (!oprCampaign) return false;

    const patronStatus = oprCampaign.attributes["patron_status"];

    return patronStatus === "active_patron";
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function getUserPatreonRefreshToken(userId) {
  // Save refresh token against the user?
  const res = await pool.query(
    "SELECT patreon_refresh_token FROM opr_companion.user_accounts WHERE id = $1",
    [userId]
  );
  return res.rows[0]["patreon_refresh_token"];
}

export async function setUserPatreonRefreshToken(userId, refreshToken) {
  // Save refresh token against the user?
  const res = await pool.query(
    "UPDATE opr_companion.user_accounts SET patreon_refresh_token = $2 WHERE id = $1",
    [userId, refreshToken]
  );
}

export async function getUserPatreonActive(userId) {
  // Save refresh token against the user?
  const res = await pool.query(
    "SELECT patreon_active_until FROM opr_companion.user_accounts WHERE id = $1",
    [userId]
  );
  return res.rows[0]["patreon_refresh_token"];
}

export async function setUserPatreonActive(userId, activeUntil) {
  // Save refresh token against the user?
  const res = await pool.query(
    "UPDATE opr_companion.user_accounts SET patreon_active_until = $2 WHERE id = $1",
    [userId, activeUntil]
  );
}
