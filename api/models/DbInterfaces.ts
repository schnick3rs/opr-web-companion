
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
