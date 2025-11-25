import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Clock } from 'lucide-react';

const WaitNode = ({ data }: { data: { duration?: number } }) => {
    const duration = data.duration || 10;

    return (
        <div className="px-4 py-3 shadow-lg rounded-lg bg-white border-2 border-amber-500 hover:border-amber-600 transition-colors">
            <div className="flex items-center">
                <div className="rounded-full w-10 h-10 flex justify-center items-center bg-amber-100">
                    <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div className="ml-3">
                    <div className="text-base font-bold text-gray-900">Wait</div>
                    <div className="text-gray-500 text-xs">{duration}s</div>
                </div>
            </div>
            <Handle 
                type="target" 
                position={Position.Top} 
                className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white hover:!bg-blue-600 hover:!scale-125 transition-all"
                style={{ top: -6 }}
            />
            <Handle 
                type="source" 
                position={Position.Bottom} 
                className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white hover:!bg-blue-600 hover:!scale-125 transition-all"
                style={{ bottom: -6 }}
            />
        </div>
    );
};

export default memo(WaitNode);
