const sampleContracts = [
  {
    brand: "Northstar Skincare",
    deliverable: "TikTok short draft",
    dueDate: "2026-06-12",
    status: "Ready for parser",
  },
  {
    brand: "Arc Studio",
    deliverable: "Instagram carousel",
    dueDate: "2026-06-18",
    status: "Awaiting upload",
  },
  {
    brand: "Luma Audio",
    deliverable: "YouTube dedicated video",
    dueDate: "2026-07-02",
    status: "Invoice pending",
  },
];

export default function ContractsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">
          Contract tracker
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Contracts</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
          This page is the review shell for Phase 3. The upload action will
          extract brand names, payout amounts, and deliverable dates into this
          table.
        </p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Upload contract PDF
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Parser wiring comes next; this keeps the dashboard route
              reviewable today.
            </p>
          </div>
          <button
            type="button"
            className="h-10 rounded-md bg-indigo-600 px-4 text-sm font-semibold text-white opacity-60"
            disabled
          >
            Upload coming next
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Brand
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Deliverable
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Due date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {sampleContracts.map((contract) => (
              <tr key={`${contract.brand}-${contract.dueDate}`}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                  {contract.brand}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                  {contract.deliverable}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                  {contract.dueDate}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                  {contract.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
