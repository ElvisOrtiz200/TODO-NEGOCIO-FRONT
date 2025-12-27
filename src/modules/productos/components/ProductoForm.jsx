import { useState, useEffect } from "react";
import { useCategorias } from "../../categorias/hooks/useCategorias";
import { useProveedores } from "../../proveedores/hooks/useProveedores";
import { useUnidadesMedida } from "../../unidadesMedida/hooks/useUnidadesMedida";
import { useAlmacenes } from "../../almacenes/hooks/useAlmacenes";
import { useToast } from "../../../components/ToastContainer";
import { getAlmacenProductoByProducto } from "../../almacenProducto/services/almacenProductoService";
import { useOrganizacion } from "../../../context/OrganizacionContext";

export default function ProductoForm({ initialData, onSubmit, onCancel }) {
  const { categorias } = useCategorias();
  const { proveedores } = useProveedores();
  const { unidadesMedida, loading: loadingUnidades } = useUnidadesMedida();
  const { almacenes, loading: loadingAlmacenes } = useAlmacenes();
  const { organizacion, organizacionVista } = useOrganizacion();
  const { warning } = useToast();
  const [nombreProducto, setNombreProducto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [idProveedor, setIdProveedor] = useState("");
  const [idUnidadMedida, setIdUnidadMedida] = useState("");
  const [tipoProducto, setTipoProducto] = useState("");
  const [codigoBarra, setCodigoBarra] = useState("");
  const [manejaStock, setManejaStock] = useState(true);
  const [idAlmacen, setIdAlmacen] = useState("");
  const [stockActual, setStockActual] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");

  useEffect(() => {
    const loadAlmacenProducto = async () => {
      if (initialData?.idProducto && initialData?.manejaStock) {
        try {
          const orgActiva = organizacionVista || organizacion;
          const idOrganizacion = orgActiva?.idOrganizacion || null;
          const almacenProductos = await getAlmacenProductoByProducto(initialData.idProducto, idOrganizacion);
          if (almacenProductos && almacenProductos.length > 0) {
            const ap = almacenProductos[0];
            setIdAlmacen(ap.idAlmacen || "");
            setStockActual(ap.stockActual || "");
            setStockMinimo(ap.stockMinimo || "");
          }
        } catch (error) {
          console.error("Error al cargar almacén producto:", error);
        }
      }
    };

    if (initialData) {
      setNombreProducto(initialData.nombreProducto || "");
      setDescripcion(initialData.descripcion || "");
      setPrecioCompra(initialData.precioCompra || "");
      setPrecioVenta(initialData.precioVenta || "");
      setIdCategoria(initialData.idCategoria || "");
      setIdProveedor(initialData.idProveedor || "");
      setIdUnidadMedida(initialData.idUnidadMedida || "");
      setTipoProducto(initialData.tipoProducto || "");
      setCodigoBarra(initialData.codigoBarra || "");
      setManejaStock(initialData.manejaStock !== undefined ? initialData.manejaStock : true);
      loadAlmacenProducto();
    } else {
      // Resetear campos si no hay datos iniciales
      setNombreProducto("");
      setDescripcion("");
      setPrecioCompra("");
      setPrecioVenta("");
      setIdCategoria("");
      setIdProveedor("");
      setIdUnidadMedida("");
      setTipoProducto("");
      setCodigoBarra("");
      setManejaStock(true);
      setIdAlmacen("");
      setStockActual("");
      setStockMinimo("");
    }
  }, [initialData, organizacion, organizacionVista]);

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

    const precioCompraNum = parseFloat(precioCompra) || 0;
    const precioVentaNum = parseFloat(precioVenta) || 0;

    if (precioVentaNum < precioCompraNum) {
      warning("El precio de venta no puede ser menor que el precio de compra");
      return;
    }

    if (manejaStock && !idAlmacen) {
      warning("Debes seleccionar un almacén cuando el producto maneja stock");
      return;
    }

    if (manejaStock) {
      const stockActualNum = parseInt(stockActual) || 0;
      const stockMinimoNum = parseInt(stockMinimo) || 0;
      
      if (stockMinimoNum < 0) {
        warning("El stock mínimo no puede ser negativo");
        return;
      }
      
      if (stockActualNum < 0) {
        warning("El stock actual no puede ser negativo");
        return;
      }
    }

    const productoData = {
      nombreProducto: nombreProducto.trim(),
      descripcion: descripcion.trim() || null,
      precioCompra: precioCompraNum,
      precioVenta: precioVentaNum,
      idCategoria: parseInt(idCategoria),
      idProveedor: idProveedor ? parseInt(idProveedor) : null,
      idUnidadMedida: idUnidadMedida ? parseInt(idUnidadMedida) : null,
      tipoProducto: tipoProducto.trim() || null,
      codigoBarra: codigoBarra.trim() || null,
      manejaStock: manejaStock,
      estadoProducto: true,
    };
    
    // Solo agregar fechaRegistroProducto si es un nuevo producto
    if (!initialData) {
      productoData.fechaRegistroProducto = new Date().toISOString();
    } else {
      // En actualización, actualizar fechaActualizacion
      productoData.fechaActualizacion = new Date().toISOString();
    }

    // Agregar datos de almacén producto si maneja stock
    if (manejaStock && idAlmacen) {
      productoData.almacenProducto = {
        idAlmacen: parseInt(idAlmacen),
        stockActual: parseInt(stockActual) || 0,
        stockMinimo: parseInt(stockMinimo) || 0,
      };
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
            value={codigoBarra}
            onChange={(e) => setCodigoBarra(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
            placeholder="Código de barras (opcional)"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
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
            Proveedor
          </label>
          <select
            value={idProveedor}
            onChange={(e) => setIdProveedor(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
          >
            <option value="">Seleccione un proveedor (opcional)</option>
            {proveedores.map((prov) => (
              <option key={prov.idProveedor} value={prov.idProveedor}>
                {prov.nombreComercial || prov.nombre || `Proveedor ${prov.idProveedor}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Producto
          </label>
          <select
            value={tipoProducto}
            onChange={(e) => setTipoProducto(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
          >
            <option value="">Seleccione un tipo (opcional)</option>
            <option value="PRODUCTO">Producto</option>
            <option value="SERVICIO">Servicio</option>
            <option value="MATERIA_PRIMA">Materia Prima</option>
            <option value="INSUMO">Insumo</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unidad de Medida
          </label>
          <select
            value={idUnidadMedida}
            onChange={(e) => setIdUnidadMedida(e.target.value)}
            disabled={loadingUnidades}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {loadingUnidades ? "Cargando..." : "Seleccione una unidad (opcional)"}
            </option>
            {unidadesMedida.map((unidad) => (
              <option key={unidad.idUnidadMedida} value={unidad.idUnidadMedida}>
                {unidad.nombreUnidadMedida}
              </option>
            ))}
          </select>
          {!loadingUnidades && unidadesMedida.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">
              No hay unidades de medida disponibles
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={manejaStock}
              onChange={(e) => {
                setManejaStock(e.target.checked);
                if (!e.target.checked) {
                  setIdAlmacen("");
                  setStockActual("");
                  setStockMinimo("");
                }
              }}
              className="w-4 h-4 text-[#2B3E3C] border-gray-300 rounded focus:ring-[#2B3E3C]"
            />
            <span className="text-sm font-medium text-gray-700">
              Maneja Stock
            </span>
          </label>
        </div>

        {manejaStock && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Almacén <span className="text-red-500">*</span>
              </label>
              <select
                value={idAlmacen}
                onChange={(e) => setIdAlmacen(e.target.value)}
                required={manejaStock}
                disabled={loadingAlmacenes}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loadingAlmacenes ? "Cargando..." : "Seleccione un almacén"}
                </option>
                {almacenes.map((alm) => (
                  <option key={alm.idAlmacen} value={alm.idAlmacen}>
                    {alm.nombreAlmacen}
                  </option>
                ))}
              </select>
              {!loadingAlmacenes && almacenes.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  No hay almacenes disponibles
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Actual
              </label>
              <input
                type="number"
                min="0"
                value={stockActual}
                onChange={(e) => setStockActual(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Mínimo
              </label>
              <input
                type="number"
                min="0"
                value={stockMinimo}
                onChange={(e) => setStockMinimo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                placeholder="0"
              />
            </div>
          </>
        )}

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

