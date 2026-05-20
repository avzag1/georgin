import ProductsBlockAdmin from "../../components/ProductsBlockAdmin";
import AddProductForm from "../../components/AddProductForm"

export default function AdminPanel() {
    return (
    <div className="flex flex-col items-center justify-center w-full h-auto bg-sky-100 p-10">
      <h1 className="text-4xl font-semibold">Панель администратора</h1>
      <AddProductForm/>
      <ProductsBlockAdmin/>
    </div>
  );
}
