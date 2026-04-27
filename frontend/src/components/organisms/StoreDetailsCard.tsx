import { StatusBadge } from '../atoms';
import type { StoreApi } from '../../services/stores.service';

interface StoreDetailsCardProps {
  store: StoreApi | null;
}

export function StoreDetailsCard({ store }: StoreDetailsCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
          <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">ID</p>
          <p className="mt-1 text-gray-900 font-medium">#{store?.id_store}</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-3">
          <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Estado</p>
          <div className="mt-1">{store?.status && <StatusBadge status={store.status} />}</div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-3 md:col-span-2">
          <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Nombre</p>
          <p className="mt-1 text-gray-900 break-words">{store?.store_name}</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 md:col-span-2">
          <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
            Direccion
          </p>
          <p className="mt-1 text-gray-900 break-words">{store?.address}</p>
        </div>
      </div>
    </div>
  );
}
