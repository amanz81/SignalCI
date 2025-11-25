import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Play } from 'lucide-react';

const TriggerNode = () => {
    return (
        <div className="px-4 py-3 shadow-lg rounded-lg bg-white border-2 border-green-500 hover:border-green-600 transition-colors">
            <div className="flex items-center">
                <div className="rounded-full w-10 h-10 flex justify-center items-center bg-green-100">
                    <Play className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                    <div className="text-base font-bold text-gray-900">Trigger</div>
                    <div className="text-gray-500 text-xs">Webhook</div>
                </div>
            </div>
            <Handle 
                type="source" 
                position={Position.Bottom} 
                className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white hover:!bg-blue-600 hover:!scale-125 transition-all"
                style={{ bottom: -6 }}
            />
        </div>
    );
};

export default memo(TriggerNode);
