import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import { getDailyAnalytics } from '../api';

function Analytics() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics(selectedDate);
  }, [selectedDate]);

  const fetchAnalytics = async (dateParam) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDailyAnalytics(dateParam);
      setAnalyticsData(response.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Could not load analytics summary. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-w-0 px-6 sm:px-10 py-8" style={{ backgroundColor: '#F5F8FB' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');
      `}</style>

      {/* Header & Date Picker */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2
            className="text-2xl mb-1"
            style={{ color: '#0F2F52', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}
          >
            System Analytics
          </h2>
          <p className="text-sm" style={{ color: '#5C6B7A', fontFamily: "'Inter', sans-serif" }}>
            Daily revenue totals, order volume, and store rankings across Stockline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="analytics-date"
            className="text-xs font-medium"
            style={{ color: '#5C6B7A', fontFamily: "'IBM Plex Mono', monospace" }}
          >
            SELECT DATE:
          </label>
          <input
            id="analytics-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3.5 py-2 text-sm rounded-sm bg-white border- cursor-pointer focus:outline-none"
            style={{
              borderColor: '#D3DEEA',
              color: '#0F2F52',
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          />
        </div>
      </div>

      {loading && (
        <p className="text-sm" style={{ color: '#5C6B7A', fontFamily: "'Inter', sans-serif" }}>
          Loading daily system analytics…
        </p>
      )}

      {error && (
        <div
          className="mb-6 px-4 py-3 rounded-sm text-sm max-w-md"
          style={{
            backgroundColor: '#FBEAE9',
            color: '#B3261E',
            border: '1px solid #EFC7C4',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && analyticsData && (
        <>
          {/* System KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div
              className="bg-white p-5 rounded-sm"
              style={{ border: '1.5px solid #DCE5EF' }}
            >
              <span
                className="text-xs block mb-2 border-amber-500 "
                style={{ color: '#8FA0B3', fontFamily: "'IBM Plex Mono', monospace" }}
              >
                TOTAL SYSTEM REVENUE
              </span>
              <span
                className="text-2xl font-medium "
                style={{ color: '#0F2F52',fontFamily: "'Space Grotesk', sans-serif" }}
              >
                PKR {analyticsData.totalSystemRevenue != null ? Number(analyticsData.totalSystemRevenue).toFixed(2) : '0.00'}
              </span>
            </div>

            <div
              className="bg-white p-5 rounded-sm"
              style={{ border: '1.5px solid #DCE5EF' }}
            >
              <span
                className="text-xs block mb-2"
                style={{ color: '#8FA0B3', fontFamily: "'IBM Plex Mono', monospace" }}
              >
                TOTAL SYSTEM ORDERS
              </span>
              <span
                className="text-2xl font-medium"
                style={{ color: '#0F2F52', fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {analyticsData.totalSystemOrders ?? 0}
              </span>
            </div>

            <div
              className="bg-white p-5 rounded-sm"
              style={{ border: '1.5px solid #DCE5EF' }}
            >
              <span
                className="text-xs block mb-2"
                style={{ color: '#8FA0B3', fontFamily: "'IBM Plex Mono', monospace" }}
              >
                TOP PERFORMING STORE
              </span>
              <span
                className="text-xl font-medium truncate block"
                style={{ color: '#0F2F52', fontFamily: "'Space Grotesk', sans-serif" }}
                title={analyticsData.topStoreName}
              >
                {analyticsData.topStoreName || 'N/A'}
              </span>
            </div>

            <div
              className="bg-white p-5 rounded-sm"
              style={{ border: '1.5px solid #DCE5EF' }}
            >
              <span
                className="text-xs block mb-2"
                style={{ color: '#8FA0B3', fontFamily: "'IBM Plex Mono', monospace" }}
              >
                TOP STORE REVENUE
              </span>
              <span
                className="text-2xl font-medium"
                style={{ color: '#137333', fontFamily: "'Space Grotesk', sans-serif" }}
              >
                PKR {analyticsData.topStoreRevenue != null ? Number(analyticsData.topStoreRevenue).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>

          {/* Revenue Bar Chart */}
          <div
            className="bg-white p-6 rounded-sm mb-8"
            style={{ border: '1.5px solid #DCE5EF' }}
          >
            <h3
              className="text-base mb-4"
              style={{ color: '#0F2F52', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}
            >
              Store Revenue Comparison
            </h3>

            {analyticsData.storeRankings && analyticsData.storeRankings.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData.storeRankings}
                    margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF2F7" />
                    <XAxis
                      dataKey="storeName"
                      stroke="#8FA0B3"
                      fontSize={12}
                      tickLine={false}
                      fontFamily="IBM Plex Mono, monospace"
                    />
                    <YAxis
                      stroke="#8FA0B3"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      fontFamily="IBM Plex Mono, monospace"
                      tickFormatter={(value) => `PKR ${value}`}
                    />
                    <Tooltip
                      formatter={(value) => [`PKR ${Number(value).toFixed(2)}`, 'Revenue']}
                      contentStyle={{
                        backgroundColor: '#0F2F52',
                        borderColor: '#0F2F52',
                        borderRadius: '2px',
                        color: '#FFFFFF',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px',
                      }}
                      itemStyle={{ color: '#FFFFFF' }}
                    />
                    <Bar dataKey="totalRevenue" radius={[4, 4, 0, 0]}>
                      {analyticsData.storeRankings.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#1D4E89' : '#5C82A6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm py-8 text-center" style={{ color: '#5C6B7A', fontFamily: "'Inter', sans-serif" }}>
                No sales records found for {selectedDate}.
              </p>
            )}
          </div>

          {/* Store Rankings Table */}
          <div
            className="bg-white rounded-sm overflow-hidden"
            style={{ border: '1.5px solid #DCE5EF' }}
          >
            <div className="px-6 py-4" style={{ borderBottom: '1px solid #EEF2F7' }}>
              <h3
                className="text-base"
                style={{ color: '#0F2F52', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}
              >
                Store Rankings Breakdown
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ backgroundColor: '#F5F8FB', borderBottom: '1px solid #DCE5EF' }}>
                    <th className="px-6 py-3 text-xs font-medium" style={{ color: '#8FA0B3', fontFamily: "'IBM Plex Mono', monospace" }}>
                      RANK
                    </th>
                    <th className="px-6 py-3 text-xs font-medium" style={{ color: '#8FA0B3', fontFamily: "'IBM Plex Mono', monospace" }}>
                      STORE NAME
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-right" style={{ color: '#8FA0B3', fontFamily: "'IBM Plex Mono', monospace" }}>
                      TOTAL ORDERS
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-right" style={{ color: '#8FA0B3', fontFamily: "'IBM Plex Mono', monospace" }}>
                      TOTAL REVENUE
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.storeRankings && analyticsData.storeRankings.length > 0 ? (
                    analyticsData.storeRankings.map((rank, index) => (
                      <tr
                        key={rank.storeId}
                        style={{
                          borderBottom: index !== analyticsData.storeRankings.length - 1 ? '1px solid #EEF2F7' : 'none',
                        }}
                      >
                        <td className="px-6 py-4 text-sm font-medium" style={{ color: '#1D4E89', fontFamily: "'IBM Plex Mono', monospace" }}>
                          #{index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium" style={{ color: '#0F2F52', fontFamily: "'Inter', sans-serif" }}>
                          {rank.storeName}
                        </td>
                        <td className="px-6 py-4 text-sm text-right" style={{ color: '#5C6B7A', fontFamily: "'IBM Plex Mono', monospace" }}>
                          {rank.totalOrders}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-right" style={{ color: '#0F2F52', fontFamily: "'IBM Plex Mono', monospace" }}>
                          PKR {Number(rank.totalRevenue).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-sm" style={{ color: '#5C6B7A', fontFamily: "'Inter', sans-serif" }}>
                        No store sales recorded for this date.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Analytics;