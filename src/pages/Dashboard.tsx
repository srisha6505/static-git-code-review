/**
 * Main dashboard page component.
 * Orchestrates hooks and feature components for the repository review interface.
 * @module pages/Dashboard
 */

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Github, GitCommit, GitPullRequest, Folder, AlertCircle } from 'lucide-react';

import { Button, Modal, SpeedGauge } from '../components/ui';
import { Header, Sidebar } from '../components/layout';
import { KeyManagerModal } from '../components/features/settings';
import { 
  FileTree, 
  BranchList, 
  CommitList, 
  ContributorList,
  PullRequestList,
  RepoHeader,
  RepoSectionCards
} from '../components/features/repository';

import { useTheme, useRepository, useReview } from '../hooks';
import { ViewState } from '../types';

/**
 * Dashboard component props.
 */
interface DashboardProps {
  /** Callback when user logs out */
  onLogout: () => void;
}

/**
 * Main dashboard page for repository analysis.
 * Uses custom hooks for state management and renders feature components.
 * 
 * @param props.onLogout - Called when user clicks logout
 */
export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const { theme, toggleTheme } = useTheme();
  const repository = useRepository();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Modal states
  const [showBranchesModal, setShowBranchesModal] = useState(false);
  const [showContributorsModal, setShowContributorsModal] = useState(false);
  const [showCommitsModal, setShowCommitsModal] = useState(false);
  const [showPRsModal, setShowPRsModal] = useState(false);
  const [showReadmeModal, setShowReadmeModal] = useState(false);

  const review = useReview(repository.setViewState, setIsSidebarOpen);

  const handleReview = () => {
    if (!repository.repoInfo) return;
    review.handleReview({
      repo: repository.repoInfo,
      commits: repository.commits,
      pullRequests: repository.pullRequests,
      files: repository.files,
      contributors: repository.contributors,
      languages: repository.languages,
      readme: repository.readme,
    });
  };

  const handleReset = () => {
    repository.resetRepo();
    review.resetReview();
  };

  return (
    <div className="flex-1 flex flex-col bg-[hsl(var(--bg))] text-[hsl(var(--text-main))] overflow-hidden transition-colors duration-300 relative">
      
      <KeyManagerModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Modals */}
      <Modal isOpen={showBranchesModal} onClose={() => setShowBranchesModal(false)} title="All Branches">
        <BranchList branches={repository.branches} />
      </Modal>
      <Modal isOpen={showContributorsModal} onClose={() => setShowContributorsModal(false)} title="All Contributors">
        <ContributorList contributors={repository.contributors} totalCommits={repository.totalCommits} />
      </Modal>
      <Modal isOpen={showCommitsModal} onClose={() => setShowCommitsModal(false)} title="All Commits">
        <CommitList commits={repository.commits} aiAnalysis={review.aiAnalysis} />
      </Modal>
      <Modal isOpen={showPRsModal} onClose={() => setShowPRsModal(false)} title="Pull Requests">
        <PullRequestList pullRequests={repository.pullRequests} aiAnalysis={review.aiAnalysis} />
      </Modal>
      <Modal isOpen={showReadmeModal} onClose={() => setShowReadmeModal(false)} title="README.md">
        <div className="prose prose-invert max-w-none">
          {repository.readme ? <ReactMarkdown>{repository.readme}</ReactMarkdown> : <div className="text-[hsl(var(--text-dim))]">No Readme found.</div>}
        </div>
      </Modal>

      <Header theme={theme} onToggleTheme={toggleTheme} onOpenSettings={() => setShowSettings(true)} onLogout={onLogout} />

      <main className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
        <div className="max-w-[1800px] mx-auto w-full space-y-8">
          
          {/* URL Input */}
          {!repository.repoInfo && (
            <section className="space-y-4 pt-10">
              <h1 className="text-3xl font-bold text-[hsl(var(--text-main))]">Repository Intelligence</h1>
              <p className="text-[hsl(var(--text-dim))] max-w-2xl">Enter a public GitHub repository URL.</p>
              <form onSubmit={repository.handleFetch} className="flex gap-4 max-w-2xl mt-6">
                <div className="flex-1 relative group">
                  <Github className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--text-dim))] w-5 h-5 group-focus-within:text-[hsl(var(--primary))] transition-colors" />
                  <input type="text" placeholder="https://github.com/facebook/react" value={repository.url} onChange={e => repository.setUrl(e.target.value)} className="w-full bg-[hsl(var(--surface-1))] border border-[hsl(var(--surface-2))] rounded-lg py-3 pl-12 pr-4 text-[hsl(var(--text-main))] focus:outline-none focus:border-[hsl(var(--primary))] transition-all" />
                </div>
                <Button type="submit" isLoading={repository.viewState === ViewState.LOADING_REPO}>Fetch Data</Button>
              </form>
              {repository.error && (
                <div className="flex items-center gap-2 text-red-400 bg-red-900/10 p-4 rounded-lg border border-red-900/30 max-w-2xl">
                  <AlertCircle size={20} /><span>{repository.error}</span>
                </div>
              )}
            </section>
          )}

          {repository.repoInfo && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
              <RepoHeader repoInfo={repository.repoInfo} aiAnalysis={review.aiAnalysis} usageMetadata={review.usageMetadata} isReviewing={review.isReviewing} hasReviewMarkdown={!!review.reviewMarkdown} onReview={handleReview} onOpenSidebar={() => setIsSidebarOpen(true)} onReset={handleReset} onShowReadme={() => setShowReadmeModal(true)} />
              
              <RepoSectionCards branches={repository.branches} contributors={repository.contributors} languages={repository.languages} aiAnalysis={review.aiAnalysis} onShowBranches={() => setShowBranchesModal(true)} onShowContributors={() => setShowContributorsModal(true)} />

              {/* Commits & PRs Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[600px]">
                <div className="bg-[hsl(var(--surface-1))] border border-[hsl(var(--surface-2))] rounded-xl p-6 shadow-sm flex flex-col h-full overflow-hidden">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-[hsl(var(--surface-2))] shrink-0">
                    <h3 className="font-bold text-lg flex items-center gap-2"><GitCommit size={20} className="text-[hsl(var(--primary))]"/> Commits</h3>
                    <div className="flex items-center gap-4">
                      {review.aiAnalysis?.scores.commitQuality !== undefined && <SpeedGauge label="Quality" score={review.aiAnalysis.scores.commitQuality} size="sm" />}
                      <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => setShowCommitsModal(true)}>View All</Button>
                    </div>
                  </div>
                  <div className="overflow-y-auto custom-scrollbar flex-1 pr-2">
                    <CommitList commits={repository.commits.slice(0, 15)} aiAnalysis={review.aiAnalysis} />
                  </div>
                </div>
                <div className="bg-[hsl(var(--surface-1))] border border-[hsl(var(--surface-2))] rounded-xl p-6 shadow-sm flex flex-col h-full overflow-hidden">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-[hsl(var(--surface-2))] shrink-0">
                    <h3 className="font-bold text-lg flex items-center gap-2"><GitPullRequest size={20} className="text-[hsl(var(--primary))]"/> Pull Requests</h3>
                    <div className="flex items-center gap-4">
                      {review.aiAnalysis?.scores.prQuality !== undefined && <SpeedGauge label="Quality" score={review.aiAnalysis.scores.prQuality} size="sm" />}
                      <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => setShowPRsModal(true)}>View All</Button>
                    </div>
                  </div>
                  <div className="overflow-y-auto custom-scrollbar flex-1 pr-2">
                    <PullRequestList pullRequests={repository.pullRequests} aiAnalysis={review.aiAnalysis} />
                  </div>
                </div>
              </div>

              {/* File Tree */}
              <div className="bg-[hsl(var(--surface-1))] border border-[hsl(var(--surface-2))] rounded-xl p-6 shadow-sm flex flex-col min-h-[500px]">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-[hsl(var(--surface-2))]">
                  <h3 className="font-bold text-lg flex items-center gap-2"><Folder size={20} className="text-[hsl(var(--primary))]"/> File Structure</h3>
                  {review.aiAnalysis?.scores.structureQuality !== undefined && <SpeedGauge label="Structure" score={review.aiAnalysis.scores.structureQuality} size="md" />}
                </div>
                <div className="flex-1 overflow-auto custom-scrollbar bg-[hsl(var(--bg))] rounded-lg border border-[hsl(var(--surface-2))] p-4">
                  <FileTree files={repository.files} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} markdown={review.reviewMarkdown} isGenerating={review.isReviewing} onAnalysisComplete={review.handleAnalysisComplete} />
    </div>
  );
};
