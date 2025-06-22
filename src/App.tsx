import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import LoginForm from './components/auth/LoginForm';
import Layout from './components/common/Layout';
import Dashboard from './components/dashboard/Dashboard';
import SellerList from './components/sellers/SellerList';
import SellerForm from './components/sellers/SellerForm';
import SupplierList from './components/suppliers/SupplierList';
import SupplierForm from './components/suppliers/SupplierForm';
import BiltyList from './components/bilties/BiltyList';
import BiltyForm from './components/bilties/BiltyForm';
import VehicleList from './components/vehicles/VehicleList';
import VehicleForm from './components/vehicles/VehicleForm';
import ScheduleList from './components/schedules/ScheduleList';
import ScheduleForm from './components/schedules/ScheduleForm';
import BillingList from './components/billing/BillingList';
import { Seller, Supplier, Bilty, Vehicle, Schedule } from './types';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [showSellerForm, setShowSellerForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showBiltyForm, setShowBiltyForm] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingSeller, setEditingSeller] = useState<Seller | undefined>();
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>();
  const [editingBilty, setEditingBilty] = useState<Bilty | undefined>();
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>();
  const [editingSchedule, setEditingSchedule] = useState<Schedule | undefined>();

  if (!user) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      
      case 'sellers':
        return (
          <>
            <SellerList
              onAddSeller={() => {
                setEditingSeller(undefined);
                setShowSellerForm(true);
              }}
              onEditSeller={(seller) => {
                setEditingSeller(seller);
                setShowSellerForm(true);
              }}
            />
            {showSellerForm && (
              <SellerForm
                seller={editingSeller}
                onClose={() => {
                  setShowSellerForm(false);
                  setEditingSeller(undefined);
                }}
              />
            )}
          </>
        );
      
      case 'suppliers':
        return (
          <>
            <SupplierList
              onAddSupplier={() => {
                setEditingSupplier(undefined);
                setShowSupplierForm(true);
              }}
              onEditSupplier={(supplier) => {
                setEditingSupplier(supplier);
                setShowSupplierForm(true);
              }}
            />
            {showSupplierForm && (
              <SupplierForm
                supplier={editingSupplier}
                onClose={() => {
                  setShowSupplierForm(false);
                  setEditingSupplier(undefined);
                }}
              />
            )}
          </>
        );
      
      case 'bilties':
        return (
          <>
            <BiltyList
              onAddBilty={() => {
                setEditingBilty(undefined);
                setShowBiltyForm(true);
              }}
              onEditBilty={(bilty) => {
                setEditingBilty(bilty);
                setShowBiltyForm(true);
              }}
            />
            {showBiltyForm && (
              <BiltyForm
                bilty={editingBilty}
                onClose={() => {
                  setShowBiltyForm(false);
                  setEditingBilty(undefined);
                }}
              />
            )}
          </>
        );
      
      case 'vehicles':
        return (
          <>
            <VehicleList
              onAddVehicle={() => {
                setEditingVehicle(undefined);
                setShowVehicleForm(true);
              }}
              onEditVehicle={(vehicle) => {
                setEditingVehicle(vehicle);
                setShowVehicleForm(true);
              }}
            />
            {showVehicleForm && (
              <VehicleForm
                vehicle={editingVehicle}
                onClose={() => {
                  setShowVehicleForm(false);
                  setEditingVehicle(undefined);
                }}
              />
            )}
          </>
        );
      
      case 'schedules':
        return (
          <>
            <ScheduleList
              onAddSchedule={() => {
                setEditingSchedule(undefined);
                setShowScheduleForm(true);
              }}
              onEditSchedule={(schedule) => {
                setEditingSchedule(schedule);
                setShowScheduleForm(true);
              }}
            />
            {showScheduleForm && (
              <ScheduleForm
                schedule={editingSchedule}
                onClose={() => {
                  setShowScheduleForm(false);
                  setEditingSchedule(undefined);
                }}
              />
            )}
          </>
        );
      
      case 'billing':
        return <BillingList />;
      
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderContent()}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;