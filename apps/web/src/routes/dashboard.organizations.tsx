import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/organizations')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/organizations"!</div>
}
