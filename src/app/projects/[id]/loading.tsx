import { ProjectDetailSkeleton } from '@/components/ui/Skeletons';

export default function ProjectLoading() {
  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-6xl mx-auto">
      <ProjectDetailSkeleton />
    </div>
  );
}
