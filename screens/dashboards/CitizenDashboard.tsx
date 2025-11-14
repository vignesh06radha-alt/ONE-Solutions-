
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AppContext, IAppContext } from '../../contexts/AppContext';
// FIX: Import ProblemStatus to use enum values instead of strings for type safety.
import { Problem, Reward, UserRole, ProblemStatus } from '../../types';
import Card from '../../components/Card';
import { PlusCircle, Gift, List, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import AILoadingIndicator from '../../components/AILoadingIndicator';
import AIAnalysisResult from './shared/AIAnalysisResult';
import MyReports from './shared/MyReports';

interface CitizenDashboardProps {
  view: string;
  setView: (view: string) => void;
}

const ReportProblemForm: React.FC<{ onReportSubmitted: () => void }> = ({ onReportSubmitted }) => {
    const { user, AIService } = useContext(AppContext) as IAppContext;
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description) {
            toast.error("Description is required.");
            return;
        }
        setIsSubmitting(true);
        setAnalysisResult(null);

        const newProblem: Partial<Problem> = {
            id: uuidv4(),
            userId: user!.id,
            reporterName: user!.name,
            description,
            image: image || `https://picsum.photos/seed/${uuidv4()}/400/300`,
            location: { lat: 34.0522 + (Math.random() - 0.5) * 0.1, lng: -118.2437 + (Math.random() - 0.5) * 0.1 },
            timestamp: new Date().toISOString(),
            aiProcessingStatus: 'processing',
        };

        try {
            const analysis = await AIService.analyzeReport(newProblem);
            
            const fullProblem: Problem = {
                ...newProblem,
                status: ProblemStatus.Classified,
                aiProcessingStatus: 'complete',
                aiAnalysis: analysis
            } as Problem;
            
            const problemList = await window.storage.get('problems:list') || [];
            await window.storage.set('problems:list', [...problemList, fullProblem.id], true);
            await window.storage.set(`problem:${fullProblem.id}`, fullProblem, true);
            
            const currentUser = await window.storage.get(`user:${user!.id}`);
            currentUser.credits = (currentUser.credits || 0) + analysis.creditsAllocated;
            await window.storage.set(`user:${user!.id}`, currentUser, false);

            setAnalysisResult(analysis);
            toast.success(`Report submitted! You earned ${analysis.creditsAllocated} credits.`);
            onReportSubmitted();
        } catch (error) {
            console.error("AI Analysis failed:", error);
            toast.error("AI analysis failed. Please try again.");
            const failedProblem: Problem = {...newProblem, status: ProblemStatus.Pending, aiProcessingStatus: 'failed' } as Problem;
            const problemList = await window.storage.get('problems:list') || [];
            await window.storage.set('problems:list', [...problemList, failedProblem.id], true);
            await window.storage.set(`problem:${failedProblem.id}`, failedProblem, true);
        } finally {
            setIsSubmitting(false);
            setDescription('');
            setImage(null);
        }
    };

    if (analysisResult) {
        return (
            <Card title="AI Analysis Complete">
                <AIAnalysisResult analysis={analysisResult} />
                <button onClick={() => setAnalysisResult(null)} className="mt-4 w-full bg-green-500/90 text-black font-bold py-2 px-4 rounded-lg hover:bg-green-400 transition-colors">
                    Report Another Problem
                </button>
            </Card>
        );
    }

    return (
        <Card title="Report to AI Agent">
             <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300">Describe the issue</label>
                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-gray-700 bg-gray-900 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="The AI works best with detailed descriptions..." required />
                </div>
                <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-300">Upload Image (Optional)</label>
                    <input type="file" id="image" onChange={handleImageUpload} accept="image/*" className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-500/10 file:text-green-400 hover:file:bg-green-500/20"/>
                    {image && <img src={image} alt="Preview" className="mt-2 rounded-lg max-h-48" />}
                </div>
                 {isSubmitting ? <AILoadingIndicator /> :
                    <button type="submit" className="w-full flex justify-center items-center bg-green-500/90 text-black font-bold py-3 px-4 rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50" disabled={isSubmitting}>
                        Submit for AI Analysis
                    </button>
                 }
            </form>
        </Card>
    );
};

const RewardsMarketplace: React.FC = () => {
    const { user } = useContext(AppContext) as IAppContext;
    const [rewards, setRewards] = useState<Reward[]>([]);

    useEffect(() => {
        const fetchRewards = async () => {
            const data = await window.storage.get('rewards:catalog');
            setRewards(data || []);
        }
        fetchRewards();
    }, []);
    
    const handleRedeem = async (reward: Reward) => {
        const currentUser = await window.storage.get(`user:${user!.id}`);
        if ((currentUser.credits || 0) < reward.cost) {
            toast.error("Not enough credits!");
            return;
        }
        currentUser.credits -= reward.cost;
        await window.storage.set(`user:${user!.id}`, currentUser, false);
        toast.success(`You redeemed "${reward.title}"!`);
    }

    return (
        <Card title="Rewards Marketplace">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((reward, index) => (
                    <div key={reward.id} 
                        className="p-6 bg-gray-900 border border-gray-800 rounded-lg flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300"
                        style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s backwards` }}
                    >
                        <div className="p-4 bg-yellow-400/10 rounded-full mb-4">
                           <reward.icon className="h-10 w-10 text-yellow-400" />
                        </div>
                        <h4 className="font-semibold text-lg text-white">{reward.title}</h4>
                        <p className="text-sm text-gray-400 my-2 flex-grow">{reward.description}</p>
                        <button onClick={() => handleRedeem(reward)} className="mt-auto w-full bg-yellow-400/90 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-300 transition-colors">
                            Redeem ({reward.cost} credits)
                        </button>
                    </div>
                ))}
            </div>
             <style>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </Card>
    )
}

const CitizenDashboard: React.FC<CitizenDashboardProps> = ({ view, setView }) => {
  const { user } = useContext(AppContext) as IAppContext;
  const [localUser, setLocalUser] = useState(user);

  const refreshUserData = useCallback(async () => {
        if(user) {
            const updatedUser = await window.storage.get(`user:${user.id}`);
            setLocalUser(updatedUser);
        }
  }, [user]);

  useEffect(() => {
    refreshUserData();
  }, [view, refreshUserData]);

  const MainDashboard = () => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 space-y-4">
                <h4 className="text-xl font-semibold text-gray-200">Welcome, {localUser?.name}</h4>
                <p className="text-gray-400">Your actions are making a real difference. Report problems to earn credits and help us build a better community together.</p>
                <div className="flex items-start space-x-6 pt-4">
                    <div className="text-center">
                        <p className="text-5xl font-bold text-green-400 my-2">{localUser?.credits || 0}</p>
                        <h4 className="font-semibold text-gray-400">My One Credits</h4>
                    </div>
                     <div className="flex flex-col space-y-4">
                        <button onClick={() => setView('report')} className="flex items-center text-lg font-semibold text-green-400 hover:text-green-300 transition-colors group">
                            Report to AI Agent <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button onClick={() => setView('rewards')} className="flex items-center text-lg font-semibold text-yellow-400 hover:text-yellow-300 transition-colors group">
                           Browse Rewards <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </Card>
             <Card className="flex flex-col items-center justify-center text-center bg-green-500/10 border-green-500/30 hover:bg-green-500/20 transition-all cursor-pointer" onClick={() => setView('my-reports')}>
                <List className="h-12 w-12 mb-2 text-green-400" />
                <h4 className="text-2xl font-bold text-white">My Reports</h4>
                <p className="text-gray-400">Track the status of your submissions.</p>
            </Card>
        </div>
        <MyReports limit={3} />
    </div>
  );

  switch (view) {
    case 'dashboard':
      return <MainDashboard />;
    case 'report':
      return <ReportProblemForm onReportSubmitted={refreshUserData} />;
    case 'my-reports':
      return <MyReports />;
    case 'rewards':
        return <RewardsMarketplace />;
    default:
      return <MainDashboard />;
  }
};

export default CitizenDashboard;