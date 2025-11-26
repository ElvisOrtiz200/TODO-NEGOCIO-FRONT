import { supabase } from "../../../api/supabaseClient";
import {
  createAlmacenProducto,
  updateAlmacenProducto,
  getAlmacenProductoByProducto,
  deleteAlmacenProducto,
} from "../../almacenProducto/services/almacenProductoService";

const TABLE = "PRODUCTO";

export const getProductos = async (idOrganizacion = null) => {
  // Asegurar que idOrganizacion sea string para comparaciones UUID
  const orgId = idOrganizacion ? String(idOrganizacion) : null;
  let query = supabase
    .from(TABLE)
    .select(`
      *,
      categoria:CATEGORIA(*),
      proveedor:PROVEEDOR(*)
    `)
    .eq("estadoProducto", true);
  
  // Filtrar por organización si se proporciona
  if (orgId) {
    query = query.eq("idOrganizacion", orgId);
  }
  
  const { data, error } = await query.order("idProducto", { ascending: true });
  if (error) throw error;
  return data;
};

export const createProducto = async (producto) => {
  // Extraer datos de almacenProducto si existen
  const { almacenProducto, ...productoData } = producto;
  
  const { data, error } = await supabase.from(TABLE).insert([productoData]).select();
  if (error) throw error;
  
  const productoCreado = data[0];
  
  // Si maneja stock y tiene datos de almacén, crear registro en ALMACENPRODUCTO
  if (productoCreado.manejaStock && almacenProducto && almacenProducto.idAlmacen) {
    try {
      const orgActiva = productoData.idOrganizacion;
      const almacenProductoData = {
        idAlmacen: almacenProducto.idAlmacen,
        idProducto: productoCreado.idProducto,
        stockActual: almacenProducto.stockActual || 0,
        stockMinimo: almacenProducto.stockMinimo || 0,
        estadoAlmacenProducto: true,
        idOrganizacion: orgActiva,
        fechaRegistroAlmProd: new Date().toISOString(),
      };
      await createAlmacenProducto(almacenProductoData);
      console.log("✅ Registro de almacén producto creado exitosamente");
    } catch (err) {
      console.error("❌ Error al crear almacén producto:", err);
      // No lanzar error para no revertir la creación del producto
      // El usuario puede editar el producto después para agregar el almacén
    }
  }
  
  return productoCreado;
};

export const updateProducto = async (idProducto, producto) => {
  // Extraer datos de almacenProducto si existen
  const { almacenProducto, ...productoData } = producto;
  
  const { data, error } = await supabase
    .from(TABLE)
    .update(productoData)
    .eq("idProducto", idProducto)
    .select();
  if (error) throw error;
  
  const productoActualizado = data[0];
  
  // Si maneja stock y tiene datos de almacén, crear o actualizar registro en ALMACENPRODUCTO
  if (productoActualizado.manejaStock && almacenProducto && almacenProducto.idAlmacen) {
    try {
      const orgActiva = productoData.idOrganizacion;
      
      // Verificar si ya existe un registro para este producto y almacén
      const almacenProductosExistentes = await getAlmacenProductoByProducto(idProducto, orgActiva);
      const existeRegistro = almacenProductosExistentes.find(
        (ap) => ap.idAlmacen === almacenProducto.idAlmacen
      );
      
      if (existeRegistro) {
        // Actualizar registro existente
        await updateAlmacenProducto(
          almacenProducto.idAlmacen,
          idProducto,
          {
            stockActual: almacenProducto.stockActual || 0,
            stockMinimo: almacenProducto.stockMinimo || 0,
            estadoAlmacenProducto: true,
          }
        );
        console.log("✅ Registro de almacén producto actualizado exitosamente");
      } else {
        // Crear nuevo registro
        const almacenProductoData = {
          idAlmacen: almacenProducto.idAlmacen,
          idProducto: idProducto,
          stockActual: almacenProducto.stockActual || 0,
          stockMinimo: almacenProducto.stockMinimo || 0,
          estadoAlmacenProducto: true,
          idOrganizacion: orgActiva,
          fechaRegistroAlmProd: new Date().toISOString(),
        };
        await createAlmacenProducto(almacenProductoData);
        console.log("✅ Registro de almacén producto creado exitosamente");
      }
    } catch (err) {
      console.error("❌ Error al actualizar/crear almacén producto:", err);
      // No lanzar error para no revertir la actualización del producto
    }
  } else if (!productoActualizado.manejaStock) {
    // Si el producto ya no maneja stock, eliminar (soft delete) los registros de ALMACENPRODUCTO
    try {
      const orgActiva = productoData.idOrganizacion;
      const almacenProductosExistentes = await getAlmacenProductoByProducto(idProducto, orgActiva);
      for (const ap of almacenProductosExistentes) {
        await deleteAlmacenProducto(ap.idAlmacen, idProducto);
      }
      console.log("✅ Registros de almacén producto eliminados (producto ya no maneja stock)");
    } catch (err) {
      console.error("❌ Error al eliminar almacén producto:", err);
      // No lanzar error para no revertir la actualización del producto
    }
  }
  
  return productoActualizado;
};

export const deleteProducto = async (idProducto) => {
  const { error } = await supabase
    .from(TABLE)
    .update({ estadoProducto: false })
    .eq("idProducto", idProducto);
  if (error) throw error;
};

export const getProductoById = async (idProducto) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("idProducto", idProducto)
    .single();
  if (error) throw error;
  return data;
};

