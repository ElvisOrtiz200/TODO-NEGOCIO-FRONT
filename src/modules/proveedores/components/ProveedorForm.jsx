import { useState, useEffect } from "react";
import { useToast } from "../../../components/ToastContainer";

export default function ProveedorForm({ initialData, onSubmit, onCancel }) {
  const { warning } = useToast();
  const [nombre, setNombre] = useState("");
  const [nombreComercial, setNombreComercial] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [direccion, setDireccion] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("RUC");

  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre || "");
      setNombreComercial(initialData.nombreComercial || "");
      setTelefono(initialData.telefono || "");
      setCorreo(initialData.correo || "");
      setDireccion(initialData.direccion || "");
      setNumeroDocumento(initialData.numeroDocumento || "");
      setTipoDocumento(initialData.tipoDocumento || "RUC");
    } else {
      // Resetear campos si no hay datos iniciales
      setNombre("");
      setNombreComercial("");
      setTelefono("");
      setCorreo("");
      setDireccion("");
      setNumeroDocumento("");
      setTipoDocumento("RUC");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!nombre.trim()) {
      warning("El nombre del proveedor es obligatorio");
      return;
    }

    if (!tipoDocumento || !tipoDocumento.trim()) {
      warning("El tipo de documento es obligatorio");
      return;
    }

    if (!numeroDocumento || !numeroDocumento.trim()) {
      warning("El número de documento es obligatorio");
      return;
    }

    const proveedorData = {
      nombre: nombre.trim(),
      nombreComercial: nombreComercial.trim() || null,
      telefono: telefono.trim() || null,
      correo: correo.trim() || null,
      direccion: direccion.trim() || null,
      numeroDocumento: numeroDocumento.trim(),
      tipoDocumento: tipoDocumento.trim(),
      estado: true,
    };
    
    // Solo agregar fechaRegistro si es un nuevo proveedor
    if (!initialData) {
      proveedorData.fechaRegistro = new Date().toISOString();
    } else {
      // En actualización, actualizar fechaActualizacion
      proveedorData.fechaActualizacion = new Date().toISOString();
    }
    
    console.log("📤 Enviando datos del proveedor:", proveedorData);
    onSubmit(proveedorData);
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
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
            placeholder="Nombre del proveedor"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre Comercial
          </label>
          <input
            type="text"
            value={nombreComercial}
            onChange={(e) => setNombreComercial(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
            placeholder="Nombre comercial (opcional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Documento <span className="text-red-500">*</span>
          </label>
          <select
            value={tipoDocumento}
            onChange={(e) => setTipoDocumento(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
          >
            <option value="">Seleccione un tipo</option>
            <option value="RUC">RUC</option>
            <option value="DNI">DNI</option>
            <option value="CE">Carné de Extranjería</option>
            <option value="PASAPORTE">Pasaporte</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Documento <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={numeroDocumento}
            onChange={(e) => setNumeroDocumento(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
            placeholder="Ej: 20123456789"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
            placeholder="Ej: +51 987 654 321"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo Electrónico
          </label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
            placeholder="proveedor@ejemplo.com"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección
          </label>
          <textarea
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
            placeholder="Dirección completa del proveedor"
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
