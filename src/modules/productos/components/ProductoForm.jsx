import { useState, useEffect } from "react";
import { useCategorias } from "../../categorias/hooks/useCategorias";
import { useAlmacenes } from "../../almacenes/hooks/useAlmacenes";
import { useToast } from "../../../components/ToastContainer";

export default function ProductoForm({ initialData, onSubmit, onCancel }) {
  const { categorias } = useCategorias();
  const { almacenes } = useAlmacenes();
  const { warning } = useToast();
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
    } else {
      // Resetear campos si no hay datos iniciales
      setNombreProducto("");
      setDescripcionProducto("");
      setPrecioCompra("");
      setPrecioVenta("");
      setStockMinimo("");
      setStockActual("");
      setIdCategoria("");
      setIdAlmacen("");
      setCodigoBarras("");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!nombreProducto.trim()) {
      warning("El nombre del producto es obligatorio");
      return;
    }

    if (!idCategoria) {
      warning("Debes seleccionar una categoría");
      return;
    }

    if (!idAlmacen) {
      warning("Debes seleccionar un almacén");
      return;
    }

    const precioCompraNum = parseFloat(precioCompra) || 0;
    const precioVentaNum = parseFloat(precioVenta) || 0;

    if (precioVentaNum < precioCompraNum) {
      warning("El precio de venta no puede ser menor que el precio de compra");
      return;
    }

    const productoData = {
      nombreProducto: nombreProducto.trim(),
      descripcionProducto: descripcionProducto.trim() || null,
      precioCompra: precioCompraNum,
      precioVenta: precioVentaNum,
      stockMinimo: parseInt(stockMinimo) || 0,
      stockActual: parseInt(stockActual) || 0,
      idCategoria: parseInt(idCategoria),
      idAlmacen: parseInt(idAlmacen),
      codigoBarras: codigoBarras.trim() || null,
      estadoProducto: true,
    };
    
    // Solo agregar fechaRegistroProducto si es un nuevo producto
    if (!initialData) {
      productoData.fechaRegistroProducto = new Date().toISOString();
    }
    
    console.log("📤 Enviando datos del producto:", productoData);
    onSubmit(productoData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Producto <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={nombreProducto}
            onChange={(e) => setNombreProducto(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
            placeholder="Nombre del producto"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Código de Barras
          </label>
          <input
            type="text"
            value={codigoBarras}
            onChange={(e) => setCodigoBarras(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
            placeholder="Código de barras (opcional)"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={descripcionProducto}
            onChange={(e) => setDescripcionProducto(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
            rows="3"
            placeholder="Descripción del producto (opcional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría <span className="text-red-500">*</span>
          </label>
          <select
            value={idCategoria}
            onChange={(e) => setIdCategoria(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Almacén <span className="text-red-500">*</span>
          </label>
          <select
            value={idAlmacen}
            onChange={(e) => setIdAlmacen(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio de Compra <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={precioCompra}
            onChange={(e) => setPrecioCompra(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio de Venta <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={precioVenta}
            onChange={(e) => setPrecioVenta(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stock Mínimo <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            value={stockMinimo}
            onChange={(e) => setStockMinimo(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stock Actual <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            value={stockActual}
            onChange={(e) => setStockActual(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#2B3E3C] text-white rounded-lg hover:bg-[#22312f] transition-colors"
        >
          {initialData ? "Actualizar" : "Registrar"}
        </button>
      </div>
    </form>
  );
}

