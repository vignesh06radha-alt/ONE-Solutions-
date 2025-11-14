
import React, { useContext, useEffect, useState } from 'react';
import { AppContext, IAppContext } from '../../contexts/AppContext';
import Card from '../../components/Card';
import { MOCK_CREDIT_PACKAGES } from '../../constants';
import { CheckCircle, BarChart, Leaf, DollarSign } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Transaction } from '../../types';
import { toast } from 'react-hot-toast';

const chartData = [
  { name: 'Jan', fundsProvided: 4000, co2Offset: 2 },
  { name: 'Feb', fundsProvided: 3000, co2Offset: 1.5 },
  { name: 'Mar', fundsProvided: 5000, co2Offset: 2.5 },
  { name: 'Apr', fundsProvided: 7000, co2Offset: 3.5 },
  { name: 'May', fundsProvided: 6000, co2Offset: 3 },
  { name: 'Jun', fundsProvided: 8000, co2Offset: 4 },
];


const GreenCredits: React.FC = () => {
    const handleRequest = (packageName: string) => {
        toast.success(`Your request for the ${packageName} package has been sent to the government liaison. You will be contacted shortly.`);
    }
    return (
        <Card title="Request Green Credits Purchase">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                {MOCK_CREDIT_PACKAGES.map(pkg => (
                    <div key={pkg.name} className={`p-6 bg-gray-900 rounded-lg transform hover:-translate-y-2 transition-transform duration-300 ${pkg.popular ? 'border-2 border-green-500' : 'border border-gray-800'}`}>
                        {pkg.popular && <div className="text-xs font-bold text-green-400 mb-2">MOST POPULAR</div>}
                        <h3 className="text-2xl font-bold text-white">{pkg.name}</h3>
                        <p className="text-4xl font-extrabold my-4 text-green-400">${pkg.price.toLocaleString()}</p>
                        <p className="text-gray-400 mb-4">{pkg.credits.toLocaleString()} Credits</p>
                        <p className="text-sm mb-6 text-gray-500">{pkg.description}</p>
                        <button onClick={() => handleRequest(pkg.name)} className="w-full bg-green-500/90 text-black font-bold py-2 px-4 rounded-lg hover:bg-green-400 transition-colors">
                            Submit Request
                        </button>
                    </div>
                ))}
            </div>
             <div className="mt-6 p-4 bg-gray-900 rounded-lg text-center border border-gray-800">
                <h4 className="font-semibold text-white">Government Rate vs ONE Rate</h4>
                <p className="text-gray-400">Your contribution is amplified through our efficient, AI-optimized platform. Standard government projects cost up to $0.15/credit equivalent. Our rate is just ${MOCK_CREDIT_PACKAGES[0].rate.toFixed(2)}/credit.</p>
            </div>
        </Card>
    )
}

const ImpactDashboard: React.FC = () => {
    const { user } = useContext(AppContext) as IAppContext;
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        const fetchTransactions = async () => {
            if(user) {
                const data = await window.storage.get(`transactions:${user.id}`);
                setTransactions(data || []);
            }
        }
        fetchTransactions();
    }, [user]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <div className="flex items-center">
                        <DollarSign className="h-8 w-8 text-green-400 mr-4"/>
                        <div>
                            <p className="text-sm text-gray-400">Total Funds Provided</p>
                            <p className="text-2xl font-bold text-white">$128,000</p>
                        </div>
                    </div>
                </Card>
                 <Card>
                    <div className="flex items-center">
                        <BarChart className="h-8 w-8 text-yellow-400 mr-4"/>
                        <div>
                            <p className="text-sm text-gray-400">CO2 Offset (Tons)</p>
                            <p className="text-2xl font-bold text-white">16.5</p>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center">
                        <Leaf className="h-8 w-8 text-green-400 mr-4"/>
                        <div>
                            <p className="text-sm text-gray-400">Total Projects Funded</p>
                            <p className="text-2xl font-bold text-white">42</p>
                        </div>
                    </div>
                </Card>
            </div>
            <Card title="Monthly Impact">
                 <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF"/>
                        <YAxis stroke="#9CA3AF"/>
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}/>
                        <Legend />
                        <Bar dataKey="fundsProvided" name="Funds Provided ($)" fill="#34D399" />
                        <Bar dataKey="co2Offset" name="CO2 Offset (Tons)" fill="#FBBF24" />
                    </RechartsBarChart>
                </ResponsiveContainer>
            </Card>
            <Card title="Transaction History">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-900">
                            <tr>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Package</th>
                                <th scope="col" className="px-6 py-3">Amount</th>
                                <th scope="col" className="px-6 py-3">Credits Requested</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(tx => (
                                <tr key={tx.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 text-white">{new Date(tx.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{tx.packageName}</td>
                                    <td className="px-6 py-4">${tx.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4">{tx.creditsPurchased.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}

const CompanyDashboard: React.FC<{ view: string; setView: (view: string) => void }> = ({ view, setView }) => {
  switch (view) {
    case 'dashboard':
      return <ImpactDashboard />;
    case 'credits':
      return <GreenCredits />;
    case 'impact':
      return <ImpactDashboard />;
    default:
      return <ImpactDashboard />;
  }
};

export default CompanyDashboard;