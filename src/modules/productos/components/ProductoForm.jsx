import { useState, useEffect } from "react";
import { useCategorias } from "../../categorias/hooks/useCategorias";
import { useAlmacenes } from "../../almacenes/hooks/useAlmacenes";

export default function ProductoForm({ initialData, onSubmit, onCancel }) {
  const { categorias } = useCategorias();
  const { almacenes } = useAlmacenes();
  const [nombreProducto, setNombreProducto] = useState("");
  const [descripcionProducto, setDescripcionProducto] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");
  const [stockActual, setStockActual] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [idAlmacen, setIdAlmacen] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");

  useEffect(() => {
    if (initialData) {
      setNombreProducto(initialData.nombreProducto || "");
      setDescripcionProducto(initialData.descripcionProducto || "");
      setPrecioCompra(initialData.precioCompra || "");
      setPrecioVenta(initialData.precioVenta || "");
      setStockMinimo(initialData.stockMinimo || "");
      setStockActual(initialData.stockActual || "");
      setIdCategoria(initialData.idCategoria || "");
      setIdAlmacen(initialData.idAlmacen || "");
      setCodigoBarras(initialData.codigoBarras || "");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      nombreProducto,
      descripcionProducto,
      precioCompra: parseFloat(precioCompra) || 0,
      precioVenta: parseFloat(precioVenta) || 0,
      stockMinimo: parseInt(stockMinimo) || 0,
      stockActual: parseInt(stockActual) || 0,
      idCategoria: parseInt(idCategoria) || null,
      idAlmacen: parseInt(idAlmacen) || null,
      codigoBarras,
      estadoProducto: true,
      fechaRegistroProducto: new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Nombre del Producto</label>
          <input
            type="text"
            value={nombreProducto}
            onChange={(e) => setNombreProducto(e.target.value)}
            required
            className="w-full border p-2 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Código de Barras</label>
          <input
            type="text"
            value={codigoBarras}
            onChange={(e) => setCodigoBarras(e.target.value)}
            className="w-full border p-2 rounded-lg"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Descripción</label>
          <textarea
            value={descripcionProducto}
            onChange={(e) => setDescripcionProducto(e.target.value)}
            className="w-full border p-2 rounded-lg"
            rows="3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Categoría</label>
          <select
            value={idCategoria}
            onChange={(e) => setIdCategoria(e.target.value)}
            required
            className="w-full border p-2 rounded-lg"
          >
            <option value="">Seleccione una categoría</option>
            {categorias.map((cat) => (
              <option key={cat.idCategoria} value={cat.idCategoria}>
                {cat.nombreCategoria}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Almacén</label>
          <select
            value={idAlmacen}
            onChange={(e) => setIdAlmacen(e.target.value)}
            required
            className="w-full border p-2 rounded-lg"
          >
            <option value="">Seleccione un almacén</option>
            {almacenes.map((alm) => (
              <option key={alm.idAlmacen} value={alm.idAlmacen}>
                {alm.nombreAlmacen}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Precio de Compra</label>
          <input
            type="number"
            step="0.01"
            value={precioCompra}
            onChange={(e) => setPrecioCompra(e.target.value)}
            required
            className="w-full border p-2 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Precio de Venta</label>
          <input
            type="number"
            step="0.01"
            value={precioVenta}
            onChange={(e) => setPrecioVenta(e.target.value)}
            required
            className="w-full border p-2 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Stock Mínimo</label>
          <input
            type="number"
            value={stockMinimo}
            onChange={(e) => setStockMinimo(e.target.value)}
            required
            className="w-full border p-2 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Stock Actual</label>
          <input
            type="number"
            value={stockActual}
            onChange={(e) => setStockActual(e.target.value)}
            required
            className="w-full border p-2 rounded-lg"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#2B3E3C] text-white rounded-lg hover:bg-[#22312f]"
        >
          {initialData ? "Actualizar" : "Registrar"}
        </button>
      </div>
    </form>
  );
}

