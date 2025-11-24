import { useState, useEffect } from "react";
import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
} from "../services/clienteService";
import { useOrganizacion } from "../../../context/OrganizacionContext";

export const useClientes = () => {
  const { organizacion, organizacionVista } = useOrganizacion();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const orgActiva = organizacionVista || organizacion;
      const idOrganizacion = orgActiva?.idOrganizacion || null;
      const data = await getClientes(idOrganizacion);
      setClientes(data);
    } catch (err) {
      console.error("Error al cargar clientes:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const addCliente = async (cliente) => {
    try {
      console.log("📝 Creando cliente con datos:", cliente);
      const nuevo = await createCliente(cliente);
      console.log("✅ Cliente creado exitosamente:", nuevo);
      // Recargar la lista completa para asegurar sincronización
      await loadClientes();
      return nuevo;
    } catch (err) {
      console.error("❌ Error creando cliente:", err);
      throw err;
    }
  };

  const editCliente = async (idCliente, cliente) => {
    try {
      console.log("✏️ Actualizando cliente:", idCliente, cliente);
      const actualizado = await updateCliente(idCliente, cliente);
      console.log("✅ Cliente actualizado exitosamente:", actualizado);
      // Recargar la lista completa para asegurar sincronización
      await loadClientes();
      return actualizado;
    } catch (err) {
      console.error("❌ Error actualizando cliente:", err);
      throw err;
    }
  };

  const removeCliente = async (idCliente) => {
    try {
      console.log("🗑️ Eliminando cliente:", idCliente);
      await deleteCliente(idCliente);
      // Recargar la lista completa para asegurar sincronización
      await loadClientes();
    } catch (err) {
      console.error("❌ Error eliminando cliente:", err);
      throw err;
    }
  };

  useEffect(() => {
    loadClientes();
  }, [organizacion?.idOrganizacion, organizacionVista?.idOrganizacion]);

  return { clientes, loading, addCliente, editCliente, removeCliente, loadClientes };
};

