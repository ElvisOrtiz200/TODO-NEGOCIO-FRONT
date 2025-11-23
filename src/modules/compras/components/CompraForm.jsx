import { useState, useEffect } from "react";
import { useProductos } from "../../productos/hooks/useProductos";
import { useProveedores } from "../../proveedores/hooks/useProveedores";

export default function CompraForm({ initialData, onSubmit, onCancel }) {
  const { productos } = useProductos();
  const { proveedores } = useProveedores();
  const [idProveedor, setIdProveedor] = useState("");
  const [detalles, setDetalles] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [precioUnitario, setPrecioUnitario] = useState("");

  useEffect(() => {
    if (initialData?.detalles) {
      setDetalles(initialData.detalles);
      setIdProveedor(initialData.idProveedor || "");
    }
  }, [initialData]);

  const agregarProducto = () => {
    const producto = productos.find((p) => p.idProducto === parseInt(productoSeleccionado));
    if (!producto) return;

    const precio = parseFloat(precioUnitario) || producto.precioCompra || 0;

    const detalle = {
      idProducto: producto.idProducto,
      nombreProducto: producto.nombreProducto,
      cantidad: parseInt(cantidad),
      precioUnitario: precio,
      subtotal: precio * cantidad,
    };

    setDetalles([...detalles, detalle]);
    setProductoSeleccionado("");
    setCantidad(1);
    setPrecioUnitario("");
  };

  const eliminarDetalle = (index) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const calcularTotal = () => {
    return detalles.reduce((sum, d) => sum + d.subtotal, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (detalles.length === 0) {
      alert("Debe agregar al menos un producto");
      return;
    }

    if (!idProveedor) {
      alert("Debe seleccionar un proveedor");
      return;
    }

    const compra = {
      idProveedor: parseInt(idProveedor),
      fechaCompra: new Date().toISOString(),
      totalCompra: calcularTotal(),
      estadoCompra: "COMPLETADA",
    };

    const detallesCompra = detalles.map((d) => ({
      idProducto: d.idProducto,
      cantidad: d.cantidad,
      precioUnitario: d.precioUnitario,
      subtotal: d.subtotal,
    }));

    onSubmit(compra, detallesCompra);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Proveedor *</label>
          <select
            value={idProveedor}
            onChange={(e) => setIdProveedor(e.target.value)}
            required
            className="w-full border p-2 rounded-lg"
          >
            <option value="">Seleccione un proveedor</option>
            {proveedores?.map((proveedor) => (
              <option key={proveedor.idProveedor} value={proveedor.idProveedor}>
                {proveedor.nombreProveedor}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-4">Agregar Producto</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium">Producto</label>
            <select
              value={productoSeleccionado}
              onChange={(e) => {
                setProductoSeleccionado(e.target.value);
                const producto = productos.find((p) => p.idProducto === parseInt(e.target.value));
                if (producto) {
                  setPrecioUnitario(producto.precioCompra || "");
                }
              }}
              className="w-full border p-2 rounded-lg"
            >
              <option value="">Seleccione...</option>
              {productos?.filter(p => p.estadoProducto).map((producto) => (
                <option key={producto.idProducto} value={producto.idProducto}>
                  {producto.nombreProducto}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Cantidad</label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              min="1"
              required
              className="w-full border p-2 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Precio Unitario</label>
            <input
              type="number"
              step="0.01"
              value={precioUnitario}
              onChange={(e) => setPrecioUnitario(e.target.value)}
              min="0"
              required
              className="w-full border p-2 rounded-lg"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={agregarProducto}
              disabled={!productoSeleccionado}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
            >
              Agregar
            </button>
          </div>
        </div>
      </div>

      {detalles.length > 0 && (
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Detalles de Compra</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Producto</th>
                  <th className="p-2 text-left">Cantidad</th>
                  <th className="p-2 text-left">Precio Unit.</th>
                  <th className="p-2 text-left">Subtotal</th>
                  <th className="p-2 text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((detalle, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{detalle.nombreProducto}</td>
                    <td className="p-2">{detalle.cantidad}</td>
                    <td className="p-2">${detalle.precioUnitario?.toFixed(2)}</td>
                    <td className="p-2">${detalle.subtotal?.toFixed(2)}</td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => eliminarDetalle(index)}
                        className="text-red-500 hover:underline"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 font-semibold">
                <tr>
                  <td colSpan="3" className="p-2 text-right">TOTAL:</td>
                  <td className="p-2">${calcularTotal().toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

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
          disabled={detalles.length === 0}
          className="px-4 py-2 bg-[#2B3E3C] text-white rounded-lg hover:bg-[#22312f] disabled:bg-gray-300"
        >
          Registrar Compra
        </button>
      </div>
    </form>
  );
}

