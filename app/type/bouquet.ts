export type Bouquet = {
  id: number;
  image: string,
  path: string,
  title: string,
  description: string,
  price: number,
  actionPrice: number | undefined,
  isHit?: boolean,
  category: string
}