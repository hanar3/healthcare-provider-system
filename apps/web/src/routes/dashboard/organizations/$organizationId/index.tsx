import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Upload } from "lucide-react";
import { beneficiariesQuery } from "./-queries";
import { Suspense } from "react";
import { BeneficiariesDataTable } from "./-components/data-table";

type BeneficiarySearch = {
  page: number;
  perPage: number;
};

export const Route = createFileRoute(
  "/dashboard/organizations/$organizationId/",
)({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): BeneficiarySearch => {
    return {
      page: Number(search?.page ?? 1),
      perPage: Number(search?.perpage ?? 10),
    } as BeneficiarySearch;
  },
  loader: async ({ context, location }) => {
    const search: BeneficiarySearch = location.search as BeneficiarySearch;
    return context.queryClient.ensureQueryData(
      beneficiariesQuery(search.page, search.perPage),
    );
  },
});

function RouteComponent() {
  return (
    <div>
      <div className="w-full flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">
            Empresas
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualize e gerencie empresas ativas.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Upload className="h-4 w-4" />
            Importar CSV
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar empresa
          </Button>
        </div>
      </div>

      <Suspense fallback={<div>Carregando...</div>}>
        <BeneficiariesDataTable />
      </Suspense>
    </div>
  );
}
