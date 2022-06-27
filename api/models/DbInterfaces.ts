

export interface IPublicUser {
  id: number;
  username: string;
  enabled: boolean;
  uuid: string;
  createdAt: Date;
  roles: string[];
  patreonThumbUrl: string;
}

export interface IPrivateUser extends IPublicUser {
  patreonActiveUntil: Date;
  patreon: boolean;
}

export interface IFullUser extends IPrivateUser {
  password: string;
  emailHashed: string;
  passwordResetToken: string;
  passwordResetTokenExpire: string;
  patreonRefreshToken: string;
  patreonScope: string;
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
