import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Pencil, Trash2, Users } from 'lucide-react';
import { deleteMember, listMembers } from '@/lib/db';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MemberFormModal } from './MemberFormModal';
import { formatDate, initials } from '@/lib/utils';
import { useToast } from '@/components/ui/Toaster';
import type { Member, MemberStatus } from '@/types';

const statusTone: Record<MemberStatus, 'success' | 'danger' | 'warning'> = {
  activo: 'success',
  vencido: 'danger',
  suspendido: 'warning',
};

export function MembersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | MemberStatus>('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);

  const queryClient = useQueryClient();
  const { push } = useToast();
  const members = useQuery({ queryKey: ['members'], queryFn: listMembers });

  const removeMutation = useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      push('success', 'Miembro eliminado');
    },
  });

  const filtered = useMemo(() => {
    return (members.data ?? []).filter((m) => {
      const matchesSearch = m.full_name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'todos' || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [members.data, search, statusFilter]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-base-100">Miembros</h2>
          <p className="text-sm text-base-400">{members.data?.length ?? 0} miembros registrados</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Nuevo miembro
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o correo…" className="input-base pl-9" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="input-base sm:w-48">
          <option value="todos">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="vencido">Vencidos</option>
          <option value="suspendido">Suspendidos</option>
        </select>
      </div>

      <div className="card p-2">
        {members.isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={6} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No hay miembros que coincidan"
            description="Ajusta la búsqueda o los filtros, o registra un nuevo miembro."
            action={
              <Button
                onClick={() => {
                  setEditing(null);
                  setModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" /> Nuevo miembro
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-base-400 border-b border-base-800">
                  <th className="py-3 px-3 font-medium">Miembro</th>
                  <th className="py-3 px-3 font-medium">Plan</th>
                  <th className="py-3 px-3 font-medium">Ingreso</th>
                  <th className="py-3 px-3 font-medium">Vence</th>
                  <th className="py-3 px-3 font-medium">Estado</th>
                  <th className="py-3 px-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="border-b border-base-800/60 last:border-0 hover:bg-base-850/60">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-base-800 text-xs font-semibold text-base-200 shrink-0">
                          {initials(m.full_name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-base-100 font-medium truncate">{m.full_name}</p>
                          <p className="text-xs text-base-400 truncate">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-base-300">{m.plan_name ?? '—'}</td>
                    <td className="py-3 px-3 text-base-300">{formatDate(m.joined_at)}</td>
                    <td className="py-3 px-3 text-base-300">{formatDate(m.expires_at)}</td>
                    <td className="py-3 px-3">
                      <Badge tone={statusTone[m.status]}>{m.status}</Badge>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditing(m);
                            setModalOpen(true);
                          }}
                          className="btn-ghost !px-2 !py-2"
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar a ${m.full_name}?`)) removeMutation.mutate(m.id);
                          }}
                          className="btn-ghost !px-2 !py-2 hover:!text-danger"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <MemberFormModal open={modalOpen} onClose={() => setModalOpen(false)} member={editing} />
    </div>
  );
}
