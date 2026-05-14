import ProductsBlockAdmin from "../../components/productsBlockAdmin";
import AddProductAdmin from "../../components/AddProductAdmin"

export default function AdminPanel() {
    return (
    <div className="flex flex-col items-center h-screen bg-sky-100 p-10">
      <h1 className="text-4xl font-semibold">Панель администратора</h1>
      <AddProductAdmin/>
      <ProductsBlockAdmin/>
    </div>
  );
}
