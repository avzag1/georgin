export const orderArray = [
  { 
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
      return this.goods.reduce((sum, good) => {
        const currentPrice = good.bouquet.actionPrice || good.bouquet.price;
        return sum + currentPrice;
      }, 0);
    }
  }
]