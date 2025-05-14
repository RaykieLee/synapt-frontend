'use client';

import { Stream, StreamStatus } from "@/types/stream";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { VideoPlayer } from "./video-player";
import { Pencil, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StreamCardProps {
  stream: Stream;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onEdit: (stream: Stream) => void;
  onDelete: (stream: Stream) => void;
  onStart: (id: number) => void;
  onStop: (id: number) => void;
  onRestart: (id: number) => void;
}

export function StreamCard({
  stream,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onStart,
  onStop,
  onRestart,
}: StreamCardProps) {
  // 获取状态徽章
  const getStatusBadge = (status: StreamStatus) => {
    switch (status) {
      case StreamStatus.Online:
        return <Badge variant="outline" className="bg-green-100 text-green-800">在线</Badge>;
      case StreamStatus.Offline:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">离线</Badge>;
      case StreamStatus.Error:
        return <Badge variant="outline" className="bg-red-100 text-red-800">错误</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">未知</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="bg-muted px-2 py-1 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(stream.stream_id)}
            id={`select-stream-${stream.stream_id}`}
          />
          <CardTitle className="text-md font-medium truncate">{stream.stream_name}</CardTitle>
          {getStatusBadge(stream.status)}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(stream)}>
              <Pencil className="h-4 w-4 mr-2" />
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(stream)}>
              <Trash2 className="h-4 w-4 mr-2" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent className="p-0 flex-grow">
        <VideoPlayer 
          url={stream.stream_transcode_url || stream.stream_url}
          status={stream.status}
          onStart={() => onStart(stream.stream_id)}
          onStop={() => onStop(stream.stream_id)}
          onRestart={() => onRestart(stream.stream_id)}
        />
      </CardContent>
{/*       
      <CardFooter className="px-4 py-2 text-xs text-muted-foreground bg-muted/50">
        <div className="w-full truncate">
          <span className="font-medium">URL:</span> {stream.stream_url}
        </div>
      </CardFooter> */}
    </Card>
  );
} 