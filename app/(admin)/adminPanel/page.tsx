import ProductsBlockAdmin from "../../components/productsBlockAdmin";
import AddProductForm from "../../components/AddProductForm"

export default function AdminPanel() {
    return (
    <div className="flex flex-col items-center h-screen bg-sky-100 p-10">
      <h1 className="text-4xl font-semibold">Панель администратора</h1>
      <AddProductForm/>
      <ProductsBlockAdmin/>
    </div>
  );
}
