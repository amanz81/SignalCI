import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Send } from 'lucide-react';

const ActionNode = ({ data }: { data: { actionType?: string } }) => {
    const actionType = data.actionType || 'Telegram';

    return (
        <div className="px-4 py-3 shadow-lg rounded-lg bg-white border-2 border-purple-500 hover:border-purple-600 transition-colors">
            <div className="flex items-center">
                <div className="rounded-full w-10 h-10 flex justify-center items-center bg-purple-100">
                    <Send className="w-5 h-5 text-purple-600" />
                </div>
                <div className="ml-3">
                    <div className="text-base font-bold text-gray-900">Action</div>
                    <div className="text-gray-500 text-xs">Send {actionType} • 1→1</div>
                </div>
            </div>
            {/* Input handle */}
            <Handle 
                type="target" 
                position={Position.Top} 
                className="!w-4 !h-4 !bg-purple-500 !border-[3px] !border-white !shadow-md hover:!bg-purple-400 hover:!scale-150 !transition-all !cursor-crosshair"
                style={{ top: -8 }}
            />
            {/* Output handle (can chain to another action) */}
            <Handle 
                type="source" 
                position={Position.Bottom} 
                className="!w-4 !h-4 !bg-purple-500 !border-[3px] !border-white !shadow-md hover:!bg-purple-400 hover:!scale-150 !transition-all !cursor-crosshair"
                style={{ bottom: -8 }}
            />
        </div>
    );
};

export default memo(ActionNode);
