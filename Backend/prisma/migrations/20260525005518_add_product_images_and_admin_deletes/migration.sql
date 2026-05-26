-- DropForeignKey
ALTER TABLE "detalle_cuenta" DROP CONSTRAINT "detalle_cuenta_id_cuenta_fkey";

-- DropForeignKey
ALTER TABLE "detalle_cuenta" DROP CONSTRAINT "detalle_cuenta_id_producto_fkey";

-- DropForeignKey
ALTER TABLE "movimientos_inventario" DROP CONSTRAINT "movimientos_inventario_id_producto_fkey";

-- CreateTable
CREATE TABLE "producto_imagen" (
    "id_imagen" SERIAL NOT NULL,
    "url_imagen" VARCHAR(255) NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "producto_imagen_pkey" PRIMARY KEY ("id_imagen")
);

-- AddForeignKey
ALTER TABLE "producto_imagen" ADD CONSTRAINT "producto_imagen_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "productos"("id_producto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "productos"("id_producto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_cuenta" ADD CONSTRAINT "detalle_cuenta_id_cuenta_fkey" FOREIGN KEY ("id_cuenta") REFERENCES "cuentas"("id_cuenta") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_cuenta" ADD CONSTRAINT "detalle_cuenta_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "productos"("id_producto") ON DELETE CASCADE ON UPDATE CASCADE;
