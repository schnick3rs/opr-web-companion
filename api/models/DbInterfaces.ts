
export interface ISpecialRule {
  id: number;
  gameSystemId: number;
  key: String;
  name: String;
  description: String;
  tags: String[];
  hasRating: boolean;
  defaultRating: number;
  cost: String;
}

export interface ISimpleGameSystem {
  id: number;
  slug: String;
  fullname: String;
  universe: String;
  portfolioLink: String;
  shortname: String;
  aberration: String;
  armyBookBuilderEnabled: boolean;
  officialArmyBookCount: number | null;
}
