import { useState, useEffect } from "react";
import { useToast } from "../../../components/ToastContainer";

export default function ClienteForm({ initialData, onSubmit, onCancel }) {
  const { warning } = useToast();
  const [nombreCliente, setNombreCliente] = useState("");
  const [apellidoCliente, setApellidoCliente] = useState("");
  const [telefonoCliente, setTelefonoCliente] = useState("");
  const [emailCliente, setEmailCliente] = useState("");

  useEffect(() => {
    if (initialData) {
      setNombreCliente(initialData.nombreCliente || "");
      setApellidoCliente(initialData.apellidoCliente || "");
      setTelefonoCliente(initialData.telefonoCliente || "");
      setEmailCliente(initialData.emailCliente || "");
    } else {
      // Resetear campos si no hay datos iniciales
      setNombreCliente("");
      setApellidoCliente("");
      setTelefonoCliente("");
      setEmailCliente("");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!nombreCliente.trim()) {
      warning("El nombre del cliente es obligatorio");
      return;
    }

    const clienteData = {
      nombreCliente: nombreCliente.trim(),
      apellidoCliente: apellidoCliente.trim() || null,
      telefonoCliente: telefonoCliente.trim() || null,
      emailCliente: emailCliente.trim() || null,
      estadoCliente: true,
    };
    
    // Solo agregar fechaRegistroCliente si es un nuevo cliente
    if (!initialData) {
      clienteData.fechaRegistroCliente = new Date().toISOString();
    }
    
    console.log("📤 Enviando datos del cliente:", clienteData);
    onSubmit(clienteData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={nombreCliente}
            onChange={(e) => setNombreCliente(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
            placeholder="Nombre del cliente"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apellido
          </label>
          <input
            type="text"
            value={apellidoCliente}
            onChange={(e) => setApellidoCliente(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
            placeholder="Apellido del cliente"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            value={telefonoCliente}
            onChange={(e) => setTelefonoCliente(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
            placeholder="Ej: +51 987 654 321"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={emailCliente}
            onChange={(e) => setEmailCliente(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
            placeholder="cliente@ejemplo.com"
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

