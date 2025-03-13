import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssVarsProvider } from '@mui/joy/styles';
import theme from './themes/theme';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import InventoryManagement from './components/Inventory/InventoryManagement';
import Suppliers from './components/Suppliers/Suppliers';
import Orders from './components/Orders/Orders';
import Reports from './components/Reports/Reports';
import AIInsights from './components/AI-Insights/AI-Insights';



const AppRoutes = () => {
    return (
        <CssVarsProvider theme={theme} defaultMode="light">
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/inventory" element={<InventoryManagement />} />
                        <Route path="/suppliers" element={<Suppliers />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/AI-Insights" element={<AIInsights />} />
                    </Routes>
                </Layout>
            </Router>
        </CssVarsProvider>
    );
}

export default AppRoutes;