import ProductsBlockAdmin from "../../components/productsBlockAdmin";


export default function AdminPanel() {
    return (
    <div className="flex flex-col items-center h-screen bg-sky-100 p-10">
      <h1 className="text-4xl font-semibold">Панель администратора</h1>
      <button
          onClick={POST}
          className="w-60 border p-3 m-5 bg-teal-100"
        >
          Добавить новый товар
      </button>
      <ProductsBlockAdmin/>
    </div>
  );
}
