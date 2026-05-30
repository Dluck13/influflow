'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    activeDeal: 0,
    upcomingDeliverables: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.error('Auth error:', userError);
          setLoading(false);
          return;
        }

        // Fetch brand deals
        const { data: deals, error: dealsError } = await supabase
          .from('brand_deals')
          .select('*')
          .eq('user_id', user.id);

        if (dealsError) {
          console.error('Error fetching deals:', dealsError);
        }

        // Fetch deliverables for the user's deals
        const { data: deliverables, error: deliverablesError } = await supabase
          .from('deliverables')
          .select('*')
          .in('deal_id', deals?.map(d => d.id) || []);

        if (deliverablesError) {
          console.error('Error fetching deliverables:', deliverablesError);
        }

        // Fetch invoices to calculate pending payments
        const { data: invoices, error: invoicesError } = await supabase
          .from('invoices')
          .select('amount, status')
          .in('deal_id', deals?.map(d => d.id) || []);

        if (invoicesError) {
          console.error('Error fetching invoices:', invoicesError);
        }

        const pendingPaymentAmount = invoices
          ?.filter(inv => inv.status === 'sent' || inv.status === 'overdue')
          .reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

        setStats({
          activeDeal: deals?.length || 0,
          upcomingDeliverables: deliverables?.filter(
            (d) => !d.is_completed
          ).length || 0,
          pendingPayments: pendingPaymentAmount,
        });
      } catch (err) {
        console.error('Unexpected error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [supabase]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Deals</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.activeDeal}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div>
              <p className="text-gray-500 text-sm font-medium">
                Upcoming Deliverables
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.upcomingDeliverables}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div>
              <p className="text-gray-500 text-sm font-medium">
                Pending Payments
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${stats.pendingPayments}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Getting Started
        </h2>
        <ul className="space-y-3 text-sm text-gray-800">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 font-bold text-indigo-600">✓</span>
            <span>Check out the Rate Calculator to estimate your pricing</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 font-bold text-indigo-600">✓</span>
            <span>Upload brand contracts to automatically extract deliverables</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 font-bold text-indigo-600">✓</span>
            <span>Generate and send professional invoices with one click</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
