import { createFileRoute, useParams } from "@tanstack/react-router";
import { Suspense } from "react";
import { DoctorCard } from "./-components/doctor-card.tsx";
import { doctorsQuery } from "./-queries";
import {
  useQuery,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { usePaginationSearchParams } from "@/hooks/use-pagination-searchparams.ts";
import { Treaty } from "@elysiajs/eden";
import client from "@/api/index.ts";

type Search = {
  page: number;
  perPage: number;
};
export const Route = createFileRoute("/dashboard/clinics/$clinicId/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): Search => {
    return {
      page: Number(search?.page ?? 1),
      perPage: Number(search?.perpage ?? 10),
    } as Search;
  },
  loader: async ({ context, location, params }) => {
    const search: Search = location.search as Search;
    return context.queryClient.ensureQueryData(
      doctorsQuery(search.page, search.perPage, params.clinicId),
    );
  },
});

function RouteComponent() {
  const { clinicId } = useParams({ from: "/dashboard/clinics/$clinicId/" });
  const [pagination, setPagination] = usePaginationSearchParams();
  const { data } = useSuspenseQuery(
    doctorsQuery(pagination.pageIndex, pagination.pageSize, clinicId),
  );
  return (
    <div>
      <div className="w-full flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">
            Clínicas
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualize e gerencie clínicas ativas.
          </p>
        </div>
      </div>

      <Suspense fallback={<div>Carregando...</div>}>
        <div className="grid grid-cols-3 gap-4">
          {data?.list.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              name={doctor.name}
              status={doctor.status === "active" ? "active" : "suspended"}
              specialties={doctor.specialties.map((s) => s.name)}
              govId={doctor.govId!}
            />
          ))}
        </div>
      </Suspense>
    </div>
  );
}
