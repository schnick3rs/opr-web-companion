

export interface IPublicUser {
  id: number;
  username: string;
  enabled: boolean;
  uuid: string;
  created_at: Date;
  roles: string[];
  patreon_thumb_url: string;
}

export interface IPrivateUser extends IPublicUser {
  patreon_active_until: Date;
}

export interface IFullUser extends IPrivateUser {
  password: string;
  email_hashed: string;
  password_reset_token: string;
  password_reset_token_expire: string;
  patreon_refresh_token: string;
  patreon_scope: string;
}

export interface ISpecialRule {
  id: number;
  gameSystemId: number;
  key: string;
  name: string;
  description: string;
  tags: string[];
  hasRating: boolean;
  defaultRating: number;
  cost: string;
}

export interface ISimpleGameSystem {
  id: number;
  slug: string;
  fullname: string;
  universe: string;
  portfolioLink: string;
  shortname: string;
  aberration: string;
  armyBookBuilderEnabled: boolean;
  officialArmyBookCount: number | null;
}
