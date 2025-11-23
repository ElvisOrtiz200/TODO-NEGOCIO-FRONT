import { useState, useEffect } from "react";
import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
} from "../services/clienteService";

export const useClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const data = await getClientes();
      setClientes(data);
    } catch (err) {
      console.error("Error al cargar clientes:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const addCliente = async (cliente) => {
    const nuevo = await createCliente(cliente);
    setClientes([...clientes, nuevo]);
  };

  const editCliente = async (idCliente, cliente) => {
    const actualizado = await updateCliente(idCliente, cliente);
    setClientes(
      clientes.map((c) =>
        c.idCliente === idCliente ? actualizado : c
      )
    );
  };

  const removeCliente = async (idCliente) => {
    await deleteCliente(idCliente);
    setClientes(clientes.filter((c) => c.idCliente !== idCliente));
  };

  useEffect(() => {
    loadClientes();
  }, []);

  return { clientes, loading, addCliente, editCliente, removeCliente, loadClientes };
};

