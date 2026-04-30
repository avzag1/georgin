type Status = 'new' | 'paid' | 'received'
type Order = {
  status: Status,
  customer: string,
  goods: Product[],
  totalAmount(): number
}
export type Product = {
  quantity: number,
  bouquet: Bouquet
}
export type Bouquet = {
  image: string,
  path: string,
  title: string,
  description: string,
  price: number,
  actionPrice: number | undefined,
  category: Category
}
type Category = 'designer' | 'mono' | 'wedding' | 'gifts'

export const orderArray: Order[] = [
  { 
    status: 'new',
    customer: "client_1",
    goods: [
      { quantity: 2,
        bouquet: {
          image: "/bouquet_1.png",
          path: "",
          title: "Букет_1",
          description: "Информация о букете_1",
          price: 2550,
          actionPrice: 2000,
          category: "designer"
        }
      },
      { quantity: 4,
        bouquet: {
          image: "/bouquet_2.png",
          path: "",
          title: "Букет_2",
          description: "Информация о букете_2",
          price: 3800,
          actionPrice: undefined,
          category: "mono"
        },
      }
    ],
    totalAmount() {
      return this.goods.reduce((totalSum, good) => {
        const currentSum = (good.bouquet.actionPrice || good.bouquet.price) * good.quantity;
        return totalSum + currentSum;
      }, 0);
    }
  }
]