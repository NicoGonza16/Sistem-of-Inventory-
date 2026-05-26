import { FiAlertTriangle } from "react-icons/fi";
import Button from "./Button";
import Modal from "./Modal";

function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar acción",
  message = "Esta acción no se puede deshacer.",
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  loading = false,
  tone = "danger",
}) {
  const toneStyles = {
    danger: "bg-rose-500/15 text-rose-300",
    warning: "bg-amber-500/15 text-amber-300",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="max-w-lg" description="Confirma esta acción antes de continuar.">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className={`rounded-2xl p-3 ${toneStyles[tone] || toneStyles.danger}`}>
            <FiAlertTriangle className="text-xl" />
          </div>
          <p className="text-sm leading-7 text-slate-300">{message}</p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmModal;
