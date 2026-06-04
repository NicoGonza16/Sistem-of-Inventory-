import Modal from "../ui/Modal";

function ProductoPreviewModal({
  previewImage,
  setPreviewImage,
  placeholderImage,
}) {
  return (
    <Modal
      isOpen={Boolean(previewImage)}
      onClose={() => setPreviewImage(null)}
      title="Vista previa de imagen"
      size="max-w-3xl"
    >
      <img
        src={previewImage || placeholderImage}
        alt="Vista previa"
        className="max-h-[70vh] w-full rounded-3xl object-cover"
      />
    </Modal>
  );
}

export default ProductoPreviewModal;
