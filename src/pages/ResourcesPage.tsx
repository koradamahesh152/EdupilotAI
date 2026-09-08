import { useState, useMemo } from 'react';
import { BookOpen, Video, FileText, Code, Target as TargetIcon, ExternalLink, Plus, Search, X } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePlans, useTopics } from '@/hooks/useData';
import { supabase } from '@/lib/supabase';
import type { Resource, RoadmapTopic } from '@/lib/types';
import { cn } from '@/lib/utils';

const resourceIcons: Record<Resource['type'], typeof BookOpen> = {
  docs: BookOpen,
  video: Video,
  practice: Code,
  article: FileText,
  project: TargetIcon,
};

const resourceTypeLabels: Record<Resource['type'], string> = {
  docs: 'Documentation',
  video: 'Video',
  practice: 'Practice',
  article: 'Article',
  project: 'Project',
};

export function ResourcesPage() {
  const { profile } = useAuth();
  const { plans } = usePlans();
  const activePlan = plans.find((p) => p.status === 'active') ?? plans[0] ?? null;
  const { topics, refresh } = useTopics(activePlan?.id ?? null);
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<Resource['type'] | 'all'>('all');
  const [addModalTopic, setAddModalTopic] = useState<RoadmapTopic | null>(null);
  const [newResource, setNewResource] = useState({ type: 'article' as Resource['type'], title: '', url: '' });

  const allResources = useMemo(() => {
    const list: Array<{ topic: RoadmapTopic; resource: Resource }> = [];
    for (const t of topics) {
      for (const r of t.resources) {
        list.push({ topic: t, resource: r });
      }
    }
    return list;
  }, [topics]);

  const filtered = useMemo(() => {
    return allResources.filter(({ resource, topic }) => {
      if (filterType !== 'all' && resource.type !== filterType) return false;
      if (search && !resource.title.toLowerCase().includes(search.toLowerCase()) && !topic.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allResources, filterType, search]);

  const addResource = async () => {
    if (!addModalTopic || !newResource.title.trim() || !newResource.url.trim()) return;
    const updatedResources = [...addModalTopic.resources, { ...newResource }];
    const { error } = await supabase
      .from('roadmap_topics')
      .update({ resources: updatedResources })
      .eq('id', addModalTopic.id);

    if (error) {
      toast(error.message, 'error');
    } else {
      toast('Resource added', 'success');
      refresh();
      setAddModalTopic(null);
      setNewResource({ type: 'article', title: '', url: '' });
    }
  };

  if (!activePlan) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <EmptyState
            icon={<BookOpen className="w-7 h-7" />}
            title="No resources yet"
            description="Create a learning plan to get AI-recommended resources for every topic."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100">Resources</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">AI-recommended learning resources for every topic</p>
      </div>

      {/* Search & filter */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources or topics..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all text-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'docs', 'video', 'practice', 'article', 'project'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={cn(
                  'px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all',
                  filterType === t
                    ? 'bg-brand-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700',
                )}
              >
                {t === 'all' ? 'All' : resourceTypeLabels[t]}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Resources grid */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<BookOpen className="w-7 h-7" />}
            title="No resources found"
            description={search || filterType !== 'all' ? "Try a different search or filter." : "Resources will appear here once you have topics."}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(({ topic, resource }, i) => {
            const Icon = resourceIcons[resource.type] ?? BookOpen;
            return (
              <Card key={`${topic.id}-${i}`} hover delay={Math.min(i * 0.03, 0.3)}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-500 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="info">{resourceTypeLabels[resource.type]}</Badge>
                    </div>
                    <h3 className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate">{resource.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Topic: {topic.title}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline">
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open
                        </Button>
                      </a>
                      <Button size="sm" variant="ghost" onClick={() => setAddModalTopic(topic)}>
                        <Plus className="w-3.5 h-3.5" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add resource modal */}
      <Modal open={!!addModalTopic} onClose={() => setAddModalTopic(null)} title="Add Custom Resource" size="sm">
        {addModalTopic && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">Adding to: <span className="font-medium text-slate-700 dark:text-slate-300">{addModalTopic.title}</span></p>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Type</label>
              <select
                value={newResource.type}
                onChange={(e) => setNewResource({ ...newResource, type: e.target.value as Resource['type'] })}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-sm"
              >
                {(['docs', 'video', 'practice', 'article', 'project'] as const).map((t) => (
                  <option key={t} value={t}>{resourceTypeLabels[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Title</label>
              <input
                value={newResource.title}
                onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                placeholder="Resource title"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">URL</label>
              <input
                value={newResource.url}
                onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-sm"
              />
            </div>
            <Button onClick={addResource} className="w-full" disabled={!newResource.title.trim() || !newResource.url.trim()}>
              <Plus className="w-4 h-4" />
              Add Resource
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
