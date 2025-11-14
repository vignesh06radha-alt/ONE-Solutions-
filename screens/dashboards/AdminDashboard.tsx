
import React, { useEffect, useState } from 'react';
import Card from '../../components/Card';
import { Problem } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Users, Flag, Bot, AlertCircle } from 'lucide-react';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({ users: 0, problems: 0, aiAnalyzed: 0 });
    const [categoryData, setCategoryData] = useState<any[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            const users = await window.storage.get('users:list') || [];
            const problemIds = await window.storage.get('problems:list') || [];
            const problemPromises = problemIds.map((id: string) => window.storage.get(`problem:${id}`));
            const allProblems: Problem[] = (await Promise.all(problemPromises)).filter(p => p != null);

            const aiAnalyzed = allProblems.filter(p => p.aiProcessingStatus === 'complete').length;

            const categories = allProblems.reduce((acc, p) => {
                const category = p.aiAnalysis?.category || 'Uncategorized';
                acc[category] = (acc[category] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            setCategoryData(Object.entries(categories).map(([name, value]) => ({ name, value })));
            setStats({ users: users.length, problems: problemIds.length, aiAnalyzed });
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Analytics</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <div className="flex items-center">
                        <Users className="h-8 w-8 text-blue-500 mr-4"/>
                        <div>
                            <p className="text-sm text-gray-500">Total Users</p>
                            <p className="text-2xl font-bold">{stats.users}</p>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center">
                        <Flag className="h-8 w-8 text-green-500 mr-4"/>
                        <div>
                            <p className="text-sm text-gray-500">Total Reports</p>
                            <p className="text-2xl font-bold">{stats.problems}</p>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center">
                        <Bot className="h-8 w-8 text-indigo-500 mr-4"/>
                        <div>
                            <p className="text-sm text-gray-500">AI Analyzed</p>
                            <p className="text-2xl font-bold">{stats.aiAnalyzed}</p>
                        </div>
                    </div>
                </Card>
                 <Card>
                    <div className="flex items-center">
                        <AlertCircle className="h-8 w-8 text-red-500 mr-4"/>
                        <div>
                            <p className="text-sm text-gray-500">User Feedback Issues</p>
                            <p className="text-2xl font-bold">12</p>
                        </div>
                    </div>
                </Card>
            </div>
            <Card title="Problem Classification Distribution">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};

export default AdminDashboard;
