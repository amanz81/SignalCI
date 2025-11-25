import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { GitBranch } from 'lucide-react';

const ConditionNode = ({ data }: { data: { conditionType?: string; threshold?: string } }) => {
    const conditionType = data.conditionType || 'Volume';
    const threshold = data.threshold || 'Not set';

    return (
        <div className="px-4 py-3 shadow-lg rounded-lg bg-white border-2 border-blue-500 hover:border-blue-600 transition-colors">
            <div className="flex items-center">
                <div className="rounded-full w-10 h-10 flex justify-center items-center bg-blue-100">
                    <GitBranch className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                    <div className="text-base font-bold text-gray-900">Condition</div>
                    <div className="text-gray-500 text-xs">{conditionType}: {threshold}</div>
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

export default memo(ConditionNode);
