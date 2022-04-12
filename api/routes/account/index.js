import Router from "express-promise-router";
import * as patreonService from "./patreonService.js";

const router = new Router();

router.get("/patreon-refresh", async (request, response) => {
  const refreshToken = await patreonService.getUserPatreonRefreshToken(
    request.me.userId
  );

  if (!refreshToken) {
    response.status(401).json({ message: "User has no refresh token" });
    return;
  }

  const { access_token, refresh_token } =
    await patreonService.getPatreonOauthTokensFromRefresh(refreshToken);

  await patreonService.setUserPatreonRefreshToken(
    request.me.userId,
    refresh_token
  );

  const isActive = await patreonService.isActiveOnePageRulesMember(
    access_token
  );

  console.log("User is Patreon", isActive);

  function getActiveUntil() {
    var now = new Date();
    if (now.getMonth() == 11) {
      return new Date(now.getFullYear() + 1, 0, 4);
    } else {
      return new Date(now.getFullYear(), now.getMonth() + 1, 4);
    }
  }

  const activeUntil = isActive ? getActiveUntil() : null;

  await patreonService.setUserPatreonActive(request.me.userId);

  response.status(200).json({ isActive, activeUntil });
});

router.get("/patreon", async (request, response) => {
  const { code } = request.query;

  console.log("Patreon connection for user", request.me);
  console.log("Patreon connection...", code);

  if (!code) {
    const message = `Connection to Patreon failed.`;
    response.status(400).json({ message });
    return;
  }

  try {
    const patreonTokenRes = await patreonService.getPatreonOauthTokensFromCode(
      code
    );

    const { access_token, refresh_token } = patreonTokenRes;

    // TODO: Error handling?
    await patreonService.setUserPatreonRefreshToken(
      request.me.userId,
      refresh_token
    );

    const isActive = await patreonService.isActiveOnePageRulesMember(
      access_token
    );

    await patreonService.setUserPatreonActive(
      request.me.userId,
      isActive ? new Date() : null
    );

    response.status(200).redirect("/account");
  } catch (e) {
    console.error(e);
    response.status(500).json({ message: "Error calling Patreon API" });
  }
});

export default router;
