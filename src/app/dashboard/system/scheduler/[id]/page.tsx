"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PipelineDetailRedirect() {
  const params = useParams();
  const router = useRouter();
  const pipelineId = params.id as string;

  useEffect(() => {
    // 重定向到新的统一管道页面
    router.replace(`/dashboard/system/scheduler/pipelines/${pipelineId}`);
  }, [pipelineId, router]);

  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <div className="text-lg">页面跳转中...</div>
      </div>
    </div>
  );
} 