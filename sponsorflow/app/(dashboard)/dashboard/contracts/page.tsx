"use client";

import { useActionState } from "react";
import {
  parseContract,
  type ParseContractState,
} from "@/app/actions/parse-contract";

const initialState: ParseContractState = {
  status: "idle",
};

export default function ContractsPage() {
  const [state, formAction, pending] = useActionState(
    parseContract,
    initialState
  );

  const deliverables = state.contract?.deliverables || [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">
          Contract parser
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Contracts</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-700">
          Upload an influencer agreement PDF to extract brand, payout, payment
          terms, and deliverable deadlines into SponsorFlow.
        </p>
      </div>

      <form action={formAction} className="rounded-lg bg-white p-6 shadow">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <label className="block">
            <span className="text-sm font-semibold text-gray-900">
              Contract PDF
            </span>
            <input
              type="file"
              name="contract"
              accept="application/pdf"
              required
              className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-950 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </label>

          <button
            type="submit"
            disabled={pending}
            className="h-11 rounded-md bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Parsing..." : "Parse and save"}
          </button>
        </div>

        {state.message && (
          <div
            className={`mt-5 rounded-md border px-4 py-3 text-sm ${
              state.status === "success"
                ? "border-green-200 bg-green-50 text-green-900"
                : "border-red-200 bg-red-50 text-red-900"
            }`}
          >
            {state.message}
          </div>
        )}
      </form>

      {state.contract && (
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <section className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-bold text-gray-900">
              Parsed deal
            </h2>

            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="font-semibold text-gray-500">Brand</dt>
                <dd className="mt-1 text-gray-950">
                  {state.contract.brandName}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-500">Deal value</dt>
                <dd className="mt-1 text-gray-950">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: state.contract.currency,
                    maximumFractionDigits: 2,
                  }).format(state.contract.dealValue)}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-500">Payment terms</dt>
                <dd className="mt-1 text-gray-950">
                  Net {state.contract.paymentTermsDays}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-500">Saved deal ID</dt>
                <dd className="mt-1 break-all text-gray-950">
                  {state.dealId}
                </dd>
              </div>
            </dl>
          </section>

          <section className="overflow-hidden rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">
                Deliverables
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Platform
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Content
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Due date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Caption requirements
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {deliverables.map((deliverable, index) => (
                    <tr
                      key={`${deliverable.platform}-${deliverable.dueDate}-${index}`}
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-950">
                        {deliverable.platform}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800">
                        {deliverable.contentType}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800">
                        {deliverable.dueDate}
                      </td>
                      <td className="min-w-72 px-6 py-4 text-sm text-gray-800">
                        {deliverable.captionRequirements || "None listed"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
