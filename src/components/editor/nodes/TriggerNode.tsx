import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Play } from 'lucide-react';

const TriggerNode = () => {
    return (
        <div className="px-4 py-3 shadow-lg rounded-lg bg-white border-2 border-green-500 hover:border-green-600 transition-colors relative">
            <div className="flex items-center">
                <div className="rounded-full w-10 h-10 flex justify-center items-center bg-green-100">
                    <Play className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                    <div className="text-base font-bold text-gray-900">Trigger</div>
                    <div className="text-gray-500 text-xs">Webhook • 0→1</div>
                </div>
            </div>
            {/* Large visible output handle */}
            <Handle 
                type="source" 
                position={Position.Bottom} 
                className="!w-4 !h-4 !bg-green-500 !border-[3px] !border-white !shadow-md hover:!bg-green-400 hover:!scale-150 !transition-all !cursor-crosshair"
                style={{ bottom: -8 }}
            />
            {/* Handle label */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 whitespace-nowrap">
                drag to connect ↓
            </div>
        </div>
    );
};

export default memo(TriggerNode);

