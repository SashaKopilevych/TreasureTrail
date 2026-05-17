export type Treasure = {
  id: number;
  description: string;
  image_name: string;
  latitude: number;
  longitude: number;
  hint: string | null;
  category_id: string;
  category_name: string;
  is_found: boolean;
};

export type Category = {
  id: number;
  name: string;
};
