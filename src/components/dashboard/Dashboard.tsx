import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  Truck, 
  Factory,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { formatCurrency } from '../../utils/helpers';

const Dashboard: React.FC = () => {
  const { state, getDashboardStats } = useData();
  const stats = getDashboardStats();

  const statCards = [
    {
      title: 'Total Bilties Today',
      value: stats.totalBiltiesToday,
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Vehicles',
      value: stats.totalVehiclesActive,
      icon: <Truck className="w-6 h-6" />,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Advance Paid',
      value: formatCurrency(stats.totalAdvancePaid),
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Net Outstanding',
      value: formatCurrency(stats.netOutstanding),
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const recentBilties = state.bilties.slice(-5).reverse();
  const pendingBilling = state.billingRecords.filter(record => record.status === 'Pending').slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <div className={stat.textColor}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Supplier Dispatch Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Dispatch Distribution</h3>
        <div className="space-y-4">
          {Object.entries(stats.supplierDispatchPercentage).map(([supplier, percentage]) => (
            <div key={supplier} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Factory className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">{supplier}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600 w-10 text-right">
                  {percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bilties */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bilties</h3>
          <div className="space-y-3">
            {recentBilties.map((bilty) => {
              const seller = state.sellers.find(s => s.id === bilty.sellerId);
              return (
                <div key={bilty.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{bilty.biltyNumber}</p>
                    <p className="text-sm text-gray-600">{seller?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{bilty.vehicleNo}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      bilty.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      bilty.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {bilty.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Billing */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Billing</h3>
          <div className="space-y-3">
            {pendingBilling.map((record) => {
              const seller = state.sellers.find(s => s.id === record.sellerId);
              return (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{record.vehicleNo}</p>
                    <p className="text-sm text-gray-600">{seller?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(record.netAmount)}</p>
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;