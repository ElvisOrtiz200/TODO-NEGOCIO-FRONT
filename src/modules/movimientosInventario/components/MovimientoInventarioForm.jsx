import { useState, useEffect } from "react";
import { useProductos } from "../../productos/hooks/useProductos";
import { useTipoMovimientos } from "../../tipoMovimientos/hooks/useTipoMovimientos";
import { useAlmacenes } from "../../almacenes/hooks/useAlmacenes";

export default function MovimientoInventarioForm({ initialData, onSubmit, onCancel }) {
  const { productos } = useProductos();
  const { tipoMovimientos } = useTipoMovimientos();
  const { almacenes } = useAlmacenes();
  const [idProducto, setIdProducto] = useState("");
  const [idTipoMovimiento, setIdTipoMovimiento] = useState("");
  const [idAlmacen, setIdAlmacen] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
    if (initialData) {
      setIdProducto(initialData.idProducto || "");
      setIdTipoMovimiento(initialData.idTipoMovimiento || "");
      setIdAlmacen(initialData.idAlmacen || "");
      setCantidad(initialData.cantidad || "");
      setObservaciones(initialData.observaciones || "");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      idProducto: parseInt(idProducto),
      idTipoMovimiento: parseInt(idTipoMovimiento),
      idAlmacen: parseInt(idAlmacen),
      cantidad: parseInt(cantidad),
      observaciones,
    });
  };

  const productoSeleccionado = productos.find((p) => p.idProducto === parseInt(idProducto));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Producto *</label>
          <select
            value={idProducto}
            onChange={(e) => setIdProducto(e.target.value)}
            required
            className="w-full border p-2 rounded-lg"
          >
            <option value="">Seleccione un producto</option>
            {productos?.filter(p => p.estadoProducto).map((producto) => (
              <option key={producto.idProducto} value={producto.idProducto}>
                {producto.nombreProducto} - Stock: {producto.stockActual}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Tipo de Movimiento *</label>
          <select
            value={idTipoMovimiento}
            onChange={(e) => setIdTipoMovimiento(e.target.value)}
            required
            className="w-full border p-2 rounded-lg"
          >
            <option value="">Seleccione...</option>
            {tipoMovimientos?.filter(tm => tm.estadoTipoMovimiento).map((tipo) => (
              <option key={tipo.idTipoMovimiento} value={tipo.idTipoMovimiento}>
                {tipo.descripcionMovimiento} ({tipo.naturaleza})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Almacén *</label>
          <select
            value={idAlmacen}
            onChange={(e) => setIdAlmacen(e.target.value)}
            required
            className="w-full border p-2 rounded-lg"
          >
            <option value="">Seleccione un almacén</option>
            {almacenes?.filter(a => a.estadoAlmacen).map((almacen) => (
              <option key={almacen.idAlmacen} value={almacen.idAlmacen}>
                {almacen.nombreAlmacen}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Cantidad *</label>
          <input
            type="number"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            min="1"
            required
            className="w-full border p-2 rounded-lg"
          />
          {productoSeleccionado && (
            <p className="text-xs text-gray-500 mt-1">
              Stock actual: {productoSeleccionado.stockActual}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Observaciones</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="w-full border p-2 rounded-lg"
            rows="3"
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
          Registrar Movimiento
        </button>
      </div>
    </form>
  );
}

