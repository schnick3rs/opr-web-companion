
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
