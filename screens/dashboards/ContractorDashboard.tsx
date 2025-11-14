
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AppContext, IAppContext } from '../../contexts/AppContext';
import { Problem, Bid, ProblemStatus } from '../../types';
import Card from '../../components/Card';
import { Briefcase, CheckCircle, Clock, DollarSign, Search, Star, Award, Bot } from 'lucide-react';
import AIAnalysisResult from './shared/AIAnalysisResult';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';


const AvailableProjects: React.FC<{ onProjectSelect: (problem: Problem) => void }> = ({ onProjectSelect }) => {
    const { user } = useContext(AppContext) as IAppContext;
    const [allProjects, setAllProjects] = useState<Problem[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<Problem[]>([]);
    const [filter, setFilter] = useState<'recommended' | 'all'>('recommended');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            const problemIds = await window.storage.get('problems:list') || [];
            const problemPromises = problemIds.map((id: string) => window.storage.get(`problem:${id}`));
            const fetchedProblems: Problem[] = (await Promise.all(problemPromises))
                .filter(p => p && (p.status === ProblemStatus.Classified || p.status === ProblemStatus.Pending));
            setAllProjects(fetchedProblems);
            setLoading(false);
        };
        fetchProjects();
    }, []);

    useEffect(() => {
        if (filter === 'recommended') {
            const recommended = allProjects.filter(p => 
                user?.domains?.some(domain => p.aiAnalysis?.category.includes(domain))
            );
            setFilteredProjects(recommended);
        } else {
            setFilteredProjects(allProjects);
        }
    }, [allProjects, filter, user]);

    const isRecommended = (problem: Problem) => user?.domains?.some(domain => problem.aiAnalysis?.category.includes(domain));

    if(loading) return <Card>Loading projects...</Card>;

    return (
        <Card title="Available Projects Board">
             <div className="flex space-x-2 mb-4">
                <button onClick={() => setFilter('recommended')} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${filter === 'recommended' ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-400'}`}>Recommended For You</button>
                <button onClick={() => setFilter('all')} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${filter === 'all' ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-400'}`}>All Projects</button>
            </div>
            <div className="space-y-4">
                {filteredProjects.map(p => (
                    <div key={p.id} className="p-4 border border-gray-800 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 hover:border-green-500/30 hover:bg-gray-800/50">
                        <div>
                            <div className="flex items-center gap-3">
                                <h4 className="font-bold text-lg text-white">{p.aiAnalysis?.subcategory || 'Uncategorized Problem'}</h4>
                                {isRecommended(p) && <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">Recommended</span>}
                            </div>
                            <p className="text-sm text-gray-400 truncate max-w-md mt-1">{p.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm">
                                <span className="flex items-center text-yellow-400"><Star className="h-4 w-4 mr-1"/> Severity: {p.aiAnalysis?.severity || 'N/A'}</span>
                                <span className="flex items-center text-green-400"><Bot className="h-4 w-4 mr-1"/> AI Match: {Math.floor(Math.random() * 20 + 80)}%</span>
                            </div>
                        </div>
                        <button onClick={() => onProjectSelect(p)} className="bg-green-500/90 text-black font-bold py-2 px-4 rounded-lg hover:bg-green-400 transition-colors whitespace-nowrap">
                            View & Bid
                        </button>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const ProjectDetails: React.FC<{ problem: Problem; onBack: () => void; refreshBids: () => void }> = ({ problem, onBack, refreshBids }) => {
    const { user } = useContext(AppContext) as IAppContext;
    const [amount, setAmount] = useState('');
    const [timeline, setTimeline] = useState('');
    const [proposal, setProposal] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleSubmitBid = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const newBid: Bid = {
            id: uuidv4(),
            problemId: problem.id,
            contractorId: user!.id,
            contractorName: user!.name,
            amount: parseFloat(amount),
            timeline,
            proposal,
            timestamp: new Date().toISOString()
        };

        try {
            let bids = await window.storage.get(`bids:${problem.id}`) || [];
            bids.push(newBid);
            await window.storage.set(`bids:${problem.id}`, bids, true);
            toast.success("Bid submitted successfully! AI evaluation will begin shortly.");
            refreshBids();
            onBack();
        } catch (error) {
            toast.error("Failed to submit bid.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="text-green-400 hover:underline">{"<"} Back to Projects</button>
            <Card title="Project Details">
                {problem.aiAnalysis ? <AIAnalysisResult analysis={problem.aiAnalysis} /> : <p>No AI analysis available yet.</p>}
            </Card>
            <Card title="Submit Your Bid">
                <form onSubmit={handleSubmitBid} className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium">Bid Amount ($)</label>
                            <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 block w-full rounded-md border-gray-700 bg-gray-900 shadow-sm focus:border-green-500 focus:ring-green-500" required />
                        </div>
                        <div>
                            <label htmlFor="timeline" className="block text-sm font-medium">Estimated Timeline</label>
                            <input type="text" id="timeline" value={timeline} onChange={e => setTimeline(e.target.value)} className="mt-1 block w-full rounded-md border-gray-700 bg-gray-900 shadow-sm focus:border-green-500 focus:ring-green-500" placeholder="e.g., 3-5 business days" required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="proposal" className="block text-sm font-medium">Proposal</label>
                        <textarea id="proposal" value={proposal} onChange={e => setProposal(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-gray-700 bg-gray-900 shadow-sm focus:border-green-500 focus:ring-green-500" placeholder="Briefly outline your plan..." required />
                    </div>
                    <button type="submit" className="w-full bg-green-500/90 text-black font-bold py-2 px-4 rounded-lg hover:bg-green-400 transition-colors" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Bid'}
                    </button>
                </form>
            </Card>
        </div>
    )
}

const MyBids: React.FC = () => {
    const { user, AIService } = useContext(AppContext) as IAppContext;
    const [bids, setBids] = useState<Bid[]>([]);
    const [evaluatedBids, setEvaluatedBids] = useState<Record<string, Bid[]>>({});
    const [loading, setLoading] = useState(true);

    const fetchAndEvaluateBids = useCallback(async () => {
        setLoading(true);
        const problemIds = await window.storage.get('problems:list') || [];
        let userBids: Bid[] = [];
        let bidsByProblem: Record<string, Bid[]> = {};

        for(const pid of problemIds) {
            const problemBids: Bid[] = await window.storage.get(`bids:${pid}`) || [];
            if(problemBids.length > 0) {
                 bidsByProblem[pid] = problemBids;
                 const userBid = problemBids.find(b => b.contractorId === user!.id);
                 if(userBid) userBids.push(userBid);
            }
        }
        setBids(userBids);
        
        // Simulate AI evaluation
        for(const pid in bidsByProblem) {
            if(bidsByProblem[pid].length > 1 && !bidsByProblem[pid][0].aiScore) { // only evaluate if not already scored
                 toast.loading(`AI is evaluating bids for problem ${pid.substring(0,4)}...`, { id: pid });
                 const { ranking } = await AIService.evaluateBids(pid, bidsByProblem[pid]);
                 await window.storage.set(`bids:${pid}`, ranking, true);
                 toast.success(`AI evaluation complete for problem ${pid.substring(0,4)}!`, { id: pid });
                 setEvaluatedBids(prev => ({...prev, [pid]: ranking}));
            } else {
                 setEvaluatedBids(prev => ({...prev, [pid]: bidsByProblem[pid]}));
            }
        }
        setLoading(false);
    }, [user, AIService]);

     useEffect(() => {
        fetchAndEvaluateBids();
    }, [fetchAndEvaluateBids]);


    const getMyBidDetails = (bid: Bid) => {
        const problemBids = evaluatedBids[bid.problemId];
        if(!problemBids) return { rank: "N/A", total: "N/A", score: "N/A" };
        const myEvaluatedBid = problemBids.find(b => b.id === bid.id);
        return {
            rank: myEvaluatedBid?.aiRanking || 'Pending',
            total: problemBids.length,
            score: myEvaluatedBid?.aiScore || 'Pending'
        }
    }

    return (
        <Card title="My Bids">
            <div className="space-y-4">
                {bids.map(bid => {
                    const { rank, total, score } = getMyBidDetails(bid);
                    return (
                        <div key={bid.id} className="p-4 border border-gray-800 rounded-lg">
                           <h4 className="font-bold text-white">Bid for Problem #{bid.problemId.substring(0,8)}</h4>
                           <p className="text-sm my-2 text-gray-400">{bid.proposal}</p>
                           <div className="flex flex-wrap gap-4 text-sm">
                               <span className="text-gray-300">Amount: ${bid.amount}</span>
                               <span className="text-gray-300">Timeline: {bid.timeline}</span>
                               <span className="font-semibold text-yellow-400">AI Rank: {rank} of {total}</span>
                               <span className="font-semibold text-green-400">AI Score: {score}/100</span>
                           </div>
                        </div>
                    )
                })}
                 {bids.length === 0 && <p className="text-gray-500">You haven't placed any bids yet.</p>}
            </div>
        </Card>
    );
}

const ContractorDashboard: React.FC<{ view: string; setView: (view: string) => void }> = ({ view, setView }) => {
  const { user } = useContext(AppContext) as IAppContext;
  const [selectedProject, setSelectedProject] = useState<Problem | null>(null);

  const MainDashboard = () => (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
                <h4 className="text-lg font-semibold text-gray-400">AI Performance Score</h4>
                <p className="text-5xl font-bold text-green-400 my-2">{user?.aiPerformanceScore || 'N/A'}</p>
                <p className="text-xs text-gray-500">Based on completion quality & timeliness.</p>
            </Card>
             <Card>
                <h4 className="text-lg font-semibold text-gray-400">Active Contracts</h4>
                <p className="text-5xl font-bold text-white my-2">3</p>
            </Card>
             <Card>
                <h4 className="text-lg font-semibold text-gray-400">Total Earnings</h4>
                <p className="text-5xl font-bold text-white my-2">$12,450</p>
            </Card>
        </div>
        <AvailableProjects onProjectSelect={setSelectedProject} />
    </div>
  );

  if (selectedProject) {
      return <ProjectDetails problem={selectedProject} onBack={() => setSelectedProject(null)} refreshBids={() => {}} />;
  }

  switch (view) {
    case 'dashboard':
      return <MainDashboard />;
    case 'projects':
      return <AvailableProjects onProjectSelect={setSelectedProject} />;
    case 'my-bids':
        return <MyBids />
    default:
      return <MainDashboard />;
  }
};

export default ContractorDashboard;