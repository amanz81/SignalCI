import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Play } from 'lucide-react';

const TriggerNode = () => {
    return (
        <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
            <div className="flex items-center">
                <div className="rounded-full w-8 h-8 flex justify-center items-center bg-stone-100">
                    <Play className="w-4 h-4" />
                </div>
                <div className="ml-2">
                    <div className="text-lg font-bold">Trigger</div>
                    <div className="text-gray-500 text-xs">Webhook</div>
                </div>
            </div>
            <Handle type="source" position={Position.Bottom} className="w-16 !bg-stone-500" />
        </div>
    );
};

export default memo(TriggerNode);
